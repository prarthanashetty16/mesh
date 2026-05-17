/**
 * Location Routes
 */

const express = require('express');
const router = express.Router();
const { updateLocation, getTaskPerformerLocation, getMyLocation } = require('../controllers/locationController');
const { authMiddleware } = require('../middleware/auth');
const { validateLocationUpdate } = require('../middleware/validation');

// Protected routes
router.post('/update', authMiddleware, validateLocationUpdate, updateLocation);
router.get('/me', authMiddleware, getMyLocation);
router.get('/task/:task_id', authMiddleware, getTaskPerformerLocation);

module.exports = router;
