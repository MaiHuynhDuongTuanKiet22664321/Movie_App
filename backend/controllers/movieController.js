import Movie from '../models/Movie.js';

export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    console.error("Get All Movies Error:", error);
    res.status(500).json({  
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay phim",
      });
    }
    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    console.error("Get Movie By Id Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    console.error("Create Movie Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay phim",
      });
    }   
    res.status(200).json({
        success: true,
        data: movie,
      });
  } catch (error) {
    console.error("Update Movie Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Khong tim thay phim",
      });
    }
    res.status(200).json({
        success: true,
        message: "Xoa phim thanh cong",
      });
  } catch (error) {
    console.error("Delete Movie Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  } 
};

// check movie có hay không
export const checkMovieExists = async (req, res) => {
  try {
    const { tmdb_id } = req.params;
    const movie = await Movie.findOne({ tmdb_id: tmdb_id });
    res.status(200).json({
      success: true,
      exists: !!movie,
    });
  } catch (error) {
    console.error("Check Movie Exists Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};