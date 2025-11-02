import express from 'express';
import {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterialSubmissions,
} from '../controllers/materialController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllMaterials)
  .post(protect, authorize('teacher', 'admin'), createMaterial);

router.route('/:id')
  .get(protect, getMaterialById)
  .put(protect, authorize('teacher', 'admin'), updateMaterial)
  .delete(protect, authorize('teacher', 'admin'), deleteMaterial);

router.get('/:id/submissions', protect, authorize('teacher', 'admin'), getMaterialSubmissions);

export default router;

