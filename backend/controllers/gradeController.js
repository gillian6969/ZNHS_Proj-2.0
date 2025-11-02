import Grade from '../models/Grade.js';
import Student from '../models/Student.js';

// @desc    Get all grades
// @route   GET /api/grades
// @access  Private (Staff/Admin)
export const getAllGrades = async (req, res) => {
  try {
    const { subject, schoolYear, studentId } = req.query;
    
    let query = {};
    if (subject) query.subject = subject;
    if (schoolYear) query.schoolYear = schoolYear;
    if (studentId) query.studentId = studentId;

    const grades = await Grade.find(query)
      .populate('studentId', 'name idNumber section')
      .sort({ subject: 1 });

    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get grade by ID
// @route   GET /api/grades/:id
// @access  Private
export const getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('studentId', 'name idNumber section');
    
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    res.json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new grade
// @route   POST /api/grades
// @access  Private (Staff/Admin)
export const createGrade = async (req, res) => {
  try {
    const { studentId, subject, q1, q2, q3, q4, final, schoolYear } = req.body;

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if grade already exists for this student and subject
    const gradeExists = await Grade.findOne({ studentId, subject, schoolYear });
    if (gradeExists) {
      return res.status(400).json({ message: 'Grade already exists for this student and subject' });
    }

    const grade = await Grade.create({
      studentId,
      subject,
      q1,
      q2,
      q3,
      q4,
      final,
      schoolYear,
      createdBy: req.user._id,
    });

    res.status(201).json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update grade
// @route   PUT /api/grades/:id
// @access  Private (Staff/Admin)
export const updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    const { q1, q2, q3, q4, final } = req.body;

    if (q1 !== undefined) grade.q1 = q1;
    if (q2 !== undefined) grade.q2 = q2;
    if (q3 !== undefined) grade.q3 = q3;
    if (q4 !== undefined) grade.q4 = q4;
    if (final !== undefined) grade.final = final;

    const updatedGrade = await grade.save();

    res.json(updatedGrade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private (Admin only)
export const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    await grade.deleteOne();
    res.json({ message: 'Grade removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk update grades
// @route   PUT /api/grades/bulk
// @access  Private (Staff/Admin)
export const bulkUpdateGrades = async (req, res) => {
  try {
    const { grades } = req.body; // Array of grade objects with _id and updated fields

    const updatePromises = grades.map(async (gradeData) => {
      const grade = await Grade.findById(gradeData._id);
      if (grade) {
        Object.keys(gradeData).forEach(key => {
          if (key !== '_id' && gradeData[key] !== undefined) {
            grade[key] = gradeData[key];
          }
        });
        return grade.save();
      }
    });

    await Promise.all(updatePromises);

    res.json({ message: 'Grades updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

