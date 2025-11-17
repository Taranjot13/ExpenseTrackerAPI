# Expense Tracker API

A comprehensive RESTful API for expense tracking with user authentication, real-time updates, caching, and analytics.

## 🚀 Features

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
  - **Redis** - Caching layer for improved performance

- **Security Features**
  - Helmet.js for secure HTTP headers
  - CORS configuration
  - Rate limiting (DDoS protection)
  - XSS protection
  - NoSQL injection prevention
  - Data sanitization

- **Performance Optimization**
  - Redis caching with TTL
  - Database indexing
  - Query optimization
  - Response compression
  - Pagination support

## 📋 Prerequisites

- Node.js (v14 or higher) - **Required**
- MongoDB (v4.4 or higher) - **Required**
- Docker & Docker Compose - **Optional** (for Redis)
- Redis (v6 or higher) - Optional (can be run via Docker)

## 🛠️ Installation

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

# Redis (Optional - Docker Recommended)
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

### 4. Start Databases

**MongoDB (Required):**
```bash
# Start MongoDB service
mongod

# Or if using MongoDB as a Windows service:
net start MongoDB
```

**Redis with Docker (Recommended for caching):**
```bash
# Start Redis container using Docker Compose
docker-compose up -d

# Verify Redis is running
docker ps

# View Redis logs
docker-compose logs redis

# Stop Redis
docker-compose down
```

**Redis without Docker (Alternative):**
```bash
redis-server
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
🚀 Server running on port 5000 in development mode
📡 WebSocket server is ready
✅ MongoDB Connected: localhost
Redis Connected
Redis Ready to use
```

The server will start on `http://localhost:5000`

## 🐳 Docker Setup

This project includes Docker support for running Redis as a containerized service.

### Docker Compose Configuration

The `docker-compose.yml` file includes:
- **Redis 7 Alpine** - Lightweight Redis instance
- **Persistent Data** - Volume-mounted data storage
- **Health Checks** - Automatic container health monitoring
- **Auto-restart** - Automatic recovery on failure

### Docker Commands

**Start Redis Container:**
```bash
docker-compose up -d
```

**View Running Containers:**
```bash
docker ps
```

**View Redis Logs:**
```bash
docker-compose logs -f redis
```

**Stop Redis Container:**
```bash
docker-compose down
```

**Stop and Remove Data:**
```bash
docker-compose down -v
```

**Restart Redis:**
```bash
docker-compose restart redis
```

**Access Redis CLI:**
```bash
docker exec -it expense-tracker-redis redis-cli
```

### Verifying Redis Connection

Once Redis is running via Docker, your application will automatically connect when you start the server. You should see:
```
Redis Connected
Redis Ready to use
```

If Redis is not running, the application will continue without caching:
```
⏭️  Redis not configured - caching disabled
```

## 🧪 Quick Test

After starting the server, test if it's working:

1. **Import Postman Collection**: `postman_collection.json`
2. **Or follow the guide**: See `POSTMAN_GUIDE.md` for step-by-step testing
3. **First endpoint to test**: Register a user at `POST http://localhost:5000/api/auth/register`

## 📚 API Documentation

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
  "icon": "🍔",
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

## 🔌 WebSocket Events

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

## 🗄️ Database Schema

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

## ⚡ Performance Optimization

### Caching Strategy
- Redis cache for frequently accessed data
- Cache TTL: 5-10 minutes for most endpoints
- Automatic cache invalidation on data changes

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

**Caching (Optional with Redis):**
- Redis cluster for distributed caching
- Cache-aside pattern implementation
- Automatic cache invalidation on data updates
- CDN for static assets

## 🧪 Testing

Run tests (to be implemented):
```bash
npm test
```

## 🔧 Troubleshooting

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
│   ├── mongodb.js          # MongoDB connection
│   ├── redis.js            # Redis connection & utilities
│   └── jwt.js              # JWT utilities
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── expenseController.js # Expense CRUD
│   ├── categoryController.js # Category CRUD
│   └── analyticsController.js # Analytics logic
├── middleware/
│   ├── authenticate.js     # JWT authentication
│   ├── rateLimiter.js      # Rate limiting
│   ├── cache.js            # Redis caching
│   ├── errorHandler.js     # Error handling
│   └── validator.js        # Input validation
├── models/
│   ├── User.js             # User model
│   ├── Expense.js          # Expense model
│   └── Category.js         # Category model
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── expenseRoutes.js    # Expense endpoints
│   ├── categoryRoutes.js   # Category endpoints
│   └── analyticsRoutes.js  # Analytics endpoints
├── .env.example            # Environment variables template
├── .env                    # Your environment configuration (not in git)
├── .gitignore              # Git ignore rules
├── .dockerignore           # Docker ignore rules
├── docker-compose.yml      # Docker Compose configuration for Redis
├── package.json            # Dependencies
├── server.js               # Application entry point
├── setup.ps1               # Setup script for Windows
├── redis-docker.ps1        # Redis Docker management script
├── README.md               # Documentation
└── REDIS_DOCKER_SETUP.md   # Redis Docker setup guide
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
   - Configure Redis password
   - Set up database backups

3. **Security**
   - Enable HTTPS/TLS
   - Configure CORS properly
   - Set appropriate rate limits
   - Enable all security headers

4. **Performance**
   - Enable compression
   - Set up Redis cluster
   - Configure database replication
   - Implement monitoring

5. **Backup**
   - Database backup strategy
   - Log management
   - Error tracking (Sentry, etc.)

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

## 📝 License

ISC License

## 📧 Support

For support, email your-email@example.com or create an issue in the repository.

## 🙏 Acknowledgments

- Express.js team
- MongoDB team
- Redis team
- Socket.IO team
- All contributors and supporters

---

**Built with ❤️ using Node.js, Express.js, MongoDB, Redis, and Socket.IO**
