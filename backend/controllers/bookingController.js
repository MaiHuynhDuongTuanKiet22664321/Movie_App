import Ticket from '../models/Ticket.js';
import Schedule from '../models/Schedule.js';
import mongoose from 'mongoose';

export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { scheduleId, selectedSeats, totalPrice, paymentMethod } = req.body;
    const userId = req.user._id;

    if (!scheduleId || !selectedSeats || selectedSeats.length === 0 || !totalPrice) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin đặt vé',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'ID lịch chiếu không hợp lệ',
      });
    }

    const schedule = await Schedule.findById(scheduleId)
      .populate('movie')
      .populate('room')
      .session(session);

    if (!schedule) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch chiếu',
      });
    }

    const bookedSeats = schedule.seatStatuses
      .filter(seat => seat.status === 'booked')
      .map(seat => `${seat.row}${seat.number}`);

    const conflictSeats = selectedSeats.filter(seat => bookedSeats.includes(seat));
    
    if (conflictSeats.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Ghế ${conflictSeats.join(', ')} đã được đặt`,
      });
    }

    selectedSeats.forEach(seatId => {
      const row = seatId.charAt(0);
      const number = parseInt(seatId.substring(1));
      
      const seatIndex = schedule.seatStatuses.findIndex(
        seat => seat.row === row && seat.number === number
      );

      if (seatIndex !== -1) {
        schedule.seatStatuses[seatIndex].status = 'booked';
        schedule.seatStatuses[seatIndex].bookedBy = userId;
      }
    });

    await schedule.save({ session });

    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const ticket = await Ticket.create([{
      userId,
      scheduleId,
      bookedSeats: selectedSeats,
      totalPrice,
      paymentStatus: 'paid',
      transactionId,
    }], { session });

    await session.commitTransaction();

    const populatedTicket = await Ticket.findById(ticket[0]._id)
      .populate({
        path: 'scheduleId',
        populate: [
          { path: 'movie' },
          { path: 'room' }
        ]
      })
      .populate('userId', 'fullName email phoneNumber');

    res.status(201).json({
      success: true,
      message: 'Đặt vé thành công',
      data: populatedTicket,
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đặt vé',
    });
  } finally {
    session.endSession();
  }
};

export const getUserTickets = async (req, res) => {
  try {
    const userId = req.user._id;

    const tickets = await Ticket.find({ userId })
      .populate({
        path: 'scheduleId',
        populate: [
          { path: 'movie' },
          { path: 'room' }
        ]
      })
      .sort({ bookedAt: -1 });

    res.status(200).json({
      success: true,
      data: tickets,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách vé',
    });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const ticket = await Ticket.findOne({ _id: id, userId })
      .populate({
        path: 'scheduleId',
        populate: [
          { path: 'movie' },
          { path: 'room' }
        ]
      })
      .populate('userId', 'fullName email phoneNumber');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vé',
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin vé',
    });
  }
};

export const checkPayment = async (req, res) => {
  try {
    const { orderCode, totalPrice } = req.body;

    const SEPAY_API_TOKEN = process.env.SEPAY_API_TOKEN;
    
    if (!SEPAY_API_TOKEN) {
      console.error('SEPAY_API_TOKEN not configured in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Payment service not configured',
      });
    }

    const response = await fetch("https://my.sepay.vn/userapi/transactions/list", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SEPAY_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("SePay API response not OK:", response.status);
      return res.status(200).json({
        success: true,
        isPaid: null,
        message: "Không thể kiểm tra thanh toán lúc này",
      });
    }

    const data = await response.json();

    if (data.status === 200 && data.transactions && Array.isArray(data.transactions)) {
      const isPaid = data.transactions.some((trans) => {
        const amountMatch = parseFloat(trans.amount_in) >= totalPrice;
        const contentMatch = trans.transaction_content?.includes(orderCode);
        return amountMatch && contentMatch;
      });

      return res.status(200).json({
        success: true,
        isPaid: isPaid,
        message: isPaid ? "Đã nhận được thanh toán" : "Chưa nhận được thanh toán",
      });
    }

    res.status(200).json({
      success: true,
      isPaid: false,
      message: "Chưa nhận được thanh toán",
    });

  } catch (error) {
    console.error("SePay Check Error:", error);
    res.status(200).json({
      success: true,
      isPaid: null,
      message: "Lỗi khi kiểm tra thanh toán",
    });
  }
};
