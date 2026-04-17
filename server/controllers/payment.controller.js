const { encrypt, decrypt, buildRequestParams, MERCHANT_ID, ACCESS_CODE } = require('../config/ccavenue');
const { Payment, Application, Student } = require('../models');
const { sendConfirmationEmail } = require('../services/email.service');
const { success, error } = require('../utils/apiResponse');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// POST /payment/initiate
async function initiatePayment(req, res) {
  try {
    const { application_id } = req.body;
    const payment = await Payment.findOne({ where: { application_id, status: 'PENDING' } });
    if (!payment) return error(res, 'No pending payment found', 404);

    const student = await Student.findByPk(req.user.student_id);
    const app = await Application.findByPk(application_id);

    const params = {
      merchant_id: MERCHANT_ID,
      order_id: payment.order_id,
      currency: 'INR',
      amount: payment.amount.toFixed(2),
      redirect_url: `${BASE_URL}/api/v1/payment/callback`,
      cancel_url: `${FRONTEND_URL}/application/${application_id}/payment-cancelled`,
      language: 'EN',
      billing_name: student?.name || '',
      billing_tel: student?.mobile || '',
      billing_email: student?.email || '',
    };

    const encRequest = encrypt(buildRequestParams(params));
    return success(res, {
      encRequest,
      access_code: ACCESS_CODE,
      action: 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
      order_id: payment.order_id,
    }, 'Payment initiated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to initiate payment', 500);
  }
}

// POST /payment/callback — CCAvenue server-to-server
async function paymentCallback(req, res) {
  try {
    const { encResp } = req.body;
    if (!encResp) return res.redirect(`${FRONTEND_URL}/payment-failed`);

    const decrypted = decrypt(encResp);
    const params = Object.fromEntries(decrypted.split('&').map(p => p.split('=')));

    const { order_id, tracking_id, bank_ref_no, order_status, failure_message, payment_mode } = params;

    const payment = await Payment.findOne({ where: { order_id } });
    if (!payment) return res.redirect(`${FRONTEND_URL}/payment-failed`);

    const statusMap = { Success: 'SUCCESS', Failure: 'FAILED', Aborted: 'ABORTED' };
    const newStatus = statusMap[order_status] || 'FAILED';

    await payment.update({ tracking_id, bank_ref_no, status: newStatus, payment_mode, failure_message: failure_message || null });

    if (newStatus === 'SUCCESS') {
      await Application.update({ status: 'PAID' }, { where: { application_id: payment.application_id } });
      const student = await Student.findOne({
        include: [{ model: Application, as: 'applications', where: { application_id: payment.application_id } }]
      });
      if (student?.email) {
        const app = await Application.findByPk(payment.application_id);
        try { await sendConfirmationEmail(student.email, student.name, app.application_no); } catch (_) {}
      }
      return res.redirect(`${FRONTEND_URL}/application/${payment.application_id}/payment-success`);
    }

    return res.redirect(`${FRONTEND_URL}/application/${payment.application_id}/payment-failed`);
  } catch (err) {
    console.error(err);
    return res.redirect(`${FRONTEND_URL}/payment-failed`);
  }
}

// GET /payment/status/:application_id
async function getPaymentStatus(req, res) {
  try {
    const payment = await Payment.findOne({
      where: { application_id: req.params.application_id },
      order: [['created_at', 'DESC']],
    });
    if (!payment) return error(res, 'Payment record not found', 404);
    return success(res, payment);
  } catch (err) {
    return error(res, 'Failed to fetch payment status', 500);
  }
}

module.exports = { initiatePayment, paymentCallback, getPaymentStatus };
