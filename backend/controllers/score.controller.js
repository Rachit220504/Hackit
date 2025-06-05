const Score = require('../models/Score');
const Evaluation = require('../models/Evaluation');
const Project = require('../models/Project');
const JudgingCriteria = require('../models/JudgingCriteria');

// @desc    Get all scores
// @route   GET /api/scores
// @access  Private/Admin
exports.getScores = async (req, res) => {
  try {
    const scores = await Score.find()
      .populate('project', 'title team')
      .populate({
        path: 'criteriaScores.criteria',
        select: 'name weight'
      });
    
    res.json(scores);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get score for a project
// @route   GET /api/scores/project/:id
// @access  Private
exports.getProjectScore = async (req, res) => {
  try {
    const score = await Score.findOne({ project: req.params.id })
      .populate({
        path: 'criteriaScores.criteria',
        select: 'name weight'
      });
    
    if (!score) {
      return res.status(404).json({ message: 'Score not found for this project' });
    }
    
    res.json(score);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Calculate scores for all projects
// @route   POST /api/scores/calculate
// @access  Private/Admin
exports.calculateAllScores = async (req, res) => {
  try {
    // Get all approved projects
    const projects = await Project.find({ submissionStatus: 'approved' });
    
    if (projects.length === 0) {
      return res.status(400).json({ message: 'No approved projects found' });
    }
    
    const results = [];
    
    // Calculate score for each project
    for (const project of projects) {
      // Get evaluations for this project
      const evaluations = await Evaluation.find({
        project: project._id,
        status: 'submitted'
      }).populate('scores.criteria');
      
      if (evaluations.length === 0) {
        continue; // Skip projects without evaluations
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
      
      // Create or update score
      let score = await Score.findOne({ project: project._id });
      
      if (score) {
        score.finalScore = finalScore;
        score.evaluationCount = evaluations.length;
        score.criteriaScores = criteriaScores;
        score.calculatedAt = Date.now();
        await score.save();
      } else {
        score = await Score.create({
          project: project._id,
          finalScore,
          evaluationCount: evaluations.length,
          criteriaScores,
        });
      }
      
      results.push({
        projectId: project._id,
        title: project.title,
        finalScore,
        evaluationCount: evaluations.length
      });
    }
    
    // Calculate ranks based on final scores
    const sortedScores = await Score.find().sort('-finalScore');
    
    for (let i = 0; i < sortedScores.length; i++) {
      sortedScores[i].rank = i + 1;
      await sortedScores[i].save();
    }
    
    res.json({
      message: `Calculated scores for ${results.length} projects`,
      results
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};
