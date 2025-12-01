# Expense Tracker API

A comprehensive RESTful API for expense tracking with user authentication, real-time updates, and analytics. Built following Backend Engineering-II (23CS008) course syllabus with Node.js, Express.js, MongoDB, and PostgreSQL integration capabilities.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Secure password hashing using bcrypt (SHA-256 based)
  - Protected routes with middleware
  - User profile management

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
  - **MongoDB** - Primary NoSQL database for user data and expenses
  - **PostgreSQL** - Optional relational database support for advanced queries

- **Security Features**
  - Helmet.js for secure HTTP headers
  - CORS configuration
  - Rate limiting (DDoS protection)
  - XSS protection
  - NoSQL injection prevention
  - Data sanitization

- **Performance Optimization**
  - Database indexing
  - Query optimization
  - Response compression
  - Pagination support
  - Efficient aggregation pipelines

## Prerequisites

- Node.js (v14 or higher) - **Required**
- MongoDB (v4.4 or higher) - **Required**
- PostgreSQL (v12 or higher) - **Optional** (for relational database features)
- Docker & Docker Compose - **Optional** (for containerized MongoDB)

## Installation

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd Expense-Tracker-Complete
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (Required)
MONGODB_URI=mongodb://localhost:27017/expense_tracker

# PostgreSQL (Optional - for relational queries)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=expense_tracker

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

### 4. Start Databases

**MongoDB (Required):**
```bash
# Start MongoDB service
mongod

# Or if using MongoDB as a Windows service:
net start MongoDB
```

**PostgreSQL (Optional - for relational database features):**
```bash
# Start PostgreSQL service (Windows)
net start postgresql-x64-14

# Or using Docker
docker run --name expense-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:14

# Connect to PostgreSQL
psql -U postgres -d expense_tracker
```

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

## Docker Setup

This project includes Docker support for running MongoDB as a containerized service.

### Docker Compose Configuration

The `docker-compose.yml` file includes:
- **MongoDB 7** - NoSQL database instance
- **Persistent Data** - Volume-mounted data storage
- **Health Checks** - Automatic container health monitoring
- **Auto-restart** - Automatic recovery on failure

### Docker Commands

**Start MongoDB Container:**
```bash
docker-compose up -d
```

**View Running Containers:**
```bash
docker ps
```

**View MongoDB Logs:**
```bash
docker-compose logs -f mongodb
```

**Stop MongoDB Container:**
```bash
docker-compose down
```

**Stop and Remove Data:**
```bash
docker-compose down -v
```

**Restart MongoDB:**
```bash
docker-compose restart mongodb
```

**Access MongoDB Shell:**
```bash
docker exec -it expense-tracker-mongodb mongosh
```

### Verifying MongoDB Connection

Once MongoDB is running, your application will automatically connect when you start the server. You should see:
```
[Success] MongoDB Connected: localhost
```

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
- **MongoDB**: NoSQL document model, CRUD operations
- Database Indexing & Query Optimization

### Scaling & Security (Lectures 70-83)
- **Database Scaling**: Indexing, sharding strategies, replication
- **Web Security**: Hashing (bcrypt/SHA-256), HTTPS/TLS
- **Testing**: Unit, Integration, Functional testing setup

### Deployment (Lectures 84-90)
- **Docker**: Containerization with docker-compose
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
- **Sharding**: Partition data by `user` field for horizontal scaling
- **Replication**: MongoDB replica sets for read scaling and high availability
- **Query Optimization**: Projection, pagination, and aggregation pipelines

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

## Deployment Guide (Syllabus: AWS, Docker, Beanstalk)

### Docker Containerization
```bash
# Run MongoDB with Docker
docker-compose up -d

# Build API Docker image
docker build -t expense-tracker-api .

# Run API container
docker run -p 5000:5000 --env-file .env expense-tracker-api
```

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
├── docker-compose.yml      # Docker Compose for MongoDB
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

### Docker Deployment (Example)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

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
