import express from 'express';
import { register, login, refresh } from '../controllers/authController.js';
import { validateRequest, registerSchema, loginSchema, refreshTokenSchema } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  refresh
);

export default router;
