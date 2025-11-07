import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    movieId: {
      type: Number,
      ref: 'Movie',
      required: [true, 'Phim chiếu không được để trống'],
    },
    date: {
      type: Date,
      required: [true, 'Ngày chiếu không được để trống'],
      set: (v) => {
        const d = new Date(v);
        return new Date(d.setHours(0, 0, 0, 0)); // chuẩn hóa về 0h00
      },
    },
    room: {
      type: String,
      required: [true, 'Phòng chiếu không được để trống'],
      enum: ['Room A', 'Room B', 'Room C', 'Room D'],
    },
    startTime: {
      type: String,
      required: [true, 'Giờ bắt đầu không được để trống'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Giờ không hợp lệ (HH:mm)'],
    },
    basePrice: {
      type: Number,
      default: 5.0,
    },
    seats: {
      type: [seatSchema],
      default: () => {
        const seats = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
        const cols = 9; // 6 hàng × 9 cột = 54 ghế
        for (let r = 0; r < rows.length; r++) {
          for (let c = 1; c <= cols; c++) {
            seats.push({ code: `${rows[r]}${c}`, isBooked: false });
          }
        }
        return seats;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index duy nhất để tránh trùng lịch chiếu
scheduleSchema.index(
  { movieId: 1, date: 1, startTime: 1, room: 1 },
  { unique: true }
);

export default mongoose.model('Schedule', scheduleSchema);
