const express = require('express');
const router = express.Router();
const Doubt = require('../models/Doubt');
const Activity = require('../models/Activity');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/doubts
// @desc    Student submits a new doubt
// @access  Protected
router.post('/', protect, async (req, res) => {
  try {
    const { question, materialTitle, materialCategory } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please write your doubt/question.' });
    }

    const doubt = await Doubt.create({
      student: req.user._id,
      question: question.trim(),
      materialTitle: materialTitle || 'General Doubt',
      materialCategory: materialCategory || '',
    });

    // Log activity
    await Activity.create({
      user: req.user._id,
      actionType: 'doubt_asked',
      title: materialTitle || 'General Doubt',
      category: materialCategory || '',
    });

    res.status(201).json({ success: true, data: doubt });
  } catch (err) {
    console.error('Doubt creation failed:', err.message);
    res.status(500).json({ success: false, message: 'Failed to submit doubt.' });
  }
});

// @route   GET /api/doubts/my
// @desc    Student gets their own doubts
// @access  Protected
router.get('/my', protect, async (req, res) => {
  try {
    const doubts = await Doubt.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: doubts, count: doubts.length });
  } catch (err) {
    console.error('Fetch my doubts failed:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load doubts.' });
  }
});

// @route   GET /api/doubts/all
// @desc    Admin gets all doubts from all students
// @access  Admin
router.get('/all', protect, admin, async (req, res) => {
  try {
    const doubts = await Doubt.find()
      .populate('student', 'name email mobile')
      .sort({ createdAt: -1 })
      .limit(100);

    const pendingCount = await Doubt.countDocuments({ status: 'pending' });
    const solvedCount = await Doubt.countDocuments({ status: 'solved' });

    res.json({ success: true, data: doubts, pendingCount, solvedCount });
  } catch (err) {
    console.error('Admin fetch doubts failed:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load doubts.' });
  }
});

// @route   PUT /api/doubts/:id/reply
// @desc    Admin replies to a doubt
// @access  Admin
router.put('/:id/reply', protect, admin, async (req, res) => {
  try {
    const { adminReply } = req.body;

    if (!adminReply || adminReply.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please write a reply.' });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found.' });
    }

    doubt.adminReply = adminReply.trim();
    doubt.status = 'solved';
    doubt.repliedAt = new Date();
    await doubt.save();

    res.json({ success: true, data: doubt });
  } catch (err) {
    console.error('Admin reply failed:', err.message);
    res.status(500).json({ success: false, message: 'Failed to reply.' });
  }
});

// @route   DELETE /api/doubts/:id
// @desc    Admin deletes a doubt
// @access  Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const doubt = await Doubt.findByIdAndDelete(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found.' });
    }
    res.json({ success: true, message: 'Doubt deleted successfully.' });
  } catch (err) {
    console.error('Doubt delete failed:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete doubt.' });
  }
});

module.exports = router;
