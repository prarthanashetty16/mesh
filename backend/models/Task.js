/**
 * Task Model
 * Database operations for Tasks table
 */

const { getOne, getAll, executeQuery } = require('../config/database');

/**
 * Create new task
 */
const createTask = async (taskData) => {
  const { title, description, price, deadline, created_by, area_id, latitude, longitude } = taskData;
  
  const query = `
    INSERT INTO Tasks (title, description, price, deadline, status, created_by, area_id, latitude, longitude, created_at)
    VALUES (?, ?, ?, ?, 'OPEN', ?, ?, ?, ?, NOW())
  `;
  
  const result = await executeQuery(query, [title, description, price, deadline, created_by, area_id, latitude, longitude]);
  return result.insertId;
};

/**
 * Get task by ID with creator info
 */
const getTaskById = async (taskId) => {
  const query = `
    SELECT t.*, u.name as creator_name, u.email as creator_email, u.latitude as creator_lat, u.longitude as creator_lon,
           u2.name as performer_name, u2.email as performer_email
    FROM Tasks t
    JOIN Users u ON t.created_by = u.user_id
    LEFT JOIN Users u2 ON t.assigned_to = u2.user_id
    WHERE t.task_id = ?
  `;
  return await getOne(query, [taskId]);
};

/**
 * Get all open tasks with pagination
 */
const getOpenTasks = async (limit = 10, offset = 0) => {
  const query = `
    SELECT t.*, u.name as creator_name, u.email as creator_email, u.latitude, u.longitude
    FROM Tasks t
    JOIN Users u ON t.created_by = u.user_id
    WHERE t.status = 'OPEN'
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
  `;
  return await getAll(query, [limit, offset]);
};

/**
 * Get open tasks count
 */
const getOpenTasksCount = async () => {
  const query = 'SELECT COUNT(*) as count FROM Tasks WHERE status = "OPEN"';
  const result = await getOne(query);
  return result.count;
};

/**
 * Get tasks by status with pagination and filters
 */
const getTasksByStatus = async (status, filters = {}, limit = 10, offset = 0) => {
  let query = `
    SELECT t.*, u.name as creator_name, u.email as creator_email
    FROM Tasks t
    JOIN Users u ON t.created_by = u.user_id
    WHERE t.status = ?
  `;
  
  const params = [status];

  // Add filters
  if (filters.minPrice !== undefined) {
    query += ' AND t.price >= ?';
    params.push(filters.minPrice);
  }
  
  if (filters.maxPrice !== undefined) {
    query += ' AND t.price <= ?';
    params.push(filters.maxPrice);
  }

  if (filters.area_id) {
    query += ' AND t.area_id = ?';
    params.push(filters.area_id);
  }

  query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return await getAll(query, params);
};

/**
 * Get tasks created by user
 */
const getTasksByCreator = async (userId, limit = 10, offset = 0) => {
  const query = `
    SELECT t.*
    FROM Tasks t
    WHERE t.created_by = ?
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
  `;
  return await getAll(query, [userId, limit, offset]);
};

/**
 * Get tasks assigned to user (accepted)
 */
const getTasksByPerformer = async (userId, limit = 10, offset = 0) => {
  const query = `
    SELECT t.*, u.name as creator_name, u.email as creator_email
    FROM Tasks t
    JOIN Users u ON t.created_by = u.user_id
    WHERE t.assigned_to = ?
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
  `;
  return await getAll(query, [userId, limit, offset]);
};

/**
 * Update task status
 */
const updateTaskStatus = async (taskId, status) => {
  const query = `
    UPDATE Tasks 
    SET status = ?
    WHERE task_id = ?
  `;
  
  await executeQuery(query, [status, taskId]);
  return true;
};

/**
 * Assign task to performer
 */
const assignTask = async (taskId, performerId) => {
  const query = `
    UPDATE Tasks 
    SET assigned_to = ?, status = 'ASSIGNED'
    WHERE task_id = ?
  `;
  
  await executeQuery(query, [performerId, taskId]);
  return true;
};

/**
 * Get nearby tasks using Haversine formula
 */
const getNearbyTasks = async (latitude, longitude, radiusKm = 10, limit = 10, offset = 0) => {
  // Haversine formula: distance = 2 * R * asin(sqrt(sin²((lat2-lat1)/2) + cos(lat1) * cos(lat2) * sin²((lon2-lon1)/2)))
  // Simplified in MySQL: distance = 6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(latitude-?)/2), 2) + COS(RADIANS(?)) * COS(RADIANS(latitude)) * POWER(SIN(RADIANS(longitude-?)/2), 2)))
  
  const query = `
    SELECT t.*, u.name as creator_name, u.email as creator_email,
           (6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(t.latitude - ?)/2), 2) + 
            COS(RADIANS(?)) * COS(RADIANS(t.latitude)) * 
            POWER(SIN(RADIANS(t.longitude - ?)/2), 2)))) AS distance
    FROM Tasks t
    JOIN Users u ON t.created_by = u.user_id
    WHERE t.status = 'OPEN'
    AND (6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(t.latitude - ?)/2), 2) + 
         COS(RADIANS(?)) * COS(RADIANS(t.latitude)) * 
         POWER(SIN(RADIANS(t.longitude - ?)/2), 2)))) <= ?
    ORDER BY distance ASC
    LIMIT ? OFFSET ?
  `;
  
  return await getAll(query, [latitude, latitude, longitude, latitude, latitude, longitude, radiusKm, limit, offset]);
};

/**
 * Get nearby tasks count
 */
const getNearbyTasksCount = async (latitude, longitude, radiusKm = 10) => {
  const query = `
    SELECT COUNT(*) as count
    FROM Tasks t
    WHERE t.status = 'OPEN'
    AND (6371 * 2 * ASIN(SQRT(POWER(SIN(RADIANS(t.latitude - ?)/2), 2) + 
         COS(RADIANS(?)) * COS(RADIANS(t.latitude)) * 
         POWER(SIN(RADIANS(t.longitude - ?)/2), 2)))) <= ?
  `;
  
  const result = await getOne(query, [latitude, latitude, longitude, radiusKm]);
  return result.count;
};

/**
 * Delete task
 */
const deleteTask = async (taskId) => {
  // Delete applications first
  await executeQuery('DELETE FROM Applications WHERE task_id = ?', [taskId]);
  
  // Delete reviews
  await executeQuery('DELETE FROM Reviews WHERE task_id = ?', [taskId]);
  
  // Delete transactions
  await executeQuery('DELETE FROM Transactions WHERE task_id = ?', [taskId]);
  
  // Delete task
  await executeQuery('DELETE FROM Tasks WHERE task_id = ?', [taskId]);
  return true;
};

module.exports = {
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
  deleteTask,
};
