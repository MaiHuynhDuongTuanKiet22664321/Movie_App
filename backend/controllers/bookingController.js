import Ticket from '../models/Ticket.js';
import Schedule from '../models/Schedule.js';
import mongoose from 'mongoose';

// Tạo booking mới
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { scheduleId, selectedSeats, totalPrice, paymentMethod } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!scheduleId || !selectedSeats || selectedSeats.length === 0 || !totalPrice) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin đặt vé',
      });
    }

    // Kiểm tra scheduleId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'ID lịch chiếu không hợp lệ',
      });
    }

    // Kiểm tra schedule tồn tại
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

    // Kiểm tra ghế đã được đặt chưa
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

    // Cập nhật trạng thái ghế trong schedule
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

    // Tạo mã giao dịch unique
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Tạo ticket mới
    const ticket = await Ticket.create([{
      userId,
      scheduleId,
      bookedSeats: selectedSeats,
      totalPrice,
      paymentStatus: 'paid',
      transactionId,
    }], { session });

    await session.commitTransaction();

    // Populate thông tin chi tiết
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

// Lấy danh sách vé của user
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

// Lấy chi tiết 1 vé
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
