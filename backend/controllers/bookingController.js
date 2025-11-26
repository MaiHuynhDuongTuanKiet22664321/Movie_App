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

export const getPaymentConfig = async (req, res) => {
  try {
    const SEPAY_BANK_ACCOUNT = process.env.SEPAY_BANK_ACCOUNT;
    const SEPAY_BANK_ID = process.env.SEPAY_BANK_ID;
    
    if (!SEPAY_BANK_ACCOUNT || !SEPAY_BANK_ID) {
      return res.status(500).json({
        success: false,
        message: 'Payment service not configured',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        bankAccount: SEPAY_BANK_ACCOUNT,
        bankId: SEPAY_BANK_ID,
      },
    });

  } catch (error) {
    console.error("Get Payment Config Error:", error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy cấu hình thanh toán',
    });
  }
};

export const checkPayment = async (req, res) => {
  try {
    console.log('🏦 [SePay Backend] ===== CHECKING PAYMENT =====');
    console.log('🏦 [SePay Backend] Request body:', req.body);
    
    const { orderCode, totalPrice } = req.body;
    const SEPAY_API_TOKEN = process.env.SEPAY_API_TOKEN;
    const SEPAY_BANK_ACCOUNT = process.env.SEPAY_BANK_ACCOUNT;
    const SEPAY_BANK_ID = process.env.SEPAY_BANK_ID;

    console.log('🏦 [SePay Backend] Environment check:', {
      hasToken: !!SEPAY_API_TOKEN,
      hasBankAccount: !!SEPAY_BANK_ACCOUNT,
      hasBankId: !!SEPAY_BANK_ID,
      bankAccount: SEPAY_BANK_ACCOUNT
    });

    if (!SEPAY_API_TOKEN || !SEPAY_BANK_ACCOUNT) {
      console.error('🏦 [SePay Backend] Missing environment variables');
      return res.status(500).json({
        success: false,
        message: 'SePay configuration missing',
      });
    }

    if (!orderCode || !totalPrice) {
      console.error('🏦 [SePay Backend] Missing required parameters');
      return res.status(400).json({
        success: false,
        message: 'Order code and total price are required',
      });
    }

    // Call SePay API to get transactions
    const sepayUrl = `https://my.sepay.vn/userapi/transactions/list?${new URLSearchParams({
      limit: '20',
      transaction_date_min: new Date(Date.now() - 30 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    })}`;
    
    console.log('🏦 [SePay Backend] Calling SePay API:', sepayUrl);

    const response = await fetch(sepayUrl, {
      headers: {
        'Authorization': `Bearer ${SEPAY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🏦 [SePay Backend] SePay API response status:', response.status);

    if (!response.ok) {
      console.error('🏦 [SePay Backend] SePay API call failed:', response.status);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify payment with SePay',
      });
    }

    const data = await response.json();
    console.log('🏦 [SePay Backend] SePay API response data:', data);

    if (!data.transactions || !Array.isArray(data.transactions)) {
      console.error('🏦 [SePay Backend] Invalid SePay response format');
      return res.status(500).json({
        success: false,
        message: 'Invalid payment verification response',
      });
    }

    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    console.log('🏦 [SePay Backend] Checking transactions in last 30 minutes');
    console.log('🏦 [SePay Backend] Looking for:', {
      orderCode,
      totalPrice,
      targetAccount: SEPAY_BANK_ACCOUNT
    });

    const isPaid = data.transactions.some((trans) => {
      const transactionDate = new Date(trans.transaction_date).getTime();
      const isRecent = transactionDate > thirtyMinutesAgo;
      const amountMatch = parseFloat(trans.amount_in) >= totalPrice;
      const contentMatch = trans.transaction_content?.includes(orderCode);
      const accountMatch = trans.to_account === SEPAY_BANK_ACCOUNT;
      
      console.log('🏦 [SePay Backend] Transaction check:', {
        id: trans.id,
        amount: trans.amount_in,
        content: trans.transaction_content,
        account: trans.to_account,
        date: trans.transaction_date,
        isRecent,
        amountMatch,
        contentMatch,
        accountMatch,
        isMatch: isRecent && amountMatch && contentMatch && accountMatch
      });
      
      return isRecent && amountMatch && contentMatch && accountMatch;
    });

    console.log('🏦 [SePay Backend] Final payment result:', isPaid);
    console.log('🏦 [SePay Backend] ===== PAYMENT CHECK ENDED =====');

    res.json({
      success: true,
      isPaid,
      message: isPaid ? 'Payment verified' : 'Payment not found',
    });
  } catch (error) {
    console.error('🏦 [SePay Backend] Payment check error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
    });
  }
};
