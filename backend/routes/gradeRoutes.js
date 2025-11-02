import express from 'express';
import {
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
  bulkUpdateGrades,
} from '../controllers/gradeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllGrades)
  .post(protect, authorize('teacher', 'admin'), createGrade);

router.put('/bulk', protect, authorize('teacher', 'admin'), bulkUpdateGrades);

router.route('/:id')
  .get(protect, getGradeById)
  .put(protect, authorize('teacher', 'admin'), updateGrade)
  .delete(protect, authorize('admin'), deleteGrade);

export default router;

