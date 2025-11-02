import express from 'express';
import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllAnnouncements)
  .post(protect, authorize('teacher', 'admin'), createAnnouncement);

router.route('/:id')
  .get(protect, getAnnouncementById)
  .put(protect, authorize('teacher', 'admin'), updateAnnouncement)
  .delete(protect, authorize('teacher', 'admin'), deleteAnnouncement);

export default router;

