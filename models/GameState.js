import mongoose from 'mongoose';

const gameStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  currentDay: {
    type: Number,
    default: 1,
    min: 1
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  resources: {
    money: { type: Number, default: 1000 },
    water: { type: Number, default: 100 },
    npk: { type: Number, default: 100 },
    compost: { type: Number, default: 0 },
    pesticides: { type: Number, default: 0 },
    seeds: { type: Map, of: Number, default: {} },
    animalProducts: {
      eggs: { type: Number, default: 0 },
      milk: { type: Number, default: 0 }
    },
    fertilizers: {
      organic: { type: Number, default: 0 },
      chemical: { type: Number, default: 0 }
    },
    harvest: { type: Map, of: Number, default: {} }
  },
  plots: [{
    plotId: { type: Number, required: true },
    unlocked: { type: Boolean, default: false },
    isPlanted: { type: Boolean, default: false },
    isPlowed: { type: Boolean, default: false },
    cropId: { type: String, default: null },
    daysSincePlant: { type: Number, default: 0 },
    growthStage: { type: Number, default: 0 },
    plantCount: { type: Number, default: 0 },
    health: { type: Number, default: 100 },
    soilMoisture: { type: Number, default: 30 },
    npkLevel: { type: Number, default: 50 },
    ph: { type: Number, default: 6.5 },
    soilQuality: { type: Number, default: 70 },
    soilOrganic: { type: Number, default: 50 },
    weedLevel: { type: Number, default: 0 },
    pestLevel: { type: Number, default: 0 },
    pestResistance: { type: Number, default: 0 },
    biomass: { type: Number, default: 0 },
    LAI: { type: Number, default: 0 }
  }],
  livestock: {
    chickens: {
      count: { type: Number, default: 0 },
      maxCount: { type: Number, default: 0 },
      age: { type: Number, default: 0 },
      feedLevel: { type: Number, default: 100 },
      health: { type: Number, default: 100 },
      unlocked: { type: Boolean, default: false }
    },
    goats: {
      count: { type: Number, default: 0 },
      maxCount: { type: Number, default: 0 },
      age: { type: Number, default: 0 },
      feedLevel: { type: Number, default: 100 },
      health: { type: Number, default: 100 },
      unlocked: { type: Boolean, default: false }
    },
    infrastructure: {
      chickenCoop: {
        level: { type: Number, default: 0 },
        unlocked: { type: Boolean, default: false }
      },
      compostPit: {
        level: { type: Number, default: 0 },
        unlocked: { type: Boolean, default: false }
      },
      goatShed: {
        level: { type: Number, default: 0 },
        unlocked: { type: Boolean, default: false }
      }
    },
    production: {
      manure: { type: Number, default: 0 },
      compost: { type: Number, default: 0 },
      eggs: { type: Number, default: 0 },
      milk: { type: Number, default: 0 }
    }
  },
  weather: {
    condition: { type: String, default: 'sunny' },
    temperature: { type: Number, default: 28 },
    precipitation: { type: Number, default: 0 }
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour recherches efficaces
gameStateSchema.index({ userId: 1, updatedAt: -1 });

// Méthode pour sauvegarder l'état
gameStateSchema.statics.saveState = async function(userId, state) {
  return await this.findOneAndUpdate(
    { userId },
    { ...state, lastUpdate: new Date() },
    { upsert: true, new: true }
  );
};

// Méthode pour charger l'état
gameStateSchema.statics.loadState = async function(userId) {
  return await this.findOne({ userId }).lean();
};

const GameState = mongoose.model('GameState', gameStateSchema);

export default GameState;
