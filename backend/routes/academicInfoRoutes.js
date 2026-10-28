import express from 'express';
import { getAcademicInfo } from '../controllers/portalController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(optionalAuth, getAcademicInfo);

export default router;
