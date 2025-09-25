# EXPENSE TRACKER API

## Overview
This project is designed for the CE-1 evaluation of Back End Engineering-II (CSE Batch 2023). It demonstrates foundational Node.js and Express.js concepts, including modular code, error handling, async programming, RESTful APIs, and EJS templating.

## Key Concepts Demonstrated
- **Node.js Basics:** Difference from browser JS, running code via CLI/IDE.
- **Modules:** CommonJS (`require`, `module.exports`), ESM (`import`, `export`), and custom modules (`modules/logger.js`, `modules/errorHandler.js`, `modules/utils.mjs`).
- **npm Usage:** Project uses `express`, `ejs`, `mongoose`, `multer`, `csv-writer`, and more. See `package.json`.
- **Error Handling:** Centralized error middleware, try/catch, async error handling.
- **Async Programming:** File operations, API endpoints, async/await, blocking vs non-blocking code.
- **RESTful API:** CRUD for expenses, budgets, categories. Modular routes and controllers.
- **EJS Templating:** Dynamic server-rendered views for dashboard and forms.

## How to Run
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start MongoDB locally (`mongodb://127.0.0.1:27017/expenses`).
3. Run the server:
   ```sh
   node server.js
   ```
4. Visit [http://localhost:3019](http://localhost:3019).

## Project Structure
```
/
├── controllers/
│   ├── authController.js
│   ├── budgetController.js
│   ├── categoryController.js
│   └── expenseController.js
├── middlewares/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── logger.js
├── models/
│   ├── Budget.js
│   ├── Category.js
│   ├── Expense.js
│   └── User.js
├── public/
│   ├── styles.css
│   ├── script.js
│   └── index.html
├── routes/
│   ├── authRoutes.js
│   ├── budgetRoutes.js
│   ├── categoryRoutes.js
│   └── expenseRoutes.js
├── views/
│   └── index.ejs
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## For CE-1 Assessment
- See `Assessment_Report_CE1.md` for a summary of concepts and features.
- See `CE1_Presentation_Outline.md` for a suggested PPT structure.
- Project demonstrates all required foundational backend engineering concepts for CE-1.

## License
This project is for educational purposes.