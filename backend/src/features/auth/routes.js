import { Router } from 'express';
import { register, login, logout, getMe } from './controller.js';
import { verifyToken } from '../../middleware/auth.js';

const router = Router();

// ── Public routes ─────────────────────────────────────────────
router.post('/register', register);
router.post('/login',    login);

// ── Protected routes ──────────────────────────────────────────
router.post('/logout',   verifyToken, logout);
router.get('/me',        verifyToken, getMe);  // frontend calls this on page load

export default router;