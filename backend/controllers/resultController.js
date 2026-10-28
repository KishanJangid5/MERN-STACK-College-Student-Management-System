import mongoose from 'mongoose';
import Result from '../models/Result.js';
import Student from '../models/Student.js';

// Grading helper
export const calculateGradeAndPoints = (marksObtained, maxMarks = 100) => {
  const percentage = (marksObtained / maxMarks) * 100;
  if (percentage >= 90) return { grade: 'O', gradePoint: 10, status: 'Pass' };
  if (percentage >= 80) return { grade: 'A+', gradePoint: 9, status: 'Pass' };
  if (percentage >= 70) return { grade: 'A', gradePoint: 8, status: 'Pass' };
  if (percentage >= 60) return { grade: 'B+', gradePoint: 7, status: 'Pass' };
  if (percentage >= 50) return { grade: 'B', gradePoint: 6, status: 'Pass' };
  if (percentage >= 40) return { grade: 'P', gradePoint: 5, status: 'Pass' };
  return { grade: 'F', gradePoint: 0, status: 'Fail' };
};

// @desc    Get examination results for a student
// @route   GET /api/results
// @access  Public or Protected
export const getResults = async (req, res, next) => {
  try {
    let { studentId, semester } = req.query;

    // Security: If student, enforce own ID
    if (req.user && req.user.role === 'student') {
      studentId = req.user.student;
    }

    if (!studentId) {
      const firstStudent = await Student.findOne().sort({ createdAt: 1 });
      if (firstStudent) {
        studentId = firstStudent._id;
      } else {
        return res.status(200).json({
          success: true,
          student: null,
          results: []
        });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Student ID'
      });
    }

    const student = await Student.findById(studentId).select('name rollNumber course semester department gpa email');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const filter = { student: studentId };
    if (semester && semester !== 'All') filter.semester = Number(semester);

    // If user is a student, only show published results
    if (req.user && req.user.role === 'student') {
      filter.publicationStatus = 'Published';
    }

    const results = await Result.find(filter).sort({ semester: -1, createdAt: -1 });

    // Calculate overall CGPA across all recorded published results
    let cumulativeCreditPoints = 0;
    let cumulativeCredits = 0;
    results.forEach((r) => {
      if (r.subjects && r.subjects.length > 0) {
        r.subjects.forEach((s) => {
          const cred = s.credits || 4;
          cumulativeCredits += cred;
          cumulativeCreditPoints += (s.gradePoint || 0) * cred;
        });
      }
    });

    const calculatedCgpa =
      cumulativeCredits > 0
        ? Number((cumulativeCreditPoints / cumulativeCredits).toFixed(2))
        : student.gpa || 8.0;

    res.status(200).json({
      success: true,
      student,
      cumulativeCgpa: calculatedCgpa,
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single result by ID
// @route   GET /api/results/:id
// @access  Public or Protected
export const getResultById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Result ID'
      });
    }

    const result = await Result.findById(id).populate('student', 'name rollNumber course semester department');
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Security: Student cannot view another student's result
    if (req.user && req.user.role === 'student') {
      if (req.user.student && req.user.student.toString() !== result.student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You cannot view another student\'s results'
        });
      }
      if (result.publicationStatus !== 'Published') {
        return res.status(403).json({
          success: false,
          message: 'This examination result has not been published yet'
        });
      }
    }

    res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Enter student examination result
// @route   POST /api/results
// @access  Protected (admin/staff)
export const createResult = async (req, res, next) => {
  try {
    const {
      studentId,
      examName,
      academicYear,
      semester,
      subjects,
      publicationStatus,
      remarks
    } = req.body;

    if (!studentId || !examName || !semester || !subjects || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'studentId, examName, semester, and at least one subject result are required'
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Calculate grades for subjects if not provided
    const processedSubjects = subjects.map((subj) => {
      const marksObt = Number(subj.marksObtained);
      const maxM = Number(subj.maxMarks || 100);
      const gradeCalc = calculateGradeAndPoints(marksObt, maxM);
      return {
        subjectCode: subj.subjectCode.trim().toUpperCase(),
        subjectName: subj.subjectName.trim(),
        credits: subj.credits ? Number(subj.credits) : 4,
        internalMarks: subj.internalMarks ? Number(subj.internalMarks) : Math.round(marksObt * 0.3),
        externalMarks: subj.externalMarks ? Number(subj.externalMarks) : Math.round(marksObt * 0.7),
        marksObtained: marksObt,
        maxMarks: maxM,
        grade: subj.grade || gradeCalc.grade,
        gradePoint: subj.gradePoint !== undefined ? Number(subj.gradePoint) : gradeCalc.gradePoint,
        status: subj.status || gradeCalc.status
      };
    });

    const newResult = new Result({
      student: studentId,
      examName: examName.trim(),
      academicYear: academicYear || '2025-2026',
      semester: Number(semester),
      subjects: processedSubjects,
      publicationStatus: publicationStatus || 'Published',
      publishedAt: publicationStatus === 'Draft' ? null : new Date(),
      remarks: remarks || 'Passed with Merit'
    });

    await newResult.save();

    res.status(201).json({
      success: true,
      message: 'Examination result recorded successfully',
      result: newResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update or publish result
// @route   PUT /api/results/:id
// @access  Protected (admin/staff)
export const updateResult = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await Result.findById(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    if (req.body.publicationStatus) {
      result.publicationStatus = req.body.publicationStatus;
      if (req.body.publicationStatus === 'Published') {
        result.publishedAt = new Date();
      }
    }
    if (req.body.remarks) result.remarks = req.body.remarks;
    if (req.body.subjects) result.subjects = req.body.subjects;

    await result.save();

    res.status(200).json({
      success: true,
      message: 'Result updated successfully',
      result
    });
  } catch (error) {
    next(error);
  }
};
