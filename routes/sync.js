import express from 'express';
import { syncProfile, getProfile, saveGameSession } from '../controllers/syncController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(verifyToken);

// POST /api/sync/profile - Synchroniser le profil complet
router.post('/profile', syncProfile);

// GET /api/sync/profile - Récupérer le profil complet
router.get('/profile', getProfile);

// POST /api/sync/game - Sauvegarder une session de jeu
router.post('/game', saveGameSession);

export default router;
