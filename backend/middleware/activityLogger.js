/**
 * Activity Logging Middleware
 * Logs user activities for audit trail
 */

const { logActivity } = require('../models/Activity');

/**
 * Middleware to log user activities
 * Usage: app.use(activityLogger);
 */
const activityLogger = async (req, res, next) => {
  // Store original send method
  const originalSend = res.send;

  // Intercept send to log activity after response
  res.send = function (data) {
    // Only log if user is authenticated and request was successful
    if (req.user && res.statusCode < 400) {
      const userId = req.user.user_id;
      const action = determineAction(req.method, req.path);
      const resourceType = getResourceType(req.path);
      
      logActivity({
        user_id: userId,
        action: action,
        resource_type: resourceType,
        resource_id: extractResourceId(req),
        description: generateDescription(req),
        ip_address: req.ip || req.connection.remoteAddress,
        metadata: {
          method: req.method,
          path: req.path,
          status: res.statusCode,
        },
      }).catch(err => console.error('Failed to log activity:', err));
    }

    // Call original send
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Determine action type from HTTP method and endpoint
 */
const determineAction = (method, path) => {
  if (method === 'POST') {
    if (path.includes('/apply')) return 'APPLY_FOR_TASK';
    if (path.includes('/auth/login')) return 'LOGIN';
    if (path.includes('/auth/register')) return 'REGISTER';
    if (path.includes('/tasks')) return 'CREATE_TASK';
    if (path.includes('/reviews')) return 'CREATE_REVIEW';
    if (path.includes('/applications')) return 'CREATE_APPLICATION';
    return 'CREATE';
  } else if (method === 'PUT' || method === 'PATCH') {
    if (path.includes('/profile')) return 'UPDATE_PROFILE';
    if (path.includes('/status')) return 'UPDATE_STATUS';
    return 'UPDATE';
  } else if (method === 'DELETE') {
    return 'DELETE';
  } else if (method === 'GET') {
    return 'VIEW';
  }
  return 'OTHER';
};

/**
 * Get resource type from path
 */
const getResourceType = (path) => {
  if (path.includes('/tasks')) return 'Task';
  if (path.includes('/user')) return 'User';
  if (path.includes('/wallet')) return 'Wallet';
  if (path.includes('/applications')) return 'Application';
  if (path.includes('/reviews')) return 'Review';
  if (path.includes('/auth')) return 'Auth';
  if (path.includes('/location')) return 'Location';
  return 'Unknown';
};

/**
 * Extract resource ID from request
 */
const extractResourceId = (req) => {
  // Try to get ID from URL params
  if (req.params && req.params.id) return req.params.id;
  if (req.params && req.params.task_id) return req.params.task_id;
  if (req.params && req.params.user_id) return req.params.user_id;
  if (req.params && req.params.app_id) return req.params.app_id;
  
  // Try to get from query
  if (req.query && req.query.id) return req.query.id;
  
  // Try to get from body
  if (req.body) {
    if (req.body.task_id) return req.body.task_id;
    if (req.body.user_id) return req.body.user_id;
    if (req.body.id) return req.body.id;
  }
  
  return null;
};

/**
 * Generate human-readable description
 */
const generateDescription = (req) => {
  const method = req.method;
  const path = req.path;
  const resourceId = extractResourceId(req);
  
  if (method === 'POST' && path.includes('/apply')) {
    return `Applied for task #${resourceId}`;
  } else if (method === 'POST' && path.includes('/tasks')) {
    return 'Created a new task';
  } else if (method === 'PUT' && path.includes('/profile')) {
    return 'Updated profile';
  } else if (method === 'POST' && path.includes('/reviews')) {
    return `Added review for task #${resourceId}`;
  } else if (method === 'POST' && path.includes('/location')) {
    return 'Updated location';
  }
  
  return `${method} ${path}`;
};

module.exports = {
  activityLogger,
};
