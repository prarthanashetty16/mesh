/**
 * Task Controller
 * Handles task creation, retrieval, and updates
 */

const { 
  createTask, 
  getTaskById, 
  getOpenTasks, 
  getOpenTasksCount,
  getTasksByStatus, 
  getTasksByCreator, 
  getTasksByPerformer, 
  updateTaskStatus, 
  assignTask, 
  getNearbyTasks,
  getNearbyTasksCount,
  deleteTask 
} = require('../models/Task');
const { getWalletBalance, deductFromWallet, addToWallet } = require('../models/User');
const { createTransaction, getTransactionByTaskId } = require('../models/Transaction');
const { getAcceptedApplication } = require('../models/Application');

/**
 * Create new task
 * POST /tasks
 */
const createNewTask = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { title, description, price, deadline, area_id, latitude, longitude } = req.body;

    const taskId = await createTask({
      title,
      description,
      price,
      deadline,
      created_by: userId,
      area_id,
      latitude,
      longitude,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        task_id: taskId,
        status: 'OPEN',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all open tasks with pagination
 * GET /tasks?page=1&limit=10
 */
const getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const tasks = await getOpenTasks(limit, offset);
    const totalCount = await getOpenTasksCount();

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get nearby tasks using Haversine formula
 * GET /tasks/nearby?latitude=X&longitude=Y&page=1&limit=10
 */
const getNearby = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const radiusKm = process.env.NEARBY_DISTANCE_KM || 10;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const tasks = await getNearbyTasks(parseFloat(latitude), parseFloat(longitude), radiusKm, limit, offset);
    const totalCount = await getNearbyTasksCount(parseFloat(latitude), parseFloat(longitude), radiusKm);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get filtered tasks
 * GET /tasks/filter?status=OPEN&minPrice=100&maxPrice=500&area_id=1&page=1
 */
const filterTasks = async (req, res, next) => {
  try {
    const { status, minPrice, maxPrice, area_id } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {};
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (area_id) filters.area_id = parseInt(area_id);

    const taskStatus = status || 'OPEN';
    const tasks = await getTasksByStatus(taskStatus, filters, limit, offset);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total: tasks.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get task by ID
 * GET /tasks/:id
 */
const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get tasks created by logged-in user
 * GET /tasks/my/created
 */
const getMyTasks = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const tasks = await getTasksByCreator(userId, limit, offset);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total: tasks.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get tasks assigned to logged-in user (accepted)
 * GET /tasks/my/accepted
 */
const getMyAcceptedTasks = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const tasks = await getTasksByPerformer(userId, limit, offset);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total: tasks.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update task status
 * PUT /tasks/:id/status
 */
const updateStatus = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;
    const { status } = req.body;

    const task = await getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Only task creator can update status
    if (task.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only task creator can update task status',
      });
    }

    // Validate status transition
    const validStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`,
      });
    }

    await updateTaskStatus(id, status);

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: {
        task_id: id,
        status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete task and process payment
 * POST /tasks/:id/complete
 */
const completeTask = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    const task = await getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Only task creator can complete
    if (task.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only task creator can complete the task',
      });
    }

    if (task.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Task is already completed',
      });
    }

    if (task.assigned_to === null) {
      return res.status(400).json({
        success: false,
        message: 'Task must be assigned before completion',
      });
    }

    // Check if transaction already exists
    let transaction = await getTransactionByTaskId(id);

    // Check wallet balance
    const creatorBalance = await getWalletBalance(userId);
    if (creatorBalance < task.price) {
      return res.status(402).json({
        success: false,
        message: `Insufficient wallet balance. Required: ${task.price}, Available: ${creatorBalance}`,
      });
    }

    // Process payment
    await deductFromWallet(userId, task.price);
    await addToWallet(task.assigned_to, task.price);

    // Create transaction if not exists
    if (!transaction) {
      await createTransaction({
        task_id: id,
        payer_id: userId,
        payee_id: task.assigned_to,
        amount: task.price,
        status: 'COMPLETED',
      });
    }

    // Update task status
    await updateTaskStatus(id, 'COMPLETED');

    res.status(200).json({
      success: true,
      message: 'Task completed and payment processed successfully',
      data: {
        task_id: id,
        amount: task.price,
        payee_id: task.assigned_to,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete task (only if OPEN or CANCELLED)
 * DELETE /tasks/:id
 */
const deleteTaskEndpoint = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    const task = await getTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Only task creator can delete
    if (task.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only task creator can delete the task',
      });
    }

    // Can only delete if OPEN or CANCELLED
    if (!['OPEN', 'CANCELLED'].includes(task.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete task with status: ${task.status}`,
      });
    }

    await deleteTask(id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
