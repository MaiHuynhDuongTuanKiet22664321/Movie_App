import mongoose from 'mongoose';
import Schedule from '../models/Schedule.js';

// 🟢 Lấy tất cả lịch chiếu
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .sort({ createdAt: -1 });
    
    if (!schedules || schedules.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không có lịch chiếu nào trong hệ thống.',
      });
    }

    res.status(200).json({
      status: 'success',
      results: schedules.length,
      data: { schedules },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi lấy danh sách lịch chiếu.',
      error: error.message,
    });
  }
};

// 🟢 Tạo nhiều lịch chiếu (batch)
export const createBatchSchedules = async (req, res) => {
  const schedulesToCreate = req.body;

  if (!Array.isArray(schedulesToCreate) || schedulesToCreate.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Body phải là một mảng chứa dữ liệu lịch chiếu.',
    });
  }

  // Validate từng item
  for (const s of schedulesToCreate) {
    if (!s.movieId || !s.date || !s.startTime || !s.room) {
      return res.status(400).json({
        status: 'fail',
        message:
          'Thiếu dữ liệu bắt buộc (movieId, date, startTime, room) trong một hoặc nhiều lịch chiếu.',
      });
    }
  }

  const options = { ordered: false }; // cho phép bỏ qua lỗi trùng lặp

  try {
    const newSchedules = await Schedule.insertMany(schedulesToCreate, options);
    res.status(201).json({
      status: 'success',
      results: newSchedules.length,
      data: { schedules: newSchedules },
    });
  } catch (error) {
    // Xử lý lỗi trùng lặp index duy nhất
    if (error.code === 11000) {
      const insertedCount = error.result?.insertedCount || 0;
      const insertedDocs = error.insertedDocs || [];

      return res.status(207).json({
        status: 'warning',
        message:
          'Tạo lịch chiếu hoàn tất, nhưng có một số lịch chiếu bị trùng lặp (đã tồn tại).',
        insertedCount,
        errorDetails:
          error.writeErrors?.map((err) => ({
            index: err.index,
            message: 'Vi phạm Unique Index: Lịch chiếu này đã tồn tại.',
            data: schedulesToCreate[err.index],
          })) || [],
        data: insertedDocs,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi tạo lịch chiếu.',
      error: error.message,
    });
  }
};

// 🟢 Xóa tất cả lịch chiếu theo MovieId
export const deleteSchedulesByMovieId = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'ID phim không hợp lệ.',
      });
    }

    const result = await Schedule.deleteMany({ movieId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Không tìm thấy lịch chiếu nào để xóa cho Movie ID: ${movieId}`,
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Đã xóa thành công ${result.deletedCount} lịch chiếu cho phim có ID: ${movieId}`,
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi xóa lịch chiếu.',
      error: error.message,
    });
  }
};

// logic lấy thông tin lịch trinh theo ngày và giờ
export const getSchedulesByDateAndTime = async (req, res) => {
  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({
        status: 'fail',
        message: 'Thiếu tham số "date" hoặc "time" trong truy vấn.',
      });
    }

    const queryDate = new Date(date);
    if (isNaN(queryDate)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Định dạng ngày không hợp lệ.',
      });
    }

    queryDate.setHours(0, 0, 0, 0);

    const schedules = await Schedule.find({
      date: queryDate,
      startTime: time, // khớp chính xác giờ bắt đầu
    }).sort({ startTime: 1 }); // hoặc .sort({ room: 1 }) nếu muốn theo phòng

    return res.status(200).json({
      status: 'success',
      results: schedules.length,
      data: schedules,
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi lấy lịch chiếu.',
      error: error.message,
    });
  }
};
// 🟢 Lấy các slot đã được đặt (occupied slots)
export const getOccupiedSlots = async (req, res) => {
    try {
        
        const occupiedSlots = await Schedule.aggregate([
            {
                $group: {
                    _id: {
                        date: "$date",
                        room: "$room",
                        startTime: "$startTime",
                    },
                    count: { $sum: 1 } 
                }
            },           
            {
                $project: {
                    _id: 0, 
                    date: "$_id.date",
                    room: "$_id.room",
                    startTime: "$_id.startTime",
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            results: occupiedSlots.length,
            data: {
                occupiedSlots: occupiedSlots,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server khi lấy các slot đã được đặt.',
            error: error.message,
        });
    }
};

export const checkSlotAvailability = async (req, res) => {
    try {
        const { date, time, room } = req.query; 

        if (!date || !time || !room) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp đầy đủ date, time và room để kiểm tra tính khả dụng.',
            });
        }
        
        const existingSchedule = await Schedule.findOne({
            date: date,
            startTime: time,
            room: room,
        });

        const isOccupied = !!existingSchedule; 

        res.status(200).json({
            status: 'success',
            data: {
                date: date,
                time: time,
                room: room,
                isOccupied: isOccupied,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server khi kiểm tra tính khả dụng của slot.',
            error: error.message,
        });
    }
};