# VeriCode AI Backend

This is the production-ready Node.js & Express.js backend for the **VeriCode AI** Code Review application. It implements a clean Model-View-Controller (MVC) architecture, utilizes MongoDB for data persistence, integrates with OpenRouter APIs, and includes robust security mechanisms (rate limiting, helmet headers, input validation).

---

## Folder Structure

```
backend/
├── config/
│   └── db.js            # MongoDB Mongoose connection config
├── controllers/
│   ├── authController.js     # User registration, login, profile CRUD
│   ├── aiController.js       # Code analysis, explain, and fix handlers
│   ├── historyController.js  # History retrieval, deletion, search, download
│   ├── reportController.js   # Custom user saved reports
│   ├── dashboardController.js# Aggregate statistics and activity logs
│   └── docController.js      # API dynamic specs generator
├── middleware/
│   ├── authMiddleware.js     # JWT Token verification (Cookies & Bearer)
│   ├── errorMiddleware.js    # Standardized global error handler
│   └── rateLimiter.js        # IP rate limits (Auth & AI specific windows)
├── models/
│   ├── User.js          # User schema and password comparison/hash
│   ├── History.js       # AI request details & response records
│   └── Report.js        # Custom saved diagnostics reports
├── prompts/
│   ├── analyzePrompt.txt# AI instructions for JSON diagnostics reviews
│   ├── explainPrompt.txt# AI instructions for Markdown explanations
│   └── fixPrompt.txt    # AI instructions for Code fixing
├── routes/
│   ├── authRoutes.js    # Authentication routes mapping
│   ├── aiRoutes.js      # Core AI endpoints mapping
│   ├── historyRoutes.js # History logs mapping
│   ├── reportRoutes.js  # Saved reports mapping
│   ├── dashboardRoutes.js# Dashboard statistics mapping
│   └── docRoutes.js     # Specifications router
├── services/
│   └── aiService.js     # OpenRouter API communication service
├── uploads/
│   └── .gitkeep         # Keep uploads directory structures
├── logs/
│   └── .gitkeep         # Keep logs directory structures
├── validators/
│   ├── validate.js      # Validator results formatting checker
│   ├── authValidator.js # Validation rules for auth payloads
│   └── aiValidator.js   # Validation rules for AI request code
├── .env                 # Local variables (credentials)
├── .env.example         # Template variables template
├── package.json         # Node dependencies configuration
└── server.js            # Entry server initialization
```

---

## Features Implemented

1. **Authentication**: Fully featured login, register, logout, profile updates, and JWT security via cookies and auth headers.
2. **AI Code Analysis**: Automated review of code snippets returning detailed scores, summaries, warnings, critical details, OWASP security metrics, and compliance compliance.
3. **Explain Code**: Line-by-line breakdown, time complexity analysis, space complexity, algorithms logic, and recommendations.
4. **Fix Code**: Automated repair of bugs, listing security optimizations, and refactored code.
5. **History & Search**: Automatic persistence of all AI actions, with text search and language filters.
6. **Reports**: Save specific reviews to a separate dashboard folder, delete or view them.
7. **Download Code**: Directly download the repaired or original source code with correct file extensions (.js, .py, .java, etc.) based on language.
8. **Dashboard Statistics**: Dynamic calculations of Total Reviews, Total Fixes, Total Explanations, Favorite Language, and active activity logs.
9. **API Specs**: Dynamic Swagger-styled documentation output at `/api/docs`.
10. **Security Controls**: HTTP security headers, CORS permissions, route-specific rate limiting, input validators, sanitization, and hidden error stack traces.

---

## Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB Server](https://www.mongodb.com/try/download/community) running locally or a MongoDB Atlas URI.

### Steps to Run

1. **Open terminal inside backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify Environment Variables**:
   A `.env` file has been pre-configured at `backend/.env`. It includes the OpenRouter API key found in the frontend and references local MongoDB. Customize if needed:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/vericode-ai
   JWT_SECRET=vericode_ai_secret_key_super_secure_123!
   JWT_EXPIRE=7d
   OPENROUTER_API_KEY=sk-or-...
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Run in Development Mode (Nodemon)**:
   ```bash
   npm run dev
   ```
   The backend server will launch on `http://localhost:5000`.

5. **Run in Production Mode**:
   ```bash
   npm start
   ```

---

## Verification

### Automated Integration Tests

To verify that all endpoints (authentication, AI services, history aggregates, dashboard calculations, and doc outputs) are running smoothly, you can run the test script:

Ensure the server is running on port 5000, then execute:
```bash
# In the project root workspace
node "C:\Users\lenovo\.gemini\antigravity\brain\75970d92-e7c3-48fc-8d97-91de80639887\scratch\test_endpoints.js"
```
This script runs a complete sequence of API checks and outputs detailed test status logs.
