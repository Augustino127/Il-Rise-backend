# IleRise Backend API

Backend Node.js/Express pour le jeu éducatif d'agriculture IleRise.

## Technologies

- **Node.js** v20+ avec ES Modules
- **Express.js** - Framework web
- **MongoDB** avec Mongoose - Base de données
- **JWT** - Authentification
- **Bcrypt** - Hachage des mots de passe
- **Joi** - Validation des données
- **Helmet** - Sécurité HTTP
- **express-rate-limit** - Protection contre les abus

## Structure du projet

```
ilerise-backend/
├── config/              # Configuration (database, jwt)
├── controllers/         # Logique métier
├── middleware/          # Middlewares (auth, validation, rate-limit)
├── models/              # Schémas MongoDB
│   ├── User.js         # Utilisateurs
│   ├── Progress.js     # Progression des joueurs
│   ├── History.js      # Historique des actions
│   ├── Culture.js      # Cultures agricoles
│   ├── KnowledgeCard.js # Cartes de connaissance
│   └── Achievement.js  # Succès/Achievements
├── routes/              # Routes API
├── services/            # Services métier
│   ├── simulationEngine.js      # Moteur de simulation agricole
│   └── competenceCalculator.js  # Calcul des compétences
├── server.js            # Point d'entrée
├── .env.example         # Variables d'environnement exemple
└── package.json
```

## Installation

1. Cloner le dépôt et naviguer dans le dossier backend:
```bash
cd C:\Projet\ilerise-backend
```

2. Installer les dépendances:
```bash
npm install
```

3. Créer le fichier `.env` à partir de `.env.example`:
```bash
cp .env.example .env
```

4. Configurer les variables d'environnement dans `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ilerise
JWT_SECRET=votre_secret_jwt
JWT_REFRESH_SECRET=votre_secret_refresh
FRONTEND_URL=http://localhost:3000
```

5. Démarrer MongoDB localement ou utiliser MongoDB Atlas

6. Lancer le serveur:
```bash
npm start          # Production
npm run dev        # Développement avec nodemon
```

## API Endpoints

### Authentification (`/api/auth`)

- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `POST /api/auth/refresh` - Rafraîchir le token

### Utilisateur (`/api/user`)

- `GET /api/user/profile` - Profil utilisateur avec stats
- `PATCH /api/user/profile` - Modifier le profil
- `GET /api/user/lives` - Statut des vies

### Progression (`/api/progress`)

- `GET /api/progress/all` - Toute la progression
- `POST /api/progress/update` - Mettre à jour après une partie
- `GET /api/progress/stats` - Statistiques globales

### Historique (`/api/history`)

- `GET /api/history/all` - Historique complet
- `POST /api/history/add` - Ajouter une entrée
- `GET /api/history/stats` - Statistiques d'historique

### Cultures (`/api/culture`)

- `GET /api/culture/all` - Liste des cultures
- `GET /api/culture/:id` - Détails d'une culture
- `POST /api/culture/create` - Créer une culture (admin)
- `PATCH /api/culture/:id` - Modifier une culture (admin)
- `DELETE /api/culture/:id` - Supprimer une culture (admin)

### Jeu (`/api/game`)

- `POST /api/game/simulate` - Lancer une simulation (consomme une vie)
- `POST /api/game/validate` - Valider les paramètres (sans consommer de vie)

## Système de compétences

Le jeu suit 5 compétences agricoles:

1. **Water** (Gestion de l'eau) - Irrigation et besoins hydriques
2. **NPK** (Fertilisation) - Azote, Phosphore, Potassium
3. **Soil** (Gestion du sol) - pH et qualité du sol
4. **Rotation** (Rotation des cultures) - Succession et associations
5. **NASA** (Données satellitaires) - Interprétation de données NASA

Les compétences progressent de 0 à 100 en fonction des performances.

## Moteur de simulation

Le backend inclut un moteur de simulation agricole inspiré de DSSAT qui calcule:

- Rendement des cultures basé sur les paramètres agronomiques
- Score de performance (0-100)
- Feedback détaillé par paramètre
- Gains de compétences

### Paramètres de simulation

- Eau (mm/saison)
- Azote, Phosphore, Potassium (kg/ha)
- pH du sol (0-14)
- Température (°C)

## Système de vies

- Chaque joueur a **5 vies maximum**
- Une vie est consommée par partie jouée
- Les vies se régénèrent automatiquement toutes les **30 minutes** (configurable)
- Le système vérifie et régénère les vies à chaque connexion

## Sécurité

- Mots de passe hachés avec bcrypt (12 rounds)
- Authentification JWT avec tokens access et refresh
- Rate limiting sur toutes les routes critiques
- Validation Joi sur toutes les entrées
- Helmet.js pour les headers de sécurité
- CORS configuré

## Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port du serveur | 5000 |
| `NODE_ENV` | Environnement | development |
| `MONGODB_URI` | URI MongoDB | mongodb://localhost:27017/ilerise |
| `JWT_SECRET` | Secret pour access tokens | - |
| `JWT_REFRESH_SECRET` | Secret pour refresh tokens | - |
| `JWT_ACCESS_EXPIRY` | Durée access token | 15m |
| `JWT_REFRESH_EXPIRY` | Durée refresh token | 7d |
| `FRONTEND_URL` | URL frontend pour CORS | http://localhost:3000 |
| `LIFE_REGEN_INTERVAL` | Régénération des vies (minutes) | 30 |
| `BCRYPT_ROUNDS` | Rounds de hachage | 12 |

## Développement

### Lancer en mode développement
```bash
npm run dev
```

### Structure d'une réponse API

Succès:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Erreur:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (dev only)"
}
```

### Codes HTTP utilisés

- `200` - OK
- `201` - Created
- `400` - Bad Request (validation)
- `401` - Unauthorized (auth required)
- `403` - Forbidden (no lives, etc.)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## Prochaines étapes

1. **Peupler la base de données** - Créer un script de seed avec des cultures réalistes
2. **Tests** - Ajouter Jest pour les tests unitaires et d'intégration
3. **Documentation API** - Swagger/OpenAPI
4. **Logs** - Winston ou Morgan pour les logs
5. **CI/CD** - GitHub Actions
6. **Déploiement** - Heroku, Railway, ou Render

## Support

Pour toute question ou problème, consulter la documentation ou créer une issue.

---

Développé avec Node.js + Express + MongoDB pour IleRise 🌱
