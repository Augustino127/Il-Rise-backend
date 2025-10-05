/**
 * FarmState.js
 * Modèle pour sauvegarder l'état complet de la ferme V3
 * IleRise - NASA Space Apps Challenge 2025
 */

import mongoose from 'mongoose';

const plotSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  unlocked: { type: Boolean, default: false },
  isPlanted: { type: Boolean, default: false },
  isPlowed: { type: Boolean, default: false },

  // Culture actuelle
  crop: {
    id: String,
    name: Object,
    growthDuration: Number,
    emoji: String
  },

  daysSincePlant: { type: Number, default: 0 },
  growthStage: { type: Number, default: 0 }, // 0-5
  plantCount: { type: Number, default: 0 },
  health: { type: Number, default: 100, min: 0, max: 100 },

  // État du sol
  soilMoisture: { type: Number, default: 30, min: 0, max: 100 },
  npkLevel: { type: Number, default: 50, min: 0, max: 150 },
  ph: { type: Number, default: 6.5, min: 4, max: 8 },
  soilQuality: { type: Number, default: 70, min: 0, max: 100 },
  soilOrganic: { type: Number, default: 50, min: 0, max: 100 },
  weedLevel: { type: Number, default: 0, min: 0, max: 100 },
  pestLevel: { type: Number, default: 0, min: 0, max: 100 },
  pestResistance: { type: Number, default: 0, min: 0, max: 100 },

  // Simulation
  biomass: { type: Number, default: 0 },
  LAI: { type: Number, default: 0 },

  actionsHistory: [{ type: String }]
}, { _id: false });

const resourcesSchema = new mongoose.Schema({
  money: { type: Number, default: 500, min: 0 },
  water: { type: Number, default: 1000, min: 0 },

  seeds: {
    maize: { type: Number, default: 50, min: 0 },
    cowpea: { type: Number, default: 30, min: 0 },
    rice: { type: Number, default: 20, min: 0 },
    cassava: { type: Number, default: 15, min: 0 },
    cacao: { type: Number, default: 10, min: 0 },
    cotton: { type: Number, default: 25, min: 0 }
  },

  fertilizers: {
    organic: { type: Number, default: 100, min: 0 },
    npk: { type: Number, default: 50, min: 0 },
    urea: { type: Number, default: 30, min: 0 },
    phosphate: { type: Number, default: 20, min: 0 }
  },

  pesticides: {
    natural: { type: Number, default: 10, min: 0 },
    chemical: { type: Number, default: 5, min: 0 }
  },

  harvest: {
    maize: { type: Number, default: 0, min: 0 },
    cowpea: { type: Number, default: 0, min: 0 },
    rice: { type: Number, default: 0, min: 0 },
    cassava: { type: Number, default: 0, min: 0 },
    cacao: { type: Number, default: 0, min: 0 },
    cotton: { type: Number, default: 0, min: 0 }
  },

  animalProducts: {
    eggs: { type: Number, default: 0, min: 0 },
    milk: { type: Number, default: 0, min: 0 },
    manure: { type: Number, default: 0, min: 0 }
  }
}, { _id: false });

const livestockSchema = new mongoose.Schema({
  infrastructure: {
    chickenCoop: {
      unlocked: { type: Boolean, default: false },
      level: { type: Number, default: 1, min: 1, max: 3 },
      capacity: { type: Number, default: 20 }
    }
  },

  animals: {
    chickens: {
      count: { type: Number, default: 0, min: 0 },
      health: { type: Number, default: 100, min: 0, max: 100 },
      feedLevel: { type: Number, default: 100, min: 0, max: 100 },
      happinessLevel: { type: Number, default: 100, min: 0, max: 100 }
    }
  },

  production: {
    eggs: { type: Number, default: 0 }
  }
}, { _id: false });

const farmStateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // Informations de localisation
  location: {
    city: { type: String, required: true },
    ndvi: { type: Number },
    temperature: { type: Number },
    precipitation: { type: Number },
    soilMoisture: { type: Number }
  },

  // Simulation temporelle
  time: {
    currentDay: { type: Number, default: 0, min: 0 },
    currentHour: { type: Number, default: 6, min: 0, max: 23 },
    speed: { type: Number, default: 2, min: 1, max: 8 },
    season: { type: String, default: 'dry', enum: ['dry', 'transition', 'rainy'] }
  },

  // Niveau joueur
  playerLevel: { type: Number, default: 1, min: 1 },

  // Parcelles (4 parcelles max)
  plots: [plotSchema],

  // Ressources
  resources: { type: resourcesSchema, default: () => ({}) },

  // Élevage
  livestock: { type: livestockSchema, default: () => ({}) },

  // Marché (modificateurs de prix)
  market: {
    priceModifiers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    trends: {
      type: Map,
      of: String,
      default: {}
    }
  },

  // Actions actives
  activeActions: [{
    id: String,
    actionName: String,
    plotId: Number,
    startDay: Number,
    endDay: Number,
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' }
  }],

  // Métadonnées
  isPaused: { type: Boolean, default: false },
  lastSaved: { type: Date, default: Date.now },
  totalPlayTime: { type: Number, default: 0 }, // en secondes

}, {
  timestamps: true
});

// Index pour optimiser les requêtes
farmStateSchema.index({ userId: 1 });
farmStateSchema.index({ 'location.city': 1 });

// Méthode pour mettre à jour le temps de jeu
farmStateSchema.methods.updatePlayTime = function(seconds) {
  this.totalPlayTime += seconds;
  this.lastSaved = new Date();
};

// Méthode pour obtenir un résumé de la ferme
farmStateSchema.methods.getSummary = function() {
  return {
    location: this.location.city,
    day: this.time.currentDay,
    money: this.resources.money,
    activePlots: this.plots.filter(p => p.isPlanted).length,
    totalHarvest: Object.values(this.resources.harvest).reduce((sum, val) => sum + val, 0)
  };
};

// Méthode statique pour créer ou obtenir l'état de la ferme
farmStateSchema.statics.getOrCreate = async function(userId, locationData) {
  let farmState = await this.findOne({ userId });

  if (!farmState) {
    // Créer nouvelle ferme avec données initiales
    farmState = await this.create({
      userId,
      location: locationData,
      plots: [
        {
          id: 1,
          name: 'Parcelle 1',
          size: 100,
          unlocked: true,
          isPlanted: false,
          isPlowed: false,
          soilMoisture: 30,
          npkLevel: 50,
          ph: 6.5,
          soilQuality: 70,
          soilOrganic: 50,
          weedLevel: 0,
          pestLevel: 0,
          pestResistance: 0,
          health: 100,
          biomass: 0,
          LAI: 0,
          actionsHistory: []
        },
        {
          id: 2,
          name: 'Parcelle 2',
          size: 100,
          unlocked: false,
          isPlanted: false,
          isPlowed: false,
          soilMoisture: 30,
          npkLevel: 50,
          ph: 6.5,
          soilQuality: 70,
          soilOrganic: 50,
          weedLevel: 0,
          pestLevel: 0,
          pestResistance: 0,
          health: 100,
          biomass: 0,
          LAI: 0,
          actionsHistory: []
        },
        {
          id: 3,
          name: 'Parcelle 3',
          size: 150,
          unlocked: false,
          isPlanted: false,
          isPlowed: false,
          soilMoisture: 30,
          npkLevel: 50,
          ph: 6.5,
          soilQuality: 70,
          soilOrganic: 50,
          weedLevel: 0,
          pestLevel: 0,
          pestResistance: 0,
          health: 100,
          biomass: 0,
          LAI: 0,
          actionsHistory: []
        },
        {
          id: 4,
          name: 'Parcelle 4',
          size: 150,
          unlocked: false,
          isPlanted: false,
          isPlowed: false,
          soilMoisture: 30,
          npkLevel: 50,
          ph: 6.5,
          soilQuality: 70,
          soilOrganic: 50,
          weedLevel: 0,
          pestLevel: 0,
          pestResistance: 0,
          health: 100,
          biomass: 0,
          LAI: 0,
          actionsHistory: []
        }
      ]
    });
  }

  return farmState;
};

const FarmState = mongoose.model('FarmState', farmStateSchema);

export default FarmState;
