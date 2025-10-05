import Culture from '../models/Culture.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import History from '../models/History.js';
import { simulateCropGrowth } from '../services/simulationEngine.js';
import { calculateCompetenceGains } from '../services/competenceCalculator.js';

/**
 * Simulate crop growth based on user inputs
 */
export const simulate = async (req, res) => {
  try {
    const userId = req.userId;
    const { cropId, parameters, level } = req.body;

    // Get crop data
    const crop = await Culture.findById(cropId);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Get user progress for this crop
    const progress = await Progress.getOrCreate(userId, cropId);

    // Check if user has unlocked this level
    if (level > progress.level) {
      return res.status(403).json({
        success: false,
        message: 'Level not unlocked yet'
      });
    }

    // Use a life
    const user = await User.findById(userId);
    const lifeUsed = user.useLife();

    if (!lifeUsed) {
      return res.status(403).json({
        success: false,
        message: 'No lives remaining',
        lives: 0
      });
    }

    await user.save();

    // Run simulation
    const simulationResult = simulateCropGrowth(crop, parameters, level);

    // Calculate competence gains
    const competenceGains = calculateCompetenceGains(
      crop,
      parameters,
      simulationResult,
      level
    );

    // Update progress
    progress.updateAfterGame(simulationResult.score, competenceGains);
    const levelUnlocked = progress.unlockNextLevel();
    await progress.save();

    // Add history entry
    await History.addEntry(userId, 'game_played', {
      cropId,
      score: simulationResult.score,
      level,
      yield: simulationResult.yield
    });

    res.status(200).json({
      success: true,
      message: 'Simulation completed',
      data: {
        simulation: simulationResult,
        competenceGains,
        progress: {
          level: progress.level,
          stars: progress.stars,
          consecutiveSuccess: progress.consecutiveSuccess,
          levelUnlocked
        },
        user: {
          lives: user.lives,
          lastLifeRegen: user.lastLifeRegen
        }
      }
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error running simulation',
      error: error.message
    });
  }
};

/**
 * Validate user's agricultural choices and provide feedback
 */
export const validate = async (req, res) => {
  try {
    const { cropId, parameters } = req.body;

    // Get crop data
    const crop = await Culture.findById(cropId);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Validate each parameter
    const validation = {
      water: validateParameter(crop.parameters.water, parameters.water, 'Water'),
      nitrogen: validateParameter(crop.parameters.nitrogen, parameters.nitrogen, 'Nitrogen'),
      phosphorus: validateParameter(crop.parameters.phosphorus, parameters.phosphorus, 'Phosphorus'),
      potassium: validateParameter(crop.parameters.potassium, parameters.potassium, 'Potassium'),
      ph: validateParameter(crop.parameters.ph, parameters.ph, 'pH'),
      temperature: validateParameter(crop.parameters.temperature, parameters.temperature, 'Temperature')
    };

    // Calculate overall score
    const scores = Object.values(validation).map(v => v.score);
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    // Generate recommendations
    const recommendations = generateRecommendations(validation, crop);

    res.status(200).json({
      success: true,
      data: {
        validation,
        overallScore,
        recommendations,
        cropOptimal: crop.parameters
      }
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating parameters',
      error: error.message
    });
  }
};

/**
 * Helper function to validate a single parameter
 */
const validateParameter = (optimal, actual, name) => {
  const diff = Math.abs(actual - optimal.optimal);
  const range = optimal.max - optimal.min;
  const tolerance = range * 0.1; // 10% tolerance

  let score = 100;
  let status = 'optimal';
  let message = `${name} is optimal`;

  if (actual < optimal.min) {
    score = Math.max(0, 100 - ((optimal.min - actual) / optimal.min) * 100);
    status = 'too_low';
    message = `${name} is too low`;
  } else if (actual > optimal.max) {
    score = Math.max(0, 100 - ((actual - optimal.max) / optimal.max) * 100);
    status = 'too_high';
    message = `${name} is too high`;
  } else if (diff > tolerance) {
    score = Math.max(70, 100 - (diff / range) * 100);
    status = actual < optimal.optimal ? 'below_optimal' : 'above_optimal';
    message = `${name} is ${status === 'below_optimal' ? 'slightly low' : 'slightly high'}`;
  }

  return {
    parameter: name,
    actual,
    optimal: optimal.optimal,
    range: { min: optimal.min, max: optimal.max },
    score: Math.round(score),
    status,
    message
  };
};

/**
 * Helper function to generate recommendations
 */
const generateRecommendations = (validation, crop) => {
  const recommendations = [];

  Object.values(validation).forEach(v => {
    if (v.score < 90) {
      let recommendation = '';

      if (v.status === 'too_low') {
        recommendation = `Increase ${v.parameter.toLowerCase()} to at least ${v.optimal}`;
      } else if (v.status === 'too_high') {
        recommendation = `Decrease ${v.parameter.toLowerCase()} to around ${v.optimal}`;
      } else {
        recommendation = `Adjust ${v.parameter.toLowerCase()} closer to ${v.optimal} for better results`;
      }

      recommendations.push({
        parameter: v.parameter,
        priority: v.score < 50 ? 'high' : v.score < 70 ? 'medium' : 'low',
        recommendation
      });
    }
  });

  return recommendations.sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 };
    return priority[b.priority] - priority[a.priority];
  });
};

export default { simulate, validate };
