const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Create new team
// @route   POST /api/teams
// @access  Private
exports.createTeam = async (req, res) => {
  try {
    // Add current user as leader
    req.body.leader = req.user.id;
    
    // Add current user to members array
    if (!req.body.members) {
      req.body.members = [];
    }
    if (!req.body.members.includes(req.user.id)) {
      req.body.members.push(req.user.id);
    }
    
    const team = await Team.create(req.body);
    
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar');
    
    res.json(teams);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Public
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate('project');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
exports.updateTeam = async (req, res) => {
  try {
    let team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Make sure user is team leader
    if (team.leader.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this team' });
    }
    
    team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.json(team);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Make sure user is team leader
    if (team.leader.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this team' });
    }
    
    await team.deleteOne();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Join a team
// @route   POST /api/teams/:id/join
// @access  Private
exports.joinTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is already a member
    if (team.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already a member of this team' });
    }
    
    // Add user to team members
    team.members.push(req.user.id);
    await team.save();
    
    res.json(team);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Leave a team
// @route   POST /api/teams/:id/leave
// @access  Private
exports.leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is a member
    if (!team.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are not a member of this team' });
    }
    
    // Check if user is the leader
    if (team.leader.toString() === req.user.id) {
      return res.status(400).json({ message: 'Team leader cannot leave the team. Transfer leadership or delete the team.' });
    }
    
    // Remove user from team members
    team.members = team.members.filter(member => member.toString() !== req.user.id);
    await team.save();
    
    res.json(team);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Remove a member from team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is team leader
    if (team.leader.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to remove members' });
    }
    
    // Check if member is in the team
    if (!team.members.includes(req.params.userId)) {
      return res.status(400).json({ message: 'User is not a member of this team' });
    }
    
    // Cannot remove the team leader
    if (team.leader.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove the team leader' });
    }
    
    // Remove user from team members
    team.members = team.members.filter(member => member.toString() !== req.params.userId);
    await team.save();
    
    res.json(team);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};
