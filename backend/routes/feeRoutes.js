import express from 'express';
import {
  getFees,
  getFeeById,
  createFee,
  updateFee,
  recordFeePayment
} from '../controllers/feeController.js';
import { protect, optionalAuth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(optionalAuth, getFees)
  .post(protect, authorize('admin', 'staff'), createFee);

router
  .route('/:id')
  .get(optionalAuth, getFeeById)
  .put(protect, authorize('admin', 'staff'), updateFee);

router
  .route('/:id/pay')
  .post(protect, recordFeePayment);

export default router;
