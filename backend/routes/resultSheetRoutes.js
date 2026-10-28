import express from 'express';
import { getResultSheet } from '../controllers/portalController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(optionalAuth, getResultSheet);
router.route('/:studentId').get(optionalAuth, getResultSheet);

export default router;
