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

    const staff = await Staff.create({
      name,
      email,
      idNumber,
      passwordHash,
      role,
      subjects: subjects || [],
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
    if (subjects) staff.subjects = subjects;
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

