import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    // ID từ TMDB API
    tmdbId: {
      type: Number,
      required: true,
      unique: true,
      sparse: true,
    },
    title: {
      type: String,
      required: true,
    },
    originalTitle: {
      type: String,
    },
    overview: {
      type: String,
    },
    // Lưu URL đầy đủ thay vì path
    posterUrl: {
      type: String,
    },
    backdropUrl: {
      type: String,
    },
    releaseDate: {
      type: String,
    },
    voteAverage: {
      type: Number,
    },
    voteCount: {
      type: Number,
    },
    runtime: {
      type: Number, // phút
    },
    genres: [
      {
        id: Number,
        name: String,
      },
    ],
    tagline: {
      type: String,
    },
    // Trạng thái phim trong hệ thống
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    // Ngày thêm vào hệ thống
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
