import { Router } from 'express';
import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
} from './controller.js';
import { verifyToken } from '../../middleware/auth.js';

const router = Router();

// ── Public routes ─────────────────────────────────────────────
router.get('/',     getAllListings);
router.get('/:id',  getListingById);

// ── Protected routes ──────────────────────────────────────────
router.post('/',          verifyToken, createListing);
router.patch('/:id',      verifyToken, updateListing);
router.delete('/:id',     verifyToken, deleteListing);
router.get('/user/me',    verifyToken, getMyListings);

export default router;