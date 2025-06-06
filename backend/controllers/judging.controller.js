const Judge = require('../models/Judge');
const JudgingCriteria = require('../models/JudgingCriteria');
const Evaluation = require('../models/Evaluation');
const Score = require('../models/Score');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create a judge
// @route   POST /api/judging/judges
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
// @route   GET /api/judging/judges
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

// @desc    Assign projects to judge
// @route   PUT /api/judging/judges/:id/assign
// @access  Private/Admin
exports.assignProjects = async (req, res) => {
  try {
    const { projectIds } = req.body;
    
    if (!projectIds || !Array.isArray(projectIds)) {
      return res.status(400).json({ message: 'Please provide project IDs as an array' });
    }
    
    // Check if judge exists
    const judge = await Judge.findById(req.params.id);
    if (!judge) {
      return res.status(404).json({ message: 'Judge not found' });
    }
    
    // Verify projects exist and are submitted
    for (const projectId of projectIds) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: `Project with ID ${projectId} not found` });
      }
      if (project.submissionStatus !== 'submitted' && project.submissionStatus !== 'approved') {
        return res.status(400).json({ 
          message: `Project with ID ${projectId} is not ready for judging (status: ${project.submissionStatus})` 
        });
      }
    }
    
    // Update judge's assigned projects
    judge.assignedProjects = [...new Set([...judge.assignedProjects.map(p => p.toString()), ...projectIds])];
    await judge.save();
    
    res.json(judge);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Create judging criteria
// @route   POST /api/judging/criteria
// @access  Private/Admin
exports.createCriteria = async (req, res) => {
  try {
    // Add user ID to criteria
    req.body.createdBy = req.user.id;
    
    const criteria = await JudgingCriteria.create(req.body);
    
    res.status(201).json(criteria);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all judging criteria
// @route   GET /api/judging/criteria
// @access  Private
exports.getCriteria = async (req, res) => {
  try {
    const criteria = await JudgingCriteria.find().sort('name');
    
    res.json(criteria);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Submit evaluation for a project
// @route   POST /api/judging/evaluations
// @access  Private/Judge
exports.submitEvaluation = async (req, res) => {
  try {
    const { projectId, scores, overallComment } = req.body;
    
    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Find judge by user ID
    const judge = await Judge.findOne({ user: req.user.id });
    if (!judge) {
      return res.status(403).json({ message: 'You are not registered as a judge' });
    }
    
    // Check if project is assigned to this judge
    if (!judge.assignedProjects.includes(projectId)) {
      return res.status(403).json({ message: 'This project is not assigned to you' });
    }
    
    // Calculate total score
    let totalScore = 0;
    for (const score of scores) {
      const criteria = await JudgingCriteria.findById(score.criteria);
      if (!criteria) {
        return res.status(404).json({ message: `Criteria with ID ${score.criteria} not found` });
      }
      totalScore += score.score * criteria.weight;
    }
    
    // Create or update evaluation
    let evaluation = await Evaluation.findOne({ project: projectId, judge: judge._id });
    
    if (evaluation) {
      evaluation.scores = scores;
      evaluation.overallComment = overallComment;
      evaluation.totalScore = totalScore;
      evaluation.status = 'submitted';
      evaluation.submittedAt = Date.now();
      await evaluation.save();
    } else {
      evaluation = await Evaluation.create({
        project: projectId,
        judge: judge._id,
        scores,
        overallComment,
        totalScore,
        status: 'submitted',
        submittedAt: Date.now(),
      });
    }
    
    // Update judge's completed evaluations count
    judge.completedEvaluations += 1;
    await judge.save();
    
    res.status(201).json(evaluation);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get evaluations for a project
// @route   GET /api/judging/projects/:id/evaluations
// @access  Private/Admin
exports.getProjectEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ project: req.params.id, status: 'submitted' })
      .populate({
        path: 'judge',
        populate: {
          path: 'user',
          select: 'name avatar',
        },
      })
      .populate('scores.criteria');
    
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Finalize scores for a project
// @route   POST /api/judging/projects/:id/finalize
// @access  Private/Admin
exports.finalizeProjectScores = async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Get all submitted evaluations for the project
    const evaluations = await Evaluation.find({ 
      project: projectId, 
      status: 'submitted' 
    }).populate('scores.criteria');
    
    if (evaluations.length === 0) {
      return res.status(400).json({ message: 'No evaluations found for this project' });
    }
    
    // Calculate final score
    let finalScore = 0;
    const criteriaMap = new Map();
    
    evaluations.forEach(evaluation => {
      evaluation.scores.forEach(score => {
        const criteriaId = score.criteria._id.toString();
        const weight = score.criteria.weight;
        
        if (!criteriaMap.has(criteriaId)) {
          criteriaMap.set(criteriaId, {
            criteria: criteriaId,
            totalScore: 0,
            count: 0,
            weight,
          });
        }
        
        const criteriaData = criteriaMap.get(criteriaId);
        criteriaData.totalScore += score.score;
        criteriaData.count += 1;
      });
    });
    
    const criteriaScores = [];
    
    criteriaMap.forEach(data => {
      const averageScore = data.totalScore / data.count;
      finalScore += averageScore * data.weight;
      
      criteriaScores.push({
        criteria: data.criteria,
        averageScore,
      });
    });
    
    // Create or update final score
    let score = await Score.findOne({ project: projectId });
    
    if (score) {
      score.finalScore = finalScore;
      score.evaluationCount = evaluations.length;
      score.criteriaScores = criteriaScores;
      score.calculatedAt = Date.now();
      await score.save();
    } else {
      score = await Score.create({
        project: projectId,
        finalScore,
        evaluationCount: evaluations.length,
        criteriaScores,
      });
    }
    
    // Update all evaluations to finalized
    await Evaluation.updateMany(
      { project: projectId, status: 'submitted' },
      { status: 'finalized' }
    );
    
    res.json(score);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};
