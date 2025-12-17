# Expense Tracker API

A comprehensive, production-ready RESTful API for expense tracking, featuring JWT authentication, real-time updates via WebSockets, and advanced analytics. Supports MongoDB (required) with optional PostgreSQL and Redis.

---

## ✨ Key Features

- **Secure Authentication**: JWT-based authentication with access/refresh tokens and secure password hashing using `bcryptjs`.
- **Single Website + REST API**: One Express app serves the UI (EJS + vanilla JS) and the REST API from the same origin on `http://localhost:5000`.
- **React Client (Optional)**: The `client/` folder is optional and not started by default.
- **Real-Time Updates**: WebSocket integration with `socket.io` for instant client updates.
- **Comprehensive Expense Management**: Full CRUD operations for expenses and categories.
- **Advanced Analytics**: Endpoints for spending summaries, category breakdowns, and budget comparisons.
- **Multi-Database Support**:
    - **MongoDB**: Primary NoSQL database for core data.
    - **PostgreSQL**: Optional relational database for complex queries.
    - **Redis**: Server-side caching for high-performance data retrieval.
- **Robust Security**: Implements `helmet` for security headers, `express-mongo-sanitize` to prevent NoSQL injection, and rate limiting.
- **Comprehensive Testing**: Includes a full testing suite with Jest for unit, integration, and functional tests.

---

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: React
- **Databases**: MongoDB, PostgreSQL, Redis
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Real-time**: WebSockets (Socket.IO)
- **Testing**: Jest

---

## 🚀 Getting Started

This project is intended to run directly on Node.js without Docker.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- Local installations of [MongoDB](https://www.mongodb.com/try/download/community), [PostgreSQL](https://www.postgresql.org/download/), and [Redis](https://redis.io/docs/getting-started/installation/).

---

### A. Local Development Setup

This approach runs a single Express website (UI + API) on localhost. You only need MongoDB running for core features.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Taranjot13/ExpenseTrackerAPI.git
    cd ExpenseTrackerAPI
    ```

2.  **Install Backend Dependencies**:
    ```bash
    npm install
    ```

3.  **(Optional) Install React Client Dependencies**:
  Only if you want to run the separate React client.
  ```bash
  cd client
  npm install
  cd ..
  ```

4.  **Set Up Environment Variables**:
    Create a `.env` file in the root directory and configure it with your local database connections and secrets.
    ```env
    # Server
    NODE_ENV=development
    PORT=5000

    # Database Connections
    MONGODB_URI=mongodb://localhost:27017/expense_tracker
    POSTGRES_PASSWORD=your_postgres_password
    REDIS_HOST=localhost
    REDIS_PORT=6379

    # JWT Secrets
    JWT_SECRET=your-super-secret-key
    JWT_REFRESH_SECRET=your-super-secret-refresh-key
    ```

5.  **Start MongoDB**:
  Ensure your local MongoDB service is running (PostgreSQL/Redis are optional).

6.  **Run the Website (UI + API)**:
  In the root directory, run:
  ```bash
  npm run dev
  ```
  Open:
  - UI: `http://localhost:5000`
  - Health: `http://localhost:5000/health`
  - API base: `http://localhost:5000/api`

7.  **(Optional) Run the React Client**:
  If you still want the separate React UI:
  ```bash
  npm run client
  ```
  React will run at `http://localhost:3000`.

---

## ⚙️ API Endpoints

Here is a brief overview of the available API endpoints. For a complete list, you can refer to the route files in the `routes/` directory.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user. |
| `POST` | `/api/auth/login` | Log in a user and receive a JWT. |
| `GET` | `/api/expenses` | Get all expenses for the authenticated user. |
| `POST` | `/api/expenses` | Create a new expense. |
| `GET` | `/api/categories` | Get all categories for the user. |
| `GET` | `/api/analytics/summary` | Get a summary of expenses. |

---

## 🧪 Running Tests

This project uses Jest for testing. The tests are structured into `unit`, `integration`, and `functional` tests.

To run the tests, you can execute the following command:

```bash
npm test
```

This will run all tests and provide a coverage report.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue if you have any suggestions or find a bug.


---
## Features

- **User Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Secure password hashing using bcrypt (SHA-256 based)

- **Expense Management**
  - CRUD operations for expenses
  - User-specific data isolation
  - Advanced filtering and pagination
  - Bulk operations support
  - Receipt attachment support

- **Category Management**
  - Custom categories per user
  - Budget tracking per category
  - Category-based analytics

- **Analytics & Reporting**
  - Spending summaries and trends
  - Category-wise breakdown
  - Budget vs actual comparisons
  - Time-based analytics (daily, weekly, monthly)

- **Real-time Updates**
  - WebSocket integration using Socket.IO
  - Live notifications for expense changes
  - User activity tracking

- **Database Support**
  - **MongoDB** - Primary NoSQL database with replication support
  - **PostgreSQL** - Optional relational database support for advanced queries
  - **Redis** - Server-side caching for improved performance

- **Database Scaling** ⚡
  - **Indexing** - Compound indexes for optimized queries
  - **Replication** - MongoDB replica sets for high availability
  - **Sharding** - Horizontal scaling configuration guide
  - **Caching** - Redis-based response caching

- **Security Features** ⭐
  - **HTTPS/TLS** - TLS 1.2/1.3 encryption with 4096-bit RSA
  - Helmet.js for secure HTTP headers
  - CORS configuration
  - Rate limiting (DDoS protection)
  - XSS protection
  - NoSQL injection prevention
  - Data sanitization

- **Performance Optimization**
  - Redis caching with automatic invalidation
  - Database indexing
  - Query optimization
  - Response compression
  - Pagination support
  - Efficient aggregation pipelines

## Prerequisites

- Node.js (v14 or higher) - **Required**
- MongoDB (v4.4 or higher) - **Required**
- Redis (v6 or higher) - **Optional** (for caching features)
- PostgreSQL (v12 or higher) - **Optional** (for relational database features)

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/Taranjot13/ExpenseTrackerAPI.git
cd Expense-Tracker-API
```

### 2. Install dependencies
```bash
npm install
```

### 3. Generate SSL Certificates (NEW! ⭐)
```bash
npm run generate:ssl
```

**Output:**
```
=================================
  SSL Certificate Generator
  (Node.js Native - No OpenSSL)
=================================

[SSL] ✓ RSA key pair generated
[SSL] ✓ Certificate signed

✅ SSL Certificate generated successfully!

Files created:
  📄 ssl/private.key
  📄 ssl/certificate.crt
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server
PORT=5000
NODE_ENV=development

# HTTPS/TLS Configuration (NEW!)
ENABLE_HTTPS=true
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt

# MongoDB (Required)
MONGODB_URI=mongodb://localhost:27017/expense_tracker

# MongoDB Replica Set (recommended for production)
# MONGODB_URI=mongodb://localhost:27017,localhost:27018,localhost:27019/expense_tracker?replicaSet=expenseTrackerRS&readPreference=secondaryPreferred&w=majority

# PostgreSQL (Optional - for relational queries)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=expense_tracker

# Redis (Optional - for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_key
JWT_REFRESH_EXPIRE=30d

# Security
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 5. Start Databases

**MongoDB (Required):**
```bash
# Start MongoDB service
mongod

# Or if using MongoDB as a Windows service:
net start MongoDB

# For MongoDB Replica Set (production):
# See docs/mongodb-replication.md for detailed setup
```

**Redis (Optional - for caching):**
```bash
# Start Redis server
redis-server

# Test Redis connection:
redis-cli ping
# Response: PONG
```

**PostgreSQL (Optional - for relational database features):**
```bash
# Start PostgreSQL service (Windows)
net start postgresql-x64-14

# Connect to PostgreSQL
psql -U postgres -d expense_tracker
```

### 6. Start Server

**With HTTPS (Recommended):**
```bash
npm start
# or
npm run start:https
```

**Server Output (HTTPS + Redis Enabled):**
```
[HTTPS] SSL/TLS certificates loaded successfully
[HTTPS] TLS 1.2/1.3 enabled with strong cipher suites
[Server] HTTPS server running on port 5000 in development mode
[Server] HTTPS: Enabled
[Redis] ✅ Redis Connected and Ready
[WebSocket] WebSocket server is ready
[Success] MongoDB Connected: localhost
```

⚠️ **Note:** Self-signed certificates will show a browser warning. Click "Advanced" → "Proceed to localhost"

### 5. Run the application

**Development mode with auto-reload (Recommended):**
```bash
npm run dev
```

**Alternative methods:**
```bash
# Direct execution
node server.js

# Production mode
npm start
```

**Expected Output:**
```
[Server] Server running on port 5000 in development mode
[WebSocket] WebSocket server is ready
[Success] MongoDB Connected: localhost
```

The server will start on `http://localhost:5000`

## Quick Test

After starting the server, test if it's working:

1. **Import Postman Collection**: `postman_collection.json`
2. **First endpoint to test**: Register a user at `POST http://localhost:5000/api/auth/register`
3. **Web Interface**: Open `http://localhost:5000` in your browser for the EJS-powered frontend

## Course Syllabus Coverage (23CS008 - Backend Engineering-II)

This project implements key concepts from the Backend Engineering-II syllabus:

### Node.js Fundamentals (Lectures 1-36)
- CommonJS & ESM Modules
- npm Package Management
- Error Handling & Debugging
- Async Programming (Promises, Async/Await)
- File System Operations
- CLI Applications (`utils/cli-report.js`)
- External API Integration
- Process Management (PM2, Nodemon)

### Express.js & Templating (Lectures 37-52)
- Express.js Setup & Routing
- REST API Design (GET, POST, PUT, DELETE)
- Express Middleware (Custom, Error Handling)
- EJS Templating Engine (views/)
- JWT Authentication & Authorization
- Route Protection
- WebSocket Integration (Socket.IO)
- MongoDB Integration with Express

### Database Systems (Lectures 53-69)
- **Git & GitHub**: Version control, branching, collaboration
- **PostgreSQL**: Schema design, queries, joins, constraints
- **MongoDB**: NoSQL document model, CRUD operations, aggregation
- **Redis**: In-memory caching, key-value store
- Database Indexing & Query Optimization

### Scaling & Security (Lectures 70-83)
- **Database Scaling**: 
  - Indexing strategies (compound indexes)
  - Sharding configuration (horizontal scaling)
  - Replication (MongoDB replica sets for HA)
- **Caching**: Redis server-side caching with TTL
- **Web Security**: Hashing (bcrypt/SHA-256), HTTPS/TLS
- **Testing**: Unit, Integration, Functional testing setup

### Deployment (Lectures 84-90)
- **AWS**: EC2, RDS, S3, Route 53, Elastic Beanstalk ready

## CLI Report Tool (Syllabus: CLI Apps & Async Programming)

Node.js CLI tool demonstrating `process.argv`, async programming, and file handling:

```bash
npm run cli:report -- --email=user@example.com [--month=YYYY-MM]
```

**Features:**
- Generates JSON expense reports in `reports/` directory
- Category-wise breakdown and totals
- Async MongoDB queries
- Command-line argument parsing

## Database Indexing & Scaling (Syllabus: Scaling DBs)

### MongoDB Indexes
- **Compound Index**: `{ user: 1, date: -1 }` - User expenses sorted by date
- **Compound Index**: `{ user: 1, category: 1 }` - Category-wise analytics per user
- **Single Index**: `{ email: 1 }` - Fast user lookups

### Scaling Strategies

#### 1. Redis Caching (Implemented ✅)
```javascript
// Expense routes with 5-minute cache
router.get('/', cache(300, generateUserCacheKey), getExpenses);

// Analytics with 10-minute cache
router.get('/summary', cache(600, generateAnalyticsCacheKey), getSummary);

// Automatic cache invalidation on mutations
router.post('/', invalidateCacheAfter('expenses'), createExpense);
```

**Cache Configuration:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

**Benefits:**
- 5-10x faster response times for repeated queries
- Reduced database load
- Automatic TTL (Time To Live) expiration
- Pattern-based cache invalidation

#### 2. MongoDB Replication (Documentation Included ✅)
- **High Availability**: Automatic failover on primary failure
- **Read Scaling**: Distribute reads across secondary nodes
- **Data Redundancy**: Multiple copies of data
- **Setup Guide**: See `docs/mongodb-replication.md`

**Quick Start:**
```bash
# Setup replica set
npm run setup:replication
```

**Connection String:**
```
mongodb://localhost:27017,localhost:27018,localhost:27019/expense_tracker?replicaSet=expenseTrackerRS&readPreference=secondaryPreferred
```

#### 3. MongoDB Sharding (Configuration Guide ✅)
- **Horizontal Scaling**: Distribute data across multiple shards
- **Shard Key Strategy**: Partition by `user` field
- **Large Dataset Support**: Handle datasets > 200GB
- **Setup Guide**: See `docs/mongodb-sharding.md`

**Sharding Architecture:**
- Config servers (3 nodes)
- Query routers (mongos)
- Shard servers (3+ shards with replica sets)

#### 4. Query Optimization
- **Projection**: Fetch only required fields
- **Pagination**: Limit results per page
- **Aggregation Pipelines**: Server-side data processing

## PostgreSQL Support (Syllabus: Relational Databases)

### Setup PostgreSQL
```bash
# Install PostgreSQL
# Windows: Download from https://www.postgresql.org/download/windows/

# Create database
psql -U postgres
CREATE DATABASE expense_tracker;
\q
```

### PostgreSQL Schema
The project includes a PostgreSQL schema equivalent to MongoDB models:
- Users table with authentication fields
- Categories table with budget tracking
- Expenses table with foreign key relationships

### Using PostgreSQL
```bash
# Add to .env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=expense_tracker
```

## Deployment Guide (Syllabus: AWS, Beanstalk)

### AWS Deployment

**1. AWS EC2 Deployment:**
- Launch EC2 instance (Ubuntu/Amazon Linux)
- Install Node.js, MongoDB, and Git
- Clone repository and run with PM2
- Configure security groups (ports 5000, 27017)

**2. AWS RDS (PostgreSQL):**
- Create RDS PostgreSQL instance
- Configure security groups and VPC
- Connect using POSTGRES_HOST environment variable

**3. AWS S3:**
- Store expense receipts/attachments
- Configure IAM roles for EC2 access

**4. AWS Route 53:**
- Configure DNS for custom domain
- Point to EC2 elastic IP or load balancer

**5. AWS Elastic Beanstalk:**
```bash
# Initialize EB CLI
eb init -p node.js expense-tracker-api

# Create environment
eb create expense-tracker-env

# Deploy
eb deploy
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "currency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "currency": "USD"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "currency": "EUR"
}
```

#### Change Password
```http
PUT /api/auth/password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Category Endpoints

#### Create Category
```http
POST /api/categories
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Food",
  "color": "#FF5733",
  "icon": "food",
  "budget": 500,
  "description": "Food and dining expenses"
}
```

#### Get All Categories
```http
GET /api/categories?includeStats=true
Authorization: Bearer <access_token>
```

#### Get Single Category
```http
GET /api/categories/:id
Authorization: Bearer <access_token>
```

#### Update Category
```http
PUT /api/categories/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Groceries",
  "budget": 600
}
```

#### Delete Category
```http
DELETE /api/categories/:id
Authorization: Bearer <access_token>
```

### Expense Endpoints

#### Create Expense
```http
POST /api/expenses
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 50.75,
  "currency": "USD",
  "category": "category_id",
  "description": "Lunch at restaurant",
  "date": "2025-11-14",
  "paymentMethod": "credit_card",
  "tags": ["lunch", "restaurant"],
  "notes": "Client meeting"
}
```

#### Get All Expenses
```http
GET /api/expenses?page=1&limit=10&category=category_id&startDate=2025-11-01&endDate=2025-11-14
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category ID
- `startDate` - Start date filter (ISO format)
- `endDate` - End date filter (ISO format)
- `minAmount` - Minimum amount filter
- `maxAmount` - Maximum amount filter
- `paymentMethod` - Filter by payment method
- `search` - Search in description

#### Get Single Expense
```http
GET /api/expenses/:id
Authorization: Bearer <access_token>
```

#### Update Expense
```http
PUT /api/expenses/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount": 55.00,
  "description": "Updated description"
}
```

#### Delete Expense
```http
DELETE /api/expenses/:id
Authorization: Bearer <access_token>
```

#### Bulk Delete Expenses
```http
POST /api/expenses/bulk-delete
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "expenseIds": ["id1", "id2", "id3"]
}
```

### Analytics Endpoints

#### Get Summary
```http
GET /api/analytics/summary?startDate=2025-11-01&endDate=2025-11-14
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalExpenses": 45,
      "totalAmount": 1250.50,
      "averageExpense": 27.79,
      "currency": "USD"
    },
    "byCategory": [...],
    "byPaymentMethod": [...],
    "monthlyTrend": [...]
  }
}
```

#### Get Spending by Date
```http
GET /api/analytics/by-date?startDate=2025-11-01&endDate=2025-11-14&groupBy=day
Authorization: Bearer <access_token>
```

**groupBy options:** `day`, `week`, `month`

#### Get Top Categories
```http
GET /api/analytics/top-categories?limit=5&startDate=2025-11-01
Authorization: Bearer <access_token>
```

#### Get Budget Comparison
```http
GET /api/analytics/budget-comparison?startDate=2025-11-01&endDate=2025-11-14
Authorization: Bearer <access_token>
```

#### Get Recent Expenses
```http
GET /api/analytics/recent?limit=10
Authorization: Bearer <access_token>
```

## WebSocket Events

Connect to WebSocket server:
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_access_token'
  }
});

// Join user room
socket.emit('join', userId);

// Listen for events
socket.on('expense_created', (data) => {
  console.log('New expense:', data.expense);
});

socket.on('expense_updated', (data) => {
  console.log('Expense updated:', data.expense);
});

socket.on('expense_deleted', (data) => {
  console.log('Expense deleted:', data.expenseId);
});

socket.on('category_created', (data) => {
  console.log('New category:', data.category);
});
```

## Database Schema

### User Model (MongoDB)
```javascript
{
  username: String,
  email: String,
  password: String (hashed with bcrypt),
  firstName: String,
  lastName: String,
  currency: String,
  isActive: Boolean,
  lastLogin: Date,
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Model (MongoDB)
```javascript
{
  user: ObjectId (ref: User),
  amount: Number,
  currency: String,
  category: ObjectId (ref: Category),
  description: String,
  date: Date,
  paymentMethod: String,
  tags: [String],
  receipt: { url, filename },
  notes: String,
  isRecurring: Boolean,
  recurringPeriod: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Category Model (MongoDB)
```javascript
{
  user: ObjectId (ref: User),
  name: String,
  color: String,
  icon: String,
  budget: Number,
  description: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- User: `{ email: 1, username: 1 }`
- Expense: `{ user: 1, date: -1 }`, `{ user: 1, category: 1 }`
- Category: `{ user: 1, name: 1 }`

## 🔐 Security Features

### Password Hashing
- Uses bcrypt with configurable rounds (default: 12)
- Bcrypt internally uses SHA-256 for key derivation

### JWT Authentication
- Access tokens (short-lived, 7 days default)
- Refresh tokens (long-lived, 30 days default)
- Secure token verification

### HTTPS/TLS Support
Configure SSL certificates in production:
```env
SSL_KEY_PATH=/path/to/private.key
SSL_CERT_PATH=/path/to/certificate.crt
```

### Security Headers (Helmet.js)
- Content Security Policy
- XSS Protection
- Frame Options
- HSTS

### Rate Limiting
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

### Data Validation
- Input validation using Joi
- XSS prevention
- NoSQL injection prevention
- Data sanitization

## Performance Optimization

### Query Optimization
- Efficient MongoDB aggregation pipelines
- Database indexes for fast queries
- Pagination to reduce data transfer

### Database Optimization
- Compound indexes for efficient queries
- Query optimization with projections
- Pagination to limit data transfer

### Scaling Strategies

**Horizontal Scaling:**
- Stateless API design
- Load balancing support
- JWT-based session management (no server-side sessions)

**Database Scaling (MongoDB):**
- **Sharding**: Partition data by user ID for horizontal scaling
- **Replication**: MongoDB replica sets for read scaling and high availability
- **Indexes**: Compound indexes optimized for common query patterns
  - User-based queries: `{ user: 1, date: -1 }`
  - Category filtering: `{ user: 1, category: 1 }`

**Performance Optimization:**
- Response compression with gzip
- Efficient aggregation pipelines
- Pagination for large datasets
- Database connection pooling

## Testing

Run tests (to be implemented):
```bash
npm test
```

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service (Windows)
net start MongoDB

# Start MongoDB manually
mongod --dbpath="C:\data\db"
```

### Port Already in Use
```bash
# Change PORT in .env file to 5001 or another port
PORT=5001
```

### Authorization Issues in Postman
1. Go to **Authorization** tab
2. Select **Type**: `Bearer Token`
3. Paste your **accessToken** from login response
4. Make sure there's no extra spaces

### "Route not found" Error
- The root URL `/` doesn't have a route
- Use API endpoints: `/api/auth/register`, `/api/expenses`, etc.
- See `POSTMAN_GUIDE.md` for all available endpoints

## 📁 Project Structure

```
Expense-Tracker-API/
├── config/
│   ├── jwt.js              # JWT utilities
│   └── mongodb.js          # MongoDB connection & configuration
├── controllers/
│   ├── analyticsController.js # Analytics & reporting logic
│   ├── authController.js   # Authentication & authorization
│   ├── categoryController.js # Category CRUD operations
│   ├── expenseController.js # Expense CRUD operations
│   └── viewController.js   # View rendering logic (EJS)
├── middleware/
│   ├── authenticate.js     # JWT authentication middleware
│   ├── errorHandler.js     # Global error handling
│   ├── rateLimiter.js      # API rate limiting
│   └── validator.js        # Request validation (Joi)
├── models/
│   ├── Category.js         # Category schema (Mongoose)
│   ├── Expense.js          # Expense schema (Mongoose)
│   └── User.js             # User schema (Mongoose)
├── routes/
│   ├── analyticsRoutes.js  # Analytics API endpoints
│   ├── authRoutes.js       # Authentication endpoints
│   ├── categoryRoutes.js   # Category endpoints
│   ├── expenseRoutes.js    # Expense endpoints
│   └── viewRoutes.js       # EJS view routes
├── views/
│   ├── analytics.ejs       # Analytics page
│   ├── categories.ejs      # Categories page
│   ├── dashboard.ejs       # Dashboard page
│   ├── expenses.ejs        # Expenses listing
│   ├── login.ejs           # Login page
│   ├── register.ejs        # Registration page
│   └── partials/           # EJS partials (header, footer)
├── public/
│   ├── css/                # Stylesheets
│   └── js/                 # Client-side JavaScript
├── utils/
│   ├── cli-report.js       # CLI reporting tool
│   └── helpers.js          # Helper utility functions
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── functional/         # Functional tests
├── .env                    # Environment variables (not in git)
├── .env.example            # Environment template
├── .gitignore              # Git ignore patterns
├── docker/                 # Archived container configs (optional)
├── package.json            # NPM dependencies & scripts
├── postman_collection.json # Postman API collection
├── README.md               # Project documentation
├── server.js               # Application entry point
└── setup.ps1               # Project setup script (PowerShell)
```

## 🚢 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong JWT secrets
   - Configure database URLs
   - Set up SSL certificates

2. **Database**
   - Enable MongoDB authentication
   - Configure database backups
   - Set up replica sets
   - Enable connection pooling

3. **Security**
   - Enable HTTPS/TLS
   - Configure CORS properly
   - Set appropriate rate limits
   - Enable all security headers
   - Implement input validation

4. **Performance**
   - Enable compression
   - Configure database indexes
   - Implement pagination
   - Set up monitoring and logging

5. **Backup & Monitoring**
   - Database backup strategy
   - Log management
   - Error tracking (e.g., Sentry)
   - Performance monitoring (e.g., New Relic)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC License

## Support

For support, email 65taranjot@gmail.com or create an issue in the repository.

## Connect With Me
[LinkedIn](https://linkedin.com/in/taranjot13)  
[GitHub](https://github.com/Taranjot13)
[Email](65taranjot@gmail.com)

## Acknowledgments

- Node.js and Express.js teams
- MongoDB team
- PostgreSQL community
- Socket.IO team
- Chitkara University - Backend Engineering-II (23CS008) course
- All contributors and supporters

---

**Built for Backend Engineering-II (23CS008) using Node.js, Express.js, MongoDB, PostgreSQL, and Socket.IO**
