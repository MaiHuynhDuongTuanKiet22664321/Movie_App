import express from 'express';
import {
  getAllMovies,
  getMovieById,
  addMovie,
  updateMovieStatus,
  deleteMovie,
} from '../controllers/movieController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllMovies);
router.get('/:id', getMovieById);
router.post('/', protect, addMovie);
router.patch('/:id/status', protect, updateMovieStatus);
router.delete('/:id', protect, deleteMovie);

export default router;
