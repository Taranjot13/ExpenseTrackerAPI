/**
 * Functional Tests for Expense Management Workflow
 * Covers: Lectures 81-83 (Functional Testing)
 * Testing Framework: Jest with Supertest
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../../models/User');
const Category = require('../../models/Category');
const Expense = require('../../models/Expense');

let mongoServer;
let server;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  server = app.listen(0);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await server.close();
});

afterEach(async () => {
  await User.deleteMany({});
  await Category.deleteMany({});
  await Expense.deleteMany({});
});

describe('Expense Management Functional Tests - Complete User Journey', () => {
  
  test('Complete expense tracking workflow', async () => {
    // Step 1: User Registration
    console.log('Step 1: Register new user');
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'functionaluser',
        email: 'functional@example.com',
        password: 'password123',
        firstName: 'Functional',
        lastName: 'Test'
      })
      .expect(201);

    expect(registerResponse.body.success).toBe(true);
    const authToken = registerResponse.body.data.token;
    const userId = registerResponse.body.data.user._id;

    // Step 2: Create Categories
    console.log('Step 2: Create expense categories');
    const foodCategory = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Food & Dining',
        icon: '🍔',
        color: '#FF6B6B',
        budget: 500
      })
      .expect(201);

    expect(foodCategory.body.success).toBe(true);
    const foodCategoryId = foodCategory.body.data._id;

    const transportCategory = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Transportation',
        icon: '🚗',
        color: '#4ECDC4',
        budget: 300
      })
      .expect(201);

    expect(transportCategory.body.success).toBe(true);
    const transportCategoryId = transportCategory.body.data._id;

    // Step 3: Get All Categories
    console.log('Step 3: Retrieve all categories');
    const categoriesResponse = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(categoriesResponse.body.success).toBe(true);
    expect(categoriesResponse.body.data.length).toBe(2);

    // Step 4: Create Multiple Expenses
    console.log('Step 4: Create multiple expenses');
    const expense1 = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 25.50,
        category: foodCategoryId,
        description: 'Lunch at restaurant',
        date: new Date('2024-01-15'),
        paymentMethod: 'credit_card',
        tags: ['lunch', 'restaurant']
      })
      .expect(201);

    expect(expense1.body.success).toBe(true);
    const expense1Id = expense1.body.data._id;

    const expense2 = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 50.00,
        category: transportCategoryId,
        description: 'Gas station fill-up',
        date: new Date('2024-01-16'),
        paymentMethod: 'debit_card',
        tags: ['fuel', 'car']
      })
      .expect(201);

    expect(expense2.body.success).toBe(true);

    const expense3 = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 15.75,
        category: foodCategoryId,
        description: 'Coffee and breakfast',
        date: new Date('2024-01-17'),
        paymentMethod: 'cash',
        tags: ['breakfast', 'coffee']
      })
      .expect(201);

    expect(expense3.body.success).toBe(true);

    // Step 5: Get All Expenses with Pagination
    console.log('Step 5: Retrieve all expenses');
    const expensesResponse = await request(app)
      .get('/api/expenses?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(expensesResponse.body.success).toBe(true);
    expect(expensesResponse.body.data.expenses.length).toBe(3);
    expect(expensesResponse.body.data.total).toBe(3);

    // Step 6: Filter Expenses by Category
    console.log('Step 6: Filter expenses by category');
    const filteredExpenses = await request(app)
      .get(`/api/expenses?category=${foodCategoryId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(filteredExpenses.body.success).toBe(true);
    expect(filteredExpenses.body.data.expenses.length).toBe(2);

    // Step 7: Get Single Expense Details
    console.log('Step 7: Get expense details');
    const expenseDetails = await request(app)
      .get(`/api/expenses/${expense1Id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(expenseDetails.body.success).toBe(true);
    expect(expenseDetails.body.data.amount).toBe(25.50);
    expect(expenseDetails.body.data.description).toBe('Lunch at restaurant');

    // Step 8: Update an Expense
    console.log('Step 8: Update expense');
    const updateResponse = await request(app)
      .put(`/api/expenses/${expense1Id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 30.00,
        description: 'Updated: Lunch at fancy restaurant'
      })
      .expect(200);

    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.amount).toBe(30.00);

    // Step 9: Get Analytics Summary
    console.log('Step 9: Get spending analytics');
    const analyticsResponse = await request(app)
      .get('/api/analytics/summary')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(analyticsResponse.body.success).toBe(true);
    expect(analyticsResponse.body.data.totalExpenses).toBeGreaterThan(0);
    expect(analyticsResponse.body.data.expenseCount).toBe(3);

    // Step 10: Get Category-wise Analytics
    console.log('Step 10: Get category-wise breakdown');
    const categoryAnalytics = await request(app)
      .get('/api/analytics/by-category')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(categoryAnalytics.body.success).toBe(true);
    expect(categoryAnalytics.body.data.length).toBeGreaterThan(0);

    // Step 11: Get Spending Trends
    console.log('Step 11: Get spending trends');
    const trendsResponse = await request(app)
      .get('/api/analytics/trends?period=monthly')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(trendsResponse.body.success).toBe(true);

    // Step 12: Update Category Budget
    console.log('Step 12: Update category budget');
    const categoryUpdate = await request(app)
      .put(`/api/categories/${foodCategoryId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        budget: 600
      })
      .expect(200);

    expect(categoryUpdate.body.success).toBe(true);
    expect(categoryUpdate.body.data.budget).toBe(600);

    // Step 13: Delete an Expense
    console.log('Step 13: Delete expense');
    const deleteResponse = await request(app)
      .delete(`/api/expenses/${expense1Id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(deleteResponse.body.success).toBe(true);

    // Step 14: Verify Deletion
    console.log('Step 14: Verify expense deletion');
    const verifyExpenses = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(verifyExpenses.body.data.expenses.length).toBe(2);

    // Step 15: Update User Profile
    console.log('Step 15: Update user profile');
    const profileUpdate = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currency: 'EUR'
      })
      .expect(200);

    expect(profileUpdate.body.success).toBe(true);
    expect(profileUpdate.body.data.currency).toBe('EUR');

    // Step 16: Get Updated Profile
    console.log('Step 16: Verify profile update');
    const profileResponse = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(profileResponse.body.success).toBe(true);
    expect(profileResponse.body.data.currency).toBe('EUR');

    // Step 17: Logout
    console.log('Step 17: User logout');
    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(logoutResponse.body.success).toBe(true);

    console.log('✅ Complete functional test passed!');
  });

  test('Error handling workflow - Invalid operations', async () => {
    // Register user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'errortest',
        email: 'error@example.com',
        password: 'password123'
      })
      .expect(201);

    const authToken = registerResponse.body.data.token;

    // Try to create expense without category
    const invalidExpense = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 50,
        description: 'Invalid expense'
      })
      .expect(400);

    expect(invalidExpense.body.success).toBe(false);

    // Try to access non-existent expense
    const fakeId = new mongoose.Types.ObjectId();
    const notFound = await request(app)
      .get(`/api/expenses/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    expect(notFound.body.success).toBe(false);

    // Try to create duplicate category
    await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Duplicate',
        icon: '📁'
      })
      .expect(201);

    const duplicate = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Duplicate',
        icon: '📁'
      })
      .expect(400);

    expect(duplicate.body.success).toBe(false);
  });

  test('Multi-user isolation - Data privacy', async () => {
    // Register User 1
    const user1Response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123'
      })
      .expect(201);

    const user1Token = user1Response.body.data.token;

    // Register User 2
    const user2Response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123'
      })
      .expect(201);

    const user2Token = user2Response.body.data.token;

    // User 1 creates category and expense
    const user1Category = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'User1 Category',
        icon: '📂'
      })
      .expect(201);

    const user1CategoryId = user1Category.body.data._id;

    const user1Expense = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        amount: 100,
        category: user1CategoryId,
        description: 'User1 Expense',
        date: new Date()
      })
      .expect(201);

    // User 2 should not see User 1's expenses
    const user2Expenses = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(200);

    expect(user2Expenses.body.data.expenses.length).toBe(0);

    // User 2 should not see User 1's categories
    const user2Categories = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(200);

    expect(user2Categories.body.data.length).toBe(0);

    // User 2 should not be able to access User 1's expense
    const user1ExpenseId = user1Expense.body.data._id;
    const unauthorizedAccess = await request(app)
      .get(`/api/expenses/${user1ExpenseId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(404);

    expect(unauthorizedAccess.body.success).toBe(false);

    console.log('✅ Data isolation verified!');
  });
});
