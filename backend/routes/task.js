/**
 * Task Routes
 */

const express = require('express');
const router = express.Router();
const {
  createNewTask,
  getTasks,
  getNearby,
  filterTasks,
  getTask,
  getMyTasks,
  getMyAcceptedTasks,
  updateStatus,
  completeTask,
  deleteTaskEndpoint,
} = require('../controllers/taskController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { validateTaskCreation, validateRequired } = require('../middleware/validation');

// Public routes - specific routes before general
router.post('/', authMiddleware, validateTaskCreation, createNewTask);
router.get('/filter', optionalAuth, filterTasks);
router.get('/nearby', optionalAuth, getNearby);
router.get('/my/created', authMiddleware, getMyTasks);
router.get('/my/accepted', authMiddleware, getMyAcceptedTasks);

// Protected routes - specific before general
router.put('/:id/status', authMiddleware, validateRequired(['status']), updateStatus);
router.post('/:id/complete', authMiddleware, completeTask);
router.delete('/:id', authMiddleware, deleteTaskEndpoint);

// General routes - must be last
router.get('/', optionalAuth, getTasks);
router.get('/:id', optionalAuth, getTask);

module.exports = router;
