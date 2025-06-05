const Judge = require('../models/Judge');
const User = require('../models/User');

// @desc    Create a judge
// @route   POST /api/judges
// @access  Private/Admin
exports.createJudge = async (req, res) => {
  try {
    const { userId, expertise } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if judge already exists
    const existingJudge = await Judge.findOne({ user: userId });
    if (existingJudge) {
      return res.status(400).json({ message: 'This user is already a judge' });
    }
    
    // Create judge
    const judge = await Judge.create({
      user: userId,
      expertise: expertise || [],
    });
    
    // Update user role to include judge
    if (user.role === 'user') {
      await User.findByIdAndUpdate(userId, { role: 'judge' });
    }
    
    res.status(201).json(judge);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all judges
// @route   GET /api/judges
// @access  Private/Admin
exports.getJudges = async (req, res) => {
  try {
    const judges = await Judge.find()
      .populate('user', 'name email avatar')
      .populate('assignedProjects', 'title submissionStatus');
    
    res.json(judges);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get a single judge
// @route   GET /api/judges/:id
// @access  Private/Admin
exports.getJudge = async (req, res) => {
  try {
    const judge = await Judge.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('assignedProjects', 'title submissionStatus');
    
    if (!judge) {
      return res.status(404).json({ message: 'Judge not found' });
    }
    
    res.json(judge);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update judge
// @route   PUT /api/judges/:id
// @access  Private/Admin
exports.updateJudge = async (req, res) => {
  try {
    const { expertise, isAvailable } = req.body;
    
    const judge = await Judge.findById(req.params.id);
    
    if (!judge) {
      return res.status(404).json({ message: 'Judge not found' });
    }
    
    if (expertise !== undefined) {
      judge.expertise = expertise;
    }
    
    if (isAvailable !== undefined) {
      judge.isAvailable = isAvailable;
    }
    
    await judge.save();
    
    res.json(judge);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Delete judge
// @route   DELETE /api/judges/:id
// @access  Private/Admin
exports.deleteJudge = async (req, res) => {
  try {
    const judge = await Judge.findById(req.params.id);
    
    if (!judge) {
      return res.status(404).json({ message: 'Judge not found' });
    }
    
    await judge.deleteOne();
    
    res.json({ message: 'Judge removed' });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Assign projects to judge
// @route   PUT /api/judges/:id/assign
// @access  Private/Admin
exports.assignProjects = async (req, res) => {
  try {
    const { projectIds } = req.body;
    const judge = await Judge.findById(req.params.id);
    
    if (!judge) {
      return res.status(404).json({ message: 'Judge not found' });
    }
    
    judge.assignedProjects = projectIds;
    await judge.save();
    
    res.json(judge);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};
