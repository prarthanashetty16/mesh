/**
 * Review Model
 * Database operations for Reviews table
 */

const { getOne, getAll, executeQuery } = require('../config/database');

/**
 * Create review
 */
const createReview = async (reviewData) => {
  const { task_id, reviewer_id, reviewed_user_id, rating, comment } = reviewData;
  
  const query = `
    INSERT INTO Reviews (task_id, reviewer_id, reviewed_user_id, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;
  
  const result = await executeQuery(query, [task_id, reviewer_id, reviewed_user_id, rating, comment]);
  return result.insertId;
};

/**
 * Get review by ID
 */
const getReviewById = async (reviewId) => {
  const query = `
    SELECT r.*, u.name as reviewer_name, u2.name as reviewed_user_name
    FROM Reviews r
    JOIN Users u ON r.reviewer_id = u.user_id
    JOIN Users u2 ON r.reviewed_user_id = u2.user_id
    WHERE r.review_id = ?
  `;
  return await getOne(query, [reviewId]);
};

/**
 * Get reviews for a user
 */
const getReviewsForUser = async (userId) => {
  const query = `
    SELECT r.*, u.name as reviewer_name
    FROM Reviews r
    JOIN Users u ON r.reviewer_id = u.user_id
    WHERE r.reviewed_user_id = ?
    ORDER BY r.created_at DESC
  `;
  return await getAll(query, [userId]);
};

/**
 * Get reviews for a task
 */
const getReviewsForTask = async (taskId) => {
  const query = `
    SELECT r.*, u.name as reviewer_name, u2.name as reviewed_user_name
    FROM Reviews r
    JOIN Users u ON r.reviewer_id = u.user_id
    JOIN Users u2 ON r.reviewed_user_id = u2.user_id
    WHERE r.task_id = ?
    ORDER BY r.created_at DESC
  `;
  return await getAll(query, [taskId]);
};

/**
 * Check if user already reviewed for task
 */
const checkExistingReview = async (taskId, reviewerId) => {
  const query = `
    SELECT * FROM Reviews 
    WHERE task_id = ? AND reviewer_id = ?
  `;
  return await getOne(query, [taskId, reviewerId]);
};

/**
 * Get average rating for user
 */
const getAverageRating = async (userId) => {
  const query = `
    SELECT AVG(rating) as average_rating
    FROM Reviews
    WHERE reviewed_user_id = ?
  `;
  const result = await getOne(query, [userId]);
  return result.average_rating || 0;
};

module.exports = {
  createReview,
  getReviewById,
  getReviewsForUser,
  getReviewsForTask,
  checkExistingReview,
  getAverageRating,
};
