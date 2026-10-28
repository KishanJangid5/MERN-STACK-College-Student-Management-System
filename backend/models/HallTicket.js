import mongoose from 'mongoose';

const paperScheduleSchema = new mongoose.Schema({
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
  examDate: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    trim: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  }
});

const hallTicketSchema = new mongoose.Schema(
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
      default: '2025-2026'
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8
    },
    hallTicketNumber: {
      type: String,
      required: [true, 'Hall ticket number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    institutionName: {
      type: String,
      default: 'College of Engineering & Technology'
    },
    centerCode: {
      type: String,
      default: 'CET-MAIN-04'
    },
    papers: [paperScheduleSchema],
    instructions: {
      type: [String],
      default: [
        'Candidate must bring this printed Hall Ticket along with valid College Identity Card.',
        'Candidates are required to occupy their designated seats 15 minutes before the exam begins.',
        'Electronic gadgets, mobile phones, programmable calculators, or smartwatches are strictly prohibited in the exam hall.',
        'No candidate will be allowed entry into the exam hall after 30 minutes from the commencement of the exam.',
        'Disciplinary action will be initiated in case of any malpractice or violation of exam hall code of conduct.'
      ]
    },
    publicationStatus: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Published'
    }
  },
  {
    timestamps: true,
    collection: 'hall_tickets'
  }
);

hallTicketSchema.index({ student: 1, semester: 1 });

const HallTicket = mongoose.model('HallTicket', hallTicketSchema);

export default HallTicket;
