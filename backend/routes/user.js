/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getWallet, getReviews } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const { validateLocationUpdate } = require('../middleware/validation');

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/wallet', authMiddleware, getWallet);
router.get('/reviews', authMiddleware, getReviews);

module.exports = router;
