import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

// @desc    Get attendance records & subject-wise analytics for a student
// @route   GET /api/attendance
// @access  Public or Protected
export const getAttendance = async (req, res, next) => {
  try {
    let { studentId, subject, status } = req.query;

    // Security check: if authenticated as student, strictly use student's own ID
    if (req.user && req.user.role === 'student') {
      studentId = req.user.student;
    }

    // If no studentId provided, pick the first student in the database so preview works
    if (!studentId) {
      const firstStudent = await Student.findOne().sort({ createdAt: 1 });
      if (firstStudent) {
        studentId = firstStudent._id;
      } else {
        return res.status(200).json({
          success: true,
          student: null,
          summary: { totalClasses: 0, attendedClasses: 0, percentage: 0 },
          subjectWise: [],
          records: []
        });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Student ID: ${studentId}`
      });
    }

    const student = await Student.findById(studentId).select('name rollNumber course semester department email');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const filter = { student: studentId };
    if (subject && subject !== 'All') filter.subject = subject;
    if (status && status !== 'All') filter.status = status;

    const records = await Attendance.find(filter).sort({ date: -1 });

    // Aggregate subject-wise summary
    const allStudentAttendance = await Attendance.find({ student: studentId });

    const subjectMap = {};
    let totalClasses = allStudentAttendance.length;
    let attendedClasses = 0;

    allStudentAttendance.forEach((item) => {
      if (!subjectMap[item.subject]) {
        subjectMap[item.subject] = {
          subject: item.subject,
          subjectCode: item.subjectCode || '',
          total: 0,
          attended: 0,
          absent: 0,
          late: 0,
          percentage: 0
        };
      }
      subjectMap[item.subject].total += 1;
      if (item.status === 'Present' || item.status === 'Late') {
        subjectMap[item.subject].attended += 1;
        attendedClasses += 1;
        if (item.status === 'Late') subjectMap[item.subject].late += 1;
      } else {
        subjectMap[item.subject].absent += 1;
      }
    });

    const subjectWise = Object.values(subjectMap).map((subj) => {
      const pct = subj.total > 0 ? Number(((subj.attended / subj.total) * 100).toFixed(1)) : 0;
      return {
        ...subj,
        percentage: pct,
        isEligible: pct >= 75
      };
    });

    const overallPercentage =
      totalClasses > 0 ? Number(((attendedClasses / totalClasses) * 100).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      student,
      summary: {
        totalClasses,
        attendedClasses,
        absentClasses: totalClasses - attendedClasses,
        percentage: overallPercentage,
        isEligible: overallPercentage >= 75
      },
      subjectWise,
      records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record new attendance entry
// @route   POST /api/attendance
// @access  Protected (admin/staff)
export const createAttendance = async (req, res, next) => {
  try {
    const { studentId, subject, subjectCode, date, status, sessionType, remarks } = req.body;

    if (!studentId || !subject || !status) {
      return res.status(400).json({
        success: false,
        message: 'studentId, subject, and status are required'
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const newRecord = await Attendance.create({
      student: studentId,
      subject: subject.trim(),
      subjectCode: subjectCode ? subjectCode.trim().toUpperCase() : '',
      date: date || new Date(),
      status,
      sessionType: sessionType || 'Lecture',
      semester: student.semester || 1,
      remarks: remarks ? remarks.trim() : '',
      recordedBy: req.user ? req.user._id : null
    });

    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      record: newRecord
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance entry
// @route   PUT /api/attendance/:id
// @access  Protected (admin/staff)
export const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance ID'
      });
    }

    const updated = await Attendance.findByIdAndUpdate(id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attendance record updated',
      record: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance entry
// @route   DELETE /api/attendance/:id
// @access  Protected (admin/staff)
export const deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance ID'
      });
    }

    const deleted = await Attendance.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted'
    });
  } catch (error) {
    next(error);
  }
};
