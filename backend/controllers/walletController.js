/**
 * Wallet Controller
 * Handles wallet operations and transactions
 */

const { getWalletBalance } = require('../models/User');
const { getTransactionsByPayer, getTransactionsByPayee, getTransactionSummary } = require('../models/Transaction');

/**
 * Get wallet balance
 * GET /wallet/balance
 */
const getBalance = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const balance = await getWalletBalance(userId);

    res.status(200).json({
      success: true,
      data: {
        user_id: userId,
        wallet_balance: balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction history (all transactions)
 * GET /wallet/transactions
 */
const getTransactionHistory = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const paidTransactions = await getTransactionsByPayer(userId);
    const earnedTransactions = await getTransactionsByPayee(userId);
    const summary = await getTransactionSummary(userId);

    res.status(200).json({
      success: true,
      data: {
        user_id: userId,
        summary,
        paid_transactions: paidTransactions,
        earned_transactions: earnedTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get wallet summary
 * GET /wallet/summary
 */
const getWalletSummary = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const balance = await getWalletBalance(userId);
    const summary = await getTransactionSummary(userId);

    res.status(200).json({
      success: true,
      data: {
        user_id: userId,
        current_balance: balance,
        total_paid: summary.total_paid,
        total_earned: summary.total_earned,
        net_balance: summary.total_earned - summary.total_paid,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBalance,
  getTransactionHistory,
  getWalletSummary,
};
