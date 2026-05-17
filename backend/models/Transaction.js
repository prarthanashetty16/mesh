/**
 * Transaction Model
 * Database operations for Transactions table (wallet transfers)
 */

const { getOne, getAll, executeQuery } = require('../config/database');

/**
 * Create transaction
 */
const createTransaction = async (transactionData) => {
  const { task_id, payer_id, payee_id, amount, status } = transactionData;
  
  const query = `
    INSERT INTO Transactions (task_id, payer_id, payee_id, amount, status, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;
  
  const result = await executeQuery(query, [task_id, payer_id, payee_id, amount, status]);
  return result.insertId;
};

/**
 * Get transaction by ID
 */
const getTransactionById = async (transactionId) => {
  const query = `
    SELECT t.*, u1.name as payer_name, u2.name as payee_name,
           tsk.title as task_title
    FROM Transactions t
    JOIN Users u1 ON t.payer_id = u1.user_id
    JOIN Users u2 ON t.payee_id = u2.user_id
    JOIN Tasks tsk ON t.task_id = tsk.task_id
    WHERE t.transaction_id = ?
  `;
  return await getOne(query, [transactionId]);
};

/**
 * Get transaction by task ID
 */
const getTransactionByTaskId = async (taskId) => {
  const query = `
    SELECT t.* FROM Transactions t
    WHERE t.task_id = ?
  `;
  return await getOne(query, [taskId]);
};

/**
 * Get transactions for user (as payer)
 */
const getTransactionsByPayer = async (payerId) => {
  const query = `
    SELECT t.*, u.name as payee_name, tsk.title as task_title
    FROM Transactions t
    JOIN Users u ON t.payee_id = u.user_id
    JOIN Tasks tsk ON t.task_id = tsk.task_id
    WHERE t.payer_id = ?
    ORDER BY t.created_at DESC
  `;
  return await getAll(query, [payerId]);
};

/**
 * Get transactions for user (as payee)
 */
const getTransactionsByPayee = async (payeeId) => {
  const query = `
    SELECT t.*, u.name as payer_name, tsk.title as task_title
    FROM Transactions t
    JOIN Users u ON t.payer_id = u.user_id
    JOIN Tasks tsk ON t.task_id = tsk.task_id
    WHERE t.payee_id = ?
    ORDER BY t.created_at DESC
  `;
  return await getAll(query, [payeeId]);
};

/**
 * Update transaction status
 */
const updateTransactionStatus = async (transactionId, status) => {
  const query = `
    UPDATE Transactions 
    SET status = ?
    WHERE transaction_id = ?
  `;
  
  await executeQuery(query, [status, transactionId]);
  return true;
};

/**
 * Get transaction summary for user
 */
const getTransactionSummary = async (userId) => {
  const query = `
    SELECT 
      SUM(CASE WHEN payer_id = ? THEN amount ELSE 0 END) as total_paid,
      SUM(CASE WHEN payee_id = ? THEN amount ELSE 0 END) as total_earned
    FROM Transactions
    WHERE status = 'COMPLETED'
  `;
  
  const result = await getOne(query, [userId, userId]);
  return {
    total_paid: result.total_paid || 0,
    total_earned: result.total_earned || 0,
  };
};

module.exports = {
  createTransaction,
  getTransactionById,
  getTransactionByTaskId,
  getTransactionsByPayer,
  getTransactionsByPayee,
  updateTransactionStatus,
  getTransactionSummary,
};
