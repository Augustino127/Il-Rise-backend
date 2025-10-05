import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Authentication rate limiter (stricter for login/register)
 * 50 requests per 15 minutes (increased for development)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Game play rate limiter
 * 30 requests per 15 minutes
 */
export const gameLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: {
    success: false,
    message: 'Too many game requests, please take a break.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Admin operations rate limiter
 * 20 requests per 15 minutes
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many admin operations, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export default {
  generalLimiter,
  authLimiter,
  gameLimiter,
  adminLimiter
};
