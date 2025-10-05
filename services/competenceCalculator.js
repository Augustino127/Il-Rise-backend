/**
 * Competence Calculator Service
 * Calculates skill gains based on game performance in 5 competence areas:
 * - Water management
 * - NPK fertilization
 * - Soil management (pH)
 * - Crop rotation
 * - NASA satellite data interpretation
 */

/**
 * Main function to calculate competence gains
 * @param {Object} crop - Crop data
 * @param {Object} parameters - User input parameters
 * @param {Object} simulationResult - Results from simulation engine
 * @param {Number} level - Difficulty level
 * @returns {Object} Competence gains for each skill
 */
export const calculateCompetenceGains = (crop, parameters, simulationResult, level) => {
  const baseGain = getBaseGain(level);
  const scoreMultiplier = getScoreMultiplier(simulationResult.score);

  // Calculate individual competence gains
  const waterGain = calculateWaterCompetence(
    simulationResult.details.water,
    baseGain,
    scoreMultiplier
  );

  const npkGain = calculateNPKCompetence(
    simulationResult.details,
    baseGain,
    scoreMultiplier
  );

  const soilGain = calculateSoilCompetence(
    simulationResult.details.ph,
    baseGain,
    scoreMultiplier
  );

  const rotationGain = calculateRotationCompetence(
    crop,
    level,
    baseGain,
    scoreMultiplier
  );

  const nasaGain = calculateNASACompetence(
    simulationResult.details,
    level,
    baseGain,
    scoreMultiplier
  );

  return {
    water: Math.round(waterGain),
    npk: Math.round(npkGain),
    soil: Math.round(soilGain),
    rotation: Math.round(rotationGain),
    nasa: Math.round(nasaGain)
  };
};

/**
 * Get base gain amount based on level
 */
const getBaseGain = (level) => {
  const baseGains = {
    1: 5,   // Easy - larger gains
    2: 4,   // Medium - moderate gains
    3: 3    // Hard - smaller gains but more valuable
  };

  return baseGains[level] || baseGains[1];
};

/**
 * Get score multiplier based on performance
 */
const getScoreMultiplier = (score) => {
  if (score >= 90) return 2.0;      // Excellent performance
  if (score >= 70) return 1.5;      // Good performance
  if (score >= 50) return 1.0;      // Fair performance
  if (score >= 30) return 0.5;      // Poor performance
  return 0.2;                        // Very poor performance
};

/**
 * Calculate water management competence gain
 */
const calculateWaterCompetence = (waterDetails, baseGain, scoreMultiplier) => {
  let gain = baseGain;

  // Bonus for excellent water management
  if (waterDetails.score >= 90) {
    gain += 3;
  } else if (waterDetails.score >= 70) {
    gain += 2;
  } else if (waterDetails.score >= 50) {
    gain += 1;
  }

  // Apply score multiplier
  gain *= scoreMultiplier;

  // Penalty for poor performance
  if (waterDetails.status === 'critical' || waterDetails.status === 'poor') {
    gain *= 0.3;
  }

  return Math.max(1, gain); // Minimum 1 point
};

/**
 * Calculate NPK fertilization competence gain
 */
const calculateNPKCompetence = (details, baseGain, scoreMultiplier) => {
  const { nitrogen, phosphorus, potassium, npkBalance } = details;

  // Average NPK scores
  const avgNPKScore = (nitrogen.score + phosphorus.score + potassium.score) / 3;

  let gain = baseGain;

  // Bonus for excellent NPK management
  if (avgNPKScore >= 90) {
    gain += 3;
  } else if (avgNPKScore >= 70) {
    gain += 2;
  } else if (avgNPKScore >= 50) {
    gain += 1;
  }

  // Bonus for good NPK balance
  if (npkBalance.score >= 80) {
    gain += 2;
  } else if (npkBalance.score >= 60) {
    gain += 1;
  }

  // Apply score multiplier
  gain *= scoreMultiplier;

  // Penalty for poor performance
  if (avgNPKScore < 30) {
    gain *= 0.3;
  }

  return Math.max(1, gain);
};

/**
 * Calculate soil management competence gain
 */
const calculateSoilCompetence = (phDetails, baseGain, scoreMultiplier) => {
  let gain = baseGain;

  // Bonus for excellent pH management
  if (phDetails.score >= 90) {
    gain += 3;
  } else if (phDetails.score >= 70) {
    gain += 2;
  } else if (phDetails.score >= 50) {
    gain += 1;
  }

  // Apply score multiplier
  gain *= scoreMultiplier;

  // Penalty for poor pH management
  if (phDetails.status === 'critical' || phDetails.status === 'poor') {
    gain *= 0.4;
  }

  return Math.max(1, gain);
};

/**
 * Calculate crop rotation competence gain
 */
const calculateRotationCompetence = (crop, level, baseGain, scoreMultiplier) => {
  let gain = baseGain * 0.8; // Slightly lower base gain

  // Bonus for completing different crop categories
  // This would ideally check user's history, but for now use level as proxy
  if (level >= 2) {
    gain += 2;
  }

  if (level === 3) {
    gain += 1;
  }

  // Bonus based on crop category
  const categoryBonus = {
    'cereale': 1,
    'legume': 2,      // Legumes are important for rotation
    'tubercule': 1,
    'oleagineux': 1,
    'fruit': 1
  };

  gain += categoryBonus[crop.category] || 0;

  // Apply score multiplier
  gain *= scoreMultiplier;

  return Math.max(1, gain);
};

/**
 * Calculate NASA data interpretation competence gain
 */
const calculateNASACompetence = (details, level, baseGain, scoreMultiplier) => {
  let gain = baseGain * 0.7; // Lower base gain as it's more advanced

  // NASA competence based on overall environmental understanding
  const { temperature, water } = details;

  // Bonus for understanding environmental factors
  if (temperature.score >= 80 && water.score >= 80) {
    gain += 4;
  } else if (temperature.score >= 60 && water.score >= 60) {
    gain += 2;
  } else if (temperature.score >= 40 && water.score >= 40) {
    gain += 1;
  }

  // Higher levels give more NASA competence (more complex data interpretation)
  if (level === 3) {
    gain *= 1.5;
  } else if (level === 2) {
    gain *= 1.2;
  }

  // Apply score multiplier
  gain *= scoreMultiplier;

  return Math.max(1, gain);
};

/**
 * Calculate bonus competence gains for achievements
 */
export const calculateAchievementBonus = (achievementType) => {
  const bonuses = {
    'first_win': { water: 5, npk: 5, soil: 5, rotation: 5, nasa: 5 },
    'perfect_score': { water: 10, npk: 10, soil: 10, rotation: 10, nasa: 10 },
    'master_water': { water: 20 },
    'master_npk': { npk: 20 },
    'master_soil': { soil: 20 },
    'master_rotation': { rotation: 20 },
    'master_nasa': { nasa: 20 },
    'three_stars_5_crops': { water: 5, npk: 5, soil: 5, rotation: 10, nasa: 5 },
    'win_streak_5': { water: 3, npk: 3, soil: 3, rotation: 3, nasa: 3 },
    'win_streak_10': { water: 5, npk: 5, soil: 5, rotation: 5, nasa: 5 }
  };

  return bonuses[achievementType] || {};
};

/**
 * Get competence level label
 */
export const getCompetenceLevel = (competenceScore) => {
  if (competenceScore >= 90) return 'expert';
  if (competenceScore >= 70) return 'advanced';
  if (competenceScore >= 50) return 'intermediate';
  if (competenceScore >= 30) return 'beginner';
  return 'novice';
};

/**
 * Get recommendations based on competence scores
 */
export const getCompetenceRecommendations = (competences) => {
  const recommendations = [];

  Object.entries(competences).forEach(([skill, score]) => {
    if (score < 30) {
      recommendations.push({
        skill,
        level: 'urgent',
        message: `Focus on improving ${skill} competence - currently at novice level.`,
        suggestedAction: 'Review basic concepts and practice more games.'
      });
    } else if (score < 50) {
      recommendations.push({
        skill,
        level: 'important',
        message: `Continue developing ${skill} competence to reach intermediate level.`,
        suggestedAction: 'Try higher difficulty levels and study knowledge cards.'
      });
    } else if (score < 70) {
      recommendations.push({
        skill,
        level: 'moderate',
        message: `Good progress in ${skill}! Keep practicing to reach advanced level.`,
        suggestedAction: 'Challenge yourself with expert-level content.'
      });
    }
  });

  // Find strongest and weakest skills
  const entries = Object.entries(competences);
  const strongest = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
  const weakest = entries.reduce((min, curr) => curr[1] < min[1] ? curr : min);

  recommendations.push({
    skill: 'overall',
    level: 'info',
    message: `Your strongest skill is ${strongest[0]} (${strongest[1]}/100). Focus on improving ${weakest[0]} (${weakest[1]}/100).`,
    suggestedAction: 'Balanced competence development leads to better overall performance.'
  });

  return recommendations;
};

export default {
  calculateCompetenceGains,
  calculateAchievementBonus,
  getCompetenceLevel,
  getCompetenceRecommendations
};
