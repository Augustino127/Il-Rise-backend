/**
 * farm.js
 * Routes pour la gestion de la ferme V3
 * IleRise - NASA Space Apps Challenge 2025
 */

import express from 'express';
import {
  initializeFarm,
  saveFarm,
  loadFarm,
  updateFarm,
  logAction,
  recordHarvest,
  getFarmStats,
  resetFarm
} from '../controllers/farmController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(verifyToken);

/**
 * POST /api/farm/init
 * Initialiser une nouvelle ferme ou récupérer l'existante
 */
router.post('/init', initializeFarm);

/**
 * POST /api/farm/save
 * Sauvegarder l'état complet de la ferme
 */
router.post('/save', saveFarm);

/**
 * GET /api/farm/load
 * Charger l'état de la ferme
 */
router.get('/load', loadFarm);

/**
 * PATCH /api/farm/update
 * Mise à jour partielle (quick save)
 */
router.patch('/update', updateFarm);

/**
 * POST /api/farm/action
 * Logger une action agricole
 */
router.post('/action', logAction);

/**
 * POST /api/farm/harvest
 * Enregistrer une récolte et mettre à jour les pièces
 */
router.post('/harvest', recordHarvest);

/**
 * GET /api/farm/stats
 * Obtenir les statistiques de la ferme
 */
router.get('/stats', getFarmStats);

/**
 * DELETE /api/farm/reset
 * Réinitialiser la ferme
 */
router.delete('/reset', resetFarm);

export default router;
