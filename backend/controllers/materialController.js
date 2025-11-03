import Material from '../models/Material.js';
import Submission from '../models/Submission.js';

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private
export const getAllMaterials = async (req, res) => {
  try {
    const { classId, subject, type } = req.query;
    
    let query = {};
    if (classId) query.classId = classId;
    if (subject) query.subject = subject;
    if (type) query.type = type;

    const materials = await Material.find(query)
      .populate('uploadedBy', 'name email')
      .populate('classId', 'className gradeLevel section')
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get material by ID
// @route   GET /api/materials/:id
// @access  Private
export const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('classId', 'className gradeLevel section');
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new material
// @route   POST /api/materials
// @access  Private (Teacher/Admin)
export const createMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { title, description, materialType, subject, classId, dueDate } = req.body;

    // Generate file URL
    const fileUrl = `/uploads/materials/${req.file.filename}`;

    const material = await Material.create({
      title,
      description,
      type: materialType || 'document',
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      subject,
      classId,
      uploadedBy: req.user._id,
      dueDate: dueDate || null,
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('Material creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private (Teacher/Admin)
export const updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check if user is the uploader or admin
    if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this material' });
    }

    const { title, description, type, fileUrl, fileName, fileSize, dueDate } = req.body;

    if (title) material.title = title;
    if (description !== undefined) material.description = description;
    if (type) material.type = type;
    if (fileUrl) material.fileUrl = fileUrl;
    if (fileName) material.fileName = fileName;
    if (fileSize) material.fileSize = fileSize;
    if (dueDate) material.dueDate = dueDate;

    const updatedMaterial = await material.save();

    res.json(updatedMaterial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private (Teacher/Admin)
export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check if user is the uploader or admin
    if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this material' });
    }

    await material.deleteOne();
    res.json({ message: 'Material removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get submissions for a material
// @route   GET /api/materials/:id/submissions
// @access  Private (Teacher/Admin)
export const getMaterialSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ materialId: req.params.id })
      .populate('studentId', 'name idNumber email')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

