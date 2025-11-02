import Class from '../models/Class.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private (Staff/Admin)
export const getAllClasses = async (req, res) => {
  try {
    const { schoolYear, gradeLevel } = req.query;
    
    let query = {};
    if (schoolYear) query.schoolYear = schoolYear;
    if (gradeLevel) query.gradeLevel = gradeLevel;

    const classes = await Class.find(query)
      .populate('teachers.teacherId', 'name email subjects')
      .populate('students', 'name idNumber email')
      .sort({ gradeLevel: 1, section: 1 });

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get class by ID
// @route   GET /api/classes/:id
// @access  Private
export const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('teachers.teacherId', 'name email subjects')
      .populate('students', 'name idNumber email gradeLevel section');
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new class
// @route   POST /api/classes
// @access  Private (Admin only)
export const createClass = async (req, res) => {
  try {
    const { className, gradeLevel, section, schoolYear, teachers, students, schedule, room } = req.body;

    // Check if class already exists
    const classExists = await Class.findOne({ gradeLevel, section, schoolYear });
    if (classExists) {
      return res.status(400).json({ message: 'Class already exists for this grade, section, and school year' });
    }

    const newClass = await Class.create({
      className,
      gradeLevel,
      section,
      schoolYear: schoolYear || '2024-2025',
      teachers: teachers || [],
      students: students || [],
      schedule,
      room,
    });

    // Update students' classId
    if (students && students.length > 0) {
      await Student.updateMany(
        { _id: { $in: students } },
        { $set: { classId: newClass._id } }
      );
    }

    // Update teachers' assignedClasses
    if (teachers && teachers.length > 0) {
      const teacherIds = teachers.map(t => t.teacherId);
      await Staff.updateMany(
        { _id: { $in: teacherIds } },
        { $addToSet: { assignedClasses: newClass._id } }
      );
    }

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin only)
export const updateClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const { className, gradeLevel, section, teachers, students, schedule, room } = req.body;

    // Update basic info
    if (className) classData.className = className;
    if (gradeLevel) classData.gradeLevel = gradeLevel;
    if (section) classData.section = section;
    if (schedule) classData.schedule = schedule;
    if (room) classData.room = room;

    // Update teachers
    if (teachers) {
      // Remove old teachers from assignedClasses
      const oldTeacherIds = classData.teachers.map(t => t.teacherId);
      await Staff.updateMany(
        { _id: { $in: oldTeacherIds } },
        { $pull: { assignedClasses: classData._id } }
      );

      // Add new teachers
      classData.teachers = teachers;
      const newTeacherIds = teachers.map(t => t.teacherId);
      await Staff.updateMany(
        { _id: { $in: newTeacherIds } },
        { $addToSet: { assignedClasses: classData._id } }
      );
    }

    // Update students
    if (students) {
      // Remove old students
      await Student.updateMany(
        { classId: classData._id },
        { $unset: { classId: 1 } }
      );

      // Add new students
      classData.students = students;
      await Student.updateMany(
        { _id: { $in: students } },
        { $set: { classId: classData._id } }
      );
    }

    const updatedClass = await classData.save();

    res.json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin only)
export const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Remove classId from students
    await Student.updateMany(
      { classId: classData._id },
      { $unset: { classId: 1 } }
    );

    // Remove from teachers' assignedClasses
    const teacherIds = classData.teachers.map(t => t.teacherId);
    await Staff.updateMany(
      { _id: { $in: teacherIds } },
      { $pull: { assignedClasses: classData._id } }
    );

    await classData.deleteOne();
    res.json({ message: 'Class removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add student to class
// @route   POST /api/classes/:id/students
// @access  Private (Admin only)
export const addStudentToClass = async (req, res) => {
  try {
    const { studentId } = req.body;

    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student already in class
    if (classData.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already in this class' });
    }

    classData.students.push(studentId);
    await classData.save();

    student.classId = classData._id;
    await student.save();

    res.json({ message: 'Student added to class', class: classData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove student from class
// @route   DELETE /api/classes/:id/students/:studentId
// @access  Private (Admin only)
export const removeStudentFromClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    classData.students = classData.students.filter(
      s => s.toString() !== req.params.studentId
    );
    await classData.save();

    await Student.findByIdAndUpdate(req.params.studentId, {
      $unset: { classId: 1 }
    });

    res.json({ message: 'Student removed from class' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get classes for a teacher
// @route   GET /api/classes/teacher/:teacherId
// @access  Private
export const getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({
      'teachers.teacherId': req.params.teacherId
    })
      .populate('students', 'name idNumber email')
      .populate('teachers.teacherId', 'name email');

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

