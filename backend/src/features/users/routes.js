import { Router } from 'express';
import {
  getUserProfile,
  updateMyProfile,
  changePassword,
} from './controller.js';
import { verifyToken } from '../../middleware/auth.js';

const router = Router();

// ── Public routes ─────────────────────────────────────────────
router.get('/:id', getUserProfile);

// ── Protected routes ──────────────────────────────────────────
router.patch('/me/profile',  verifyToken, updateMyProfile);
router.patch('/me/password', verifyToken, changePassword);

export default router;