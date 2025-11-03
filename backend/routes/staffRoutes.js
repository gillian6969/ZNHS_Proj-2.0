import express from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  changeStaffPassword,
  uploadStaffAvatar,
} from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getAllStaff)
  .post(protect, authorize('admin'), createStaff);

router.route('/:id')
  .get(protect, getStaffById)
  .put(protect, authorize('admin'), updateStaff)
  .delete(protect, authorize('admin'), deleteStaff);

router.put('/:id/change-password', protect, changeStaffPassword);
router.post('/:id/avatar', protect, uploadAvatar, uploadStaffAvatar);

export default router;

