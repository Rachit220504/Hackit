const express = require('express');
const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  joinTeam,
  leaveTeam,
  removeMember,
  inviteToTeam,
  getTeamInvitations,
  verifyInvitation,
  acceptInvitation,
  declineInvitation,
  cancelInvitation
} = require('../controllers/team.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Team CRUD routes
router.route('/')
  .get(getTeams)
  .post(protect, createTeam);

router.route('/:id')
  .get(getTeam)
  .put(protect, updateTeam)
  .delete(protect, deleteTeam);

// Team membership routes
router.route('/:id/join')
  .post(protect, joinTeam);

router.route('/:id/leave')
  .post(protect, leaveTeam);

router.route('/:id/members/:userId')
  .delete(protect, removeMember);

// Team invitation routes
router.route('/:id/invite')
  .post(protect, inviteToTeam);

router.route('/:id/invitations')
  .get(protect, getTeamInvitations);

router.route('/:id/invitations/:email')
  .delete(protect, cancelInvitation);

// Public route to verify invitation token
router.route('/invitations/:token')
  .get(verifyInvitation);

// Protected routes to accept/decline invitations
router.route('/invitations/:token/accept')
  .post(protect, acceptInvitation);

router.route('/invitations/:token/decline')
  .post(protect, declineInvitation);

module.exports = router;
