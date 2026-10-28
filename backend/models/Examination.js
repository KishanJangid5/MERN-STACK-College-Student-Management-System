import mongoose from 'mongoose';

const examinationSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: [true, 'Examination name is required'],
      trim: true
    },
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
    examDate: {
      type: Date,
      required: [true, 'Examination date is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true
    },
    duration: {
      type: String,
      default: '3 Hours',
      trim: true
    },
    venue: {
      type: String,
      required: [true, 'Venue / Examination hall is required'],
      trim: true
    },
    examType: {
      type: String,
      enum: ['Theory', 'Practical', 'Mid-Term', 'Viva Voce', 'Project Review'],
      default: 'Theory'
    },
    maxMarks: {
      type: Number,
      default: 100
    },
    passingMarks: {
      type: Number,
      default: 40
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Ongoing', 'Completed', 'Postponed', 'Cancelled'],
      default: 'Scheduled'
    },
    instructions: {
      type: String,
      trim: true,
      default: 'Candidates must report 30 minutes prior to the exam with their physical Hall Ticket and College ID.'
    }
  },
  {
    timestamps: true,
    collection: 'examinations'
  }
);

examinationSchema.index({ course: 1, semester: 1, examDate: 1 });

const Examination = mongoose.model('Examination', examinationSchema);

export default Examination;
