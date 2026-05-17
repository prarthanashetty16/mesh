/**
 * Application Model
 * Database operations for Applications table (task applications)
 */

const { getOne, getAll, executeQuery } = require('../config/database');

/**
 * Create application (user applies for task)
 */
const createApplication = async (taskId, applicantId) => {
  const query = `
    INSERT INTO Applications (task_id, applicant_id, status, applied_at)
    VALUES (?, ?, 'PENDING', NOW())
  `;
  
  const result = await executeQuery(query, [taskId, applicantId]);
  return result.insertId;
};

/**
 * Get application by ID
 */
const getApplicationById = async (applicationId) => {
  const query = `
    SELECT a.*, u.name, u.email, u.rating,
           t.title, t.price, t.status as task_status
    FROM Applications a
    JOIN Users u ON a.applicant_id = u.user_id
    JOIN Tasks t ON a.task_id = t.task_id
    WHERE a.application_id = ?
  `;
  return await getOne(query, [applicationId]);
};

/**
 * Get applications for a task
 */
const getApplicationsByTask = async (taskId) => {
  const query = `
    SELECT a.*, u.user_id, u.name, u.email, u.rating
    FROM Applications a
    JOIN Users u ON a.applicant_id = u.user_id
    WHERE a.task_id = ?
    ORDER BY a.applied_at ASC
  `;
  return await getAll(query, [taskId]);
};

/**
 * Get applications by user (applications made by user)
 */
const getApplicationsByUser = async (userId) => {
  const query = `
    SELECT a.*, t.title, t.price, t.status as task_status
    FROM Applications a
    JOIN Tasks t ON a.task_id = t.task_id
    WHERE a.applicant_id = ?
    ORDER BY a.applied_at DESC
  `;
  return await getAll(query, [userId]);
};

/**
 * Check if user already applied for task
 */
const checkExistingApplication = async (taskId, applicantId) => {
  const query = `
    SELECT * FROM Applications 
    WHERE task_id = ? AND applicant_id = ?
  `;
  return await getOne(query, [taskId, applicantId]);
};

/**
 * Accept application
 */
const acceptApplication = async (applicationId, taskId) => {
  const query = `
    UPDATE Applications 
    SET status = 'ACCEPTED'
    WHERE application_id = ?
  `;
  
  await executeQuery(query, [applicationId]);
  
  // Reject other applications for this task
  const rejectQuery = `
    UPDATE Applications 
    SET status = 'REJECTED'
    WHERE task_id = ? AND application_id != ?
  `;
  
  await executeQuery(rejectQuery, [taskId, applicationId]);
  return true;
};

/**
 * Reject application
 */
const rejectApplication = async (applicationId) => {
  const query = `
    UPDATE Applications 
    SET status = 'REJECTED'
    WHERE application_id = ?
  `;
  
  await executeQuery(query, [applicationId]);
  return true;
};

/**
 * Get accepted application for task
 */
const getAcceptedApplication = async (taskId) => {
  const query = `
    SELECT a.*, u.user_id, u.name, u.email
    FROM Applications a
    JOIN Users u ON a.applicant_id = u.user_id
    WHERE a.task_id = ? AND a.status = 'ACCEPTED'
  `;
  return await getOne(query, [taskId]);
};

/**
 * Get application time (when applied)
 */
const getApplicationTime = async (applicationId) => {
  const query = `
    SELECT applied_at FROM Applications WHERE application_id = ?
  `;
  const result = await getOne(query, [applicationId]);
  return result ? result.applied_at : null;
};

module.exports = {
  createApplication,
  getApplicationById,
  getApplicationsByTask,
  getApplicationsByUser,
  checkExistingApplication,
  acceptApplication,
  rejectApplication,
  getAcceptedApplication,
  getApplicationTime,
};
