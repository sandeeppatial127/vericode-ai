import express from 'express';
import { saveReport, getReports, getReportById, deleteReport } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/', saveReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);

export default router;
