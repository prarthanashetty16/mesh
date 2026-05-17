/**
 * Admin Controller
 * Handles admin dashboard and analytics
 */

const { getAllUsers } = require('../models/User');
const { getOpenTasks, getTasksByStatus } = require('../models/Task');
const { getAll, getOne } = require('../config/database');
const { getAllActivities, getActivityCount, getActivitySummary, getRecentActivities } = require('../models/Activity');

/**
 * Get dashboard statistics
 * GET /admin/dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    // Count total users
    const usersQuery = 'SELECT COUNT(*) as total FROM Users';
    const usersResult = await getOne(usersQuery);
    const totalUsers = usersResult?.total || 0;

    // Count total tasks
    const tasksQuery = 'SELECT COUNT(*) as total FROM Tasks';
    const tasksResult = await getOne(tasksQuery);
    const totalTasks = tasksResult?.total || 0;

    // Count tasks by status
    const statusQuery = `
      SELECT status, COUNT(*) as count 
      FROM Tasks 
      GROUP BY status
    `;
    const statusResults = await getAll(statusQuery) || [];

    // Count total completed tasks
    const completedQuery = 'SELECT COUNT(*) as total FROM Tasks WHERE status = "COMPLETED"';
    const completedResult = await getOne(completedQuery);
    const completedTasks = completedResult?.total || 0;

    // Get total transaction amount
    const transactionQuery = `
      SELECT SUM(amount) as total_amount FROM Transactions WHERE status = 'COMPLETED'
    `;
    const transactionResult = await getOne(transactionQuery);
    const totalTransactionAmount = transactionResult?.total_amount || 0;

    // Get total reviews
    const reviewsQuery = 'SELECT COUNT(*) as total FROM Reviews';
    const reviewsResult = await getOne(reviewsQuery);
    const totalReviews = reviewsResult?.total || 0;

    // Average task price
    const avgPriceQuery = 'SELECT AVG(price) as avg_price FROM Tasks';
    const avgPriceResult = await getOne(avgPriceQuery);
    const avgTaskPrice = avgPriceResult?.avg_price || 0;

    // Count open applications
    const applicationsQuery = 'SELECT COUNT(*) as total FROM Applications WHERE status = "PENDING"';
    const applicationsResult = await getOne(applicationsQuery);
    const pendingApplications = applicationsResult?.total || 0;

    // Get active users (who performed tasks in last 30 days)
    const activeUsersQuery = `
      SELECT COUNT(DISTINCT user_id) as total 
      FROM Activity 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    const activeUsersResult = await getOne(activeUsersQuery);
    const activeUsers = activeUsersResult?.total || 0;

    // Application acceptance rate
    const acceptanceRateQuery = `
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted_count
      FROM Applications
    `;
    const acceptanceRateResult = await getOne(acceptanceRateQuery);
    const acceptanceRate = acceptanceRateResult?.total_applications > 0 
      ? (((acceptanceRateResult?.accepted_count || 0) / acceptanceRateResult.total_applications) * 100).toFixed(2)
      : 0;

    // Task cancellation rate
    const cancellationRateQuery = `
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_count
      FROM Tasks
    `;
    const cancellationRateResult = await getOne(cancellationRateQuery);
    const cancellationRate = cancellationRateResult?.total_tasks > 0 
      ? (((cancellationRateResult?.cancelled_count || 0) / cancellationRateResult.total_tasks) * 100).toFixed(2)
      : 0;

    // Average rating
    const avgRatingQuery = 'SELECT AVG(rating) as avg_rating FROM Reviews';
    const avgRatingResult = await getOne(avgRatingQuery);
    const avgRating = avgRatingResult?.avg_rating || 0;

    // Total applications
    const totalApplicationsQuery = 'SELECT COUNT(*) as total FROM Applications';
    const totalApplicationsResult = await getOne(totalApplicationsQuery);
    const totalApplications = totalApplicationsResult?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        dashboard: {
          total_users: totalUsers,
          active_users: activeUsers,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          pending_applications: pendingApplications,
          total_applications: totalApplications,
          total_reviews: totalReviews,
          avg_rating: parseFloat(avgRating).toFixed(2),
        },
        tasks_by_status: statusResults,
        financials: {
          total_transaction_amount: parseFloat(totalTransactionAmount),
          average_task_price: parseFloat(avgTaskPrice).toFixed(2),
        },
        metrics: {
          acceptance_rate: parseFloat(acceptanceRate),
          cancellation_rate: parseFloat(cancellationRate),
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
      SELECT u.*, a.city, a.state, a.locality, a.pincode,
             (SELECT COUNT(*) FROM Tasks WHERE created_by = u.user_id) as tasks_created,
             (SELECT COUNT(*) FROM Tasks WHERE assigned_to = u.user_id AND status = 'COMPLETED') as tasks_completed,
             (SELECT COUNT(*) FROM Applications WHERE applicant_id = u.user_id) as applications_submitted,
             (SELECT AVG(rating) FROM Reviews WHERE reviewed_user_id = u.user_id) as avg_rating,
             (SELECT COUNT(*) FROM Reviews WHERE reviewed_user_id = u.user_id) as total_reviews
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
      SELECT t.*, u.name as creator_name, u.email as creator_email, u.phone as creator_phone,
             u2.name as performer_name, u2.email as performer_email, u2.phone as performer_phone,
             a.city, a.state, a.locality, a.pincode,
             (SELECT COUNT(*) FROM Applications WHERE task_id = t.task_id) as total_applications,
             (SELECT COUNT(*) FROM Applications WHERE task_id = t.task_id AND status = 'PENDING') as pending_applications
      FROM Tasks t
      JOIN Users u ON t.created_by = u.user_id
      LEFT JOIN Users u2 ON t.assigned_to = u2.user_id
      LEFT JOIN Area a ON t.area_id = a.area_id
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

    // New users this month
    const newUsersQuery = `
      SELECT COUNT(*) as total
      FROM Activity
      WHERE action = 'REGISTER' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    const newUsersResult = await getOne(newUsersQuery);

    // Task creation trend
    const taskCreationTrendQuery = `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM Tasks
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    const taskCreationTrend = await getAll(taskCreationTrendQuery);

    res.status(200).json({
      success: true,
      data: {
        tasks_per_day: tasksPerDay,
        revenue_per_day: revenuePerDay,
        top_users: topUsers,
        completion_rate: completionRateResult.completion_rate,
        new_users_month: newUsersResult.total,
        task_creation_trend: taskCreationTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Admin Password
 * POST /admin/verify-password
 */
const verifyAdminPassword = (req, res) => {
  const { adminPassword } = req.body;
  const ADMIN_PASSWORD = 'dbmsproject';

  if (!adminPassword) {
    return res.status(400).json({
      success: false,
      message: 'Admin password is required',
    });
  }

  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin password',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Admin password verified',
  });
};

/**
 * Get user activities (audit log)
 * GET /admin/activities
 */
const getActivities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const activities = await getAllActivities(page, limit);
    const countResult = await getActivityCount();

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total: countResult,
          pages: Math.ceil(countResult / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity summary
 * GET /admin/activity-summary
 */
const getActivitySummaryData = async (req, res, next) => {
  try {
    const summary = await getActivitySummary();
    const recent = await getRecentActivities(10);

    res.status(200).json({
      success: true,
      data: {
        activity_summary: summary,
        recent_activities: recent,
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
  verifyAdminPassword,
  getActivities,
  getActivitySummaryData,
};
