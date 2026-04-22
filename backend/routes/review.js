/**
 * Review Routes
 */

const express = require('express');
const router = express.Router();
const { addReview, getUserReviews, getTaskReviews } = require('../controllers/reviewController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

// Public routes
router.get('/user/:user_id', optionalAuth, getUserReviews);
router.get('/task/:task_id', optionalAuth, getTaskReviews);

// Protected routes
router.post('/task/:task_id', authMiddleware, validateReview, addReview);

module.exports = router;
