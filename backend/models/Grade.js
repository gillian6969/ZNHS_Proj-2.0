import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  q1: {
    type: Number,
    min: 0,
    max: 100,
  },
  q2: {
    type: Number,
    min: 0,
    max: 100,
  },
  q3: {
    type: Number,
    min: 0,
    max: 100,
  },
  q4: {
    type: Number,
    min: 0,
    max: 100,
  },
  final: {
    type: Number,
    min: 0,
    max: 100,
  },
  schoolYear: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
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

// Index for faster queries
gradeSchema.index({ studentId: 1, subject: 1 });

const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;

