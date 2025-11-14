import Movie from '../models/Movie.js';

// Get all movies in database
export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ addedAt: -1 });
    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phim',
    });
  }
};

// Get movie by ID
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }
    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin phim',
    });
  }
};

// Add movie from TMDB to database
export const addMovie = async (req, res) => {
  try {
    const {
      tmdbId,
      title,
      originalTitle,
      overview,
      posterUrl,
      backdropUrl,
      releaseDate,
      voteAverage,
      voteCount,
      runtime,
      genres,
      tagline,
    } = req.body;

    // Check if movie already exists
    const existingMovie = await Movie.findOne({ tmdbId });
    if (existingMovie) {
      return res.status(400).json({
        success: false,
        message: 'Phim đã tồn tại trong hệ thống',
      });
    }

    const movie = new Movie({
      tmdbId,
      title,
      originalTitle,
      overview,
      posterUrl,
      backdropUrl,
      releaseDate,
      voteAverage,
      voteCount,
      runtime,
      genres,
      tagline,
    });

    await movie.save();

    res.status(201).json({
      success: true,
      message: 'Đã thêm phim vào hệ thống',
      data: movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm phim',
    });
  }
};

// Update movie status
export const updateMovieStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã cập nhật trạng thái phim',
      data: movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật phim',
    });
  }
};

// Delete movie
export const deleteMovie = async (req, res) => {
  try {
    // Check if movie is being used in any schedule
    const Schedule = (await import('../models/Schedule.js')).default;
    const schedulesUsingMovie = await Schedule.countDocuments({ movie: req.params.id });
    
    if (schedulesUsingMovie > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa phim vì đang có ${schedulesUsingMovie} lịch chiếu sử dụng phim này`,
      });
    }

    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã xóa phim',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa phim',
    });
  }
};
