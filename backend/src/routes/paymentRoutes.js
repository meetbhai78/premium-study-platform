const express = require('express');
const router = express.Router();
const {
  getUPIDetails,
  requestPremium,
  adminGetPendingPayments,
  adminVerifyPayment,
  createOrder,
  verifySignature,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const upload = require('../middleware/upload');

// Rate limiter for manual receipt uploads (spam protection)
const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: { success: false, message: 'Too many upload attempts. Please try after 5 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// User payment flows
router.get('/upi-info', protect, getUPIDetails);
router.post('/unlock', protect, uploadLimiter, upload.single('screenshot'), requestPremium);

// Razorpay direct gateway flows
router.post('/razorpay/order', protect, createOrder);
router.post('/razorpay/verify', protect, verifySignature);

// Admin validation flows
router.get('/admin/pending', protect, admin, adminGetPendingPayments);
router.put('/admin/:id/verify', protect, admin, adminVerifyPayment);

module.exports = router;
