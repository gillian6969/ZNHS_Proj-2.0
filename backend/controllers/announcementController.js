import Announcement from '../models/Announcement.js';

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
export const getAllAnnouncements = async (req, res) => {
  try {
    const { visibility, classId } = req.query;
    
    let query = {};
    
    // Filter by visibility based on user role
    if (visibility) {
      query.visibility = visibility;
    } else {
      if (req.user.role === 'student') {
        query.visibility = { $in: ['students', 'all'] };
        // Students see announcements for their class or all classes
        if (req.user.classId) {
          query.$or = [
            { classId: req.user.classId },
            { classId: null }
          ];
        }
      } else if (req.user.role === 'teacher' || req.user.role === 'admin') {
        query.visibility = { $in: ['staff', 'all'] };
      }
    }

    // Filter by classId if provided (for teacher filtering)
    if (classId) {
      query.$or = [
        { classId },
        { classId: null } // Include announcements for all classes
      ];
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name role')
      .populate('classId', 'className gradeLevel section')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get announcement by ID
// @route   GET /api/announcements/:id
// @access  Private
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name role');
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private (Staff/Admin)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, body, priority, classId, visibility } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Please provide title and body' });
    }

    const announcement = await Announcement.create({
      title,
      body,
      priority: priority || 'normal',
      classId: classId || null, // null means all classes
      visibility: visibility || 'all',
      createdBy: req.user._id,
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name role')
      .populate('classId', 'className gradeLevel section');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Staff/Admin)
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    const { title, body, visibility } = req.body;

    announcement.title = title || announcement.title;
    announcement.body = body || announcement.body;
    announcement.visibility = visibility || announcement.visibility;

    const updatedAnnouncement = await announcement.save();

    res.json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Staff/Admin)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await announcement.deleteOne();
    res.json({ message: 'Announcement removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

