const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUserPremium,
  toggleUserStatus,
  deleteUser,
  resetUserPassword,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All endpoints in this file are admin-only
router.get('/stats', protect, admin, getStats);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/premium', protect, admin, updateUserPremium);
router.put('/users/:id/toggle-status', protect, admin, toggleUserStatus);
router.put('/users/:id/reset-password', protect, admin, resetUserPassword);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;

