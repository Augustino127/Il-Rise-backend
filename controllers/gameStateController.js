import GameState from '../models/GameState.js';

/**
 * Sauvegarder l'état du jeu
 */
export const saveGameState = async (req, res) => {
  try {
    const userId = req.user.id;
    const gameState = req.body;

    const savedState = await GameState.saveState(userId, gameState);

    res.json({
      success: true,
      message: 'Game state saved successfully',
      data: savedState
    });
  } catch (error) {
    console.error('Error saving game state:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save game state',
      error: error.message
    });
  }
};

/**
 * Charger l'état du jeu
 */
export const loadGameState = async (req, res) => {
  try {
    const userId = req.user.id;

    const gameState = await GameState.loadState(userId);

    if (!gameState) {
      return res.json({
        success: true,
        message: 'No saved game state found',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Game state loaded successfully',
      data: gameState
    });
  } catch (error) {
    console.error('Error loading game state:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load game state',
      error: error.message
    });
  }
};

/**
 * Supprimer l'état du jeu (reset)
 */
export const deleteGameState = async (req, res) => {
  try {
    const userId = req.user.id;

    await GameState.findOneAndDelete({ userId });

    res.json({
      success: true,
      message: 'Game state deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting game state:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete game state',
      error: error.message
    });
  }
};

/**
 * Mettre à jour les ressources
 */
export const updateResources = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resources } = req.body;

    const gameState = await GameState.findOne({ userId });
    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: 'Game state not found'
      });
    }

    gameState.resources = { ...gameState.resources, ...resources };
    gameState.lastUpdate = new Date();
    await gameState.save();

    res.json({
      success: true,
      message: 'Resources updated successfully',
      data: gameState.resources
    });
  } catch (error) {
    console.error('Error updating resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resources',
      error: error.message
    });
  }
};

/**
 * Mettre à jour une parcelle
 */
export const updatePlot = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plotId } = req.params;
    const plotData = req.body;

    const gameState = await GameState.findOne({ userId });
    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: 'Game state not found'
      });
    }

    const plotIndex = gameState.plots.findIndex(p => p.plotId === parseInt(plotId));
    if (plotIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Plot not found'
      });
    }

    gameState.plots[plotIndex] = { ...gameState.plots[plotIndex], ...plotData };
    gameState.lastUpdate = new Date();
    await gameState.save();

    res.json({
      success: true,
      message: 'Plot updated successfully',
      data: gameState.plots[plotIndex]
    });
  } catch (error) {
    console.error('Error updating plot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update plot',
      error: error.message
    });
  }
};

/**
 * Mettre à jour l'élevage
 */
export const updateLivestock = async (req, res) => {
  try {
    const userId = req.user.id;
    const livestockData = req.body;

    const gameState = await GameState.findOne({ userId });
    if (!gameState) {
      return res.status(404).json({
        success: false,
        message: 'Game state not found'
      });
    }

    gameState.livestock = { ...gameState.livestock, ...livestockData };
    gameState.lastUpdate = new Date();
    await gameState.save();

    res.json({
      success: true,
      message: 'Livestock updated successfully',
      data: gameState.livestock
    });
  } catch (error) {
    console.error('Error updating livestock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update livestock',
      error: error.message
    });
  }
};
