import express from 'express';
import {
  getAllSchedules,
  createBatchSchedules,
  deleteSchedulesByMovieId,
  getSchedulesByDateAndTime,
  getOccupiedSlots,
  checkSlotAvailability
} from '../controllers/scheduleController.js';

const router = express.Router();

// Routes cho lịch chiếu
router.get('/getall', getAllSchedules);
router.post('/create', createBatchSchedules);
router.delete('/movie/:movieId', deleteSchedulesByMovieId); 
router.get('/bydateandtime', getSchedulesByDateAndTime);
router.get('/occupiedslots', getOccupiedSlots);
router.get('/checkslot', checkSlotAvailability);


export default router;
