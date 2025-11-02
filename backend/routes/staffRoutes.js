import express from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getAllStaff)
  .post(protect, authorize('admin'), createStaff);

router.route('/:id')
  .get(protect, getStaffById)
  .put(protect, authorize('admin'), updateStaff)
  .delete(protect, authorize('admin'), deleteStaff);

export default router;

