export const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// API endpoints
const MOVIE_ENDPOINTS = {
  GETALL: `${BASE_URL}/api/movies/getall`,
  GETBYID: (id: string) => `${BASE_URL}/api/movies/${id}`,
  CREATE: `${BASE_URL}/api/movies/create`,
  UPDATE: (id: string) => `${BASE_URL}/api/movies/${id}`,
  DELETE: (id: string) => `${BASE_URL}/api/movies/${id}`,
  EXISTS: (id: string) => `${BASE_URL}/api/movies/exists/${id}`,
};

// Fetch all movies
export const fetchAllMovies = async () => {
  try {
    const response = await fetch(MOVIE_ENDPOINTS.GETALL);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch movies");
    return data;
  } catch (error: any) {
    console.error("Error fetching movies:", error);
    throw new Error(error.message || "Failed to fetch movies");
  }
};

// Fetch movie by ID
export const fetchMovieById = async (tmdb_id: number | string) => {
  try {
    // Đảm bảo tmdb_id là string khi đưa vào URL
    const response = await fetch(MOVIE_ENDPOINTS.GETBYID(String(tmdb_id)));
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch movie");
    }

    return data.data; // Trả về object phim trực tiếp
  } catch (error: any) {
    console.error("Error fetching movie:", error);
    throw new Error(error.message || "Failed to fetch movie");
  }
};


// Create a new movie
export const createMovie = async (movieData: {
  tmdb_id: number;
  title: string;
  original_title?: string;
  overview: string;
  runtime: number;
  release_date: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  vote_count?: number;
  genres?: string[];
  tagline?: string;
}) => {
  try {
    const response = await fetch(MOVIE_ENDPOINTS.CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movieData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create movie");
    return data;
  } catch (error: any) {
    console.error("Error creating movie:", error);
    throw new Error(error.message || "Failed to create movie");
  }
};


// Update a movie
export const updateMovie = async (
  id: string,
  movieData: Partial<{
    tmdb_id: number;
    title: string;
    original_title: string;
    overview: string;
    runtime: number;
    release_date: string;
    poster_path: string;
    backdrop_path: string;
    vote_average: number;
    vote_count: number;
    genres: string[];
    tagline: string;
  }>
) => {
  try {
    const response = await fetch(MOVIE_ENDPOINTS.UPDATE(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movieData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update movie");
    return data;
  } catch (error: any) {
    console.error("Error updating movie:", error);
    throw new Error(error.message || "Failed to update movie");
  }
};

// Delete a movie
export const deleteMovie = async (id: string) => {
  try {
    const response = await fetch(MOVIE_ENDPOINTS.DELETE(id), {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete movie");
    return data;
  } catch (error: any) {
    console.error("Error deleting movie:", error);
    throw new Error(error.message || "Failed to delete movie");
  }
};

// Check if a movie exists by tmdb_id
export const checkMovieExists = async (tmdb_id: string) => {
  try {
    const response = await fetch(MOVIE_ENDPOINTS.EXISTS(tmdb_id));
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to check movie existence");
    return data.exists; // Trả về true hoặc false
  } catch (error: any) {
    console.error("Error checking movie existence:", error);
    throw new Error(error.message || "Failed to check movie existence");
  }
};
