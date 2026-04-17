const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Student, User } = require('../models');
const { generateOTP, getOTPExpiry, isOTPValid } = require('../services/otp.service');
const { sendOTPEmail } = require('../services/email.service');
const { success, error } = require('../utils/apiResponse');

const SALT_ROUNDS = 12;

function signTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

// Student: register with mobile
async function register(req, res) {
  try {
    const { mobile, email } = req.body;
    let student = await Student.findOne({ where: { mobile } });
    if (student && student.is_verified) return error(res, 'Mobile already registered. Please login.', 409);

    const otp = generateOTP();
    const hashedOTP = otp; // In production, optionally hash OTP too
    const expiresAt = getOTPExpiry(10);

    if (!student) {
      const tempPassword = await bcrypt.hash(Math.random().toString(36), SALT_ROUNDS);
      student = await Student.create({ mobile, email: email || null, password: tempPassword, otp, otp_expires: expiresAt });
    } else {
      await student.update({ otp, otp_expires: expiresAt, email: email || student.email });
    }

    // In production: send SMS. For now, send via email if provided
    if (email) {
      try { await sendOTPEmail(email, otp, 'Applicant'); } catch (_) {}
    }

    // Development: return OTP in response (remove in prod)
    const devData = process.env.NODE_ENV !== 'production' ? { otp } : {};
    return success(res, devData, 'OTP sent successfully. Valid for 10 minutes.', 200);
  } catch (err) {
    console.error(err);
    return error(res, 'Registration failed', 500);
  }
}

// Student: verify OTP + set password
async function verifyOTP(req, res) {
  try {
    const { mobile, otp, password, name } = req.body;
    const student = await Student.findOne({ where: { mobile } });
    if (!student) return error(res, 'Mobile not registered', 404);
    if (!isOTPValid(student)) return error(res, 'OTP expired. Please request a new one.', 400);
    if (student.otp !== otp) return error(res, 'Invalid OTP', 400);

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await student.update({ password: hashedPassword, name, is_verified: 1, otp: null, otp_expires: null });

    const payload = { student_id: student.student_id, mobile: student.mobile, type: 'student' };
    const { accessToken, refreshToken } = signTokens(payload);
    await student.update({ refresh_token: refreshToken });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return success(res, { accessToken, student: { student_id: student.student_id, name, mobile } }, 'Registration successful');
  } catch (err) {
    console.error(err);
    return error(res, 'OTP verification failed', 500);
  }
}

// Student: login
async function studentLogin(req, res) {
  try {
    const { mobile, password } = req.body;
    const student = await Student.findOne({ where: { mobile } });
    if (!student || !student.is_verified) return error(res, 'Invalid credentials or account not verified', 401);

    const match = await bcrypt.compare(password, student.password);
    if (!match) return error(res, 'Invalid credentials', 401);

    const payload = { student_id: student.student_id, mobile: student.mobile, type: 'student' };
    const { accessToken, refreshToken } = signTokens(payload);
    await student.update({ refresh_token: refreshToken });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return success(res, { accessToken, student: { student_id: student.student_id, name: student.name, mobile: student.mobile } }, 'Login successful');
  } catch (err) {
    console.error(err);
    return error(res, 'Login failed', 500);
  }
}

// Admin / College Staff: login
async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email }, include: [{ association: 'college', attributes: ['college_id','college_name'] }] });
    if (!user || !user.is_active) return error(res, 'Invalid credentials or account disabled', 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) return error(res, 'Invalid credentials', 401);

    await user.update({ last_login: new Date() });

    const payload = { user_id: user.user_id, email: user.email, role: user.role, college_id: user.college_id, type: 'user' };
    const { accessToken, refreshToken } = signTokens(payload);
    await user.update({ refresh_token: refreshToken });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return success(res, { accessToken, user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role, college: user.college } }, 'Login successful');
  } catch (err) {
    console.error(err);
    return error(res, 'Login failed', 500);
  }
}

// Refresh token
async function refreshToken(req, res) {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return error(res, 'Refresh token required', 401);

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    let entity;

    if (decoded.type === 'student') {
      entity = await Student.findOne({ where: { student_id: decoded.student_id, refresh_token: token } });
    } else {
      entity = await User.findOne({ where: { user_id: decoded.user_id, refresh_token: token } });
    }

    if (!entity) return error(res, 'Invalid refresh token', 401);

    const payload = decoded.type === 'student'
      ? { student_id: decoded.student_id, mobile: decoded.mobile, type: 'student' }
      : { user_id: decoded.user_id, email: decoded.email, role: decoded.role, college_id: decoded.college_id, type: 'user' };

    const { accessToken, refreshToken: newRefresh } = signTokens(payload);
    await entity.update({ refresh_token: newRefresh });
    res.cookie('refreshToken', newRefresh, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    return success(res, { accessToken }, 'Token refreshed');
  } catch (err) {
    return error(res, 'Invalid or expired refresh token', 401);
  }
}

// Logout
async function logout(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        if (decoded.type === 'student') await Student.update({ refresh_token: null }, { where: { student_id: decoded.student_id } });
        else await User.update({ refresh_token: null }, { where: { user_id: decoded.user_id } });
      } catch (_) {}
    }
    res.clearCookie('refreshToken');
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    return error(res, 'Logout failed', 500);
  }
}

module.exports = { register, verifyOTP, studentLogin, adminLogin, refreshToken, logout };
