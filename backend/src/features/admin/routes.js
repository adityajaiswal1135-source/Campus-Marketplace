import { Router } from 'express';
import {
  getAllUsers,
  banUser,
  unbanUser,
  adminDeleteListing,
  adminGetAllListings,
} from './controller.js';
import { verifyToken } from '../../middleware/auth.js';
import { adminGuard } from '../../middleware/admin.js';

const router = Router();

// All admin routes require both verifyToken and adminGuard
router.use(verifyToken, adminGuard);

// ── User management ───────────────────────────────────────────
router.get('/users',             getAllUsers);
router.patch('/users/:id/ban',   banUser);
router.patch('/users/:id/unban', unbanUser);

// ── Listing management ────────────────────────────────────────
router.get('/listings',          adminGetAllListings);
router.delete('/listings/:id',   adminDeleteListing);

export default router;