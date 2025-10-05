import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'first_game',
      'first_win',
      'perfect_score',
      'master_water',
      'master_npk',
      'master_soil',
      'master_rotation',
      'master_nasa',
      'all_competences_50',
      'all_competences_100',
      'unlock_5_crops',
      'unlock_10_crops',
      'unlock_all_crops',
      'three_stars_5_crops',
      'three_stars_all_crops',
      'play_10_games',
      'play_50_games',
      'play_100_games',
      'win_streak_3',
      'win_streak_5',
      'win_streak_10'
    ]
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index to ensure unique achievements per user
achievementSchema.index({ userId: 1, type: 1 }, { unique: true });

// Static method to unlock achievement
achievementSchema.statics.unlockAchievement = async function(userId, type, metadata = {}) {
  try {
    const achievement = await this.create({
      userId,
      type,
      metadata
    });
    return { success: true, achievement };
  } catch (error) {
    // If duplicate, achievement already unlocked
    if (error.code === 11000) {
      return { success: false, message: 'Achievement already unlocked' };
    }
    throw error;
  }
};

// Static method to get user achievements
achievementSchema.statics.getUserAchievements = async function(userId) {
  return await this.find({ userId })
    .sort({ unlockedAt: -1 })
    .lean();
};

// Static method to check and unlock achievements based on user progress
achievementSchema.statics.checkAndUnlockAchievements = async function(userId, progressData) {
  const achievements = [];

  // Check total games played
  if (progressData.totalGames === 1) {
    achievements.push('first_game');
  } else if (progressData.totalGames === 10) {
    achievements.push('play_10_games');
  } else if (progressData.totalGames === 50) {
    achievements.push('play_50_games');
  } else if (progressData.totalGames === 100) {
    achievements.push('play_100_games');
  }

  // Check competences mastery
  const competences = progressData.competences || {};
  Object.entries(competences).forEach(([key, value]) => {
    if (value >= 100) {
      achievements.push(`master_${key}`);
    }
  });

  // Check if all competences >= 50
  const allCompetences = Object.values(competences);
  if (allCompetences.length === 5 && allCompetences.every(v => v >= 50)) {
    achievements.push('all_competences_50');
  }

  // Check if all competences >= 100
  if (allCompetences.length === 5 && allCompetences.every(v => v >= 100)) {
    achievements.push('all_competences_100');
  }

  // Unlock achievements
  const unlocked = [];
  for (const type of achievements) {
    const result = await this.unlockAchievement(userId, type, progressData);
    if (result.success) {
      unlocked.push(result.achievement);
    }
  }

  return unlocked;
};

const Achievement = mongoose.model('Achievement', achievementSchema);

export default Achievement;
