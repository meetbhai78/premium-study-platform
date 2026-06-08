const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

// @route   POST /api/activity/log
// @desc    Log a student activity event
// @access  Protected
router.post('/log', protect, async (req, res) => {
  try {
    const { actionType, title, category, metadata } = req.body;

    if (!actionType) {
      return res.status(400).json({ success: false, message: 'actionType is required.' });
    }

    await Activity.create({
      user: req.user._id,
      actionType,
      title: title || '',
      category: category || '',
      metadata: metadata || '',
    });

    res.status(201).json({ success: true, message: 'Activity logged.' });
  } catch (err) {
    console.error('Activity log failed:', err.message);
    res.status(500).json({ success: false, message: 'Failed to log activity.' });
  }
});

// @route   GET /api/activity/report
// @desc    Get student's activity report (today/week/month)
// @access  Protected
router.get('/report', protect, async (req, res) => {
  try {
    const { period } = req.query; // 'today', 'week', 'month'
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'today':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
    }

    const activities = await Activity.find({
      user: req.user._id,
      createdAt: { $gte: startDate },
    }).sort({ createdAt: -1 }).limit(200);

    // Compute summary stats
    const summary = {
      totalActions: activities.length,
      pdfViews: activities.filter(a => a.actionType === 'pdf_view').length,
      videoWatches: activities.filter(a => a.actionType === 'video_watch').length,
      quizAttempts: activities.filter(a => a.actionType === 'quiz_attempt').length,
      downloads: activities.filter(a => a.actionType === 'material_download').length,
      doubtsAsked: activities.filter(a => a.actionType === 'doubt_asked').length,
    };

    res.json({ success: true, data: activities, summary, period: period || 'today' });
  } catch (err) {
    console.error('Activity report failed:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load report.' });
  }
});

module.exports = router;
