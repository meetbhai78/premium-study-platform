const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actionType: {
    type: String,
    enum: ['pdf_view', 'video_watch', 'quiz_attempt', 'material_download', 'doubt_asked', 'login'],
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: '',
  },
  metadata: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Indexes for fast date-range queries
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
