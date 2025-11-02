import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  remarks: {
    type: String,
    trim: true,
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index for faster queries
attendanceSchema.index({ studentId: 1, date: -1 });
attendanceSchema.index({ date: -1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;

