/**
 * farmController.js
 * Contrôleur pour gérer la ferme V3
 * IleRise - NASA Space Apps Challenge 2025
 */

import FarmState from '../models/FarmState.js';
import User from '../models/User.js';
import History from '../models/History.js';

/**
 * Créer ou récupérer l'état de la ferme
 * POST /api/farm/init
 */
export const initializeFarm = async (req, res) => {
  try {
    const userId = req.user._id;
    const { location } = req.body;

    if (!location || !location.city) {
      return res.status(400).json({
        success: false,
        message: 'Location data is required'
      });
    }

    // Créer ou récupérer la ferme
    const farmState = await FarmState.getOrCreate(userId, location);

    // Ajouter entrée historique
    await History.addEntry(userId, 'farm_initialized', {
      location: location.city,
      day: farmState.time.currentDay
    });

    res.json({
      success: true,
      message: 'Farm initialized successfully',
      data: farmState
    });

  } catch (error) {
    console.error('Initialize farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing farm',
      error: error.message
    });
  }
};

/**
 * Sauvegarder l'état complet de la ferme
 * POST /api/farm/save
 */
export const saveFarm = async (req, res) => {
  try {
    const userId = req.user._id;
    const farmData = req.body;

    if (!farmData) {
      return res.status(400).json({
        success: false,
        message: 'Farm data is required'
      });
    }

    // Rechercher la ferme existante
    let farmState = await FarmState.findOne({ userId });

    if (!farmState) {
      // Créer nouvelle ferme
      farmState = new FarmState({
        userId,
        ...farmData
      });
    } else {
      // Mettre à jour la ferme existante
      Object.assign(farmState, farmData);
      farmState.lastSaved = new Date();
    }

    await farmState.save();

    // Log dans l'historique
    await History.addEntry(userId, 'farm_saved', {
      day: farmState.time.currentDay,
      money: farmState.resources.money,
      activePlots: farmState.plots.filter(p => p.isPlanted).length
    });

    res.json({
      success: true,
      message: 'Farm saved successfully',
      data: {
        lastSaved: farmState.lastSaved,
        summary: farmState.getSummary()
      }
    });

  } catch (error) {
    console.error('Save farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving farm',
      error: error.message
    });
  }
};

/**
 * Charger l'état de la ferme
 * GET /api/farm/load
 */
export const loadFarm = async (req, res) => {
  try {
    const userId = req.user._id;

    const farmState = await FarmState.findOne({ userId });

    if (!farmState) {
      return res.status(404).json({
        success: false,
        message: 'No farm found for this user'
      });
    }

    res.json({
      success: true,
      data: farmState
    });

  } catch (error) {
    console.error('Load farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading farm',
      error: error.message
    });
  }
};

/**
 * Mettre à jour partiellement la ferme (quick save)
 * PATCH /api/farm/update
 */
export const updateFarm = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    const farmState = await FarmState.findOne({ userId });

    if (!farmState) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Mettre à jour les champs fournis
    if (updates.time) Object.assign(farmState.time, updates.time);
    if (updates.resources) Object.assign(farmState.resources, updates.resources);
    if (updates.plots) farmState.plots = updates.plots;
    if (updates.livestock) Object.assign(farmState.livestock, updates.livestock);
    if (updates.market) Object.assign(farmState.market, updates.market);
    if (updates.activeActions) farmState.activeActions = updates.activeActions;
    if (updates.isPaused !== undefined) farmState.isPaused = updates.isPaused;

    farmState.lastSaved = new Date();

    await farmState.save();

    res.json({
      success: true,
      message: 'Farm updated successfully',
      data: {
        lastSaved: farmState.lastSaved
      }
    });

  } catch (error) {
    console.error('Update farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating farm',
      error: error.message
    });
  }
};

/**
 * Logger une action de la ferme
 * POST /api/farm/action
 */
export const logAction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { actionType, actionData } = req.body;

    // Enregistrer dans l'historique
    await History.addEntry(userId, `farm_action_${actionType}`, actionData);

    res.json({
      success: true,
      message: 'Action logged successfully'
    });

  } catch (error) {
    console.error('Log action error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging action',
      error: error.message
    });
  }
};

/**
 * Récolter et mettre à jour les pièces
 * POST /api/farm/harvest
 */
export const recordHarvest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cropId, yield: yieldAmount, revenue } = req.body;

    // Mettre à jour les pièces de l'utilisateur
    const user = await User.findById(userId);
    if (revenue > 0) {
      user.addCoins(revenue);
      await user.save();
    }

    // Logger dans l'historique
    await History.addEntry(userId, 'farm_harvest', {
      cropId,
      yield: yieldAmount,
      revenue
    });

    res.json({
      success: true,
      message: 'Harvest recorded',
      data: {
        coins: user.coins,
        revenue
      }
    });

  } catch (error) {
    console.error('Record harvest error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording harvest',
      error: error.message
    });
  }
};

/**
 * Obtenir les statistiques de la ferme
 * GET /api/farm/stats
 */
export const getFarmStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const farmState = await FarmState.findOne({ userId });

    if (!farmState) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    const stats = {
      summary: farmState.getSummary(),
      playTime: farmState.totalPlayTime,
      location: farmState.location,
      plots: farmState.plots.map(p => ({
        id: p.id,
        unlocked: p.unlocked,
        isPlanted: p.isPlanted,
        crop: p.crop?.id || null,
        health: p.health
      })),
      resources: {
        money: farmState.resources.money,
        water: farmState.resources.water,
        totalSeeds: Object.values(farmState.resources.seeds).reduce((sum, val) => sum + val, 0),
        totalHarvest: Object.values(farmState.resources.harvest).reduce((sum, val) => sum + val, 0)
      },
      time: farmState.time
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get farm stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting farm stats',
      error: error.message
    });
  }
};

/**
 * Réinitialiser la ferme
 * DELETE /api/farm/reset
 */
export const resetFarm = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await FarmState.deleteOne({ userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No farm found to reset'
      });
    }

    // Logger dans l'historique
    await History.addEntry(userId, 'farm_reset', {
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Farm reset successfully'
    });

  } catch (error) {
    console.error('Reset farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting farm',
      error: error.message
    });
  }
};
