const JudgingCriteria = require('../models/JudgingCriteria');

// @desc    Create judging criteria
// @route   POST /api/criteria
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
// @route   GET /api/criteria
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

// @desc    Get single judging criteria
// @route   GET /api/criteria/:id
// @access  Private
exports.getSingleCriteria = async (req, res) => {
  try {
    const criteria = await JudgingCriteria.findById(req.params.id);
    
    if (!criteria) {
      return res.status(404).json({ message: 'Criteria not found' });
    }
    
    res.json(criteria);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update judging criteria
// @route   PUT /api/criteria/:id
// @access  Private/Admin
exports.updateCriteria = async (req, res) => {
  try {
    const criteria = await JudgingCriteria.findById(req.params.id);
    
    if (!criteria) {
      return res.status(404).json({ message: 'Criteria not found' });
    }
    
    // Only creator or admin can update
    if (criteria.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this criteria' });
    }
    
    const updatedCriteria = await JudgingCriteria.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedCriteria);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Delete judging criteria
// @route   DELETE /api/criteria/:id
// @access  Private/Admin
exports.deleteCriteria = async (req, res) => {
  try {
    const criteria = await JudgingCriteria.findById(req.params.id);
    
    if (!criteria) {
      return res.status(404).json({ message: 'Criteria not found' });
    }
    
    // Only creator or admin can delete
    if (criteria.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this criteria' });
    }
    
    await criteria.deleteOne();
    
    res.json({ message: 'Criteria removed' });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};
