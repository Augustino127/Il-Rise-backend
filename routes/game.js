import express from 'express';
import { simulate, validate } from '../controllers/gameController.js';
import { verifyToken, checkLives } from '../middleware/auth.js';
import { validateRequest, gameSimulationSchema } from '../middleware/validation.js';
import { gameLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

/**
 * @route   POST /api/game/simulate
 * @desc    Simulate crop growth with user parameters
 * @access  Private (requires lives)
 */
router.post(
  '/simulate',
  checkLives,
  gameLimiter,
  validateRequest(gameSimulationSchema),
  simulate
);

/**
 * @route   POST /api/game/validate
 * @desc    Validate user's agricultural choices (no lives required)
 * @access  Private
 */
router.post(
  '/validate',
  validateRequest(gameSimulationSchema),
  validate
);

export default router;
