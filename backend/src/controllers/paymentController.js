const Payment = require('../models/Payment');
const User = require('../models/User');
const { uploadFile } = require('../config/cloudinary');
const fs = require('fs');

// Helper to safely unlink temporary files
const cleanTempFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Failed to delete temp file: ${filePath}`, err);
    }
  }
};

// @desc    Get configured UPI credentials and deep links
// @route   GET /api/payments/upi-info
// @access  Private (Registered Users)
exports.getUPIDetails = async (req, res) => {
  try {
    const upiId = process.env.UPI_ID || 'chaudharinikunjkumarvajesingb@razorpay';
    const merchantName = process.env.UPI_MERCHANT_NAME || 'Premium Study Platform';
    const amount = process.env.UPI_AMOUNT || '99';

    // Encode parameters for standard UPI deep link protocol
    // Format: upi://pay?pa=address&pn=name&am=amount&cu=INR
    const encodedName = encodeURIComponent(merchantName);
    const deepLink = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount}&cu=INR`;

    // Individual app deep links (Android-ready anchors)
    const gpayLink = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount}&cu=INR`;
    const phonepeLink = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount}&cu=INR`;
    const paytmLink = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount}&cu=INR`;

    res.status(200).json({
      success: true,
      data: {
        upiId,
        merchantName,
        amount: Number(amount),
        deepLinks: {
          generic: deepLink,
          gpay: gpayLink,
          phonepe: phonepeLink,
          paytm: paytmLink,
        },
        // We can display a custom QR code matching this UPI ID
        qrCodePayload: `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount}&cu=INR`,
      },
    });
  } catch (error) {
    console.error('Fetch UPI Details Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    User submits payment screenshot to request premium activation
// @route   POST /api/payments/unlock
// @access  Private
exports.requestPremium = async (req, res) => {
  let screenshotTempPath = null;
  try {
    const { transactionId } = req.body;
    const userId = req.user._id;

    // Check if user already has premium or pending requests
    const user = await User.findById(userId);
    if (user.premium) {
      return res.status(400).json({ success: false, message: 'You already have premium access!' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a payment screenshot receipt' });
    }

    screenshotTempPath = req.file.path;

    console.log(`Uploading payment screenshot...`);
    const uploadResult = await uploadFile(screenshotTempPath, 'payment_screenshots', 'image');

    // Create payment entry
    const payment = await Payment.create({
      userId,
      amount: Number(process.env.UPI_AMOUNT || 99),
      transactionId: transactionId || `TXN-${Date.now()}`,
      screenshotUrl: uploadResult.secure_url,
      screenshotPublicId: uploadResult.public_id,
      status: 'pending',
    });

    // Update user's payment state to pending
    user.paymentStatus = 'pending';
    await user.save();

    cleanTempFile(screenshotTempPath);

    res.status(201).json({
      success: true,
      message: 'Payment verification request submitted successfully. Admin will verify shortly.',
      data: payment,
    });
  } catch (error) {
    console.error('Submit Payment Error:', error);
    cleanTempFile(screenshotTempPath);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin reviews pending payment claims
// @route   GET /api/payments/admin/pending
// @access  Private (Admin Only)
exports.adminGetPendingPayments = async (req, res) => {
  try {
    const pending = await Payment.find({ status: 'pending' })
      .populate('userId', 'name email mobile paymentStatus')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: pending.length, data: pending });
  } catch (error) {
    console.error('Fetch Pending Payments Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin approves or rejects a payment verification request
// @route   PUT /api/payments/admin/:id/verify
// @access  Private (Admin Only)
exports.adminVerifyPayment = async (req, res) => {
  try {
    const { status, rejectReason } = req.body; // 'approved' or 'rejected'

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid review status (approved/rejected)' });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This payment record has already been reviewed' });
    }

    const user = await User.findById(payment.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User matching this payment not found' });
    }

    // Update payment record details
    payment.status = status;
    if (status === 'rejected') {
      payment.rejectReason = rejectReason || 'Receipt details were unclear or unverified';
    }
    await payment.save();

    // Sync status updates back to the user profiles
    if (status === 'approved') {
      user.premium = true;
      user.paymentStatus = 'approved';
    } else {
      user.premium = false;
      user.paymentStatus = 'rejected';
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: `Payment request has been successfully ${status}.`,
      data: payment,
    });
  } catch (error) {
    console.error('Payment Verification Action Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// Razorpay Webhook & Order SDK Methods
// ==========================================
const { createRazorpayOrder, verifyRazorpaySignature } = require('../config/razorpay');

// @desc    Generate Razorpay Order
// @route   POST /api/payments/razorpay/order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const amount = Number(process.env.UPI_AMOUNT || 99);
    const receiptId = `receipt_order_${Date.now()}`;
    
    console.log(`Generating Razorpay Order for ₹${amount}`);
    const order = await createRazorpayOrder(amount, receiptId);
    
    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        keyId: process.env.RAZORPAY_KEY_ID || 'sandbox_key',
        mock: !!order.mock,
      }
    });
  } catch (error) {
    console.error('Razorpay Controller Error:', error);
    res.status(500).json({ success: false, message: 'Razorpay order creation failed.' });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/razorpay/verify
// @access  Private
exports.verifySignature = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Missing order_id or payment_id details' });
    }
    
    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature verification failed.' });
    }
    
    // Payment is verified! Elevate user premium instantly!
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.premium = true;
    user.paymentStatus = 'approved';
    await user.save();
    
    // Log verified payment in DB
    await Payment.create({
      userId: req.user._id,
      amount: Number(process.env.UPI_AMOUNT || 99),
      transactionId: razorpay_payment_id,
      screenshotUrl: 'https://cdn.razorpay.com/static/assets/logo.svg', // Flagged as gateway transaction
      screenshotPublicId: `gateway_${razorpay_payment_id}`,
      status: 'approved',
    });
    
    res.status(200).json({
      success: true,
      message: 'Razorpay payment signature verified. Premium status unlocked successfully!',
      user: {
        _id: user._id,
        premium: user.premium,
        paymentStatus: user.paymentStatus,
      }
    });
  } catch (error) {
    console.error('Razorpay Signature Verification Controller Error:', error);
    res.status(500).json({ success: false, message: 'Signature verification failed.' });
  }
};
