import mongoose from 'mongoose';

const cultureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Culture name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 500
  },
  parameters: {
    ph: {
      min: {
        type: Number,
        required: true,
        min: 0,
        max: 14
      },
      optimal: {
        type: Number,
        required: true,
        min: 0,
        max: 14
      },
      max: {
        type: Number,
        required: true,
        min: 0,
        max: 14
      }
    },
    water: {
      min: {
        type: Number,
        required: true,
        min: 0
      },
      optimal: {
        type: Number,
        required: true,
        min: 0
      },
      max: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        default: 'mm/saison'
      }
    },
    nitrogen: {
      min: {
        type: Number,
        required: true,
        min: 0
      },
      optimal: {
        type: Number,
        required: true,
        min: 0
      },
      max: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        default: 'kg/ha'
      }
    },
    phosphorus: {
      min: {
        type: Number,
        required: true,
        min: 0
      },
      optimal: {
        type: Number,
        required: true,
        min: 0
      },
      max: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        default: 'kg/ha'
      }
    },
    potassium: {
      min: {
        type: Number,
        required: true,
        min: 0
      },
      optimal: {
        type: Number,
        required: true,
        min: 0
      },
      max: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        default: 'kg/ha'
      }
    },
    temperature: {
      min: {
        type: Number,
        required: true
      },
      optimal: {
        type: Number,
        required: true
      },
      max: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        default: '°C'
      }
    },
    growthDays: {
      type: Number,
      required: true,
      min: 1
    }
  },
  yields: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    avg: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      default: 't/ha'
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
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['cereale', 'legume', 'fruit', 'tubercule', 'oleagineux'],
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
cultureSchema.index({ name: 1 });
cultureSchema.index({ category: 1, difficulty: 1 });
cultureSchema.index({ active: 1 });

// Method to check if parameters are within range
cultureSchema.methods.isParameterInRange = function(parameter, value) {
  if (!this.parameters[parameter]) {
    return { valid: false, message: 'Invalid parameter' };
  }

  const param = this.parameters[parameter];

  if (value < param.min || value > param.max) {
    return { valid: false, message: `Out of range (${param.min}-${param.max})` };
  }

  return { valid: true };
};

// Static method to get active cultures
cultureSchema.statics.getActiveCultures = async function() {
  return await this.find({ active: true }).sort({ category: 1, name: 1 });
};

const Culture = mongoose.model('Culture', cultureSchema);

export default Culture;
