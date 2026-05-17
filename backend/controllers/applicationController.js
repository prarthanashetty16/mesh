/**
 * Application Controller
 * Handles task applications (users applying for tasks)
 */

const {
  createApplication,
  getApplicationById,
  getApplicationsByTask,
  getApplicationsByUser,
  checkExistingApplication,
  acceptApplication,
  rejectApplication,
  getAcceptedApplication,
  getApplicationTime,
} = require('../models/Application');
const { getTaskById, assignTask } = require('../models/Task');
const { getUserById } = require('../models/User');

/**
 * Apply for a task
 * POST /applications/:task_id/apply
 */
const applyForTask = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { task_id } = req.params;

    // Check if task exists
    const task = await getTaskById(task_id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // User cannot apply for their own task
    if (task.created_by === userId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot apply for your own task',
      });
    }

    // Check if task is still open
    if (task.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        message: 'This task is no longer open for applications',
      });
    }

    // Check if user already applied
    const existingApp = await checkExistingApplication(task_id, userId);
    if (existingApp) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this task',
      });
    }

    // Create application
    const applicationId = await createApplication(task_id, userId);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application_id: applicationId,
        task_id,
        status: 'PENDING',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all applications for a task
 * GET /tasks/:task_id/applications
 */
const getTaskApplications = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { task_id } = req.params;

    // Check if task exists
    const task = await getTaskById(task_id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Only task creator can view applications
    if (task.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only task creator can view applications',
      });
    }

    const applications = await getApplicationsByTask(task_id);

    res.status(200).json({
      success: true,
      data: {
        total_applications: applications.length,
        applications,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get applications submitted by logged-in user
 * GET /applications/my
 */
const getMyApplications = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const applications = await getApplicationsByUser(userId);

    res.status(200).json({
      success: true,
      data: {
        total_applications: applications.length,
        applications,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept application and assign task
 * POST /applications/:app_id/accept
 */
const acceptApp = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { app_id } = req.params;

    // Get application
    const application = await getApplicationById(app_id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check if user is task creator
    const task = await getTaskById(application.task_id);
    if (task.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only task creator can accept applications',
      });
    }

    // Check if task is still open
    if (task.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        message: 'Task is no longer open',
      });
    }

    // Accept application
    await acceptApplication(app_id, application.task_id);

    // Assign task to applicant
    await assignTask(application.task_id, application.applicant_id);

    res.status(200).json({
      success: true,
      message: 'Application accepted and task assigned successfully',
      data: {
        application_id: app_id,
        task_id: application.task_id,
        assigned_to: application.applicant_id,
        status: 'ACCEPTED',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject application
 * POST /applications/:app_id/reject
 */
const rejectApp = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { app_id } = req.params;

    // Get application
    const application = await getApplicationById(app_id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check if user is task creator
    const task = await getTaskById(application.task_id);
    if (task.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only task creator can reject applications',
      });
    }

    // Reject application
    await rejectApplication(app_id);

    res.status(200).json({
      success: true,
      message: 'Application rejected successfully',
      data: {
        application_id: app_id,
        status: 'REJECTED',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if task not accepted for 5 minutes
 * GET /tasks/:task_id/price-suggestion
 */
const checkPriceSuggestion = async (req, res, next) => {
  try {
    const { task_id } = req.params;

    const task = await getTaskById(task_id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (task.status !== 'OPEN') {
      return res.status(200).json({
        success: true,
        data: {
          suggestion_needed: false,
          reason: 'Task already assigned or completed',
        },
      });
    }

    const createdAt = new Date(task.created_at);
    const now = new Date();
    const minutesPassed = Math.floor((now - createdAt) / 60000);
    const suggestionMinutes = process.env.PRICE_SUGGESTION_MINUTES || 5;

    if (minutesPassed >= suggestionMinutes) {
      return res.status(200).json({
        success: true,
        data: {
          suggestion_needed: true,
          message: `Task not accepted for ${suggestionMinutes} minutes. Consider lowering the price.`,
          minutes_passed: minutesPassed,
          current_price: task.price,
          suggested_price: Math.max(task.price * 0.9, 10), // Suggest 10% reduction, minimum 10
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        suggestion_needed: false,
        minutes_remaining: suggestionMinutes - minutesPassed,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForTask,
  getTaskApplications,
  getMyApplications,
  acceptApp,
  rejectApp,
  checkPriceSuggestion,
};
