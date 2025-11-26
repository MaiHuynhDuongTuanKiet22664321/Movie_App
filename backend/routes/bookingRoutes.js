import express from 'express';
import { createBooking, getUserTickets, getTicketById, checkPayment, getPaymentConfig } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(protect);

// POST /api/bookings - Tạo booking mới
router.post('/', createBooking);

// GET /api/bookings - Lấy danh sách vé của user
router.get('/', getUserTickets);

// GET /api/bookings/payment/config - Lấy cấu hình thanh toán (phải đặt trước /:id)
router.get('/payment/config', getPaymentConfig);

// GET /api/bookings/:id - Lấy chi tiết 1 vé
router.get('/:id', getTicketById);

// POST /api/bookings/payment/check - Kiểm tra thanh toán (SePay proxy)
router.post('/payment/check', checkPayment);

export default router;
