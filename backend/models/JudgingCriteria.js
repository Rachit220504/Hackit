const mongoose = require('mongoose');

const JudgingCriteriaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a criteria name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [200, 'Description cannot be more than 200 characters'],
  },
  weight: {
    type: Number,
    required: [true, 'Please add a weight'],
    min: [1, 'Weight must be at least 1'],
    max: [10, 'Weight cannot be more than 10'],
    default: 1,
  },
  minScore: {
    type: Number,
    default: 1,
  },
  maxScore: {
    type: Number,
    default: 10,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('JudgingCriteria', JudgingCriteriaSchema);
