import mongoose from 'mongoose';

const subjectResultSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  credits: {
    type: Number,
    default: 4
  },
  internalMarks: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  externalMarks: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  maxMarks: {
    type: Number,
    default: 100
  },
  grade: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  gradePoint: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  status: {
    type: String,
    enum: ['Pass', 'Fail'],
    default: 'Pass'
  }
});

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true
    },
    examName: {
      type: String,
      required: [true, 'Examination name is required'],
      trim: true
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
    subjects: [subjectResultSchema],
    totalMarksObtained: {
      type: Number,
      default: 0
    },
    totalMaxMarks: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    sgpa: {
      type: Number,
      default: 0
    },
    cgpa: {
      type: Number,
      default: 0
    },
    resultStatus: {
      type: String,
      enum: ['Pass', 'Fail', 'Withheld'],
      default: 'Pass'
    },
    publicationStatus: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Published'
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    remarks: {
      type: String,
      trim: true,
      default: 'First Class with Distinction'
    }
  },
  {
    timestamps: true,
    collection: 'results'
  }
);

// Auto-calculate totals and SGPA if not supplied
resultSchema.pre('save', function () {
  if (this.subjects && this.subjects.length > 0) {
    let totalObtained = 0;
    let totalMax = 0;
    let totalCreditPoints = 0;
    let totalCredits = 0;
    let hasFailed = false;

    this.subjects.forEach((subj) => {
      totalObtained += subj.marksObtained;
      totalMax += subj.maxMarks || 100;
      const credits = subj.credits || 4;
      totalCredits += credits;
      totalCreditPoints += (subj.gradePoint || 0) * credits;
      if (subj.status === 'Fail') hasFailed = true;
    });

    this.totalMarksObtained = totalObtained;
    this.totalMaxMarks = totalMax;
    this.percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
    this.sgpa = totalCredits > 0 ? Number((totalCreditPoints / totalCredits).toFixed(2)) : 0;
    this.resultStatus = hasFailed ? 'Fail' : 'Pass';
  }
});

resultSchema.index({ student: 1, semester: 1 });

const Result = mongoose.model('Result', resultSchema);

export default Result;
