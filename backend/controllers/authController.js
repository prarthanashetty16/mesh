/**
 * Auth Controller
 * Handles user registration and login
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getUserByEmail, createUser } = require('../models/User');

/**
 * Register new user
 * POST /auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address_line, landmark, area_id, latitude, longitude } = req.body;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = await createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      address_line,
      landmark,
      area_id,
      latitude,
      longitude,
    });

    // Generate JWT token
    const token = jwt.sign(
      { user_id: userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user_id: userId,
        email,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
