import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address'
      ]
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [15, 'Age must be at least 15'],
      max: [100, 'Age cannot exceed 100']
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number / Student ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      default: 'Engineering'
    },
    semester: {
      type: Number,
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8'],
      default: 1
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    gpa: {
      type: Number,
      min: [0, 'GPA cannot be less than 0'],
      max: [10, 'GPA cannot be greater than 10'],
      default: 8.0
    },
    status: {
      type: String,
      enum: ['Active', 'Graduated', 'Suspended', 'On Leave'],
      default: 'Active'
    }
  },
  {
    timestamps: true,
    collection: 'students'
  }
);

// Indexing for faster search on name, email, rollNumber
studentSchema.index({ name: 'text', email: 'text', rollNumber: 'text' });

const Student = mongoose.model('Student', studentSchema);

export default Student;
