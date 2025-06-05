const express = require('express');
const {
  createJudge,
  getJudges,
  assignProjects,
  createCriteria,
  getCriteria,
  submitEvaluation,
  getProjectEvaluations,
  finalizeProjectScores
} = require('../controllers/judging.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Judge routes
router.route('/judges')
  .get(protect, authorize('admin', 'organizer'), getJudges)
  .post(protect, authorize('admin', 'organizer'), createJudge);

router.route('/judges/:id/assign')
  .put(protect, authorize('admin', 'organizer'), assignProjects);

// Criteria routes
router.route('/criteria')
  .get(protect, getCriteria)
  .post(protect, authorize('admin', 'organizer'), createCriteria);

// Evaluation routes
router.route('/evaluations')
  .post(protect, authorize('judge', 'admin'), submitEvaluation);

router.route('/projects/:id/evaluations')
  .get(protect, authorize('admin', 'organizer'), getProjectEvaluations);

router.route('/projects/:id/finalize')
  .post(protect, authorize('admin', 'organizer'), finalizeProjectScores);

module.exports = router;
