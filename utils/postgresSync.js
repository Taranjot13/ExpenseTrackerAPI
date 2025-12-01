const { query, isAvailable } = require('../config/postgres');

/**
 * Sync user to PostgreSQL
 */
const syncUser = async (user) => {
  if (!isAvailable()) return;

  try {
    await query(
      `INSERT INTO users (mongo_id, email, username, first_name, last_name, currency, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (mongo_id) 
       DO UPDATE SET 
         email = EXCLUDED.email,
         username = EXCLUDED.username,
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         currency = EXCLUDED.currency,
         updated_at = EXCLUDED.updated_at`,
      [
        user._id.toString(),
        user.email,
        user.username,
        user.firstName || null,
        user.lastName || null,
        user.currency || 'USD',
        user.createdAt,
        user.updatedAt || new Date()
      ]
    );
    console.log(`[Success] User synced to PostgreSQL: ${user.email}`);
  } catch (error) {
    console.error('PostgreSQL sync error (user):', error.message);
  }
};

/**
 * Sync category to PostgreSQL
 */
const syncCategory = async (category, userId) => {
  if (!isAvailable()) return;

  try {
    await query(
      `INSERT INTO categories (mongo_id, user_mongo_id, name, color, icon, budget, description, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (mongo_id)
       DO UPDATE SET
         name = EXCLUDED.name,
         color = EXCLUDED.color,
         icon = EXCLUDED.icon,
         budget = EXCLUDED.budget,
         description = EXCLUDED.description,
         is_active = EXCLUDED.is_active,
         updated_at = EXCLUDED.updated_at`,
      [
        category._id.toString(),
        userId.toString(),
        category.name,
        category.color || null,
        category.icon || null,
        category.budget || null,
        category.description || null,
        category.isActive !== false,
        category.createdAt,
        category.updatedAt || new Date()
      ]
    );
    console.log(`[Success] Category synced to PostgreSQL: ${category.name}`);
  } catch (error) {
    console.error('PostgreSQL sync error (category):', error.message);
  }
};

/**
 * Sync expense to PostgreSQL
 */
const syncExpense = async (expense, userId) => {
  if (!isAvailable()) return;

  try {
    const categoryId = expense.category ? 
      (typeof expense.category === 'object' ? expense.category._id : expense.category) : 
      null;

    await query(
      `INSERT INTO expenses (mongo_id, user_mongo_id, category_mongo_id, amount, currency, description, date, payment_method, tags, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (mongo_id)
       DO UPDATE SET
         category_mongo_id = EXCLUDED.category_mongo_id,
         amount = EXCLUDED.amount,
         currency = EXCLUDED.currency,
         description = EXCLUDED.description,
         date = EXCLUDED.date,
         payment_method = EXCLUDED.payment_method,
         tags = EXCLUDED.tags,
         notes = EXCLUDED.notes,
         updated_at = EXCLUDED.updated_at`,
      [
        expense._id.toString(),
        userId.toString(),
        categoryId ? categoryId.toString() : null,
        expense.amount,
        expense.currency || 'USD',
        expense.description || null,
        expense.date,
        expense.paymentMethod || null,
        expense.tags || [],
        expense.notes || null,
        expense.createdAt,
        expense.updatedAt || new Date()
      ]
    );
    console.log(`[Success] Expense synced to PostgreSQL: ${expense.amount}`);
  } catch (error) {
    console.error('PostgreSQL sync error (expense):', error.message);
  }
};

/**
 * Delete user from PostgreSQL
 */
const deleteUser = async (userId) => {
  if (!isAvailable()) return;

  try {
    await query('DELETE FROM users WHERE mongo_id = $1', [userId.toString()]);
    console.log(`[Success] User deleted from PostgreSQL: ${userId}`);
  } catch (error) {
    console.error('PostgreSQL delete error (user):', error.message);
  }
};

/**
 * Delete category from PostgreSQL
 */
const deleteCategory = async (categoryId) => {
  if (!isAvailable()) return;

  try {
    await query('DELETE FROM categories WHERE mongo_id = $1', [categoryId.toString()]);
    console.log(`[Success] Category deleted from PostgreSQL: ${categoryId}`);
  } catch (error) {
    console.error('PostgreSQL delete error (category):', error.message);
  }
};

/**
 * Delete expense from PostgreSQL
 */
const deleteExpense = async (expenseId) => {
  if (!isAvailable()) return;

  try {
    await query('DELETE FROM expenses WHERE mongo_id = $1', [expenseId.toString()]);
    console.log(`[Success] Expense deleted from PostgreSQL: ${expenseId}`);
  } catch (error) {
    console.error('PostgreSQL delete error (expense):', error.message);
  }
};

/**
 * Get analytics from PostgreSQL (demonstrates SQL queries)
 */
const getAnalytics = async (userId, startDate, endDate) => {
  if (!isAvailable()) {
    throw new Error('PostgreSQL is not available');
  }

  try {
    // Monthly spending summary
    const summary = await query(
      `SELECT 
        COUNT(*) as total_expenses,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        MIN(amount) as min_amount,
        MAX(amount) as max_amount
       FROM expenses
       WHERE user_mongo_id = $1
       AND date BETWEEN $2 AND $3`,
      [userId.toString(), startDate, endDate]
    );

    // Category-wise breakdown
    const categoryBreakdown = await query(
      `SELECT 
        c.name as category_name,
        c.color,
        COUNT(e.id) as expense_count,
        SUM(e.amount) as total_amount
       FROM expenses e
       LEFT JOIN categories c ON e.category_mongo_id = c.mongo_id
       WHERE e.user_mongo_id = $1
       AND e.date BETWEEN $2 AND $3
       GROUP BY c.name, c.color
       ORDER BY total_amount DESC`,
      [userId.toString(), startDate, endDate]
    );

    // Daily spending trend
    const dailyTrend = await query(
      `SELECT 
        date,
        COUNT(*) as expense_count,
        SUM(amount) as total_amount
       FROM expenses
       WHERE user_mongo_id = $1
       AND date BETWEEN $2 AND $3
       GROUP BY date
       ORDER BY date DESC`,
      [userId.toString(), startDate, endDate]
    );

    return {
      summary: summary.rows[0],
      categoryBreakdown: categoryBreakdown.rows,
      dailyTrend: dailyTrend.rows
    };

  } catch (error) {
    console.error('PostgreSQL analytics error:', error.message);
    throw error;
  }
};

/**
 * Get expenses with JOIN (demonstrates relational queries)
 */
const getExpensesWithCategory = async (userId, limit = 10, offset = 0) => {
  if (!isAvailable()) {
    throw new Error('PostgreSQL is not available');
  }

  try {
    const result = await query(
      `SELECT 
        e.mongo_id,
        e.amount,
        e.currency,
        e.description,
        e.date,
        e.payment_method,
        e.tags,
        e.notes,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
       FROM expenses e
       LEFT JOIN categories c ON e.category_mongo_id = c.mongo_id
       WHERE e.user_mongo_id = $1
       ORDER BY e.date DESC, e.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId.toString(), limit, offset]
    );

    return result.rows;

  } catch (error) {
    console.error('PostgreSQL query error:', error.message);
    throw error;
  }
};

module.exports = {
  syncUser,
  syncCategory,
  syncExpense,
  deleteUser,
  deleteCategory,
  deleteExpense,
  getAnalytics,
  getExpensesWithCategory
};
