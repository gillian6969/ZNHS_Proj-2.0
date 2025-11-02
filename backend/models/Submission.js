import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
  },
  comments: {
    type: String,
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late'],
    default: 'submitted',
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  feedback: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  gradedAt: {
    type: Date,
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;

