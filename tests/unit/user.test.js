/**
 * Unit Tests for User Model
 * Covers: Lectures 81-83 (Unit Testing)
 * Testing Framework: Jest
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup: Connect to in-memory MongoDB
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Cleanup: Disconnect and stop MongoDB
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database after each test
afterEach(async () => {
  await User.deleteMany({});
});

describe('User Model Unit Tests', () => {
  
  describe('User Creation', () => {
    test('should create a user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = await User.create(userData);

      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.isActive).toBe(true);
      expect(user.currency).toBe('USD');
    });

    test('should hash password before saving', async () => {
      const plainPassword = 'password123';
      const user = await User.create({
        username: 'hashtest',
        email: 'hash@example.com',
        password: plainPassword
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      expect(userWithPassword.password).not.toBe(plainPassword);
      expect(userWithPassword.password).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });

    test('should fail without required fields', async () => {
      const user = new User({
        email: 'incomplete@example.com'
      });

      await expect(user.save()).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const user = new User({
        username: 'invaliduser',
        email: 'invalidemail',
        password: 'password123'
      });

      await expect(user.save()).rejects.toThrow();
    });

    test('should enforce unique username', async () => {
      const userData = {
        username: 'uniqueuser',
        email: 'unique1@example.com',
        password: 'password123'
      };

      await User.create(userData);

      const duplicateUser = {
        username: 'uniqueuser',
        email: 'unique2@example.com',
        password: 'password123'
      };

      await expect(User.create(duplicateUser)).rejects.toThrow();
    });
  });

  describe('Password Methods', () => {
    test('comparePassword should return true for correct password', async () => {
      const plainPassword = 'correctpassword';
      const user = await User.create({
        username: 'pwtest',
        email: 'pw@example.com',
        password: plainPassword
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword.comparePassword(plainPassword);
      
      expect(isMatch).toBe(true);
    });

    test('comparePassword should return false for incorrect password', async () => {
      const user = await User.create({
        username: 'pwtest2',
        email: 'pw2@example.com',
        password: 'correctpassword'
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword.comparePassword('wrongpassword');
      
      expect(isMatch).toBe(false);
    });
  });

  describe('User Schema Validations', () => {
    test('should trim whitespace from username', async () => {
      const user = await User.create({
        username: '  trimtest  ',
        email: 'trim@example.com',
        password: 'password123'
      });

      expect(user.username).toBe('trimtest');
    });

    test('should convert email to lowercase', async () => {
      const user = await User.create({
        username: 'casetest',
        email: 'UPPERCASE@EXAMPLE.COM',
        password: 'password123'
      });

      expect(user.email).toBe('uppercase@example.com');
    });

    test('should set default currency to USD', async () => {
      const user = await User.create({
        username: 'currencytest',
        email: 'currency@example.com',
        password: 'password123'
      });

      expect(user.currency).toBe('USD');
    });

    test('should enforce username length constraints', async () => {
      const shortUsername = new User({
        username: 'ab',
        email: 'short@example.com',
        password: 'password123'
      });

      await expect(shortUsername.save()).rejects.toThrow();

      const longUsername = new User({
        username: 'a'.repeat(31),
        email: 'long@example.com',
        password: 'password123'
      });

      await expect(longUsername.save()).rejects.toThrow();
    });
  });

  describe('User Updates', () => {
    test('should update user fields correctly', async () => {
      const user = await User.create({
        username: 'updatetest',
        email: 'update@example.com',
        password: 'password123'
      });

      user.firstName = 'Updated';
      user.lastName = 'Name';
      await user.save();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
    });

    test('should update lastLogin timestamp', async () => {
      const user = await User.create({
        username: 'logintest',
        email: 'login@example.com',
        password: 'password123'
      });

      expect(user.lastLogin).toBeUndefined();

      user.lastLogin = new Date();
      await user.save();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.lastLogin).toBeDefined();
    });
  });
});
