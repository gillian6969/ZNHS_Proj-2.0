import Staff from '../models/Staff.js';
import bcrypt from 'bcryptjs';

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private (Admin only)
export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().select('-passwordHash').sort({ name: 1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get staff by ID
// @route   GET /api/staff/:id
// @access  Private
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select('-passwordHash');
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new staff
// @route   POST /api/staff
// @access  Private (Admin only)
export const createStaff = async (req, res) => {
  try {
    const { name, email, idNumber, password, role, subjects, contact } = req.body;

    // Check if staff exists
    const staffExists = await Staff.findOne({ $or: [{ email }, { idNumber }] });
    if (staffExists) {
      return res.status(400).json({ message: 'Staff already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Ensure subjects is an array
    const subjectsArray = Array.isArray(subjects) ? subjects : (subjects ? [subjects] : ['Administration']);

    const staff = await Staff.create({
      name,
      email,
      idNumber,
      passwordHash,
      role,
      subjects: subjectsArray,
      contact,
      assignedClasses: [],
    });

    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Private (Admin only)
export const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    const { name, email, role, subjects, contact } = req.body;

    staff.name = name || staff.name;
    staff.email = email || staff.email;
    staff.role = role || staff.role;
    if (subjects) {
      staff.subjects = Array.isArray(subjects) ? subjects : [subjects];
    }
    staff.contact = contact || staff.contact;

    const updatedStaff = await staff.save();

    res.json(updatedStaff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Private (Admin only)
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    await staff.deleteOne();
    res.json({ message: 'Staff removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change staff password (User themselves)
// @route   PUT /api/staff/:id/change-password
// @access  Private
export const changeStaffPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current password and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Ensure user can only change their own password (unless admin)
    if (req.user.role !== 'admin' && req.user._id.toString() !== staff._id.toString()) {
      return res.status(403).json({ message: 'You can only change your own password' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, staff.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    staff.passwordHash = await bcrypt.hash(newPassword, salt);

    await staff.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload avatar
// @route   POST /api/staff/:id/avatar
// @access  Private
export const uploadStaffAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    staff.avatar = avatarUrl;
    await staff.save();

    res.json({ avatar: avatarUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

