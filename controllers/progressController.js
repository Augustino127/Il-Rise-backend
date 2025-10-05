import Progress from '../models/Progress.js';
import Culture from '../models/Culture.js';
import History from '../models/History.js';
import Achievement from '../models/Achievement.js';

/**
 * Get all user progress
 */
export const getAllProgress = async (req, res) => {
  try {
    const userId = req.userId;

    const progress = await Progress.getAllUserProgress(userId);

    res.status(200).json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('Get all progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
};

/**
 * Update progress after a game
 */
export const updateProgress = async (req, res) => {
  try {
    const userId = req.userId;
    const { cropId, score, competenceGains } = req.body;

    // Verify crop exists
    const crop = await Culture.findById(cropId);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Get or create progress
    let progress = await Progress.getOrCreate(userId, cropId);

    // Update progress
    progress.updateAfterGame(score, competenceGains);

    // Check if next level should be unlocked
    const levelUnlocked = progress.unlockNextLevel();

    await progress.save();

    // Add history entry
    await History.addEntry(userId, 'game_played', {
      cropId,
      score,
      level: progress.level,
      stars: progress.stars
    });

    // Check for achievements
    const totalProgress = await Progress.find({ userId });
    const totalGames = totalProgress.reduce((sum, p) => sum + p.totalGamesPlayed, 0);

    const avgCompetences = calculateAverageCompetences(totalProgress);

    const unlockedAchievements = await Achievement.checkAndUnlockAchievements(userId, {
      totalGames,
      competences: avgCompetences,
      score
    });

    // Add history for new achievements
    if (unlockedAchievements.length > 0) {
      for (const achievement of unlockedAchievements) {
        await History.addEntry(userId, 'achievement_earned', {
          achievementType: achievement.type
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        progress,
        levelUnlocked,
        achievements: unlockedAchievements
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message
    });
  }
};

/**
 * Get user statistics
 */
export const getStats = async (req, res) => {
  try {
    const userId = req.userId;

    const progress = await Progress.find({ userId });

    const stats = {
      totalCropsUnlocked: progress.filter(p => p.unlocked).length,
      totalStars: progress.reduce((sum, p) => sum + p.stars, 0),
      totalGamesPlayed: progress.reduce((sum, p) => sum + p.totalGamesPlayed, 0),
      averageScore: calculateAverageScore(progress),
      competences: calculateAverageCompetences(progress),
      cropsWithThreeStars: progress.filter(p => p.stars === 3).length,
      levelDistribution: {
        level1: progress.filter(p => p.level === 1).length,
        level2: progress.filter(p => p.level === 2).length,
        level3: progress.filter(p => p.level === 3).length
      }
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
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

/**
 * Helper function to calculate average score
 */
const calculateAverageScore = (progressData) => {
  if (!progressData.length) return 0;

  const totalScore = progressData.reduce((sum, p) => sum + p.bestScore, 0);
  return Math.round(totalScore / progressData.length);
};

export default { getAllProgress, updateProgress, getStats };
