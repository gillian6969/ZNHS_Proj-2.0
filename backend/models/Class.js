import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  gradeLevel: {
    type: String,
    required: true,
    enum: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
  },
  section: {
    type: String,
    required: true,
    enum: ['Pilot', 'SSC', 'ICT', 'Section 1', 'Section 2', 'Section 3', 'Section 4', 'Section 5'],
    trim: true,
  },
  room: {
    type: String,
    trim: true,
  },
  schoolYear: {
    type: String,
    required: true,
    default: '2024-2025',
  },
  teachers: [{
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
    },
    subject: {
      type: String,
      required: true,
    },
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for className (auto-generated from grade + section)
classSchema.virtual('className').get(function() {
  return `${this.gradeLevel} - ${this.section}`;
});

// Index for faster queries
classSchema.index({ gradeLevel: 1, section: 1, schoolYear: 1 });

const Class = mongoose.model('Class', classSchema);

export default Class;

