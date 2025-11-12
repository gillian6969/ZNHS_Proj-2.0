import bcrypt from 'bcryptjs';
import Attendance from '../models/Attendance.js';
import Class from '../models/Class.js';
import Grade from '../models/Grade.js';
import Student from '../models/Student.js';

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
    const { name, email, idNumber, password, gradeLevel, section, contact, address } = req.body;

    // Check if student exists
    const studentExists = await Student.findOne({ $or: [{ email }, { idNumber }] });
    if (studentExists) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Find matching class based on grade and section
    const matchingClass = await Class.findOne({ 
      gradeLevel, 
      section,
      schoolYear: '2024-2025'
    });

    const student = await Student.create({
      name,
      email,
      idNumber,
      passwordHash,
      gradeLevel,
      section,
      contact,
      address,
      classId: matchingClass ? matchingClass._id : null,
      role: 'student',
    });

    // Add student to class if found
    if (matchingClass) {
      matchingClass.students.push(student._id);
      await matchingClass.save();
    }

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

    // Check if grade or section changed
    const gradeOrSectionChanged = 
      (gradeLevel && gradeLevel !== student.gradeLevel) || 
      (section && section !== student.section);

    // Update student fields
    student.name = name || student.name;
    student.email = email || student.email;
    student.gradeLevel = gradeLevel || student.gradeLevel;
    student.section = section || student.section;
    student.contact = contact || student.contact;
    student.address = address || student.address;

    // If grade or section changed, reassign to matching class
    if (gradeOrSectionChanged) {
      // Remove from old class
      if (student.classId) {
        await Class.findByIdAndUpdate(student.classId, {
          $pull: { students: student._id }
        });
      }

      // Find new matching class
      const matchingClass = await Class.findOne({
        gradeLevel: student.gradeLevel,
        section: student.section,
        schoolYear: '2024-2025'
      });

      if (matchingClass) {
        student.classId = matchingClass._id;
        matchingClass.students.push(student._id);
        await matchingClass.save();
      } else {
        student.classId = null;
      }
    }

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

// @desc    Reset student password (Admin only)
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

// @desc    Change student password (User themselves)
// @route   PUT /api/students/:id/change-password
// @access  Private
export const changeStudentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current password and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Ensure user can only change their own password (unless admin)
    if (req.user.role !== 'admin' && req.user._id.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'You can only change your own password' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, student.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    student.passwordHash = await bcrypt.hash(newPassword, salt);

    await student.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload avatar
// @route   POST /api/students/:id/avatar
// @access  Private
export const uploadStudentAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    student.avatar = avatarUrl;
    const updatedStudent = await student.save();

    res.json({ 
      avatar: avatarUrl,
      success: true,
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to upload avatar',
      success: false 
    });
  }
};

