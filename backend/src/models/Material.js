const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a material title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: [
      'Gujarati Grammer',
      'English Grammer',
      'Std 9 Maths',
      'Std 9 Science',
      'Std 9 SS',
      'Std 10 Maths',
      'Std 10 Science',
      'Std 10 SS',
      'Manovigyan',
      'Pedagogy',
      'Reasoning',
      'Maths',
      'GK',
      'TAT',
      'TET',
      'Std 6',
      'Std 7',
      'Std 8',
      'Others',
      'Teachers Material (Maths Science)',
      'Others (For Teachers)',
    ],
  },
  type: {
    type: String,
    required: [true, 'Please specify the material type'],
    enum: ['pdf', 'video', 'zip'],
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide the file URL'],
  },
  filePublicId: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
  },
  thumbnailPublicId: {
    type: String,
  },
  accessType: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Material', materialSchema);
