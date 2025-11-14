import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = async () => {
  const token = await SecureStore.getItemAsync('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export const bookingApi = {
  // Tạo booking mới
  createBooking: async (bookingData: {
    scheduleId: string;
    selectedSeats: string[];
    totalPrice: number;
    paymentMethod: string;
  }) => {
    try {
      const config = await getAuthHeader();
      const response = await axios.post(
        `${API_URL}/bookings`,
        bookingData,
        config
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Lỗi kết nối' };
    }
  },

  // Lấy danh sách vé của user
  getUserTickets: async () => {
    try {
      const config = await getAuthHeader();
      const response = await axios.get(`${API_URL}/bookings`, config);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Lỗi kết nối' };
    }
  },

  // Lấy chi tiết 1 vé
  getTicketById: async (ticketId: string) => {
    try {
      const config = await getAuthHeader();
      const response = await axios.get(`${API_URL}/bookings/${ticketId}`, config);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Lỗi kết nối' };
    }
  },
};
