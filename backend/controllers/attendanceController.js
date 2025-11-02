import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private (Staff/Admin)
export const getAllAttendance = async (req, res) => {
  try {
    const { studentId, date, status, startDate, endDate } = req.query;
    
    let query = {};
    if (studentId) query.studentId = studentId;
    if (status) query.status = status;
    
    if (date) {
      query.date = new Date(date);
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name idNumber section')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance by ID
// @route   GET /api/attendance/:id
// @access  Private
export const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('studentId', 'name idNumber section');
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create attendance record
// @route   POST /api/attendance
// @access  Private (Staff/Admin)
export const createAttendance = async (req, res) => {
  try {
    const { studentId, date, status, subject, remarks } = req.body;

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const attendance = await Attendance.create({
      studentId,
      date: date || new Date(),
      status,
      subject,
      remarks,
      markedBy: req.user._id,
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Staff/Admin)
export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const { status, remarks } = req.body;

    if (status) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;

    const updatedAttendance = await attendance.save();

    res.json(updatedAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin only)
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await attendance.deleteOne();
    res.json({ message: 'Attendance record removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk create attendance (mark all students)
// @route   POST /api/attendance/bulk
// @access  Private (Staff/Admin)
export const bulkCreateAttendance = async (req, res) => {
  try {
    const { studentIds, date, status, subject } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: 'Please provide student IDs array' });
    }

    const attendanceRecords = studentIds.map(studentId => ({
      studentId,
      date: date || new Date(),
      status: status || 'present',
      subject,
      markedBy: req.user._id,
    }));

    const attendance = await Attendance.insertMany(attendanceRecords);

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats/:studentId
// @access  Private
export const getAttendanceStats = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const attendance = await Attendance.find({
      studentId,
      ...dateFilter
    });

    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length,
    };

    stats.attendanceRate = stats.total > 0 
      ? ((stats.present + stats.late) / stats.total * 100).toFixed(2) 
      : 0;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

