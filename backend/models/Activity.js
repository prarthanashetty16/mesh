/**
 * Activity Model
 * Database operations for user activity logs
 */

const { getOne, getAll, executeQuery } = require('../config/database');

/**
 * Log user activity
 */
const logActivity = async (activityData) => {
  const { user_id, action, resource_type, resource_id, description, ip_address, metadata } = activityData;
  
  const query = `
    INSERT INTO Activity (user_id, action, resource_type, resource_id, description, ip_address, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  
  const result = await executeQuery(query, [
    user_id,
    action,
    resource_type,
    resource_id,
    description || null,
    ip_address || null,
    metadata ? JSON.stringify(metadata) : null
  ]);
  
  return result.insertId;
};

/**
 * Get all activity logs with pagination
 */
const getAllActivities = async (page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT a.*, u.name as user_name, u.email as user_email
    FROM Activity a
    LEFT JOIN Users u ON a.user_id = u.user_id
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  return await getAll(query, [limit, offset]);
};

/**
 * Get activity count
 */
const getActivityCount = async () => {
  const query = 'SELECT COUNT(*) as total FROM Activity';
  const result = await getOne(query);
  return result.total;
};

/**
 * Get activity for specific user
 */
const getUserActivities = async (userId, page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT a.*, u.name as user_name
    FROM Activity a
    LEFT JOIN Users u ON a.user_id = u.user_id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  return await getAll(query, [userId, limit, offset]);
};

/**
 * Get activity summary
 */
const getActivitySummary = async () => {
  const query = `
    SELECT 
      action, 
      COUNT(*) as count
    FROM Activity
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY action
    ORDER BY count DESC
  `;
  
  return await getAll(query);
};

/**
 * Get recent activities
 */
const getRecentActivities = async (limit = 20) => {
  const query = `
    SELECT a.*, u.name as user_name, u.email as user_email
    FROM Activity a
    LEFT JOIN Users u ON a.user_id = u.user_id
    ORDER BY a.created_at DESC
    LIMIT ?
  `;
  
  return await getAll(query, [limit]);
};

/**
 * Get activities by action type
 */
const getActivitiesByAction = async (action, page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT a.*, u.name as user_name
    FROM Activity a
    LEFT JOIN Users u ON a.user_id = u.user_id
    WHERE a.action = ?
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  return await getAll(query, [action, limit, offset]);
};

module.exports = {
  logActivity,
  getAllActivities,
  getActivityCount,
  getUserActivities,
  getActivitySummary,
  getRecentActivities,
  getActivitiesByAction,
};
