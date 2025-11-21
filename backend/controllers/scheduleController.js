import Schedule from '../models/Schedule.js';
import Room from '../models/Room.js';

export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('movie', 'title poster_path')
      .populate('room', 'name');
    res.json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('movie')
      .populate('room');
    if (!schedule) return res.status(404).json({ success: false, message: "Không tìm thấy lịch chiếu" });
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSchedule = async (req, res) => {
  try {
    const { movie, room, date, time, basePrice = 75000 } = req.body;

    // Chuyển date sang format YYYY-MM-DD
    const dateObj = new Date(date);
    const dateString = dateObj.toISOString().split('T')[0];

    const existingSchedule = await Schedule.findOne({ movie, room, date: dateString, time });
    if (existingSchedule) return res.status(400).json({ success: false, message: "Lịch chiếu đã tồn tại" });

    const roomDoc = await Room.findById(room);
    if (!roomDoc) return res.status(404).json({ success: false, message: "Không tìm thấy phòng" });

    const seatStatuses = roomDoc.sodoghe.map(seat => ({
      row: seat.row,
      number: seat.number,
      status: 'available',
      price: seat.price || basePrice
    }));

    const schedule = new Schedule({
      movie,
      room,
      date: dateString,
      time,
      basePrice,
      seatStatuses
    });

    await schedule.save();
    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('movie', 'title poster_path')
      .populate('room', 'name');

    res.status(201).json({ success: true, data: populatedSchedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('movie', 'title poster_path')
      .populate('room', 'name');
    if (!schedule) return res.status(404).json({ success: false, message: "Không tìm thấy lịch chiếu" });
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: "Không tìm thấy lịch chiếu" });
    res.json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bookSeats = async (req, res) => {
  try {
    const { seats } = req.body;
    const userId = req.userId;

    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: "Không tìm thấy lịch chiếu" });

    let totalPrice = 0;
    const bookedSeats = [];

    for (const seat of seats) {
      const seatStatus = schedule.seatStatuses.find(
        s => s.row === seat.row && s.number === seat.number
      );

      if (!seatStatus || seatStatus.status !== 'available') {
        return res.status(400).json({ 
          success: false, 
          message: `Ghế ${seat.row}${seat.number} không khả dụng` 
        });
      }

      seatStatus.status = 'booked';
      seatStatus.bookedBy = userId;
      totalPrice += seatStatus.price;
      bookedSeats.push(`${seat.row}${seat.number}`);
    }

    await schedule.save();

    res.json({ 
      success: true, 
      message: "Đặt vé thành công",
      data: { bookedSeats, totalPrice }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSchedulesByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const schedules = await Schedule.find({ movie: movieId })
      .populate('room', 'name')
      .sort({ date: 1, time: 1 });
    res.json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
