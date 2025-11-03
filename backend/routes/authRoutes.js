import express from 'express';
import { body } from 'express-validator';
import {
  getMe,
  login,
  register,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Vui lòng nhập họ và tên')
    .isLength({ min: 2 })
    .withMessage('Họ và tên phải có ít nhất 2 ký tự'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Vui lòng nhập email')
    .isEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .notEmpty()
    .withMessage('Vui lòng nhập mật khẩu')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('phoneNumber')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại không hợp lệ'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Vui lòng nhập email')
    .isEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .notEmpty()
    .withMessage('Vui lòng nhập mật khẩu'),
];

const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Họ và tên không được để trống')
    .isLength({ min: 2 })
    .withMessage('Họ và tên phải có ít nhất 2 ký tự'),
  body('phoneNumber')
    .optional()
    .custom((value) => {
      if (!value || value === '') {
        return true; // Allow empty phone number
      }
      return /^[0-9]{10,11}$/.test(value);
    })
    .withMessage('Số điện thoại không hợp lệ'),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidation, updateProfile);

export default router;

