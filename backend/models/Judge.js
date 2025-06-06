const mongoose = require('mongoose');

const JudgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  }],
  expertise: [String],
  isAvailable: {
    type: Boolean,
    default: true,
  },
  completedEvaluations: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Judge', JudgeSchema);
