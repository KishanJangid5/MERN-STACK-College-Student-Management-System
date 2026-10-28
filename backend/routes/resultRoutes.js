import express from 'express';
import {
  getResults,
  getResultById,
  createResult,
  updateResult
} from '../controllers/resultController.js';
import { protect, optionalAuth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(optionalAuth, getResults)
  .post(protect, authorize('admin', 'staff'), createResult);

router
  .route('/:id')
  .get(optionalAuth, getResultById)
  .put(protect, authorize('admin', 'staff'), updateResult);

export default router;
