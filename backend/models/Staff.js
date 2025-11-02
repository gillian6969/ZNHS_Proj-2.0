import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['teacher', 'admin'],
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  contact: {
    type: String,
    trim: true,
  },
  assignedClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  }],
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

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;

