/**
 * Input Validation Middleware
 * Validates request data before processing
 */

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateCoordinates = (lat, lon) => {
  const lat_num = parseFloat(lat);
  const lon_num = parseFloat(lon);
  return lat_num >= -90 && lat_num <= 90 && lon_num >= -180 && lon_num <= 180;
};

const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }
    next();
  };
};

const validateRegistration = (req, res, next) => {
  const { name, email, password, phone, area_id } = req.body;

  if (!name || !email || !password || !phone || !area_id) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: name, email, password, phone, area_id',
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
  }

  if (!validatePhone(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number (must be 10 digits)',
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  next();
};

const validateTaskCreation = (req, res, next) => {
  const { title, description, price, deadline, area_id, latitude, longitude } = req.body;

  if (!title || !price || !area_id || latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: title, price, area_id, latitude, longitude',
    });
  }

  if (isNaN(price) || price <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a positive number',
    });
  }

  if (!validateCoordinates(latitude, longitude)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates (latitude: -90 to 90, longitude: -180 to 180)',
    });
  }

  next();
};

const validateReview = (req, res, next) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: rating, comment',
    });
  }

  if (isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5',
    });
  }

  next();
};

const validateLocationUpdate = (req, res, next) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: latitude, longitude',
    });
  }

  if (!validateCoordinates(latitude, longitude)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates',
    });
  }

  next();
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateCoordinates,
  validateRequired,
  validateRegistration,
  validateLogin,
  validateTaskCreation,
  validateReview,
  validateLocationUpdate,
};
