import express from 'express';
import {
  getSyllabus,
  getSyllabusById,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus
} from '../controllers/syllabusController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getSyllabus)
  .post(protect, authorize('admin', 'staff'), createSyllabus);

router
  .route('/:id')
  .get(getSyllabusById)
  .put(protect, authorize('admin', 'staff'), updateSyllabus)
  .delete(protect, authorize('admin', 'staff'), deleteSyllabus);

export default router;
