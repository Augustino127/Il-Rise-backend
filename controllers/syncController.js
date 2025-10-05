import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Achievement from '../models/Achievement.js';
import History from '../models/History.js';

/**
 * Synchroniser le profil complet du joueur
 */
export const syncProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      coins,
      selectedLocation,
      competenceStats,
      completedLevels,
      highScores,
      unlockedKnowledgeCards
    } = req.body;

    // Mettre à jour User
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mettre à jour coins
    if (coins !== undefined && coins > user.coins) {
      const coinsToAdd = coins - user.coins;
      user.addCoins(coinsToAdd);
    }

    // Mettre à jour localité
    if (selectedLocation) {
      user.updateLocation(selectedLocation);
    }

    await user.save();

    // Mettre à jour Progress pour chaque culture
    const progressUpdates = [];

    if (competenceStats) {
      // Créer/mettre à jour progress global (sans cropId spécifique)
      let globalProgress = await Progress.findOne({ userId, cropId: null });

      if (!globalProgress) {
        globalProgress = new Progress({
          userId,
          cropId: null,
          competenceStats,
          completedLevels: completedLevels || [],
          highScores: highScores || {}
        });
      } else {
        globalProgress.competenceStats = competenceStats;
        globalProgress.completedLevels = completedLevels || globalProgress.completedLevels;
        globalProgress.highScores = highScores || globalProgress.highScores;
      }

      if (unlockedKnowledgeCards && unlockedKnowledgeCards.length > 0) {
        globalProgress.unlockedKnowledgeCards = unlockedKnowledgeCards.map(cardId => ({
          cardId,
          unlockedAt: new Date()
        }));
      }

      await globalProgress.save();
      progressUpdates.push(globalProgress);
    }

    // Vérifier et débloquer les achievements
    const newAchievements = await Achievement.checkAndUnlockAchievements(userId, {
      totalGames: completedLevels?.length || 0,
      competences: competenceStats ? {
        water: competenceStats.water?.goodScores > 0 ? (competenceStats.water.goodScores / competenceStats.water.totalGames) * 100 : 0,
        npk: competenceStats.npk?.goodScores > 0 ? (competenceStats.npk.goodScores / competenceStats.npk.totalGames) * 100 : 0,
        soil: competenceStats.ph?.goodScores > 0 ? (competenceStats.ph.goodScores / competenceStats.ph.totalGames) * 100 : 0,
        rotation: competenceStats.rotation?.levelsCompleted || 0,
        nasa: competenceStats.nasa?.nasaHelpUsed || 0
      } : {}
    });

    // Ajouter entrée historique
    if (completedLevels && completedLevels.length > 0) {
      await History.addEntry(userId, 'game_played', {
        totalLevels: completedLevels.length,
        syncedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Profile synchronized successfully',
      data: {
        user: {
          coins: user.coins,
          coinsEarned: user.coinsEarned,
          coinsSpent: user.coinsSpent,
          lives: user.lives,
          selectedLocation: user.selectedLocation
        },
        progress: progressUpdates,
        newAchievements: newAchievements.map(a => ({
          type: a.type,
          unlockedAt: a.unlockedAt
        }))
      }
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      message: 'Error syncing profile',
      error: error.message
    });
  }
};

/**
 * Récupérer le profil complet depuis le backend
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('-password');
    const progress = await Progress.find({ userId }).populate('cropId');
    const achievements = await Achievement.getUserAchievements(userId);
    const history = await History.getUserHistory(userId, 20);

    res.json({
      success: true,
      data: {
        user,
        progress,
        achievements,
        history
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

/**
 * Sauvegarder une session de jeu
 */
export const saveGameSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      cropId,
      levelId,
      location,
      score,
      stars,
      yieldValue,
      parameters,
      stressFactors,
      coinsEarned,
      duration
    } = req.body;

    const user = await User.findById(userId);

    // Ajouter les pièces gagnées
    if (coinsEarned > 0) {
      user.addCoins(coinsEarned);
      await user.save();
    }

    // Créer entrée historique
    await History.addEntry(userId, 'game_played', {
      cropId,
      levelId,
      location,
      score,
      stars,
      yield: yieldValue,
      coinsEarned,
      duration
    });

    // Si score parfait, ajouter achievement
    if (score >= 95) {
      await Achievement.unlockAchievement(userId, 'perfect_score', { levelId, score });
    }

    res.json({
      success: true,
      message: 'Game session saved',
      data: {
        coins: user.coins,
        coinsEarned
      }
    });

  } catch (error) {
    console.error('Save game session error:', error);
    res.status(500).json({
      message: 'Error saving game session',
      error: error.message
    });
  }
};
