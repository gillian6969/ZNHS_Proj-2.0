import bcrypt from 'bcryptjs';
import PasswordReset from '../models/PasswordReset.js';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';
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

// @desc    Request password reset (local-only: returns OTP in response)
// @route   POST /api/auth/request-reset
// @access  Public
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Find user in Staff or Student
    const user = await Staff.findOne({ email }) || await Student.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // Remove existing reset tokens for this email
    await PasswordReset.deleteMany({ email });

    // Save new reset token (expires in 15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await PasswordReset.create({ email, otpHash, expiresAt });

    // Return OTP in response (local-only; do NOT use in production)
    return res.json({ message: 'OTP generated (local only)', otp, expiresAt });
  } catch (error) {
    console.error('requestPasswordReset error', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Email, otp and newPassword are required' });

    // Find reset record
    const record = await PasswordReset.findOne({ email });
    if (!record) return res.status(400).json({ message: 'No password reset request found' });

    if (record.expiresAt < new Date()) {
      await PasswordReset.deleteMany({ email });
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) return res.status(400).json({ message: 'Invalid OTP' });

    // Find user and update password
    const userType = (await Staff.findOne({ email })) ? 'staff' : ((await Student.findOne({ email })) ? 'student' : null);
    if (!userType) return res.status(404).json({ message: 'User not found' });

    const passwordSalt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, passwordSalt);

    if (userType === 'staff') {
      await Staff.updateOne({ email }, { passwordHash: newHash });
    } else {
      await Student.updateOne({ email }, { passwordHash: newHash });
    }

    // Cleanup reset records
    await PasswordReset.deleteMany({ email });

    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('resetPassword error', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

