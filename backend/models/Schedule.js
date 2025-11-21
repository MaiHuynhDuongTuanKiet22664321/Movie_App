import mongoose from 'mongoose';

const seatStatusSchema = new mongoose.Schema({
  row: { type: String, required: true },
  number: { type: Number, required: true },
  status: { type: String, enum: ['available', 'booked'], default: 'available' },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const scheduleSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'completed'], default: 'scheduled' },
  seatStatuses: [seatStatusSchema],
  basePrice: { type: Number, required: true, default: 75000 }
}, { timestamps: true });

// Unique index: không thể có 2 lịch chiếu cho cùng phim, cùng phòng, cùng ngày, cùng giờ
scheduleSchema.index({ movie: 1, room: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.model('Schedule', scheduleSchema);
