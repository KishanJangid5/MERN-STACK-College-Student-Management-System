import mongoose from 'mongoose';
import Syllabus from '../models/Syllabus.js';

// @desc    Get all syllabi filtered by course and semester
// @route   GET /api/syllabus
// @access  Public
export const getSyllabus = async (req, res, next) => {
  try {
    const { course, semester, search } = req.query;

    const query = {};
    if (course && course !== 'All') {
      query.course = course;
    }
    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { subjectName: searchRegex },
        { subjectCode: searchRegex },
        { description: searchRegex }
      ];
    }

    const syllabi = await Syllabus.find(query).sort({ semester: 1, subjectCode: 1 });

    res.status(200).json({
      success: true,
      count: syllabi.length,
      syllabi
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single syllabus by ID
// @route   GET /api/syllabus/:id
// @access  Public
export const getSyllabusById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid syllabus ID'
      });
    }

    const syllabus = await Syllabus.findById(id);
    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus not found'
      });
    }

    res.status(200).json({
      success: true,
      syllabus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new syllabus entry
// @route   POST /api/syllabus
// @access  Protected (admin/staff)
export const createSyllabus = async (req, res, next) => {
  try {
    const {
      course,
      semester,
      academicYear,
      subjectCode,
      subjectName,
      credits,
      totalHours,
      description,
      units,
      referenceBooks,
      documentUrl
    } = req.body;

    if (!course || !semester || !subjectCode || !subjectName) {
      return res.status(400).json({
        success: false,
        message: 'Course, semester, subject code, and subject name are required'
      });
    }

    const newSyllabus = await Syllabus.create({
      course: course.trim(),
      semester: Number(semester),
      academicYear: academicYear || '2025-2026',
      subjectCode: subjectCode.trim().toUpperCase(),
      subjectName: subjectName.trim(),
      credits: credits ? Number(credits) : 4,
      totalHours: totalHours ? Number(totalHours) : 45,
      description: description ? description.trim() : '',
      units: units || [],
      referenceBooks: referenceBooks || [],
      documentUrl: documentUrl || '',
      uploadedBy: req.user ? req.user._id : null
    });

    res.status(201).json({
      success: true,
      message: 'Syllabus entry created successfully',
      syllabus: newSyllabus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update syllabus entry
// @route   PUT /api/syllabus/:id
// @access  Protected (admin/staff)
export const updateSyllabus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid syllabus ID'
      });
    }

    const updated = await Syllabus.findByIdAndUpdate(id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Syllabus updated successfully',
      syllabus: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete syllabus entry
// @route   DELETE /api/syllabus/:id
// @access  Protected (admin/staff)
export const deleteSyllabus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid syllabus ID'
      });
    }

    const deleted = await Syllabus.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Syllabus not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Syllabus deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
