import express from 'express';
import { getProfile, updateProfile, getLives, useLife } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateRequest, updateProfileSchema } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile with stats
 * @access  Private
 */
router.get('/profile', getProfile);

/**
 * @route   PATCH /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.patch(
  '/profile',
  validateRequest(updateProfileSchema),
  updateProfile
);

/**
 * @route   GET /api/user/lives
 * @desc    Get user lives status
 * @access  Private
 */
router.get('/lives', getLives);

/**
 * @route   POST /api/user/use-life
 * @desc    Use one life (deduct from user)
 * @access  Private
 */
router.post('/use-life', useLife);

export default router;
