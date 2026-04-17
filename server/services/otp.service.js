const crypto = require('crypto');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOTPExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function isOTPValid(student) {
  if (!student.otp || !student.otp_expires) return false;
  return new Date() < new Date(student.otp_expires);
}

module.exports = { generateOTP, getOTPExpiry, isOTPValid };
