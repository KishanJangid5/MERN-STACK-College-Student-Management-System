import express from 'express';
import { getProfile, updateProfile } from '../controllers/portalController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(optionalAuth, getProfile)
  .put(protect, updateProfile);

export default router;
