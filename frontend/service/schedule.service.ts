export const BASE_URL: string =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const SCHEDULE_ENDPOINTS = {
  GETALL: `${BASE_URL}/api/schedules/getall`,
  CREATE: `${BASE_URL}/api/schedules/create`,
  DELETE_BY_MOVIE: (movieId: string) =>
    `${BASE_URL}/api/schedules/movie/${movieId}`,
  GET_BY_DATE_AND_TIME: `${BASE_URL}/api/schedules/bydateandtime`,
  GET_OCCUPIED_SLOTS: `${BASE_URL}/api/schedules/occupiedslots`,
  CHECK_SLOT_AVAILABILITY: `${BASE_URL}/api/schedules/checkslot`,
};

export interface Schedule {
  _id?: string;
  movieId: string;
  date: string;
  startTime: string;
  room: string;
  basePrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
}

export const fetchAllSchedules = async (): Promise<Schedule[]> => {
  try {
    const response = await fetch(SCHEDULE_ENDPOINTS.GETALL);
    const data: ApiResponse<Schedule[]> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch schedules");
    }

    return data.data || [];
  } catch (error: any) {
    console.error("Error fetching schedules:", error);
    throw new Error(error.message || "Failed to fetch schedules");
  }
};

export const createSchedules = async (
  schedules: Schedule[]
): Promise<ApiResponse<Schedule[]>> => {
  try {
    const response = await fetch(SCHEDULE_ENDPOINTS.CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schedules),
    });

    const data: ApiResponse<Schedule[]> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create schedules");
    }

    return data;
  } catch (error: any) {
    console.error("Error creating schedules:", error);
    throw new Error(error.message || "Failed to create schedules");
  }
};

export const deleteSchedulesByMovieId = async (
  movieId: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(SCHEDULE_ENDPOINTS.DELETE_BY_MOVIE(movieId), {
      method: "DELETE",
    });

    const data: ApiResponse<null> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete schedules");
    }

    return data;
  } catch (error: any) {
    console.error("Error deleting schedules:", error);
    throw new Error(error.message || "Failed to delete schedules");
  }
};

export const getSchedulesByDateAndTime = async (
  date: string,
  time: string
): Promise<Schedule[]> => {
  try {
    const url = new URL(SCHEDULE_ENDPOINTS.GET_BY_DATE_AND_TIME);
    url.searchParams.append("date", date);
    url.searchParams.append("time", time);

    const response = await fetch(url.toString());
    const data: ApiResponse<Schedule[]> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch schedules");
    }

    return data.data || [];
  } catch (error: any) {
    console.error("Error fetching schedules:", error);
    throw new Error(error.message || "Failed to fetch schedules");
  }
};

export const getOccupiedSlots = async (): Promise<string[]> => {
  try {
    const response = await fetch(SCHEDULE_ENDPOINTS.GET_OCCUPIED_SLOTS);
    const data: ApiResponse<string[]> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch occupied slots");
    }

    return data.data || [];
  } catch (error: any) {
    console.error("Error fetching occupied slots:", error);
    throw new Error(error.message || "Failed to fetch occupied slots");
  }
};

export const checkSlotAvailability = async (
  date: string,
  startTime: string,
  room: string
): Promise<{ date: string; time: string; room: string; isOccupied: boolean }> => {
  try {
    const url = new URL(SCHEDULE_ENDPOINTS.CHECK_SLOT_AVAILABILITY);
    url.searchParams.append("date", date);
    url.searchParams.append("time", startTime);
    url.searchParams.append("room", room);  
    const response = await fetch(url.toString());
    const data: ApiResponse<{ date: string; time: string; room: string; isOccupied: boolean }> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to check slot availability");
    }
    return data.data!;
  } catch (error: any) {
    console.error("Error checking slot availability:", error);
    throw new Error(error.message || "Failed to check slot availability");
  }
}