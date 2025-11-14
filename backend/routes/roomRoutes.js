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
router.put('/:id', protect, updateRoom);
router.delete('/:id', protect, deleteRoom);
router.put('/:id/seatmap', protect, updateSeatMap);
router.post('/:id/seats', protect, addSeat);
router.delete('/:id/seats', protect, removeSeat);
router.patch('/:id/seats', protect, updateSeat);

export default router;
