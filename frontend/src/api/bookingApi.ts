import axios from 'axios';
import { getToken } from '../utils/storage';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  } catch (error: any) {
    throw new Error('Lỗi lấy token: ' + error.message);
  }
};

// Kiểm tra xem một string có phải ObjectId MongoDB không
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
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
      // Validation dữ liệu
      if (!bookingData.scheduleId) {
        throw new Error('scheduleId không được để trống');
      }
      if (!isValidObjectId(bookingData.scheduleId)) {
        throw new Error(`scheduleId không hợp lệ: ${bookingData.scheduleId}`);
      }
      if (!Array.isArray(bookingData.selectedSeats) || bookingData.selectedSeats.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một ghế');
      }
      if (!bookingData.totalPrice || bookingData.totalPrice <= 0) {
        throw new Error('Tổng giá tiền phải lớn hơn 0');
      }
      if (!['cash', 'momo', 'bank'].includes(bookingData.paymentMethod)) {
        throw new Error('Phương thức thanh toán không hợp lệ');
      }

      const config = await getAuthHeader();
      
      const response = await axios.post(
        `${API_URL}/bookings`,
        bookingData,
        config
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
      }
      throw error.response?.data || { success: false, message: error.message || 'Lỗi kết nối' };
    }
  },

  // Lấy danh sách vé của user
  getUserTickets: async () => {
    try {
      const config = await getAuthHeader();
      const response = await axios.get(`${API_URL}/bookings`, config);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
      }
      throw error.response?.data || { success: false, message: error.message || 'Lỗi kết nối' };
    }
  },

  // Lấy chi tiết 1 vé
  getTicketById: async (ticketId: string) => {
    try {
      if (!isValidObjectId(ticketId)) {
        throw new Error(`ticketId không hợp lệ: ${ticketId}`);
      }
      const config = await getAuthHeader();
      const response = await axios.get(`${API_URL}/bookings/${ticketId}`, config);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
      }
      throw error.response?.data || { success: false, message: error.message || 'Lỗi kết nối' };
    }
  },

  // Lấy thông tin lịch chiếu (bao gồm seatStatuses)
  getSchedule: async (scheduleId: string) => {
    try {
      if (!isValidObjectId(scheduleId)) {
        throw new Error(`scheduleId không hợp lệ: ${scheduleId}`);
      }
      const response = await axios.get(`${API_URL}/schedules/${scheduleId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: error.message || 'Lỗi kết nối' };
    }
  },
};
