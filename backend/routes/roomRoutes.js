import express from 'express';
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  updateSeatMap,
  addSeat,
  removeSeat,
  updateSeat
} from '../controllers/roomController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllRooms);
router.get('/:id', getRoomById);
router.post('/', protect, createRoom);
router.put('/:id/seatmap', protect, updateSeatMap); // Phải đặt trước /:id vì cùng method PUT
router.post('/:id/seats', protect, addSeat); // Phải đặt trước /:id vì cùng method POST
router.delete('/:id/seats', protect, removeSeat); // Phải đặt trước /:id vì cùng method DELETE
router.patch('/:id/seats', protect, updateSeat); // Phải đặt trước /:id vì cùng method PATCH
router.put('/:id', protect, updateRoom);
router.delete('/:id', protect, deleteRoom);

export default router;
