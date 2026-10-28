import mongoose from 'mongoose';
import Student from '../models/Student.js';
import Result from '../models/Result.js';
import Syllabus from '../models/Syllabus.js';

// @desc    Get student profile for portal
// @route   GET /api/profile
// @access  Public or Protected
export const getProfile = async (req, res, next) => {
  try {
    let { studentId } = req.query;

    if (req.user && req.user.role === 'student') {
      studentId = req.user.student;
    }

    if (!studentId) {
      const firstStudent = await Student.findOne().sort({ createdAt: 1 });
      if (firstStudent) studentId = firstStudent._id;
      else {
        return res.status(200).json({ success: true, student: null });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid Student ID' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile (students can edit phone & address; admins can edit all)
// @route   PUT /api/profile
// @access  Protected
export const updateProfile = async (req, res, next) => {
  try {
    let { studentId } = req.query;
    if (!studentId && req.body.studentId) studentId = req.body.studentId;

    if (req.user && req.user.role === 'student') {
      studentId = req.user.student;
    }

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Role-based field restrictions
    if (req.user && req.user.role === 'student') {
      // Students can ONLY update phone and address
      if (req.body.phone !== undefined) student.phone = req.body.phone.trim();
      if (req.body.address !== undefined) student.address = req.body.address.trim();
    } else {
      // Admin or staff can update other fields
      if (req.body.name) student.name = req.body.name.trim();
      if (req.body.phone !== undefined) student.phone = req.body.phone.trim();
      if (req.body.address !== undefined) student.address = req.body.address.trim();
      if (req.body.department) student.department = req.body.department.trim();
      if (req.body.semester !== undefined) student.semester = Number(req.body.semester);
      if (req.body.status) student.status = req.body.status;
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed Academic Info for student
// @route   GET /api/academic-info
// @access  Public or Protected
export const getAcademicInfo = async (req, res, next) => {
  try {
    let { studentId } = req.query;

    if (req.user && req.user.role === 'student') {
      studentId = req.user.student;
    }

    if (!studentId) {
      const firstStudent = await Student.findOne().sort({ createdAt: 1 });
      if (firstStudent) studentId = firstStudent._id;
      else {
        return res.status(200).json({ success: true, academicInfo: null });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid Student ID' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Find subjects for current course & semester
    const syllabi = await Syllabus.find({
      course: student.course,
      semester: student.semester
    }).select('subjectCode subjectName credits totalHours description');

    const enrolledSubjects =
      syllabi.length > 0
        ? syllabi.map((s) => ({
            code: s.subjectCode,
            name: s.subjectName,
            credits: s.credits,
            type: 'Core Academic',
            faculty: `Prof. ${s.subjectName.split(' ')[0]} Specialist`
          }))
        : [
            {
              code: `${student.course.substring(0, 2).toUpperCase()}-401`,
              name: 'Advanced Database Systems',
              credits: 4,
              type: 'Core Academic',
              faculty: 'Dr. Anand Joshi'
            },
            {
              code: `${student.course.substring(0, 2).toUpperCase()}-402`,
              name: 'Design & Analysis of Algorithms',
              credits: 4,
              type: 'Core Academic',
              faculty: 'Prof. Meera Kulkarni'
            },
            {
              code: `${student.course.substring(0, 2).toUpperCase()}-403`,
              name: 'Operating Systems & System Programming',
              credits: 4,
              type: 'Core Academic',
              faculty: 'Dr. Rajesh Deshmukh'
            },
            {
              code: `${student.course.substring(0, 2).toUpperCase()}-404`,
              name: 'Software Engineering & Agile Methodologies',
              credits: 3,
              type: 'Professional Elective',
              faculty: 'Prof. Neha Singhania'
            },
            {
              code: `${student.course.substring(0, 2).toUpperCase()}-405`,
              name: 'Advanced Computing Laboratory',
              credits: 2,
              type: 'Laboratory / Practical',
              faculty: 'Prof. Vikram Rao'
            }
          ];

    const academicInfo = {
      student,
      program: {
        degree: 'Bachelor of Technology (B.Tech)',
        course: student.course,
        department: student.department || 'Computer Science & Engineering',
        academicYear: '2025-2026',
        currentSemester: student.semester || 4,
        totalSemesters: 8,
        batch: `${new Date(student.enrollmentDate).getFullYear()} - ${new Date(student.enrollmentDate).getFullYear() + 4}`,
        enrollmentNumber: student.rollNumber,
        admissionStatus: 'Confirmed Regular'
      },
      academicStanding: {
        cgpa: student.gpa || 8.4,
        status: student.status || 'Active',
        totalCreditsRequired: 160,
        creditsCompleted: (student.semester - 1) * 22,
        academicDivision: student.gpa >= 8.5 ? 'First Class with Distinction' : student.gpa >= 7.0 ? 'First Class' : 'Second Class',
        attendanceEligibility: 'Eligible for Regular Examinations'
      },
      advisor: {
        name: 'Dr. Rameshwar Rao',
        designation: 'Associate Professor & Academic Mentor',
        department: student.department || 'Computer Science & Engineering',
        email: 'advisor@college.edu',
        officeHours: 'Monday - Thursday: 03:00 PM - 05:00 PM'
      },
      enrolledSubjects
    };

    res.status(200).json({
      success: true,
      academicInfo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get consolidated official Result Sheet / Transcript for student
// @route   GET /api/result-sheet
// @access  Public or Protected
export const getResultSheet = async (req, res, next) => {
  try {
    let { studentId } = req.query;

    if (req.user && req.user.role === 'student') {
      studentId = req.user.student;
    }

    if (!studentId) {
      const firstStudent = await Student.findOne().sort({ createdAt: 1 });
      if (firstStudent) studentId = firstStudent._id;
      else {
        return res.status(200).json({ success: true, resultSheet: null });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid Student ID' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Fetch published results for this student
    const results = await Result.find({
      student: studentId,
      publicationStatus: 'Published'
    }).sort({ semester: 1 });

    // Calculate cumulative totals
    let totalCredits = 0;
    let totalCreditPoints = 0;
    let grandTotalMarksObtained = 0;
    let grandTotalMaxMarks = 0;

    results.forEach((r) => {
      grandTotalMarksObtained += r.totalMarksObtained || 0;
      grandTotalMaxMarks += r.totalMaxMarks || 0;
      if (r.subjects) {
        r.subjects.forEach((s) => {
          const c = s.credits || 4;
          totalCredits += c;
          totalCreditPoints += (s.gradePoint || 0) * c;
        });
      }
    });

    const cumulativeCGPA =
      totalCredits > 0 ? Number((totalCreditPoints / totalCredits).toFixed(2)) : student.gpa || 8.2;
    const overallPercentage =
      grandTotalMaxMarks > 0
        ? Number(((grandTotalMarksObtained / grandTotalMaxMarks) * 100).toFixed(2))
        : 82.0;

    const resultSheet = {
      institution: {
        name: 'College of Engineering & Technology',
        affiliation: 'Affiliated to State Technical University & Approved by AICTE',
        accreditation: 'NAAC A+ Accredited Institution',
        address: 'Knowledge City, Institutional Area, Campus West',
        sealUrl: '/assets/college-seal.png'
      },
      documentDetails: {
        title: 'CONSOLIDATED GRADE SHEET / OFFICIAL TRANSCRIPT',
        serialNumber: `TR-${student.rollNumber.replace(/\s+/g, '')}-2026`,
        issueDate: new Date(),
        verificationCode: `VERIFY-${Date.now().toString(36).toUpperCase()}`
      },
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        course: student.course,
        department: student.department || 'Computer Science & Engineering',
        currentSemester: student.semester,
        enrollmentDate: student.enrollmentDate
      },
      semesters: results,
      summary: {
        totalSemestersRecorded: results.length,
        totalCreditsEarned: totalCredits,
        grandTotalMarksObtained,
        grandTotalMaxMarks,
        overallPercentage,
        cgpa: cumulativeCGPA,
        finalClassification:
          cumulativeCGPA >= 8.5
            ? 'First Class with Distinction (Honours)'
            : cumulativeCGPA >= 7.0
            ? 'First Class'
            : 'Second Class',
        resultStatus: results.some((r) => r.resultStatus === 'Fail') ? 'Backlog / Pending' : 'Pass'
      }
    };

    res.status(200).json({
      success: true,
      resultSheet
    });
  } catch (error) {
    next(error);
  }
};
