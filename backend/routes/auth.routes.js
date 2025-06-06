const express = require('express');
const passport = require('passport');
const { 
  register, 
  login, 
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  oauthCallback
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Local auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// OAuth routes
router.get('/github',
  passport.authenticate('github', { session: false })
);

router.get('/github/callback', 
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  oauthCallback
);

router.get('/google',
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  oauthCallback
);

module.exports = router;
