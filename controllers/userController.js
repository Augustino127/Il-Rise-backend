import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Achievement from '../models/Achievement.js';

/**
 * Get user profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    // Get user statistics
    const progressData = await Progress.find({ userId: user._id });

    const stats = {
      totalCropsUnlocked: progressData.filter(p => p.unlocked).length,
      totalStars: progressData.reduce((sum, p) => sum + p.stars, 0),
      totalGamesPlayed: progressData.reduce((sum, p) => sum + p.totalGamesPlayed, 0),
      averageCompetences: calculateAverageCompetences(progressData)
    };

    // Get achievements
    const achievements = await Achievement.getUserAchievements(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          lives: user.lives,
          lastLifeRegen: user.lastLifeRegen,
          createdAt: user.createdAt
        },
        stats,
        achievements
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const updates = req.body;

    // Check if username is being changed and is unique
    if (updates.username) {
      const existingUser = await User.findOne({
        username: updates.username,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // Check if email is being changed and is unique
    if (updates.email) {
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

/**
 * Get user lives status
 */
export const getLives = async (req, res) => {
  try {
    const user = req.user;

    // Calculate time to next life
    const regenInterval = (parseInt(process.env.LIFE_REGEN_INTERVAL) || 30) * 60 * 1000;
    const timeSinceLastRegen = Date.now() - user.lastLifeRegen.getTime();
    const timeToNextLife = regenInterval - (timeSinceLastRegen % regenInterval);

    res.status(200).json({
      success: true,
      data: {
        lives: user.lives,
        maxLives: 5,
        lastLifeRegen: user.lastLifeRegen,
        timeToNextLife: Math.ceil(timeToNextLife / 1000), // in seconds
        regenInterval: regenInterval / 1000 // in seconds
      }
    });
  } catch (error) {
    console.error('Get lives error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lives status',
      error: error.message
    });
  }
};

/**
 * Use a life (deduct one life from user)
 */
export const useLife = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Régénérer les vies avant utilisation
    user.regenerateLives();

    // Vérifier si l'utilisateur a des vies
    if (user.lives <= 0) {
      const regenInterval = (parseInt(process.env.LIFE_REGEN_INTERVAL) || 30) * 60 * 1000;
      const timeSinceLastRegen = Date.now() - user.lastLifeRegen.getTime();
      const timeToNextLife = regenInterval - (timeSinceLastRegen % regenInterval);

      return res.status(403).json({
        success: false,
        message: 'No lives remaining',
        data: {
          lives: 0,
          timeToNextLife: Math.ceil(timeToNextLife / 1000)
        }
      });
    }

    // Utiliser une vie
    const lifeUsed = user.useLife();

    if (lifeUsed) {
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Life used successfully',
        data: {
          lives: user.lives,
          maxLives: 5,
          lastLifeRegen: user.lastLifeRegen
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to use life'
      });
    }
  } catch (error) {
    console.error('Use life error:', error);
    res.status(500).json({
      success: false,
      message: 'Error using life',
      error: error.message
    });
  }
};

/**
 * Helper function to calculate average competences
 */
const calculateAverageCompetences = (progressData) => {
  if (!progressData.length) {
    return { water: 0, npk: 0, soil: 0, rotation: 0, nasa: 0 };
  }

  const totals = { water: 0, npk: 0, soil: 0, rotation: 0, nasa: 0 };

  progressData.forEach(progress => {
    Object.keys(totals).forEach(key => {
      totals[key] += progress.competences[key] || 0;
    });
  });

  const count = progressData.length;

  return {
    water: Math.round(totals.water / count),
    npk: Math.round(totals.npk / count),
    soil: Math.round(totals.soil / count),
    rotation: Math.round(totals.rotation / count),
    nasa: Math.round(totals.nasa / count)
  };
};

export default { getProfile, updateProfile, getLives, useLife };
