import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentGrades,
  getStudentAttendance,
  resetStudentPassword,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('teacher', 'admin'), getAllStudents)
  .post(protect, authorize('admin'), createStudent);

router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

router.get('/:id/grades', protect, getStudentGrades);
router.get('/:id/attendance', protect, getStudentAttendance);
router.put('/:id/reset-password', protect, authorize('admin'), resetStudentPassword);

export default router;

