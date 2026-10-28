import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true
    },
    subject: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true
    },
    subjectCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused'],
      default: 'Present',
      required: true
    },
    sessionType: {
      type: String,
      enum: ['Lecture', 'Practical / Lab', 'Tutorial', 'Seminar'],
      default: 'Lecture'
    },
    academicYear: {
      type: String,
      default: '2025-2026'
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    collection: 'attendance'
  }
);

// Compound index for fast queries by student and date
attendanceSchema.index({ student: 1, date: -1 });
attendanceSchema.index({ student: 1, subject: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
