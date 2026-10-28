import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
  unitNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  hours: {
    type: Number,
    default: 8
  },
  topics: [
    {
      type: String,
      trim: true
    }
  ]
});

const syllabusSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8
    },
    academicYear: {
      type: String,
      default: '2025-2026'
    },
    subjectCode: {
      type: String,
      required: [true, 'Subject code is required'],
      trim: true,
      uppercase: true
    },
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true
    },
    credits: {
      type: Number,
      default: 4,
      min: 1,
      max: 10
    },
    totalHours: {
      type: Number,
      default: 45
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    units: [unitSchema],
    referenceBooks: [
      {
        type: String,
        trim: true
      }
    ],
    documentUrl: {
      type: String,
      trim: true,
      default: ''
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    collection: 'syllabi'
  }
);

syllabusSchema.index({ course: 1, semester: 1 });
syllabusSchema.index({ subjectCode: 1 });

const Syllabus = mongoose.model('Syllabus', syllabusSchema);

export default Syllabus;
