import express from 'express';
import { getAllHistory, addHistory, getHistoryStats } from '../controllers/historyController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/history/all
 * @desc    Get all user history
 * @access  Private
 */
router.get('/all', getAllHistory);

/**
 * @route   POST /api/history/add
 * @desc    Add a history entry
 * @access  Private
 */
router.post('/add', addHistory);

/**
 * @route   GET /api/history/stats
 * @desc    Get history statistics
 * @access  Private
 */
router.get('/stats', getHistoryStats);

export default router;
