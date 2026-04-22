/**
 * Review Controller
 * Handles task reviews and ratings
 */

const {
  createReview,
  getReviewById,
  getReviewsForUser,
  getReviewsForTask,
  checkExistingReview,
  getAverageRating,
} = require('../models/Review');
const { getTaskById } = require('../models/Task');
const { updateUserRating } = require('../models/User');

/**
 * Add review for completed task
 * POST /reviews/task/:task_id
 */
const addReview = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { task_id } = req.params;
    const { rating, comment } = req.body;

    // Get task
    const task = await getTaskById(task_id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if task is completed
    if (task.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Review can only be added to completed tasks',
      });
    }

    // Check if user is task creator or performer
    if (userId !== task.created_by && userId !== task.assigned_to) {
      return res.status(403).json({
        success: false,
        message: 'Only task creator or performer can add review',
      });
    }

    // Determine who is being reviewed
    const reviewedUserId = userId === task.created_by ? task.assigned_to : task.created_by;

    // Check if already reviewed
    const existingReview = await checkExistingReview(task_id, userId);
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this task',
      });
    }

    // Create review
    const reviewId = await createReview({
      task_id,
      reviewer_id: userId,
      reviewed_user_id: reviewedUserId,
      rating,
      comment,
    });

    // Update user rating
    await updateUserRating(reviewedUserId);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: {
        review_id: reviewId,
        task_id,
        rating,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews for a user
 * GET /reviews/user/:user_id
 */
const getUserReviews = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const reviews = await getReviewsForUser(user_id);
    const avgRating = await getAverageRating(user_id);

    res.status(200).json({
      success: true,
      data: {
        user_id,
        average_rating: avgRating,
        total_reviews: reviews.length,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews for a task
 * GET /reviews/task/:task_id
 */
const getTaskReviews = async (req, res, next) => {
  try {
    const { task_id } = req.params;

    const reviews = await getReviewsForTask(task_id);

    res.status(200).json({
      success: true,
      data: {
        task_id,
        total_reviews: reviews.length,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getUserReviews,
  getTaskReviews,
};
