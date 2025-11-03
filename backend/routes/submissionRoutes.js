import express from 'express';
import {
  getAllSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  gradeSubmission,
  deleteSubmission,
  getStudentSubmissions,
} from '../controllers/submissionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadSubmission } from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllSubmissions)
  .post(protect, authorize('student'), uploadSubmission, createSubmission);

router.get('/student/:studentId', protect, getStudentSubmissions);

router.route('/:id')
  .get(protect, getSubmissionById)
  .put(protect, updateSubmission)
  .delete(protect, deleteSubmission);

router.put('/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);

export default router;

