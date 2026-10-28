import mongoose from 'mongoose';
import HallTicket from '../models/HallTicket.js';
import Student from '../models/Student.js';
import Examination from '../models/Examination.js';

// @desc    Get hall ticket for a student
// @route   GET /api/hall-tickets
// @access  Public or Protected
export const getHallTickets = async (req, res, next) => {
  try {
    let { studentId, semester } = req.query;

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
          hallTickets: []
        });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Student ID'
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const filter = { student: studentId };
    if (semester && semester !== 'All') filter.semester = Number(semester);
    if (req.user && req.user.role === 'student') {
      filter.publicationStatus = 'Published';
    }

    let hallTickets = await HallTicket.find(filter)
      .populate('student', 'name rollNumber course semester department email phone')
      .sort({ createdAt: -1 });

    // If no hall ticket exists yet for this student, auto-generate one from exams matching the course/sem!
    if (hallTickets.length === 0) {
      const exams = await Examination.find({
        course: student.course,
        semester: student.semester
      }).sort({ examDate: 1 });

      const papers = exams.length > 0
        ? exams.map((ex) => ({
            subjectCode: ex.subjectCode,
            subjectName: ex.subjectName,
            examDate: ex.examDate,
            time: `${ex.startTime} - ${ex.endTime}`,
            venue: ex.venue
          }))
        : [
            {
              subjectCode: `${student.course.substring(0, 2).toUpperCase()}-401`,
              subjectName: 'Advanced Database Management Systems',
              examDate: new Date(Date.now() + 7 * 86400000),
              time: '10:00 AM - 01:00 PM',
              venue: 'Hall 302, Academic Block A'
            },
            {
              subjectCode: `${student.course.substring(0, 2).toUpperCase()}-402`,
              subjectName: 'Design & Analysis of Algorithms',
              examDate: new Date(Date.now() + 10 * 86400000),
              time: '10:00 AM - 01:00 PM',
              venue: 'Hall 302, Academic Block A'
            },
            {
              subjectCode: `${student.course.substring(0, 2).toUpperCase()}-403`,
              subjectName: 'Computer Networks & Security',
              examDate: new Date(Date.now() + 14 * 86400000),
              time: '10:00 AM - 01:00 PM',
              venue: 'Hall 205, Academic Block B'
            }
          ];

      const cleanRoll = student.rollNumber.replace(/\s+/g, '-');
      const htNumber = `HT-2026-${cleanRoll}`;

      const generated = await HallTicket.create({
        student: student._id,
        examName: `Semester ${student.semester} End-Term Examination 2026`,
        academicYear: '2025-2026',
        semester: student.semester || 4,
        hallTicketNumber: htNumber,
        papers,
        publicationStatus: 'Published'
      });

      const populated = await HallTicket.findById(generated._id).populate(
        'student',
        'name rollNumber course semester department email phone'
      );
      hallTickets = [populated];
    }

    res.status(200).json({
      success: true,
      student,
      hallTickets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hall ticket by ID
// @route   GET /api/hall-tickets/:id
// @access  Public or Protected
export const getHallTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Hall Ticket ID'
      });
    }

    const hallTicket = await HallTicket.findById(id).populate(
      'student',
      'name rollNumber course semester department email phone address'
    );

    if (!hallTicket) {
      return res.status(404).json({
        success: false,
        message: 'Hall ticket not found'
      });
    }

    // Security check
    if (req.user && req.user.role === 'student') {
      if (req.user.student && req.user.student.toString() !== hallTicket.student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You cannot access another student\'s hall ticket'
        });
      }
      if (hallTicket.publicationStatus !== 'Published') {
        return res.status(403).json({
          success: false,
          message: 'This hall ticket has not been published yet'
        });
      }
    }

    res.status(200).json({
      success: true,
      hallTicket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Generate hall ticket
// @route   POST /api/hall-tickets
// @access  Protected (admin/staff)
export const createHallTicket = async (req, res, next) => {
  try {
    const { studentId, examName, semester, academicYear, hallTicketNumber, papers, publicationStatus } = req.body;

    if (!studentId || !examName || !semester) {
      return res.status(400).json({
        success: false,
        message: 'studentId, examName, and semester are required'
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const cleanRoll = student.rollNumber.replace(/\s+/g, '-');
    const htNumber = hallTicketNumber || `HT-2026-${cleanRoll}-${Math.floor(100 + Math.random() * 900)}`;

    const newHallTicket = await HallTicket.create({
      student: studentId,
      examName: examName.trim(),
      academicYear: academicYear || '2025-2026',
      semester: Number(semester),
      hallTicketNumber: htNumber.toUpperCase().trim(),
      papers: papers || [],
      publicationStatus: publicationStatus || 'Published'
    });

    const populated = await HallTicket.findById(newHallTicket._id).populate(
      'student',
      'name rollNumber course semester department email phone'
    );

    res.status(201).json({
      success: true,
      message: 'Hall ticket generated successfully',
      hallTicket: populated
    });
  } catch (error) {
    next(error);
  }
};
