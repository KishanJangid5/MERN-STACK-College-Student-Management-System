import express from 'express';
import {
  getStudents,
  getDashboardStats,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Specific sub-routes first (to prevent :id capturing /stats)
router.get('/stats', getDashboardStats);

// Main collection routes
router.route('/')
  .get(getStudents)
  .post(protect, createStudent);

// Specific resource routes by MongoDB ID
router.route('/:id')
  .get(getStudentById)
  .put(protect, updateStudent)
  .delete(protect, deleteStudent);

export default router;
