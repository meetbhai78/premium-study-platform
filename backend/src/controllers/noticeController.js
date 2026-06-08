const Notice = require('../models/Notice');

// @desc    Get notices targeted to current user type (all/free/premium)
// @route   GET /api/notices
// @access  Private
exports.getNotices = async (req, res) => {
  try {
    const user = req.user;
    
    // Default targets query
    const targetGroups = ['all'];
    if (user.premium) {
      targetGroups.push('premium');
    } else {
      targetGroups.push('free');
    }

    const notices = await Notice.find({ target: { $in: targetGroups } }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: notices.length, data: notices });
  } catch (error) {
    console.error('Fetch Notices Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create announcements
// @route   POST /api/notices
// @access  Private (Admin Only)
exports.createNotice = async (req, res) => {
  try {
    const { title, content, target } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide both title and content' });
    }

    const notice = await Notice.create({
      title,
      content,
      target: target || 'all',
    });

    res.status(201).json({ success: true, message: 'Announcement created successfully', data: notice });
  } catch (error) {
    console.error('Create Notice Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/notices/:id
// @access  Private (Admin Only)
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await Notice.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete Notice Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
