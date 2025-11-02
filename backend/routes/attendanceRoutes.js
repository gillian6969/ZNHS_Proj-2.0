import express from 'express';
import {
  getAllAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  bulkCreateAttendance,
  getAttendanceStats,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllAttendance)
  .post(protect, authorize('teacher', 'admin'), createAttendance);

router.post('/bulk', protect, authorize('teacher', 'admin'), bulkCreateAttendance);
router.get('/stats/:studentId', protect, getAttendanceStats);

router.route('/:id')
  .get(protect, getAttendanceById)
  .put(protect, authorize('teacher', 'admin'), updateAttendance)
  .delete(protect, authorize('admin'), deleteAttendance);

export default router;

