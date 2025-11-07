import express from 'express';
import {
    getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie, checkMovieExists
} from '../controllers/movieController.js';

const router = express.Router();

// Routes for movie operations  
router.get('/getall', getAllMovies);
router.get('/:id', getMovieById);
router.post('/create', createMovie);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);
router.get('/exists/:tmdb_id', checkMovieExists);

export default router;