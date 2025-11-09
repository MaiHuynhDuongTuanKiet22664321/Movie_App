import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    // CẦN THIẾT cho logic navigation (sử dụng 'id' của API/TMDB)
    tmdb_id: {
      type: Number,
      required: true,
      unique: true,
    },
    // CẦN THIẾT cho hiển thị: title={movie.title}
    title: {
      type: String,
      required: [true, 'Tên phim không được để trống'],
      trim: true,
    },
    original_title: {
      type: String,
      trim: true,
    },
    overview: {
      type: String,
    },
    runtime: {
      type: Number,
      min: [1, 'Thời lượng phải lớn hơn 0 phút'],
    },
    release_date: {
      type: Date,
      required: [true, 'Ngày phát hành không được để trống'],
    },
    poster_path: {
      type: String,
    },
    backdrop_path: {
      type: String,
    },
    vote_average: {
      type: Number,
      min: 0,
      max: 10,
    },
    vote_count: {
      type: Number,
      default: 0,
    },
    genre_ids: {
      type: [Number], // Lưu danh sách ID thể loại
    },
    tagline: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Thêm Virtual 'id' để dễ dàng sử dụng trong React Native component
movieSchema.virtual('id').get(function() {
  return this.tmdb_id;
});

movieSchema.set('toJSON', { virtuals: true });
movieSchema.set('toObject', { virtuals: true });

export default mongoose.model('Movie', movieSchema);