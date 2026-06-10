const User = require('../models/User');
const Material = require('../models/Material');
const Payment = require('../models/Payment');

// @desc    Get dashboard analytics statistics
// @route   GET /api/admin/stats
// @access  Private (Admin Only)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const premiumUsers = await User.countDocuments({ role: 'user', premium: true });
    const totalMaterials = await Material.countDocuments({});

    // Aggregate total revenue from approved payments
    const revenueStats = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        premiumUsers,
        totalMaterials,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Fetch Stats Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (searchable)
// @route   GET /api/admin/users
// @access  Private (Admin Only)
exports.getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { role: 'user' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('Fetch Users Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manually upgrade/downgrade premium user access
// @route   PUT /api/admin/users/:id/premium
// @access  Private (Admin Only)
exports.updateUserPremium = async (req, res) => {
  try {
    const { premium } = req.body; // boolean

    if (typeof premium !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Please specify premium status as a boolean' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.premium = premium;
    user.paymentStatus = premium ? 'approved' : 'none';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User premium status has been manually ${premium ? 'activated' : 'deactivated'}.`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        premium: user.premium,
        paymentStatus: user.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Manual Premium Upgrade Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle activate/deactivate user profiles
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin Only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User profile has been successfully ${user.isActive ? 'activated' : 'deactivated'}.`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Toggle User Status Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user record
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete users payment logs too for referential integrity
    await Payment.deleteMany({ userId: req.params.id });

    // Remove user profile
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'User account and associated logs deleted successfully' });
  } catch (error) {
    console.error('Delete User Account Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset user password manually by Admin
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private (Admin Only)
exports.resetUserPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Please provide a password of at least 6 characters' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Set the password. The pre('save') hook in the User model will hash this.
    user.passwordHash = password;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Password for ${user.name} has been reset successfully.`,
    });
  } catch (error) {
    console.error('Admin Password Reset Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

