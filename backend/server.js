import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import studentRoutes from './routes/studentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import syllabusRoutes from './routes/syllabusRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import examinationRoutes from './routes/examinationRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import hallTicketRoutes from './routes/hallTicketRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import academicInfoRoutes from './routes/academicInfoRoutes.js';
import resultSheetRoutes from './routes/resultSheetRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl, postman)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the College Student Management System API',
    endpoints: {
      health: '/api/health',
      students: '/api/students',
      stats: '/api/students/stats',
      auth: '/api/auth',
      attendance: '/api/attendance',
      syllabus: '/api/syllabus',
      fees: '/api/fees',
      profile: '/api/profile',
      academicInfo: '/api/academic-info',
      examinations: '/api/examinations',
      results: '/api/results',
      hallTickets: '/api/hall-tickets',
      resultSheet: '/api/result-sheet'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'collegeDB'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

// Student Portal Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/academic-info', academicInfoRoutes);
app.use('/api/examinations', examinationRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/hall-tickets', hallTicketRoutes);
app.use('/api/result-sheet', resultSheetRoutes);

// Alias /students route to support direct /students path
app.use('/students', studentRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Student Management System API Server`);
  console.log(` Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(` Port: ${PORT}`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
