# Viva Preparation Guide: Expense Tracker API

This document provides a comprehensive overview of the Expense Tracker API project, designed to help you prepare for your viva. It covers the project's architecture, how it implements key concepts from your syllabus, and the overall workflow.

---

## 1. How the Project Works: An End-to-End Workflow

This project is a full-stack application that allows users to track their expenses. Here’s how it works from a user's perspective:

1.  **User Registration**: A new user visits the web application (React frontend) and signs up through the registration form. The frontend sends the user's details (name, email, password) to the backend API (`POST /api/auth/register`).
2.  **Password Hashing**: The backend receives the request. Before saving the user to the database, it securely hashes the password using the **bcryptjs** library. This ensures that plain-text passwords are never stored.
3.  **Database Storage**: The new user's data is saved to the **MongoDB** database.
4.  **User Login & JWT**: The user logs in with their email and password (`POST /api/auth/login`). The backend verifies the credentials and, if successful, generates a **JSON Web Token (JWT)**. This token is sent back to the frontend.
5.  **Authenticated Requests**: The frontend stores this JWT and includes it in the header of all subsequent requests to protected API endpoints (e.g., for fetching or creating expenses).
6.  **Middleware Protection**: On the backend, the `authenticate.js` middleware intercepts each request, verifies the JWT, and attaches the user's data to the request object. This ensures that only authenticated users can access their own data.
7.  **CRUD Operations**: The user can create, read, update, and delete expenses and categories through the frontend. Each action triggers a corresponding API call to the backend (e.g., `POST /api/expenses`, `GET /api/expenses`).
8.  **Real-time Updates with WebSockets**: When a significant action occurs (like creating a new expense), the backend uses **WebSockets (`socket.io`)** to send a real-time notification to the user's frontend, allowing the UI to update instantly without needing a page refresh.
9.  **Caching with Redis**: To improve performance, frequently accessed data (like expense lists or categories) is cached in **Redis**. When a user requests this data, the backend first checks the Redis cache. If the data is present, it's returned instantly, reducing the load on the MongoDB database.
10. **Containerization with Docker**: The entire application stack—the Node.js backend, React frontend, MongoDB, PostgreSQL, and Redis—is managed by **Docker and Docker Compose**. This ensures that the development environment is consistent, and the application can be deployed reliably.

---

## 2. Syllabus Implementation in Your Project

Here’s how your project implements the key concepts from your backend engineering syllabus.

### CE-1: Foundational Backend Engineering

| Concept | Implementation in Your Project |
| :--- | :--- |
| **Node.js & Express.js** | The entire backend is built with Node.js and the Express.js framework. **`server.js`** is the main entry point that sets up the Express app. |
| **Modules (CommonJS)** | The project extensively uses the CommonJS module system (`require` and `module.exports`) to structure code into different files (e.g., importing routes and middleware in `server.js`). |
| **npm & Packages** | **`package.json`** manages all project dependencies, such as `express`, `mongoose`, `jsonwebtoken`, and `socket.io`. |
| **RESTful APIs** | The project implements a full RESTful API for resources like expenses and categories. See the **`routes/`** directory for endpoint definitions and the **`controllers/`** directory for the logic. |
| **Middleware** | Custom middleware is a core part of the project. Key examples in the **`middleware/`** directory include `authenticate.js` (for security), `errorHandler.js` (for centralized error handling), and `cache.js` (for Redis caching). |
| **Error Handling** | The **`middleware/errorHandler.js`** file provides a robust, centralized error-handling mechanism that catches different types of errors (e.g., Mongoose validation errors, JWT errors) and sends consistent responses. |
| **Templating (EJS)** | The **`views/`** directory and the `ejs` package are used for server-side rendering, although the primary frontend is the React app. |

### CE-2: Advanced Backend Engineering

| Concept | Implementation in Your Project |
| :--- | :--- |
| **Authentication (JWT)** | User authentication is handled using JSON Web Tokens. The **`config/jwt.js`** file manages token creation and verification, while **`controllers/authController.js`** contains the login/registration logic. |
| **WebSocket Integration** | Real-time communication is implemented using `socket.io`. The **`config/websocket.js`** file initializes the WebSocket server, which is then used in the controllers to push live updates to the client. |
| **Version Control (Git)** | The project is a Git repository, demonstrating version control practices. |
| **Relational Databases (PostgreSQL)** | The project is configured to connect to a PostgreSQL database, as seen in **`config/postgres.js`** and **`docker-compose.yml`**. |
| **NoSQL Databases (MongoDB)** | MongoDB is the primary database, managed with the `mongoose` ODM. The data models are defined in the **`models/`** directory (e.g., `User.js`, `Expense.js`). |
| **Caching (Redis)** | Server-side caching is implemented using Redis. The **`middleware/cache.js`** file contains the logic to cache responses from GET requests, significantly improving performance. |
| **Database Scaling** | The project demonstrates an understanding of scaling concepts with a **`docker-compose.replication.yml`** file for setting up MongoDB replication. |
| **Web Security** | Multiple security best practices are implemented: **`bcryptjs`** for password hashing, **`helmet`** for securing HTTP headers, and **`express-mongo-sanitize`** to prevent NoSQL injection attacks. |

### CE-3: Testing & Deployment

| Concept | Implementation in Your Project |
| :--- | :--- |
| **Software Testing** | The **`tests/`** directory is structured for unit, integration, and functional testing using the Jest framework. This demonstrates a commitment to code quality and reliability. |
| **Deployment (Docker)** | The project is fully containerized using Docker. The **`Dockerfile`** (for the backend) and **`client/Dockerfile`** (for the frontend), along with **`docker-compose.yml`**, allow for easy and consistent deployment of the entire application. |

---

## 3. File-to-Concept Mapping

This section provides a quick reference for which files demonstrate key programming concepts.

| File(s) | Key Concept(s) Demonstrated |
| :--- | :--- |
| **`server.js`** | **Application Entry Point**, Middleware Integration, Route Management, Server Initialization. |
| **`docker-compose.yml`** | **Orchestration**, Service Management, Networking between containers. |
| **`Dockerfile`** | **Containerization**, Multi-stage builds for optimized production images. |
| **`package.json`** | **Dependency Management** with npm. |
| **`config/jwt.js`** | **Authentication**, JSON Web Token (JWT) management. |
| **`config/websocket.js`** | **Real-time Communication** with WebSockets. |
| **`routes/expenseRoutes.js`** | **RESTful API Routing**, applying middleware to specific routes. |
| **`controllers/expenseController.js`** | **Business Logic**, interacting with the database models. |
| **`models/User.js`** | **Data Modeling** with Mongoose, defining schemas and pre-save hooks (for password hashing). |
| **`middleware/authenticate.js`** | **Security**, protecting API endpoints. |
| **`middleware/errorHandler.js`** | **Centralized Error Handling**. |
| **`middleware/cache.js`** | **Performance Optimization** through server-side caching with Redis. |
| **`client/src/App.js`** | **Client-Side Routing** with React Router. |
| **`client/src/components/Login.js`** | **Frontend-Backend Communication** (making API calls with `axios`). |
