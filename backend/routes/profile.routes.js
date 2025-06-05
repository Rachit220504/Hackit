const express = require('express');
const { updateProfile, getProfileById } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.put('/', protect, updateProfile);
router.get('/:id', getProfileById);

module.exports = router;
