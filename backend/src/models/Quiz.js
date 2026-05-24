const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Please add a question text'],
    trim: true,
  },
  options: {
    type: [String],
    required: [true, 'Please add options list'],
    validate: [
      (arr) => arr.length === 4,
      'A multiple choice question must have exactly 4 choices.'
    ],
  },
  correctOptionIndex: {
    type: Number,
    required: [true, 'Please specify correct index'],
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    trim: true,
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a quiz title'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Please specify quiz subject category'],
    enum: [
      'Gujarati Grammer',
      'English Grammer',
      'Std 9 Maths',
      'Std 9 Science',
      'Std 10 Maths',
      'Std 10 Science',
      'Manovigyan',
      'Pedagogy',
      'Reasoning',
      'Maths',
      'GK',
      'Others'
    ],
  },
  questions: [questionSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  pointsForCompletion: {
    type: Number,
    default: 50,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Quiz', quizSchema);
