import express from 'express';
import {
  getHallTickets,
  getHallTicketById,
  createHallTicket
} from '../controllers/hallTicketController.js';
import { protect, optionalAuth, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(optionalAuth, getHallTickets)
  .post(protect, authorize('admin', 'staff'), createHallTicket);

router
  .route('/:id')
  .get(optionalAuth, getHallTicketById);

export default router;
