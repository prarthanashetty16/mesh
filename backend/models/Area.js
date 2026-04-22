/**
 * Area Model
 * Database operations for Area table
 */

const { getOne, getAll, executeQuery } = require('../config/database');

/**
 * Get all areas
 */
const getAllAreas = async () => {
  const query = 'SELECT * FROM Area ORDER BY city ASC, locality ASC';
  return await getAll(query);
};

/**
 * Get area by ID
 */
const getAreaById = async (areaId) => {
  const query = 'SELECT * FROM Area WHERE area_id = ?';
  return await getOne(query, [areaId]);
};

/**
 * Get areas by city
 */
const getAreasByCity = async (city) => {
  const query = 'SELECT * FROM Area WHERE city = ? ORDER BY locality ASC';
  return await getAll(query, [city]);
};

/**
 * Get unique cities
 */
const getCities = async () => {
  const query = 'SELECT DISTINCT city FROM Area WHERE city IS NOT NULL ORDER BY city ASC';
  return await getAll(query);
};

module.exports = {
  getAllAreas,
  getAreaById,
  getAreasByCity,
  getCities,
};
