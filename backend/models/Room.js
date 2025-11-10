import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  row: { type: String, required: true },
  number: { type: Number, required: true },
  status: { type: String, enum: ['available', 'booked'], default: 'available' },
  price: { type: Number, required: true, default: 75000 }
});

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  sodoghe: [seatSchema],
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
