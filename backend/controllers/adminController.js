/**
 * Admin Controller
 * Handles admin dashboard and analytics
 */

const { getAllUsers } = require('../models/User');
const { getOpenTasks, getTasksByStatus } = require('../models/Task');
const { getAll, getOne } = require('../config/database');

/**
 * Get dashboard statistics
 * GET /admin/dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    // Count total users
    const usersQuery = 'SELECT COUNT(*) as total FROM Users';
    const usersResult = await getOne(usersQuery);
    const totalUsers = usersResult.total;

    // Count total tasks
    const tasksQuery = 'SELECT COUNT(*) as total FROM Tasks';
    const tasksResult = await getOne(tasksQuery);
    const totalTasks = tasksResult.total;

    // Count tasks by status
    const statusQuery = `
      SELECT status, COUNT(*) as count 
      FROM Tasks 
      GROUP BY status
    `;
    const statusResults = await getAll(statusQuery);

    // Count total completed tasks
    const completedQuery = 'SELECT COUNT(*) as total FROM Tasks WHERE status = "COMPLETED"';
    const completedResult = await getOne(completedQuery);
    const completedTasks = completedResult.total;

    // Get total transaction amount
    const transactionQuery = `
      SELECT SUM(amount) as total_amount FROM Transactions WHERE status = 'COMPLETED'
    `;
    const transactionResult = await getOne(transactionQuery);
    const totalTransactionAmount = transactionResult.total_amount || 0;

    // Get total reviews
    const reviewsQuery = 'SELECT COUNT(*) as total FROM Reviews';
    const reviewsResult = await getOne(reviewsQuery);
    const totalReviews = reviewsResult.total;

    // Average task price
    const avgPriceQuery = 'SELECT AVG(price) as avg_price FROM Tasks';
    const avgPriceResult = await getOne(avgPriceQuery);
    const avgTaskPrice = avgPriceResult.avg_price || 0;

    // Count open applications
    const applicationsQuery = 'SELECT COUNT(*) as total FROM Applications WHERE status = "PENDING"';
    const applicationsResult = await getOne(applicationsQuery);
    const pendingApplications = applicationsResult.total;

    res.status(200).json({
      success: true,
      data: {
        dashboard: {
          total_users: totalUsers,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          pending_applications: pendingApplications,
          total_reviews: totalReviews,
        },
        tasks_by_status: statusResults,
        financials: {
          total_transaction_amount: parseFloat(totalTransactionAmount),
          average_task_price: parseFloat(avgTaskPrice),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (admin)
 * GET /admin/users
 */
const listAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const query = `
      SELECT u.*, a.city, a.state, 
             (SELECT COUNT(*) FROM Tasks WHERE created_by = u.user_id) as tasks_created,
             (SELECT COUNT(*) FROM Tasks WHERE assigned_to = u.user_id AND status = 'COMPLETED') as tasks_completed,
             (SELECT AVG(rating) FROM Reviews WHERE reviewed_user_id = u.user_id) as avg_rating
      FROM Users u
      LEFT JOIN Area a ON u.area_id = a.area_id
      LIMIT ? OFFSET ?
    `;

    const users = await getAll(query, [limit, offset]);

    const countQuery = 'SELECT COUNT(*) as total FROM Users';
    const countResult = await getOne(countQuery);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tasks (admin)
 * GET /admin/tasks
 */
const listAllTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status } = req.query;

    let query = `
      SELECT t.*, u.name as creator_name, u2.name as performer_name
      FROM Tasks t
      JOIN Users u ON t.created_by = u.user_id
      LEFT JOIN Users u2 ON t.assigned_to = u2.user_id
    `;

    let countQuery = 'SELECT COUNT(*) as total FROM Tasks';

    if (status) {
      query += ' WHERE t.status = ?';
      countQuery += ' WHERE status = ?';
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';

    const params = status ? [status, limit, offset] : [limit, offset];
    const countParams = status ? [status] : [];

    const tasks = await getAll(query, params);
    const countResult = await getOne(countQuery, countParams);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions (admin)
 * GET /admin/transactions
 */
const listAllTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const query = `
      SELECT t.*, u1.name as payer_name, u2.name as payee_name,
             tsk.title as task_title
      FROM Transactions t
      JOIN Users u1 ON t.payer_id = u1.user_id
      JOIN Users u2 ON t.payee_id = u2.user_id
      JOIN Tasks tsk ON t.task_id = tsk.task_id
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const transactions = await getAll(query, [limit, offset]);

    const countQuery = 'SELECT COUNT(*) as total FROM Transactions';
    const countResult = await getOne(countQuery);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reviews (admin)
 * GET /admin/reviews
 */
const listAllReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const query = `
      SELECT r.*, u1.name as reviewer_name, u2.name as reviewed_user_name,
             t.title as task_title
      FROM Reviews r
      JOIN Users u1 ON r.reviewer_id = u1.user_id
      JOIN Users u2 ON r.reviewed_user_id = u2.user_id
      JOIN Tasks t ON r.task_id = t.task_id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const reviews = await getAll(query, [limit, offset]);

    const countQuery = 'SELECT COUNT(*) as total FROM Reviews';
    const countResult = await getOne(countQuery);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytics
 * GET /admin/analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    // Tasks per day (last 30 days)
    const tasksPerDayQuery = `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM Tasks
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const tasksPerDay = await getAll(tasksPerDayQuery);

    // Revenue per day (last 30 days)
    const revenuePerDayQuery = `
      SELECT DATE(created_at) as date, SUM(amount) as total_revenue
      FROM Transactions
      WHERE status = 'COMPLETED' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const revenuePerDay = await getAll(revenuePerDayQuery);

    // Top 5 users by earnings
    const topUsersQuery = `
      SELECT u.user_id, u.name, u.email,
             COUNT(DISTINCT t.task_id) as tasks_completed,
             SUM(tr.amount) as total_earnings,
             AVG(r.rating) as avg_rating
      FROM Users u
      LEFT JOIN Tasks t ON u.user_id = t.assigned_to AND t.status = 'COMPLETED'
      LEFT JOIN Transactions tr ON t.task_id = tr.task_id AND tr.status = 'COMPLETED'
      LEFT JOIN Reviews r ON u.user_id = r.reviewed_user_id
      GROUP BY u.user_id
      ORDER BY total_earnings DESC
      LIMIT 5
    `;
    const topUsers = await getAll(topUsersQuery);

    // Task completion rate
    const completionRateQuery = `
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_tasks,
        ROUND(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as completion_rate
      FROM Tasks
    `;
    const completionRateResult = await getOne(completionRateQuery);

    res.status(200).json({
      success: true,
      data: {
        tasks_per_day: tasksPerDay,
        revenue_per_day: revenuePerDay,
        top_users: topUsers,
        completion_rate: completionRateResult.completion_rate,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  listAllUsers,
  listAllTasks,
  listAllTransactions,
  listAllReviews,
  getAnalytics,
};
