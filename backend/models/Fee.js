import mongoose from 'mongoose';

const paymentHistorySchema = new mongoose.Schema({
  receiptNo: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Card', 'Net Banking', 'UPI', 'Cheque', 'Demand Draft', 'Cash'],
    default: 'UPI'
  },
  transactionId: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
});

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      default: '2025-2026'
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8
    },
    feeType: {
      type: String,
      required: [true, 'Fee type is required'],
      enum: [
        'Tuition Fee',
        'Academic & Laboratory Fee',
        'Examination Fee',
        'Library & Digital Resources Fee',
        'Development & Amenities Fee',
        'Consolidated Semester Fee'
      ],
      default: 'Consolidated Semester Fee'
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total fee cannot be negative']
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, 'Amount paid cannot be negative']
    },
    balanceAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending', 'Overdue'],
      default: 'Pending'
    },
    paymentHistory: [paymentHistorySchema]
  },
  {
    timestamps: true,
    collection: 'fees'
  }
);

// Pre-save hook to calculate balance and status automatically
feeSchema.pre('save', function () {
  this.balanceAmount = Math.max(0, this.totalAmount - (this.amountPaid || 0));

  const now = new Date();
  if (this.balanceAmount === 0 && this.totalAmount > 0) {
    this.paymentStatus = 'Paid';
  } else if (this.amountPaid > 0 && this.balanceAmount > 0) {
    this.paymentStatus = this.dueDate && now > this.dueDate ? 'Overdue' : 'Partial';
  } else if (this.dueDate && now > this.dueDate) {
    this.paymentStatus = 'Overdue';
  } else {
    this.paymentStatus = 'Pending';
  }
});

feeSchema.index({ student: 1, academicYear: 1, semester: 1 });

const Fee = mongoose.model('Fee', feeSchema);

export default Fee;
