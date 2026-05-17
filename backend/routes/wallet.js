/**
 * Wallet Routes
 */

const express = require('express');
const router = express.Router();
const { getBalance, getTransactionHistory, getWalletSummary } = require('../controllers/walletController');
const { authMiddleware } = require('../middleware/auth');

// Protected routes
router.get('/balance', authMiddleware, getBalance);
router.get('/transactions', authMiddleware, getTransactionHistory);
router.get('/summary', authMiddleware, getWalletSummary);

module.exports = router;
