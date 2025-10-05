import express from 'express';
import {
  getAllCultures,
  getCultureById,
  createCulture,
  updateCulture,
  deleteCulture
} from '../controllers/cultureController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateRequest, createCultureSchema } from '../middleware/validation.js';
import { adminLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * @route   GET /api/culture/all
 * @desc    Get all cultures (filtered by query params)
 * @access  Public
 */
router.get('/all', getAllCultures);

/**
 * @route   GET /api/culture/:id
 * @desc    Get culture by ID
 * @access  Public
 */
router.get('/:id', getCultureById);

/**
 * @route   POST /api/culture/create
 * @desc    Create new culture (admin only)
 * @access  Private (Admin)
 */
router.post(
  '/create',
  verifyToken,
  adminLimiter,
  validateRequest(createCultureSchema),
  createCulture
);

/**
 * @route   PATCH /api/culture/:id
 * @desc    Update culture (admin only)
 * @access  Private (Admin)
 */
router.patch(
  '/:id',
  verifyToken,
  adminLimiter,
  updateCulture
);

/**
 * @route   DELETE /api/culture/:id
 * @desc    Delete culture (admin only)
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  verifyToken,
  adminLimiter,
  deleteCulture
);

export default router;
