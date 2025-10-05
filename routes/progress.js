import express from 'express';
import { getAllProgress, updateProgress, getStats } from '../controllers/progressController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateRequest, updateProgressSchema } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/progress/all
 * @desc    Get all user progress
 * @access  Private
 */
router.get('/all', getAllProgress);

/**
 * @route   POST /api/progress/update
 * @desc    Update progress after a game
 * @access  Private
 */
router.post(
  '/update',
  validateRequest(updateProgressSchema),
  updateProgress
);

/**
 * @route   GET /api/progress/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', getStats);

export default router;
