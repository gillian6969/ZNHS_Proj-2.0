import express from 'express';
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
  getTeacherClasses,
} from '../controllers/classController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllClasses)
  .post(protect, authorize('admin'), createClass);

router.get('/teacher/:teacherId', protect, getTeacherClasses);

router.route('/:id')
  .get(protect, getClassById)
  .put(protect, authorize('admin'), updateClass)
  .delete(protect, authorize('admin'), deleteClass);

router.post('/:id/students', protect, authorize('admin'), addStudentToClass);
router.delete('/:id/students/:studentId', protect, authorize('admin'), removeStudentFromClass);

export default router;

