import express from 'express';
import { getDocs } from '../controllers/docController.js';

const router = express.Router();

router.get('/', getDocs);

export default router;
