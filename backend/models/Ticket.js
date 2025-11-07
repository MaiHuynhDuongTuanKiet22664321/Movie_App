import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'ID người dùng không được để trống'],
    },
    scheduleId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Schedule',
      required: [true, 'ID lịch chiếu không được để trống'],
    },
    bookedSeats: {
      type: [String],
      required: [true, 'Danh sách ghế đã đặt không được để trống'],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'Vé phải có ít nhất 1 ghế được chọn',
      },
    },
    totalPrice: {
      type: Number,
      required: [true, 'Tổng giá tiền không được để trống'],
      min: [0.01, 'Tổng giá tiền phải lớn hơn 0'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'paid', // Mặc định là 'paid' nếu giao dịch thành công
    },
    transactionId: {
      type: String,
      required: [true, 'Mã giao dịch không được để trống'],
      unique: true,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Tùy chọn: Thêm trường ảo (virtual field) để lấy thông tin phim/lịch chiếu dễ dàng
ticketSchema.virtual('scheduleDetails', {
    ref: 'Schedule',
    localField: 'scheduleId',
    foreignField: '_id',
    justOne: true,
});

export default mongoose.model('Ticket', ticketSchema);