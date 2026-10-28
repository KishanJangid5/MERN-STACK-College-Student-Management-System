import express from 'express';
import {
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance
} from '../controllers/attendanceController.js';
import { protect, optionalAuth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(optionalAuth, getAttendance)
  .post(protect, authorize('admin', 'staff'), createAttendance);

router
  .route('/:id')
  .put(protect, authorize('admin', 'staff'), updateAttendance)
  .delete(protect, authorize('admin', 'staff'), deleteAttendance);

export default router;
