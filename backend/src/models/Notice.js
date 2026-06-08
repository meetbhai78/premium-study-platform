const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a notice title'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Please add notice content'],
  },
  target: {
    type: String,
    enum: ['all', 'free', 'premium'],
    default: 'all',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notice', noticeSchema);
