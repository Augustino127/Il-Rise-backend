import Joi from 'joi';

/**
 * Middleware factory to validate request data using Joi schemas
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
export const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Replace request data with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Validation schemas for authentication
export const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Username can only contain letters, numbers, and underscores'
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .required(),
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required(),
  password: Joi.string()
    .required()
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
});

// Validation schemas for game
export const gameSimulationSchema = Joi.object({
  cropId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid crop ID format'
    }),
  parameters: Joi.object({
    water: Joi.number().min(0).required(),
    nitrogen: Joi.number().min(0).required(),
    phosphorus: Joi.number().min(0).required(),
    potassium: Joi.number().min(0).required(),
    ph: Joi.number().min(0).max(14).required(),
    temperature: Joi.number().required()
  }).required(),
  level: Joi.number().min(1).max(3).default(1)
});

// Validation schemas for progress
export const updateProgressSchema = Joi.object({
  cropId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  score: Joi.number().min(0).max(100).required(),
  competenceGains: Joi.object({
    water: Joi.number().min(0).max(100),
    npk: Joi.number().min(0).max(100),
    soil: Joi.number().min(0).max(100),
    rotation: Joi.number().min(0).max(100),
    nasa: Joi.number().min(0).max(100)
  }).default({})
});

// Validation schemas for culture
export const createCultureSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().max(500).required(),
  parameters: Joi.object({
    ph: Joi.object({
      min: Joi.number().min(0).max(14).required(),
      optimal: Joi.number().min(0).max(14).required(),
      max: Joi.number().min(0).max(14).required()
    }).required(),
    water: Joi.object({
      min: Joi.number().min(0).required(),
      optimal: Joi.number().min(0).required(),
      max: Joi.number().min(0).required(),
      unit: Joi.string().default('mm/saison')
    }).required(),
    nitrogen: Joi.object({
      min: Joi.number().min(0).required(),
      optimal: Joi.number().min(0).required(),
      max: Joi.number().min(0).required(),
      unit: Joi.string().default('kg/ha')
    }).required(),
    phosphorus: Joi.object({
      min: Joi.number().min(0).required(),
      optimal: Joi.number().min(0).required(),
      max: Joi.number().min(0).required(),
      unit: Joi.string().default('kg/ha')
    }).required(),
    potassium: Joi.object({
      min: Joi.number().min(0).required(),
      optimal: Joi.number().min(0).required(),
      max: Joi.number().min(0).required(),
      unit: Joi.string().default('kg/ha')
    }).required(),
    temperature: Joi.object({
      min: Joi.number().required(),
      optimal: Joi.number().required(),
      max: Joi.number().required(),
      unit: Joi.string().default('°C')
    }).required(),
    growthDays: Joi.number().min(1).required()
  }).required(),
  yields: Joi.object({
    min: Joi.number().min(0).required(),
    avg: Joi.number().min(0).required(),
    max: Joi.number().min(0).required(),
    unit: Joi.string().default('t/ha')
  }).required(),
  images: Joi.array().items(Joi.string()).default([]),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  category: Joi.string().valid('cereale', 'legume', 'fruit', 'tubercule', 'oleagineux').required()
});

// Validation schemas for user profile update
export const updateProfileSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/),
  email: Joi.string()
    .email()
    .lowercase()
}).min(1);

export default {
  validateRequest,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  gameSimulationSchema,
  updateProgressSchema,
  createCultureSchema,
  updateProfileSchema
};
