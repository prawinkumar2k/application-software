const crypto = require('crypto');
require('dotenv').config();

const MERCHANT_ID = process.env.CCAVENUE_MERCHANT_ID || '';
const ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE || '';
const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY || '';

function encrypt(plainText) {
  const m = crypto.createHash('md5');
  m.update(WORKING_KEY);
  const key = m.digest();
  const iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encoded = cipher.update(plainText, 'utf8', 'hex');
  encoded += cipher.final('hex');
  return encoded;
}

function decrypt(encText) {
  const m = crypto.createHash('md5');
  m.update(WORKING_KEY);
  const key = m.digest();
  const iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  let decoded = decipher.update(encText, 'hex', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
}

function buildRequestParams(params) {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
}

module.exports = { encrypt, decrypt, buildRequestParams, MERCHANT_ID, ACCESS_CODE, WORKING_KEY };
