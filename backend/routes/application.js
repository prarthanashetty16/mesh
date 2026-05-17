/**
 * Application Routes
 */

const express = require('express');
const router = express.Router();
const {
  applyForTask,
  getTaskApplications,
  getMyApplications,
  acceptApp,
  rejectApp,
  checkPriceSuggestion,
} = require('../controllers/applicationController');
const { authMiddleware } = require('../middleware/auth');

// Protected routes
router.post('/:task_id/apply', authMiddleware, applyForTask);
router.get('/my', authMiddleware, getMyApplications);
router.post('/:app_id/accept', authMiddleware, acceptApp);
router.post('/:app_id/reject', authMiddleware, rejectApp);

// More specific routes must come BEFORE general routes
router.get('/task/:task_id/price-suggestion', checkPriceSuggestion);
router.get('/task/:task_id', authMiddleware, getTaskApplications);

module.exports = router;
