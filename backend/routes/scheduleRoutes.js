import express from 'express';
import {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  bookSeats,
  getSchedulesByMovie
} from '../controllers/scheduleController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllSchedules);
router.get('/movie/:movieId', getSchedulesByMovie); // Phải đặt trước /:id
router.get('/:id', getScheduleById);
router.post('/', protect, createSchedule);
router.put('/:id', protect, updateSchedule);
router.delete('/:id', protect, deleteSchedule);
router.post('/:id/book', protect, bookSeats);

export default router;
