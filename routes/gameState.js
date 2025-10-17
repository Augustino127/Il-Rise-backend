import express from 'express';
import {
  saveGameState,
  loadGameState,
  deleteGameState,
  updateResources,
  updatePlot,
  updateLivestock
} from '../controllers/gameStateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes de sauvegarde/chargement
router.post('/save', saveGameState);
router.get('/load', loadGameState);
router.delete('/reset', deleteGameState);

// Routes de mise à jour spécifiques
router.put('/resources', updateResources);
router.put('/plot/:plotId', updatePlot);
router.put('/livestock', updateLivestock);

export default router;
