/**
 * Simulation Engine - DSSAT-like agricultural crop growth simulator
 * Calculates crop yield based on various agricultural parameters
 */

/**
 * Main simulation function
 * @param {Object} crop - Crop data from database
 * @param {Object} parameters - User input parameters
 * @param {Number} level - Difficulty level (1-3)
 * @returns {Object} Simulation results with score, yield, and details
 */
export const simulateCropGrowth = (crop, parameters, level = 1) => {
  // Extract optimal parameters
  const optimal = crop.parameters;

  // Calculate individual parameter scores
  const waterScore = calculateWaterScore(optimal.water, parameters.water);
  const nitrogenScore = calculateNPKScore(optimal.nitrogen, parameters.nitrogen);
  const phosphorusScore = calculateNPKScore(optimal.phosphorus, parameters.phosphorus);
  const potassiumScore = calculateNPKScore(optimal.potassium, parameters.potassium);
  const phScore = calculatePhScore(optimal.ph, parameters.ph);
  const tempScore = calculateTemperatureScore(optimal.temperature, parameters.temperature);

  // Calculate NPK balance score
  const npkBalanceScore = calculateNPKBalance(
    { nitrogen: parameters.nitrogen, phosphorus: parameters.phosphorus, potassium: parameters.potassium },
    { nitrogen: optimal.nitrogen.optimal, phosphorus: optimal.phosphorus.optimal, potassium: optimal.potassium.optimal }
  );

  // Weight factors based on level
  const weights = getLevelWeights(level);

  // Calculate overall score
  const overallScore = Math.round(
    waterScore * weights.water +
    nitrogenScore * weights.nitrogen +
    phosphorusScore * weights.phosphorus +
    potassiumScore * weights.potassium +
    phScore * weights.ph +
    tempScore * weights.temperature +
    npkBalanceScore * weights.balance
  );

  // Calculate yield based on score
  const yieldResult = calculateYield(crop.yields, overallScore);

  // Determine growth success
  const success = overallScore >= 50;

  // Generate detailed feedback
  const feedback = generateFeedback({
    waterScore,
    nitrogenScore,
    phosphorusScore,
    potassiumScore,
    phScore,
    tempScore,
    npkBalanceScore,
    overallScore
  }, parameters, optimal);

  return {
    score: overallScore,
    yield: yieldResult,
    success,
    details: {
      water: { score: Math.round(waterScore * 100), status: getStatus(waterScore) },
      nitrogen: { score: Math.round(nitrogenScore * 100), status: getStatus(nitrogenScore) },
      phosphorus: { score: Math.round(phosphorusScore * 100), status: getStatus(phosphorusScore) },
      potassium: { score: Math.round(potassiumScore * 100), status: getStatus(potassiumScore) },
      ph: { score: Math.round(phScore * 100), status: getStatus(phScore) },
      temperature: { score: Math.round(tempScore * 100), status: getStatus(tempScore) },
      npkBalance: { score: Math.round(npkBalanceScore * 100), status: getStatus(npkBalanceScore) }
    },
    feedback,
    level
  };
};

/**
 * Calculate water stress score
 */
const calculateWaterScore = (optimal, actual) => {
  const { min, optimal: opt, max } = optimal;

  if (actual < min) {
    // Water deficit - severe penalty
    const deficit = min - actual;
    return Math.max(0, 1 - (deficit / min) * 1.5);
  } else if (actual > max) {
    // Waterlogging - severe penalty
    const excess = actual - max;
    return Math.max(0, 1 - (excess / max) * 1.2);
  } else {
    // Within range - calculate proximity to optimal
    const distance = Math.abs(actual - opt);
    const range = max - min;
    return Math.max(0.7, 1 - (distance / range) * 0.5);
  }
};

/**
 * Calculate NPK nutrient score
 */
const calculateNPKScore = (optimal, actual) => {
  const { min, optimal: opt, max } = optimal;

  if (actual < min) {
    // Nutrient deficiency
    const deficit = min - actual;
    return Math.max(0, 1 - (deficit / min) * 1.3);
  } else if (actual > max) {
    // Nutrient toxicity
    const excess = actual - max;
    return Math.max(0, 1 - (excess / max) * 1.1);
  } else {
    // Within range
    const distance = Math.abs(actual - opt);
    const range = max - min;
    return Math.max(0.7, 1 - (distance / range) * 0.4);
  }
};

/**
 * Calculate pH score
 */
const calculatePhScore = (optimal, actual) => {
  const { min, optimal: opt, max } = optimal;

  if (actual < min || actual > max) {
    // Outside range - severe penalty
    const distance = actual < min ? min - actual : actual - max;
    return Math.max(0, 1 - distance * 0.3);
  } else {
    // Within range
    const distance = Math.abs(actual - opt);
    const range = (max - min) / 2;
    return Math.max(0.6, 1 - (distance / range) * 0.5);
  }
};

/**
 * Calculate temperature score
 */
const calculateTemperatureScore = (optimal, actual) => {
  const { min, optimal: opt, max } = optimal;

  if (actual < min) {
    // Cold stress
    const deficit = min - actual;
    return Math.max(0, 1 - (deficit / 10) * 0.8);
  } else if (actual > max) {
    // Heat stress
    const excess = actual - max;
    return Math.max(0, 1 - (excess / 10) * 0.8);
  } else {
    // Within range
    const distance = Math.abs(actual - opt);
    const range = max - min;
    return Math.max(0.7, 1 - (distance / range) * 0.4);
  }
};

/**
 * Calculate NPK balance score
 */
const calculateNPKBalance = (actual, optimal) => {
  // Calculate NPK ratios
  const actualRatio = {
    n: actual.nitrogen,
    p: actual.phosphorus,
    k: actual.potassium
  };

  const optimalRatio = {
    n: optimal.nitrogen,
    p: optimal.phosphorus,
    k: optimal.potassium
  };

  // Check balance
  const nDiff = Math.abs(actualRatio.n - optimalRatio.n) / optimalRatio.n;
  const pDiff = Math.abs(actualRatio.p - optimalRatio.p) / optimalRatio.p;
  const kDiff = Math.abs(actualRatio.k - optimalRatio.k) / optimalRatio.k;

  const avgDiff = (nDiff + pDiff + kDiff) / 3;

  return Math.max(0.5, 1 - avgDiff * 0.5);
};

/**
 * Get level-specific weight factors
 */
const getLevelWeights = (level) => {
  const weights = {
    1: { water: 0.25, nitrogen: 0.15, phosphorus: 0.10, potassium: 0.10, ph: 0.15, temperature: 0.15, balance: 0.10 },
    2: { water: 0.20, nitrogen: 0.15, phosphorus: 0.12, potassium: 0.12, ph: 0.13, temperature: 0.13, balance: 0.15 },
    3: { water: 0.18, nitrogen: 0.15, phosphorus: 0.13, potassium: 0.13, ph: 0.13, temperature: 0.13, balance: 0.15 }
  };

  return weights[level] || weights[1];
};

/**
 * Calculate final yield
 */
const calculateYield = (yields, score) => {
  const { min, avg, max, unit } = yields;

  let finalYield;

  if (score >= 90) {
    finalYield = max;
  } else if (score >= 70) {
    finalYield = avg + ((score - 70) / 20) * (max - avg);
  } else if (score >= 50) {
    finalYield = avg + ((score - 50) / 20) * (avg - min) * 0.5;
  } else {
    finalYield = min * (score / 50);
  }

  return {
    value: parseFloat(finalYield.toFixed(2)),
    unit,
    percentage: Math.round((finalYield / max) * 100),
    optimal: max
  };
};

/**
 * Get status label
 */
const getStatus = (score) => {
  if (score >= 0.9) return 'excellent';
  if (score >= 0.7) return 'good';
  if (score >= 0.5) return 'fair';
  if (score >= 0.3) return 'poor';
  return 'critical';
};

/**
 * Generate detailed feedback
 */
const generateFeedback = (scores, parameters, optimal) => {
  const feedback = [];

  // Water feedback
  if (scores.waterScore < 0.7) {
    if (parameters.water < optimal.water.min) {
      feedback.push({
        category: 'water',
        priority: 'high',
        message: 'Water deficit detected. Increase irrigation to meet crop needs.',
        impact: 'severe'
      });
    } else if (parameters.water > optimal.water.max) {
      feedback.push({
        category: 'water',
        priority: 'high',
        message: 'Excess water causing waterlogging. Reduce irrigation or improve drainage.',
        impact: 'severe'
      });
    } else {
      feedback.push({
        category: 'water',
        priority: 'medium',
        message: 'Water level could be optimized for better growth.',
        impact: 'moderate'
      });
    }
  }

  // NPK feedback
  ['nitrogen', 'phosphorus', 'potassium'].forEach((nutrient) => {
    const score = scores[`${nutrient}Score`];
    if (score < 0.7) {
      const param = optimal[nutrient];
      if (parameters[nutrient] < param.min) {
        feedback.push({
          category: nutrient,
          priority: 'high',
          message: `${nutrient.charAt(0).toUpperCase() + nutrient.slice(1)} deficiency. Increase application to at least ${param.optimal} ${param.unit}.`,
          impact: 'severe'
        });
      } else if (parameters[nutrient] > param.max) {
        feedback.push({
          category: nutrient,
          priority: 'medium',
          message: `Excess ${nutrient} may cause toxicity. Reduce to around ${param.optimal} ${param.unit}.`,
          impact: 'moderate'
        });
      }
    }
  });

  // pH feedback
  if (scores.phScore < 0.7) {
    if (parameters.ph < optimal.ph.min) {
      feedback.push({
        category: 'ph',
        priority: 'high',
        message: 'Soil is too acidic. Add lime to raise pH.',
        impact: 'severe'
      });
    } else if (parameters.ph > optimal.ph.max) {
      feedback.push({
        category: 'ph',
        priority: 'high',
        message: 'Soil is too alkaline. Add sulfur or organic matter to lower pH.',
        impact: 'severe'
      });
    }
  }

  // Temperature feedback
  if (scores.tempScore < 0.7) {
    if (parameters.temperature < optimal.temperature.min) {
      feedback.push({
        category: 'temperature',
        priority: 'medium',
        message: 'Temperature is too low for optimal growth. Consider delaying planting.',
        impact: 'moderate'
      });
    } else if (parameters.temperature > optimal.temperature.max) {
      feedback.push({
        category: 'temperature',
        priority: 'medium',
        message: 'Temperature is too high. Consider shade or irrigation to cool plants.',
        impact: 'moderate'
      });
    }
  }

  // NPK balance feedback
  if (scores.npkBalanceScore < 0.7) {
    feedback.push({
      category: 'balance',
      priority: 'medium',
      message: 'NPK nutrients are imbalanced. Adjust ratios for better nutrient uptake.',
      impact: 'moderate'
    });
  }

  // Overall feedback
  if (scores.overallScore >= 90) {
    feedback.push({
      category: 'overall',
      priority: 'info',
      message: 'Excellent! All parameters are optimized for maximum yield.',
      impact: 'positive'
    });
  } else if (scores.overallScore >= 70) {
    feedback.push({
      category: 'overall',
      priority: 'info',
      message: 'Good performance. Minor adjustments could further improve yield.',
      impact: 'positive'
    });
  } else if (scores.overallScore < 50) {
    feedback.push({
      category: 'overall',
      priority: 'critical',
      message: 'Multiple critical issues detected. Major adjustments needed.',
      impact: 'severe'
    });
  }

  return feedback.sort((a, b) => {
    const priority = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
    return priority[b.priority] - priority[a.priority];
  });
};

export default { simulateCropGrowth };
