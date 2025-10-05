import mongoose from 'mongoose';

const knowledgeCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['water', 'npk', 'soil', 'rotation', 'nasa'],
    index: true
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'expert'],
    index: true
  },
  audioUrl: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^(https?:\/\/|\/audio\/)/.test(v);
      },
      message: 'Audio URL must be valid'
    }
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^(https?:\/\/|\/images\/)/.test(v);
      },
      message: 'Image must be a valid URL or path'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  relatedCrops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Culture'
  }],
  order: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
knowledgeCardSchema.index({ category: 1, level: 1, order: 1 });
knowledgeCardSchema.index({ active: 1 });

// Static method to get cards by category and level
knowledgeCardSchema.statics.getCardsByCategory = async function(category, level = null) {
  const query = { category, active: true };

  if (level) {
    query.level = level;
  }

  return await this.find(query)
    .sort({ order: 1, createdAt: 1 })
    .populate('relatedCrops', 'name')
    .lean();
};

// Static method to get recommended cards based on competence level
knowledgeCardSchema.statics.getRecommendedCards = async function(competenceLevel) {
  let level;

  if (competenceLevel < 30) {
    level = 'beginner';
  } else if (competenceLevel < 70) {
    level = 'intermediate';
  } else {
    level = 'expert';
  }

  return await this.find({ level, active: true })
    .sort({ order: 1 })
    .limit(5)
    .lean();
};

const KnowledgeCard = mongoose.model('KnowledgeCard', knowledgeCardSchema);

export default KnowledgeCard;
