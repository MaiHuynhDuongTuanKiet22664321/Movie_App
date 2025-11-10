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
router.get('/:id', getScheduleById);
router.post('/', createSchedule);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);
router.post('/:id/book', protect, bookSeats);
router.get('/movie/:movieId', getSchedulesByMovie);

export default router;
