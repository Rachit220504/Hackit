const Team = require('../models/Team');
const User = require('../models/User');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

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

// @desc    Invite a user to the team
// @route   POST /api/teams/:id/invite
// @access  Private
exports.inviteToTeam = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const team = await Team.findById(req.params.id)
      .populate('leader', 'name email')
      .populate('members', 'email');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is team leader
    if (team.leader._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Only team leader can send invitations' });
    }
    
    // Check if team has reached max members
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ message: `Team has reached the maximum limit of ${team.maxMembers} members` });
    }
    
    // Check if user is already a member
    const isMember = team.members.some(member => member.email === email);
    if (isMember) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }
    
    // Check if invitation already exists
    const existingInvitation = team.invitations.find(inv => inv.email === email && inv.status === 'pending');
    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation has already been sent to this email' });
    }
    
    // Generate unique token for the invitation
    const token = crypto.randomBytes(20).toString('hex');
    
    // Create invitation
    team.invitations.push({
      email,
      token,
      status: 'pending',
      createdAt: Date.now(),
    });
    
    await team.save();
    
    // Create invitation link
    const invitationLink = `${process.env.FRONTEND_URL}/teams/invite/${token}`;
    
    // Send invitation email
    await emailService.sendTeamInvitation(
      email,
      team.name,
      invitationLink,
      team.leader.name
    );
    
    res.json({ message: 'Invitation sent successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get team invitations
// @route   GET /api/teams/:id/invitations
// @access  Private
exports.getTeamInvitations = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is team leader
    if (team.leader.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to view invitations' });
    }
    
    res.json(team.invitations);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Verify invitation token
// @route   GET /api/teams/invitations/:token
// @access  Public
exports.verifyInvitation = async (req, res) => {
  try {
    const token = req.params.token;
    
    // Find team with this invitation token
    const team = await Team.findOne({
      'invitations.token': token,
      'invitations.status': 'pending',
    }).populate('leader', 'name');
    
    if (!team) {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }
    
    // Get the specific invitation
    const invitation = team.invitations.find(inv => inv.token === token);
    
    res.json({
      teamId: team._id,
      teamName: team.name,
      leaderName: team.leader.name,
      inviteeEmail: invitation.email,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Accept team invitation
// @route   POST /api/teams/invitations/:token/accept
// @access  Private
exports.acceptInvitation = async (req, res) => {
  try {
    const token = req.params.token;
    
    // Find team with this invitation token
    const team = await Team.findOne({
      'invitations.token': token,
      'invitations.status': 'pending',
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }
    
    // Get the specific invitation
    const invitation = team.invitations.find(inv => inv.token === token);
    
    // Verify that the logged-in user's email matches the invitation
    if (req.user.email !== invitation.email) {
      return res.status(401).json({ message: 'This invitation was sent to a different email address' });
    }
    
    // Add user to team members if not already a member
    if (!team.members.includes(req.user.id)) {
      team.members.push(req.user.id);
    }
    
    // Update invitation status
    invitation.status = 'accepted';
    
    await team.save();
    
    res.json({ message: 'Invitation accepted successfully', teamId: team._id });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Decline team invitation
// @route   POST /api/teams/invitations/:token/decline
// @access  Private
exports.declineInvitation = async (req, res) => {
  try {
    const token = req.params.token;
    
    // Find team with this invitation token
    const team = await Team.findOne({
      'invitations.token': token,
      'invitations.status': 'pending',
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }
    
    // Get the specific invitation
    const invitation = team.invitations.find(inv => inv.token === token);
    
    // Verify that the logged-in user's email matches the invitation
    if (req.user.email !== invitation.email) {
      return res.status(401).json({ message: 'This invitation was sent to a different email address' });
    }
    
    // Update invitation status
    invitation.status = 'declined';
    
    await team.save();
    
    res.json({ message: 'Invitation declined successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Cancel invitation (team leader only)
// @route   DELETE /api/teams/:id/invitations/:email
// @access  Private
exports.cancelInvitation = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is team leader
    if (team.leader.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to cancel invitations' });
    }
    
    // Remove the invitation
    team.invitations = team.invitations.filter(inv => inv.email !== req.params.email);
    
    await team.save();
    
    res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};
