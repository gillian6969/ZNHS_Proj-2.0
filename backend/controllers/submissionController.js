import Submission from '../models/Submission.js';
import Material from '../models/Material.js';

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Private
export const getAllSubmissions = async (req, res) => {
  try {
    const { studentId, materialId, status } = req.query;
    
    let query = {};
    if (studentId) query.studentId = studentId;
    if (materialId) query.materialId = materialId;
    if (status) query.status = status;

    const submissions = await Submission.find(query)
      .populate('studentId', 'name idNumber email')
      .populate('materialId', 'title subject dueDate')
      .populate('gradedBy', 'name email')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('studentId', 'name idNumber email')
      .populate('materialId', 'title subject dueDate')
      .populate('gradedBy', 'name email');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new submission
// @route   POST /api/submissions
// @access  Private (Student)
export const createSubmission = async (req, res) => {
  try {
    const { materialId, fileUrl, fileName, fileSize, comments } = req.body;

    // Check if material exists
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check if student already submitted
    const existingSubmission = await Submission.findOne({
      materialId,
      studentId: req.user._id,
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    // Check if late
    const isLate = material.dueDate && new Date() > new Date(material.dueDate);

    const submission = await Submission.create({
      materialId,
      studentId: req.user._id,
      fileUrl,
      fileName,
      fileSize,
      comments,
      status: isLate ? 'late' : 'submitted',
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update submission (resubmit)
// @route   PUT /api/submissions/:id
// @access  Private (Student)
export const updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user owns this submission
    if (submission.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this submission' });
    }

    const { fileUrl, fileName, fileSize, comments } = req.body;

    if (fileUrl) submission.fileUrl = fileUrl;
    if (fileName) submission.fileName = fileName;
    if (fileSize) submission.fileSize = fileSize;
    if (comments !== undefined) submission.comments = comments;
    submission.submittedAt = new Date();

    const updatedSubmission = await submission.save();

    res.json(updatedSubmission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Teacher/Admin)
export const gradeSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const { score, feedback } = req.body;

    submission.score = score;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;

    const gradedSubmission = await submission.save();

    res.json(gradedSubmission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private (Student/Admin)
export const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user owns this submission or is admin
    if (submission.studentId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this submission' });
    }

    await submission.deleteOne();
    res.json({ message: 'Submission removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's submissions
// @route   GET /api/submissions/student/:studentId
// @access  Private
export const getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.params.studentId })
      .populate('materialId', 'title subject dueDate type')
      .populate('gradedBy', 'name')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

