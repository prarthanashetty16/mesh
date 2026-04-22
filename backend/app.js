/**
 * Express App Configuration
 * Sets up middleware and routes
 */

const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');
const applicationRoutes = require('./routes/application');
const locationRoutes = require('./routes/location');
const walletRoutes = require('./routes/wallet');
const reviewRoutes = require('./routes/review');
const adminRoutes = require('./routes/admin');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/error');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ROOT ROUTE (prevents confusion)
app.get('/', (req, res) => {
  res.send('🚀 Backend is running');
});

// ✅ API ROUTES (clean prefix)
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;