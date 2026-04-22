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
} = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');

// Note: In production, add role-based access control to verify user is admin
// For now, these are protected routes requiring authentication

// Dashboard
router.get('/dashboard', authMiddleware, getDashboard);

// Users
router.get('/users', authMiddleware, listAllUsers);

// Tasks
router.get('/tasks', authMiddleware, listAllTasks);

// Transactions
router.get('/transactions', authMiddleware, listAllTransactions);

// Reviews
router.get('/reviews', authMiddleware, listAllReviews);

// Analytics
router.get('/analytics', authMiddleware, getAnalytics);

module.exports = router;
