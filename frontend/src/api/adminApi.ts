import { getToken } from "../utils/storage";

const API_BASE_URL = "https://movie-ticket-xncx.onrender.com/api";

// Helper function to get headers with auth token
const getHeaders = async () => {
  const token = await getToken();
  console.log("Token being used:", token ? `${token.substring(0, 20)}...` : "No token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Schedule APIs
export const scheduleApi = {
  getAll: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/schedules`, { headers });
    return response.json();
  },

  getById: async (id: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, { headers });
    return response.json();
  },

  create: async (data: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/schedules`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: "DELETE",
      headers,
    });
    return response.json();
  },

  getByMovie: async (movieId: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/schedules/movie/${movieId}`, { headers });
    return response.json();
  },
};

// Room APIs
export const roomApi = {
  getAll: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/rooms`, { headers });
    return response.json();
  },

  getById: async (id: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`, { headers });
    return response.json();
  },

  create: async (data: any) => {
    const headers = await getHeaders();
    console.log("Creating room with data:", data);
    console.log("Request headers:", headers);
    
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      
      console.log("Room creation response status:", response.status);
      console.log("Room creation response headers:", response.headers);
      
      const result = await response.json();
      console.log("Room creation response body:", result);
      
      return result;
    } catch (error) {
      console.log("Room creation fetch error:", error);
      throw error;
    }
  },

  update: async (id: string, data: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: "DELETE",
      headers,
    });
    return response.json();
  },

  updateSeatMap: async (id: string, sodoghe: any[]) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/rooms/${id}/seatmap`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ sodoghe }),
    });
    return response.json();
  },

  addSeat: async (id: string, seat: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/rooms/${id}/seats`, {
      method: "POST",
      headers,
      body: JSON.stringify(seat),
    });
    return response.json();
  },

  removeSeat: async (id: string, row: string, number: number) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/rooms/${id}/seats`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ row, number }),
    });
    return response.json();
  },

  updateSeat: async (id: string, seat: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/rooms/${id}/seats`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(seat),
    });
    return response.json();
  },
};

// Movie APIs
export const movieApi = {
  getAll: async () => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/movies`, { headers });
    return response.json();
  },

  getById: async (id: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/movies/${id}`, { headers });
    return response.json();
  },

  add: async (movieData: any) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/movies`, {
      method: "POST",
      headers,
      body: JSON.stringify(movieData),
    });
    return response.json();
  },

  updateStatus: async (id: string, status: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/movies/${id}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  delete: async (id: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/movies/${id}`, {
      method: "DELETE",
      headers,
    });
    return response.json();
  },
};
