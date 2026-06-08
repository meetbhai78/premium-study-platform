const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  materialTitle: {
    type: String,
    default: 'General Doubt',
  },
  materialCategory: {
    type: String,
    default: '',
  },
  question: {
    type: String,
    required: [true, 'Please write your doubt/question'],
    maxlength: [1000, 'Question cannot exceed 1000 characters'],
  },
  status: {
    type: String,
    enum: ['pending', 'solved'],
    default: 'pending',
  },
  adminReply: {
    type: String,
    default: '',
  },
  repliedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for faster queries
doubtSchema.index({ student: 1, createdAt: -1 });
doubtSchema.index({ status: 1 });

module.exports = mongoose.model('Doubt', doubtSchema);
