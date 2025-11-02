import Event from '../models/Event.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Private
export const getAllEvents = async (req, res) => {
  try {
    const { visibility, upcoming } = req.query;
    
    let query = {};
    
    // Filter by visibility
    if (visibility) {
      query.visibility = visibility;
    } else {
      // If no visibility specified, show based on user role
      if (req.user.role === 'student') {
        query.visibility = { $in: ['students', 'all'] };
      } else if (req.user.role === 'teacher' || req.user.role === 'admin') {
        query.visibility = { $in: ['staff', 'all'] };
      }
    }

    // Filter upcoming events
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name role')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name role');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Staff/Admin)
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, visibility } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      visibility: visibility || 'all',
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Staff/Admin)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const { title, description, date, visibility } = req.body;

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.visibility = visibility || event.visibility;

    const updatedEvent = await event.save();

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Staff/Admin)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

