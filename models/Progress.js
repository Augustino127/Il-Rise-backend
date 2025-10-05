import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Culture',
    required: true,
    index: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 3,
    default: 1
  },
  stars: {
    type: Number,
    min: 0,
    max: 3,
    default: 0
  },
  unlocked: {
    type: Boolean,
    default: false
  },
  consecutiveSuccess: {
    type: Number,
    min: 0,
    max: 3,
    default: 0
  },
  competences: {
    water: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    npk: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    soil: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    rotation: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    nasa: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  competenceStats: {
    water: {
      totalGames: { type: Number, default: 0 },
      goodScores: { type: Number, default: 0 }
    },
    npk: {
      totalGames: { type: Number, default: 0 },
      goodScores: { type: Number, default: 0 }
    },
    ph: {
      totalGames: { type: Number, default: 0 },
      goodScores: { type: Number, default: 0 }
    },
    rotation: {
      levelsCompleted: { type: Number, default: 0 }
    },
    nasa: {
      nasaHelpUsed: { type: Number, default: 0 }
    }
  },
  unlockedKnowledgeCards: [{
    cardId: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now }
  }],
  completedLevels: [{
    type: String
  }],
  highScores: {
    type: Map,
    of: {
      score: Number,
      stars: Number
    },
    default: {}
  },
  lastPlayed: {
    type: Date,
    default: Date.now
  },
  totalGamesPlayed: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient user+crop queries
progressSchema.index({ userId: 1, cropId: 1 }, { unique: true });

// Method to update progress after a game
progressSchema.methods.updateAfterGame = function(score, competenceGains = {}) {
  // Update total games played
  this.totalGamesPlayed += 1;

  // Update best score
  if (score > this.bestScore) {
    this.bestScore = score;
  }

  // Update stars based on score
  if (score >= 90) {
    this.stars = Math.max(this.stars, 3);
    this.consecutiveSuccess = Math.min(this.consecutiveSuccess + 1, 3);
  } else if (score >= 70) {
    this.stars = Math.max(this.stars, 2);
    this.consecutiveSuccess = Math.min(this.consecutiveSuccess + 1, 3);
  } else if (score >= 50) {
    this.stars = Math.max(this.stars, 1);
    this.consecutiveSuccess = 0;
  } else {
    this.consecutiveSuccess = 0;
  }

  // Update competences
  Object.keys(competenceGains).forEach(key => {
    if (this.competences[key] !== undefined) {
      this.competences[key] = Math.min(
        this.competences[key] + competenceGains[key],
        100
      );
    }
  });

  // Update last played
  this.lastPlayed = new Date();

  return this;
};

// Static method to get or create progress
progressSchema.statics.getOrCreate = async function(userId, cropId) {
  let progress = await this.findOne({ userId, cropId });

  if (!progress) {
    progress = await this.create({
      userId,
      cropId,
      unlocked: false
    });
  }

  return progress;
};

// Static method to get all user progress
progressSchema.statics.getAllUserProgress = async function(userId) {
  return await this.find({ userId })
    .populate('cropId')
    .sort({ unlocked: -1, lastPlayed: -1 })
    .lean();
};

// Static method to unlock next level
progressSchema.methods.unlockNextLevel = function() {
  if (this.level < 3 && this.consecutiveSuccess >= 3) {
    this.level += 1;
    this.consecutiveSuccess = 0;
    return true;
  }
  return false;
};

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
