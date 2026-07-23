import express from 'express';
import { analyze, explain, fix } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateAIRequest } from '../validators/aiValidator.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All AI routes require authentication (for history tracking) and rate limiting
router.post('/analyze', protect, aiLimiter, validateAIRequest, analyze);
router.post('/explain', protect, aiLimiter, validateAIRequest, explain);
router.post('/fix', protect, aiLimiter, validateAIRequest, fix);

export default router;
