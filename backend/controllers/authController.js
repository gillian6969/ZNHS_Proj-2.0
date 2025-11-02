import bcrypt from 'bcryptjs';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
export const registerStudent = async (req, res) => {
  try {
    const { name, email, idNumber, password, gradeLevel, section, contact } = req.body;

    // Validation
    if (!name || !email || !idNumber || !password || !gradeLevel || !section) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if student already exists
    const studentExists = await Student.findOne({ $or: [{ email }, { idNumber }] });
    if (studentExists) {
      return res.status(400).json({ message: 'Student already exists with this email or ID number' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create student
    const student = await Student.create({
      name,
      email,
      idNumber,
      passwordHash,
      gradeLevel,
      section,
      contact,
      role: 'student',
    });

    if (student) {
      res.status(201).json({
        _id: student._id,
        name: student.name,
        email: student.email,
        idNumber: student.idNumber,
        gradeLevel: student.gradeLevel,
        section: student.section,
        role: student.role,
        token: generateToken(student._id, student.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid student data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user (Student or Staff)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { identifier, password, userType } = req.body; // identifier can be email or idNumber

    if (!identifier || !password || !userType) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    let user;
    let role;

    // Check if logging in as student or staff
    if (userType === 'student') {
      user = await Student.findOne({
        $or: [{ email: identifier }, { idNumber: identifier }]
      });
      role = 'student';
    } else if (userType === 'staff') {
      user = await Staff.findOne({
        $or: [{ email: identifier }, { idNumber: identifier }]
      });
      role = user?.role; // Could be 'teacher' or 'admin'
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return user data with token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      idNumber: user.idNumber,
      role: role,
      gradeLevel: user.gradeLevel || undefined,
      section: user.section || undefined,
      subjects: user.subjects || undefined,
      classId: user.classId || undefined,
      assignedClasses: user.assignedClasses || undefined,
      token: generateToken(user._id, role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

