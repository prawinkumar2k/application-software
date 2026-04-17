const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/auth.controller');
const { validate, registerSchema, otpVerifySchema, loginSchema, adminLoginSchema } = require('../utils/validators');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many requests, please try again later.' } });

router.post('/register', authLimiter, validate(registerSchema), ctrl.register);
router.post('/verify-otp', authLimiter, validate(otpVerifySchema), ctrl.verifyOTP);
router.post('/login', authLimiter, ctrl.studentLogin);
router.post('/admin/login', authLimiter, ctrl.adminLogin);
router.post('/refresh', ctrl.refreshToken);
router.post('/logout', ctrl.logout);

module.exports = router;
