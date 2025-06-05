const Project = require('../models/Project');
const Team = require('../models/Team');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    // Get team where user is leader
    const team = await Team.findOne({ leader: req.user.id });
    
    if (!team) {
      return res.status(400).json({ message: 'You must be a team leader to create a project' });
    }
    
    // Add team to project
    req.body.team = team._id;
    
    const project = await Project.create(req.body);
    
    // Update team with project reference
    await Team.findByIdAndUpdate(team._id, { project: project._id });
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('team', 'name description')
      .sort('-createdAt');
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'team',
        populate: {
          path: 'members leader',
          select: 'name email avatar',
        },
      })
      .populate({
        path: 'feedbacks.givenBy',
        select: 'name avatar role',
      });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is team leader
    const team = await Team.findById(project.team);
    if (team.leader.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'organizer') {
      return res.status(401).json({ message: 'Not authorized to update this project' });
    }
    
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.json(project);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is team leader
    const team = await Team.findById(project.team);
    if (team.leader.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this project' });
    }
    
    await project.deleteOne();
    
    // Remove project reference from team
    await Team.findByIdAndUpdate(team._id, { $unset: { project: 1 } });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Submit project for review
// @route   POST /api/projects/:id/submit
// @access  Private
exports.submitProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is team leader
    const team = await Team.findById(project.team);
    if (team.leader.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to submit this project' });
    }
    
    // Update submission status
    project.submissionStatus = 'submitted';
    project.submissionDate = Date.now();
    
    await project.save();
    
    res.json(project);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Add feedback to project
// @route   POST /api/projects/:id/feedback
// @access  Private/Admin/Organizer
exports.addFeedback = async (req, res) => {
  try {
    const { comment } = req.body;
    
    if (!comment) {
      return res.status(400).json({ message: 'Please provide feedback comment' });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Only admin or organizer can add feedback
    if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
      return res.status(401).json({ message: 'Not authorized to add feedback' });
    }
    
    // Add feedback
    project.feedbacks.unshift({
      comment,
      givenBy: req.user.id,
    });
    
    await project.save();
    
    // Populate the newly added feedback
    const populatedProject = await Project.findById(req.params.id).populate({
      path: 'feedbacks.givenBy',
      select: 'name avatar role',
    });
    
    res.json(populatedProject.feedbacks[0]);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update project submission status
// @route   PUT /api/projects/:id/status
// @access  Private/Admin/Organizer
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['draft', 'submitted', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Please provide a valid submission status' });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Only admin or organizer can update submission status
    if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
      return res.status(401).json({ message: 'Not authorized to update submission status' });
    }
    
    // Update status
    project.submissionStatus = status;
    
    // If being resubmitted, update submission date
    if (status === 'submitted') {
      project.submissionDate = Date.now();
    }
    
    await project.save();
    
    res.json(project);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all projects for current user's team
// @route   GET /api/projects/myteam
// @access  Private
exports.getMyTeamProjects = async (req, res) => {
  try {
    // Find teams where user is a member
    const teams = await Team.find({ members: req.user.id });
    
    if (teams.length === 0) {
      return res.json([]);
    }
    
    // Get team IDs
    const teamIds = teams.map(team => team._id);
    
    // Find projects for these teams
    const projects = await Project.find({ team: { $in: teamIds } })
      .populate('team', 'name description leader')
      .sort('-createdAt');
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};
