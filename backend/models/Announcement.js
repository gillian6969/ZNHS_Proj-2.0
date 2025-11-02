import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  visibility: {
    type: String,
    enum: ['students', 'staff', 'all'],
    default: 'all',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
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
announcementSchema.index({ date: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;

