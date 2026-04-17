const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireStudent } = require('../middleware/role.middleware');
const ctrl = require('../controllers/payment.controller');

router.post('/initiate', verifyToken, requireStudent, ctrl.initiatePayment);
router.post('/callback', ctrl.paymentCallback); // CCAvenue server-to-server — no auth
router.get('/status/:application_id', verifyToken, requireStudent, ctrl.getPaymentStatus);

module.exports = router;
