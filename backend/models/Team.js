const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
  },
  token: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800, // Auto-delete after 1 week (in seconds)
  },
});

const TeamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['leader', 'developer', 'designer', 'tester', 'marketer', 'other'],
    default: 'developer'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a team name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Team name cannot be more than 50 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  memberDetails: [TeamMemberSchema],
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  invitations: [InvitationSchema],
  maxMembers: {
    type: Number,
    default: 5,
  },
  skillsNeeded: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Team', TeamSchema);
