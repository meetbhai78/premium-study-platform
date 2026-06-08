const express = require('express');
const router = express.Router();
const { getNotices, createNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, getNotices);
router.post('/', protect, admin, createNotice);
router.delete('/:id', protect, admin, deleteNotice);

module.exports = router;
