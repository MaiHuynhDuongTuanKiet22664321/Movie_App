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

const router = express.Router();

router.get('/', getAllRooms);
router.get('/:id', getRoomById);
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);
router.put('/:id/seatmap', updateSeatMap);
router.post('/:id/seats', addSeat);
router.delete('/:id/seats', removeSeat);
router.patch('/:id/seats', updateSeat);

export default router;
