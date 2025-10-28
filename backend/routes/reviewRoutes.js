import express from 'express';
const router = express.Router();
import { getAllReviews } from '../controllers/reviewController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

// Get all reviews (Admin only)
router.get('/all', protect, isAdmin, getAllReviews);

export default router;

