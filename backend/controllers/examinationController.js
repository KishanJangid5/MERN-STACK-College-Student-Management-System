import mongoose from 'mongoose';
import Examination from '../models/Examination.js';

// @desc    Get examination schedules
// @route   GET /api/examinations
// @access  Public
export const getExaminations = async (req, res, next) => {
  try {
    const { course, semester, status, examType } = req.query;

    const query = {};
    if (course && course !== 'All') query.course = course;
    if (semester && semester !== 'All') query.semester = Number(semester);
    if (status && status !== 'All') query.status = status;
    if (examType && examType !== 'All') query.examType = examType;

    const examinations = await Examination.find(query).sort({ examDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: examinations.length,
      examinations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single examination by ID
// @route   GET /api/examinations/:id
// @access  Public
export const getExaminationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Examination ID'
      });
    }

    const exam = await Examination.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found'
      });
    }

    res.status(200).json({
      success: true,
      examination: exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new examination schedule
// @route   POST /api/examinations
// @access  Protected (admin/staff)
export const createExamination = async (req, res, next) => {
  try {
    const {
      examName,
      course,
      semester,
      academicYear,
      subjectCode,
      subjectName,
      examDate,
      startTime,
      endTime,
      duration,
      venue,
      examType,
      maxMarks,
      instructions
    } = req.body;

    if (!examName || !course || !semester || !subjectCode || !subjectName || !examDate || !startTime || !venue) {
      return res.status(400).json({
        success: false,
        message: 'Exam name, course, semester, subject, date, time, and venue are required'
      });
    }

    const newExam = await Examination.create({
      examName: examName.trim(),
      course: course.trim(),
      semester: Number(semester),
      academicYear: academicYear || '2025-2026',
      subjectCode: subjectCode.trim().toUpperCase(),
      subjectName: subjectName.trim(),
      examDate: new Date(examDate),
      startTime: startTime.trim(),
      endTime: endTime ? endTime.trim() : '01:00 PM',
      duration: duration || '3 Hours',
      venue: venue.trim(),
      examType: examType || 'Theory',
      maxMarks: maxMarks ? Number(maxMarks) : 100,
      instructions: instructions ? instructions.trim() : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Examination scheduled successfully',
      examination: newExam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update examination schedule
// @route   PUT /api/examinations/:id
// @access  Protected (admin/staff)
export const updateExamination = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Examination ID'
      });
    }

    const updated = await Examination.findByIdAndUpdate(id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Examination schedule updated',
      examination: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete examination schedule
// @route   DELETE /api/examinations/:id
// @access  Protected (admin/staff)
export const deleteExamination = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Examination ID'
      });
    }

    const deleted = await Examination.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Examination deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
