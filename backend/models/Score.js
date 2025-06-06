const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  finalScore: {
    type: Number,
    required: [true, 'Please add a final score'],
  },
  rank: {
    type: Number,
  },
  evaluationCount: {
    type: Number,
    default: 0,
  },
  criteriaScores: [{
    criteria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JudgingCriteria',
    },
    averageScore: {
      type: Number,
    },
  }],
  calculatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Score', ScoreSchema);
