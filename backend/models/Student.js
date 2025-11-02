import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  idNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  gradeLevel: {
    type: String,
    required: true,
    enum: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
  },
  section: {
    type: String,
    required: true,
    trim: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  contact: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    default: 'student',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Note: email and idNumber already have indexes from unique: true
// No need to add duplicate indexes

const Student = mongoose.model('Student', studentSchema);

export default Student;

