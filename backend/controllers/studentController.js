import Student from '../models/Student.js';
import Grade from '../models/Grade.js';
import Attendance from '../models/Attendance.js';
import bcrypt from 'bcryptjs';

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Staff/Admin only)
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-passwordHash').sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-passwordHash');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin only)
export const createStudent = async (req, res) => {
  try {
    const { name, email, idNumber, password, gradeLevel, section, contact, address, classId } = req.body;

    // Check if student exists
    const studentExists = await Student.findOne({ $or: [{ email }, { idNumber }] });
    if (studentExists) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const student = await Student.create({
      name,
      email,
      idNumber,
      passwordHash,
      gradeLevel,
      section,
      contact,
      address,
      classId,
      role: 'student',
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { name, email, gradeLevel, section, contact, address } = req.body;

    student.name = name || student.name;
    student.email = email || student.email;
    student.gradeLevel = gradeLevel || student.gradeLevel;
    student.section = section || student.section;
    student.contact = contact || student.contact;
    student.address = address || student.address;

    const updatedStudent = await student.save();

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.deleteOne();
    res.json({ message: 'Student removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student grades
// @route   GET /api/students/:id/grades
// @access  Private
export const getStudentGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.id }).sort({ subject: 1 });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student attendance
// @route   GET /api/students/:id/attendance
// @access  Private
export const getStudentAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.params.id }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset student password
// @route   PUT /api/students/:id/reset-password
// @access  Private (Admin only)
export const resetStudentPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'Please provide new password' });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    student.passwordHash = await bcrypt.hash(newPassword, salt);

    await student.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

