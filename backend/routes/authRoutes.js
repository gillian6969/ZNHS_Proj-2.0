import express from 'express';
import {
    getMe,
    login,
    registerStudent,
    requestPasswordReset,
    resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', login);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

export default router;

