import mongoose from 'mongoose';
import Student from '../models/Student.js';

// @desc    Get all students with search, course filter, and sorting
// @route   GET /api/students
// @access  Public or Protected
export const getStudents = async (req, res, next) => {
  try {
    const { search, course, department, status, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    // Search filter across name, email, rollNumber
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { rollNumber: searchRegex }
      ];
    }

    // Filter by course
    if (course && course !== 'All') {
      query.course = course;
    }

    // Filter by department
    if (department && department !== 'All') {
      query.department = department;
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Build sort object
    const sortField = sortBy;
    const sortDirection = order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    const students = await Student.find(query).sort(sort);
    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard aggregated statistics
// @route   GET /api/students/stats
// @access  Public or Protected
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();

    // Distinct courses count and list
    const distinctCourses = await Student.distinct('course');

    // Students grouped by course
    const courseDistribution = await Student.aggregate([
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 },
          avgGpa: { $avg: '$gpa' }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          course: '$_id',
          count: 1,
          avgGpa: { $round: ['$avgGpa', 2] }
        }
      }
    ]);

    // Students grouped by department
    const departmentDistribution = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          department: '$_id',
          count: 1
        }
      }
    ]);

    // Average GPA across all students
    const gpaStats = await Student.aggregate([
      {
        $group: {
          _id: null,
          avgGpa: { $avg: '$gpa' }
        }
      }
    ]);
    const averageGpa = gpaStats.length > 0 ? Number(gpaStats[0].avgGpa.toFixed(2)) : 0;

    // Active students count
    const activeStudents = await Student.countDocuments({ status: 'Active' });

    // Recently enrolled students (latest 5)
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email course rollNumber enrollmentDate status gpa createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalCourses: distinctCourses.length,
        coursesList: distinctCourses,
        activeStudents,
        averageGpa,
        courseDistribution,
        departmentDistribution,
        recentStudents
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Public or Protected
export const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Student ID format: '${id}'`
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID '${id}'`
      });
    }

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Public or Protected
export const createStudent = async (req, res, next) => {
  try {
    let {
      name,
      email,
      course,
      age,
      rollNumber,
      phone,
      department,
      semester,
      enrollmentDate,
      address,
      gpa,
      status
    } = req.body;

    // Validate required fields
    if (!name || !email || !course || age === undefined || age === null || age === '') {
      return res.status(400).json({
        success: false,
        message: 'Name, email, course, and age are required fields'
      });
    }

    // Auto-generate roll number if not provided
    if (!rollNumber || rollNumber.trim() === '') {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const prefix = course.substring(0, 2).toUpperCase() || 'ST';
      rollNumber = `${prefix}-${randomDigits}`;
    }

    // Check duplicate email
    const existingEmail = await Student.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: `Student with email '${email}' already exists`
      });
    }

    // Check duplicate roll number
    const existingRoll = await Student.findOne({ rollNumber: rollNumber.toUpperCase().trim() });
    if (existingRoll) {
      return res.status(409).json({
        success: false,
        message: `Student with Roll Number '${rollNumber}' already exists`
      });
    }

    const newStudent = await Student.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      course: course.trim(),
      age: Number(age),
      rollNumber: rollNumber.toUpperCase().trim(),
      phone: phone ? phone.trim() : '',
      department: department ? department.trim() : 'Engineering',
      semester: semester ? Number(semester) : 1,
      enrollmentDate: enrollmentDate || new Date(),
      address: address ? address.trim() : '',
      gpa: gpa !== undefined && gpa !== '' ? Number(gpa) : 8.0,
      status: status || 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Student record created successfully',
      student: newStudent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Public or Protected
export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Student ID format: '${id}'`
      });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID '${id}'`
      });
    }

    // If email is changing, ensure uniqueness
    if (req.body.email && req.body.email.toLowerCase().trim() !== student.email) {
      const emailExists = await Student.findOne({
        email: req.body.email.toLowerCase().trim(),
        _id: { $ne: id }
      });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: `Student with email '${req.body.email}' already exists`
        });
      }
    }

    // If rollNumber is changing, ensure uniqueness
    if (req.body.rollNumber && req.body.rollNumber.toUpperCase().trim() !== student.rollNumber) {
      const rollExists = await Student.findOne({
        rollNumber: req.body.rollNumber.toUpperCase().trim(),
        _id: { $ne: id }
      });
      if (rollExists) {
        return res.status(409).json({
          success: false,
          message: `Student with Roll Number '${req.body.rollNumber}' already exists`
        });
      }
    }

    // Clean up fields if provided
    const updateData = { ...req.body };
    if (updateData.email) updateData.email = updateData.email.toLowerCase().trim();
    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.rollNumber) updateData.rollNumber = updateData.rollNumber.toUpperCase().trim();
    if (updateData.age !== undefined) updateData.age = Number(updateData.age);
    if (updateData.semester !== undefined) updateData.semester = Number(updateData.semester);
    if (updateData.gpa !== undefined) updateData.gpa = Number(updateData.gpa);

    const updatedStudent = await Student.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Student record updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Public or Protected
export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Student ID format: '${id}'`
      });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID '${id}'`
      });
    }

    await Student.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Student '${student.name}' (${student.rollNumber}) deleted successfully`,
      student
    });
  } catch (error) {
    next(error);
  }
};
