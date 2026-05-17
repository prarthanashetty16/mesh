/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const {
  getDashboard,
  listAllUsers,
  listAllTasks,
  listAllTransactions,
  listAllReviews,
  getAnalytics,
  verifyAdminPassword,
  getActivities,
  getActivitySummaryData,
} = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');
const { adminPasswordMiddleware } = require('../middleware/auth');

// Verify admin password (no auth required, just password)
router.post('/verify-password', verifyAdminPassword);

// All routes below require both authentication and admin password
// Dashboard
router.get('/dashboard', authMiddleware, adminPasswordMiddleware, getDashboard);

// Users
router.get('/users', authMiddleware, adminPasswordMiddleware, listAllUsers);

// Tasks
router.get('/tasks', authMiddleware, adminPasswordMiddleware, listAllTasks);

// Transactions
router.get('/transactions', authMiddleware, adminPasswordMiddleware, listAllTransactions);

// Reviews
router.get('/reviews', authMiddleware, adminPasswordMiddleware, listAllReviews);

// Analytics
router.get('/analytics', authMiddleware, adminPasswordMiddleware, getAnalytics);

// Activities (User audit log)
router.get('/activities', authMiddleware, adminPasswordMiddleware, getActivities);

// Activity Summary
router.get('/activity-summary', authMiddleware, adminPasswordMiddleware, getActivitySummaryData);

module.exports = router;
