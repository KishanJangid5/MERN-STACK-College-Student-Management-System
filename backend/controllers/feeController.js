import mongoose from 'mongoose';
import Fee from '../models/Fee.js';
import Student from '../models/Student.js';

// @desc    Get fees and payment records for a student
// @route   GET /api/fees
// @access  Public or Protected
export const getFees = async (req, res, next) => {
  try {
    let { studentId, academicYear, status } = req.query;

    // Security: if user is student, enforce student's own ID
    if (req.user && req.user.role === 'student') {
      studentId = req.user.student;
    }

    // Default to first student if none specified
    if (!studentId) {
      const firstStudent = await Student.findOne().sort({ createdAt: 1 });
      if (firstStudent) {
        studentId = firstStudent._id;
      } else {
        return res.status(200).json({
          success: true,
          student: null,
          summary: { totalFees: 0, amountPaid: 0, balanceAmount: 0, status: 'No Records' },
          fees: []
        });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Student ID'
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
    if (academicYear && academicYear !== 'All') filter.academicYear = academicYear;
    if (status && status !== 'All') filter.paymentStatus = status;

    const fees = await Fee.find(filter).sort({ semester: -1, createdAt: -1 });

    // Calculate aggregated financials
    let totalFees = 0;
    let amountPaid = 0;
    let balanceAmount = 0;

    fees.forEach((f) => {
      totalFees += f.totalAmount || 0;
      amountPaid += f.amountPaid || 0;
      balanceAmount += f.balanceAmount || 0;
    });

    let overallStatus = 'Paid';
    if (balanceAmount > 0 && amountPaid > 0) overallStatus = 'Partial';
    else if (balanceAmount > 0 && amountPaid === 0) overallStatus = 'Pending';
    if (fees.some((f) => f.paymentStatus === 'Overdue')) overallStatus = 'Overdue';

    res.status(200).json({
      success: true,
      student,
      summary: {
        totalFees,
        amountPaid,
        balanceAmount,
        overallStatus,
        totalInvoices: fees.length
      },
      fees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single fee invoice by ID
// @route   GET /api/fees/:id
// @access  Public or Protected
export const getFeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Fee ID'
      });
    }

    const fee = await Fee.findById(id).populate('student', 'name rollNumber course semester email');
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    // Security: Student cannot view another student's fee record
    if (req.user && req.user.role === 'student') {
      if (req.user.student && req.user.student.toString() !== fee.student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You cannot access another student\'s fee records'
        });
      }
    }

    res.status(200).json({
      success: true,
      fee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create fee invoice / structure for student
// @route   POST /api/fees
// @access  Protected (admin/staff)
export const createFee = async (req, res, next) => {
  try {
    const { studentId, academicYear, semester, feeType, totalAmount, amountPaid, dueDate } = req.body;

    if (!studentId || !totalAmount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'studentId, totalAmount, and dueDate are required'
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const newFee = new Fee({
      student: studentId,
      academicYear: academicYear || '2025-2026',
      semester: semester ? Number(semester) : student.semester || 1,
      feeType: feeType || 'Consolidated Semester Fee',
      totalAmount: Number(totalAmount),
      amountPaid: amountPaid ? Number(amountPaid) : 0,
      dueDate: new Date(dueDate)
    });

    await newFee.save();

    res.status(201).json({
      success: true,
      message: 'Fee invoice created successfully',
      fee: newFee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a payment against a fee record
// @route   POST /api/fees/:id/pay
// @access  Protected (admin/staff/student)
export const recordFeePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, transactionId, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than zero'
      });
    }

    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    const paymentAmount = Number(amount);
    const receiptNo = `REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    fee.amountPaid = (fee.amountPaid || 0) + paymentAmount;
    fee.paymentHistory.push({
      receiptNo,
      amount: paymentAmount,
      paymentDate: new Date(),
      paymentMethod: paymentMethod || 'UPI',
      transactionId: transactionId || `TXN${Date.now()}`,
      notes: notes || 'Online portal payment'
    });

    await fee.save();

    res.status(200).json({
      success: true,
      message: `Payment of ₹${paymentAmount.toLocaleString()} recorded successfully!`,
      receiptNo,
      fee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update fee record
// @route   PUT /api/fees/:id
// @access  Protected (admin/staff)
export const updateFee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    if (req.body.totalAmount !== undefined) fee.totalAmount = Number(req.body.totalAmount);
    if (req.body.amountPaid !== undefined) fee.amountPaid = Number(req.body.amountPaid);
    if (req.body.dueDate) fee.dueDate = new Date(req.body.dueDate);
    if (req.body.feeType) fee.feeType = req.body.feeType;
    if (req.body.academicYear) fee.academicYear = req.body.academicYear;
    if (req.body.semester !== undefined) fee.semester = Number(req.body.semester);

    await fee.save();

    res.status(200).json({
      success: true,
      message: 'Fee record updated successfully',
      fee
    });
  } catch (error) {
    next(error);
  }
};
