const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  criteria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JudgingCriteria',
    required: true,
  },
  score: {
    type: Number,
    required: [true, 'Please add a score'],
  },
  comment: {
    type: String,
    maxlength: [200, 'Comment cannot be more than 200 characters'],
  },
});

const EvaluationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Judge',
    required: true,
  },
  scores: [ScoreSchema],
  overallComment: {
    type: String,
    maxlength: [500, 'Overall comment cannot be more than 500 characters'],
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'finalized'],
    default: 'draft',
  },
  submittedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Evaluation', EvaluationSchema);
