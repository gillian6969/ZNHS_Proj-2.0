import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllEvents)
  .post(protect, authorize('teacher', 'admin'), createEvent);

router.route('/:id')
  .get(protect, getEventById)
  .put(protect, authorize('teacher', 'admin'), updateEvent)
  .delete(protect, authorize('teacher', 'admin'), deleteEvent);

export default router;

