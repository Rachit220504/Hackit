const express = require('express');
const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  joinTeam,
  leaveTeam,
  removeMember
} = require('../controllers/team.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .get(getTeams)
  .post(protect, createTeam);

router.route('/:id')
  .get(getTeam)
  .put(protect, updateTeam)
  .delete(protect, deleteTeam);

router.route('/:id/join')
  .post(protect, joinTeam);

router.route('/:id/leave')
  .post(protect, leaveTeam);

router.route('/:id/members/:userId')
  .delete(protect, removeMember);

module.exports = router;
