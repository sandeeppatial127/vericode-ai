import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
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

// Enable 'trust proxy' for reverse proxies like Render / Vercel / Cloudflare
app.set('trust proxy', 1);

// Configure Helmet to NOT block cross-origin calls
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Setup robust CORS configuration
const isDev = process.env.NODE_ENV !== 'production';

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Allow non-browser requests (Postman, mobile apps)
  
  const cleanOrigin = origin.replace(/\/$/, '');
  const envFrontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null;
  
  if (envFrontendUrl && cleanOrigin === envFrontendUrl) return true;
  if (cleanOrigin.endsWith('.vercel.app') || cleanOrigin.includes('vercel.app')) return true; // Allow Vercel origins
  if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) return true;
  
  return true; // Default fallback to ensure cross-origin headers are always attached
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Mount CORS middleware first
app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight across all routes
app.options('*', cors(corsOptions));
app.options('/api/*', cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Apply global rate limiting for general security
app.use('/api', apiLimiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api', aiRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/docs', docRoutes);
app.get('/api/download/:historyId', protect, downloadCode);

// Health check route with DB status
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    environment: process.env.NODE_ENV || 'development',
    database: dbState
  });
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
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});