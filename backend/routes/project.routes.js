const express = require('express');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  submitProject,
  addFeedback,
  updateSubmissionStatus,
  getMyTeamProjects
} = require('../controllers/project.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Public and protected routes
router.route('/')
  .get(getProjects)
  .post(protect, createProject);

router.route('/myteam')
  .get(protect, getMyTeamProjects);

router.route('/:id')
  .get(getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

// Project submission and feedback routes
router.route('/:id/submit')
  .post(protect, submitProject);

router.route('/:id/feedback')
  .post(protect, authorize('admin', 'organizer'), addFeedback);

router.route('/:id/status')
  .put(protect, authorize('admin', 'organizer'), updateSubmissionStatus);

module.exports = router;
