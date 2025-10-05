import { verifyAccessToken } from '../config/jwt.js';
import User from '../models/User.js';

/**
 * Middleware to verify JWT token and authenticate user
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Access denied.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.'
      });
    }

    // Regenerate lives if needed
    user.regenerateLives();
    await user.save();

    // Attach user to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

/**
 * Middleware to check if user has enough lives
 */
export const checkLives = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.lives <= 0) {
      return res.status(403).json({
        success: false,
        message: 'No lives remaining. Please wait for regeneration.',
        lives: 0,
        nextLifeIn: calculateTimeToNextLife(req.user)
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking lives',
      error: error.message
    });
  }
};

/**
 * Calculate time until next life regeneration
 */
const calculateTimeToNextLife = (user) => {
  const regenInterval = (parseInt(process.env.LIFE_REGEN_INTERVAL) || 30) * 60 * 1000;
  const timeSinceLastRegen = Date.now() - user.lastLifeRegen.getTime();
  const timeToNextLife = regenInterval - (timeSinceLastRegen % regenInterval);

  return Math.ceil(timeToNextLife / 1000); // Return in seconds
};

export default { verifyToken, checkLives };
