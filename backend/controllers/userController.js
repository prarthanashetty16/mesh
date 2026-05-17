/**
 * User Controller
 * Handles user profile and account operations
 */

const { getUserById, updateUserProfile, updateUserLocation, getWalletBalance, updateUserRating } = require('../models/User');
const { getReviewsForUser, getAverageRating } = require('../models/Review');

/**
 * Get user profile
 * GET /user/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get average rating
    const avgRating = await getAverageRating(userId);

    res.status(200).json({
      success: true,
      data: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address_line: user.address_line,
        landmark: user.landmark,
        wallet_balance: user.wallet_balance,
        rating: avgRating,
        area: {
          area_id: user.area_id,
          city: user.city,
          state: user.state,
          locality: user.locality,
        },
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

/**
 * Update user profile
 * PUT /user/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { name, address_line, landmark, latitude, longitude } = req.body;

    await updateUserProfile(userId, {
      name,
      address_line,
      landmark,
      latitude,
      longitude,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get wallet balance
 * GET /user/wallet
 */
const getWallet = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const balance = await getWalletBalance(userId);

    res.status(200).json({
      success: true,
      data: {
        wallet_balance: balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user reviews
 * GET /user/reviews
 */
const getReviews = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const reviews = await getReviewsForUser(userId);

    res.status(200).json({
      success: true,
      data: {
        total_reviews: reviews.length,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getWallet,
  getReviews,
};
