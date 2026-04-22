/**
 * User Model
 * Database operations for Users table
 */

const { getOne, getAll, executeQuery } = require('../config/database');

/**
 * Create new user
 */
const createUser = async (userData) => {
  const { name, email, password, phone, address_line, landmark, area_id, latitude, longitude } = userData;
  
  const query = `
    INSERT INTO Users (name, email, password, phone, address_line, landmark, area_id, latitude, longitude, wallet_balance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `;
  
  const result = await executeQuery(query, [name, email, password, phone, address_line || null, landmark || null, area_id, latitude, longitude]);
  return result.insertId;
};

/**
 * Get user by email
 */
const getUserByEmail = async (email) => {
  const query = 'SELECT * FROM Users WHERE email = ?';
  return await getOne(query, [email]);
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  const query = `
    SELECT u.*, a.city, a.state, a.locality 
    FROM Users u
    LEFT JOIN Area a ON u.area_id = a.area_id
    WHERE u.user_id = ?
  `;
  return await getOne(query, [userId]);
};

/**
 * Get all users
 */
const getAllUsers = async () => {
  const query = `
    SELECT u.*, a.city, a.state 
    FROM Users u
    LEFT JOIN Area a ON u.area_id = a.area_id
  `;
  return await getAll(query);
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, userData) => {
  const { name, address_line, landmark, latitude, longitude } = userData;
  
  const query = `
    UPDATE Users 
    SET name = ?, address_line = ?, landmark = ?, latitude = ?, longitude = ?
    WHERE user_id = ?
  `;
  
  await executeQuery(query, [name, address_line, landmark, latitude, longitude, userId]);
  return true;
};

/**
 * Update user location
 */
const updateUserLocation = async (userId, latitude, longitude) => {
  const query = `
    UPDATE Users 
    SET latitude = ?, longitude = ?
    WHERE user_id = ?
  `;
  
  await executeQuery(query, [latitude, longitude, userId]);
  return true;
};

/**
 * Get user wallet balance
 */
const getWalletBalance = async (userId) => {
  const query = 'SELECT wallet_balance FROM Users WHERE user_id = ?';
  const result = await getOne(query, [userId]);
  return result ? result.wallet_balance : 0;
};

/**
 * Add money to wallet
 */
const addToWallet = async (userId, amount) => {
  const query = `
    UPDATE Users 
    SET wallet_balance = wallet_balance + ?
    WHERE user_id = ?
  `;
  
  await executeQuery(query, [amount, userId]);
  return true;
};

/**
 * Deduct money from wallet
 */
const deductFromWallet = async (userId, amount) => {
  const query = `
    UPDATE Users 
    SET wallet_balance = wallet_balance - ?
    WHERE user_id = ?
  `;
  
  await executeQuery(query, [amount, userId]);
  return true;
};

/**
 * Update user rating
 */
const updateUserRating = async (userId) => {
  const query = `
    UPDATE Users u
    SET u.rating = (
      SELECT AVG(rating) FROM Reviews WHERE reviewed_user_id = ?
    )
    WHERE u.user_id = ?
  `;
  
  await executeQuery(query, [userId, userId]);
  return true;
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
  updateUserProfile,
  updateUserLocation,
  getWalletBalance,
  addToWallet,
  deductFromWallet,
  updateUserRating,
};
