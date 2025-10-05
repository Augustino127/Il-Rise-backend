import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'game_played',
      'level_unlocked',
      'achievement_earned',
      'crop_mastered',
      'competence_improved',
      'perfect_score',
      'streak_achieved'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying by user and timestamp
historySchema.index({ userId: 1, timestamp: -1 });

// Static method to add history entry
historySchema.statics.addEntry = async function(userId, action, details = {}) {
  return await this.create({
    userId,
    action,
    details
  });
};

// Static method to get user history
historySchema.statics.getUserHistory = async function(userId, limit = 50, skip = 0) {
  return await this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

// Static method to get history by action type
historySchema.statics.getHistoryByAction = async function(userId, action, limit = 20) {
  return await this.find({ userId, action })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

const History = mongoose.model('History', historySchema);

export default History;
