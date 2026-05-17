/**
 * Error Handling Middleware
 */

const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // Database errors
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists (duplicate entry)',
    });
  }

  // Foreign key errors
  if (error.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist',
    });
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
