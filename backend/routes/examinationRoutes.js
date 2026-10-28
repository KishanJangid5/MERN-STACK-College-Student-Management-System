import express from 'express';
import {
  getExaminations,
  getExaminationById,
  createExamination,
  updateExamination,
  deleteExamination
} from '../controllers/examinationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getExaminations)
  .post(protect, authorize('admin', 'staff'), createExamination);

router
  .route('/:id')
  .get(getExaminationById)
  .put(protect, authorize('admin', 'staff'), updateExamination)
  .delete(protect, authorize('admin', 'staff'), deleteExamination);

export default router;
