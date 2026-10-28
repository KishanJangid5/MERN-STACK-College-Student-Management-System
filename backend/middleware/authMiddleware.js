import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_college_student_management_2026'
      );

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user no longer exists'
        });
      }

      // If user is a student, ensure linked student record is resolved
      if (req.user.role === 'student' && !req.user.student) {
        const studentMatch = await Student.findOne({ email: req.user.email.toLowerCase() });
        if (studentMatch) {
          req.user.student = studentMatch._id;
          await User.findByIdAndUpdate(req.user._id, { student: studentMatch._id });
        }
      }

      return next();
    } catch (error) {
      console.error('[Auth Error]:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, please log in to access this resource'
    });
  }
};

// Optional auth: attaches user if token is present, does not block if not
export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_college_student_management_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
      if (req.user && req.user.role === 'student' && !req.user.student) {
        const studentMatch = await Student.findOne({ email: req.user.email.toLowerCase() });
        if (studentMatch) req.user.student = studentMatch._id;
      }
    } catch {
      // Ignore token verification errors for optional auth
    }
  }
  next();
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please log in first'
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' is not authorized to perform this operation`
      });
    }
    next();
  };
};

// Security helper: verify that student can only view/manage their own records
export const enforceStudentSelfOrAdmin = (req, targetStudentId) => {
  if (!req.user) return false;
  if (req.user.role === 'admin' || req.user.role === 'staff') return true;
  if (req.user.role === 'student') {
    const studentIdStr = req.user.student ? req.user.student.toString() : null;
    return studentIdStr && studentIdStr === targetStudentId?.toString();
  }
  return false;
};
