import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { protect } from './middleware/authMiddleware.js';
import { downloadCode } from './controllers/historyController.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import docRoutes from './routes/docRoutes.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security HTTP Headers
app.use(helmet());

// Enable CORS (allow localhost/127.0.0.1 on any port in development)
const isDev = process.env.NODE_ENV !== 'production';
const staticOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (staticOrigins.includes(origin)) return true;
  if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, origin || staticOrigins[0]);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers
app.use(express.json({ limit: '10mb' })); // Support larger code snippets
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Apply global rate limiting for general security
app.use('/api', apiLimiter);

// Mount API Routes
app.use('/api/auth', authRoutes);       // /api/auth/login, /api/auth/register, /api/auth/me
app.use('/api', aiRoutes);             // /api/analyze, /api/explain, /api/fix
app.use('/api/history', historyRoutes); // /api/history, /api/history/:id
app.use('/api/report', reportRoutes);   // /api/report, /api/report/:id
app.use('/api/dashboard', dashboardRoutes); // /api/dashboard
app.use('/api/docs', docRoutes);       // /api/docs
app.get('/api/download/:historyId', protect, downloadCode); // /api/download/:historyId

// Simple health check route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy', data: null });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
