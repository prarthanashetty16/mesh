/**
 * Location Controller
 * Handles location tracking for task performers
 */

const { updateUserLocation, getUserById } = require('../models/User');
const { getTaskById, updateTaskStatus } = require('../models/Task');

/**
 * Update user location
 * POST /location/update
 */
const updateLocation = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { latitude, longitude } = req.body;

    await updateUserLocation(userId, latitude, longitude);

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: {
        latitude,
        longitude,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get performer location for a task
 * GET /location/task/:task_id
 */
const getTaskPerformerLocation = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { task_id } = req.params;

    // Get task
    const task = await getTaskById(task_id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Only task creator can view performer location
    if (task.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only task creator can view performer location',
      });
    }

    // Check if task is assigned
    if (task.assigned_to === null) {
      return res.status(400).json({
        success: false,
        message: 'Task has no assigned performer',
      });
    }

    // Check if task is completed (tracking ends after completion)
    if (task.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Task tracking has ended as task is completed',
      });
    }

    // Get performer location
    const performer = await getUserById(task.assigned_to);

    res.status(200).json({
      success: true,
      data: {
        performer_id: performer.user_id,
        performer_name: performer.name,
        location: {
          latitude: performer.latitude,
          longitude: performer.longitude,
        },
        area: {
          area_id: performer.area_id,
          city: performer.city,
          state: performer.state,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get own location
 * GET /location/me
 */
const getMyLocation = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const user = await getUserById(userId);

    res.status(200).json({
      success: true,
      data: {
        user_id: user.user_id,
        name: user.name,
        location: {
          latitude: user.latitude,
          longitude: user.longitude,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateLocation,
  getTaskPerformerLocation,
  getMyLocation,
};
