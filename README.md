# IleRise Backend API

Node.js/Express backend for the educational agriculture game IleRise.

## Technologies

- **Node.js** v20+ with ES Modules
- **Express.js** - Web framework
- **MongoDB** with Mongoose - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Data validation
- **Helmet** - HTTP security
- **express-rate-limit** - Abuse protection

## Project Structure

```
ilerise-backend/
├── config/              # Configuration (database, jwt)
├── controllers/         # Business logic
├── middleware/          # Middlewares (auth, validation, rate-limit)
├── models/              # MongoDB schemas
│   ├── User.js         # Users
│   ├── Progress.js     # Player progress
│   ├── History.js      # Action history
│   ├── Culture.js      # Crops
│   ├── KnowledgeCard.js # Knowledge cards
│   └── Achievement.js  # Achievements
├── routes/              # API routes
├── services/            # Business services
│   ├── simulationEngine.js      # Agricultural simulation engine
│   └── competenceCalculator.js  # Skill calculator
├── server.js            # Entry point
├── .env.example         # Example environment variables
└── package.json
```

## Installation

1. Clone the repository and navigate to the backend folder:
```bash
cd C:\Projet\ilerise-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create the `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ilerise
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:3000
```

5. Start MongoDB locally or use MongoDB Atlas

6. Launch the server:
```bash
npm start          # Production
npm run dev        # Development with nodemon
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Create an account
- `POST /api/auth/login` - Log in
- `POST /api/auth/refresh` - Refresh token

### User (`/api/user`)

- `GET /api/user/profile` - User profile with stats
- `PATCH /api/user/profile` - Update profile
- `GET /api/user/lives` - Lives status

### Progress (`/api/progress`)

- `GET /api/progress/all` - All progress
- `POST /api/progress/update` - Update after a game
- `GET /api/progress/stats` - Global statistics

### History (`/api/history`)

- `GET /api/history/all` - Full history
- `POST /api/history/add` - Add an entry
- `GET /api/history/stats` - History statistics

### Crops (`/api/culture`)

- `GET /api/culture/all` - List of crops
- `GET /api/culture/:id` - Crop details
- `POST /api/culture/create` - Create a crop (admin)
- `PATCH /api/culture/:id` - Update a crop (admin)
- `DELETE /api/culture/:id` - Delete a crop (admin)

### Game (`/api/game`)

- `POST /api/game/simulate` - Run a simulation (consumes a life)
- `POST /api/game/validate` - Validate parameters (no life consumed)

## Skill System

The game tracks 5 agricultural skills:

1. **Water** (Water management) - Irrigation and water needs
2. **NPK** (Fertilization) - Nitrogen, Phosphorus, Potassium
3. **Soil** (Soil management) - pH and soil quality
4. **Rotation** (Crop rotation) - Succession and associations
5. **NASA** (Satellite data) - NASA data interpretation

Skills progress from 0 to 100 based on performance.

## Simulation Engine

The backend includes an agricultural simulation engine inspired by DSSAT that calculates:

- Crop yield based on agronomic parameters
- Performance score (0-100)
- Detailed feedback per parameter
- Skill gains

### Simulation Parameters

- Water (mm/season)
- Nitrogen, Phosphorus, Potassium (kg/ha)
- Soil pH (0-14)
- Temperature (°C)

## Life System

- Each player has **5 maximum lives**
- One life is consumed per game played
- Lives regenerate automatically every **30 minutes** (configurable)
- The system checks and regenerates lives on each login

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT authentication with access and refresh tokens
- Rate limiting on all critical routes
- Joi validation on all inputs
- Helmet.js for security headers
- CORS configured

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB URI | mongodb://localhost:27017/ilerise |
| `JWT_SECRET` | Secret for access tokens | - |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | - |
| `JWT_ACCESS_EXPIRY` | Access token duration | 15m |
| `JWT_REFRESH_EXPIRY` | Refresh token duration | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `LIFE_REGEN_INTERVAL` | Life regeneration (minutes) | 30 |
| `BCRYPT_ROUNDS` | Hashing rounds | 12 |

## Development

### Run in development mode
```bash
npm run dev
```

### API Response Structure

Success:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (dev only)"
}
```

### HTTP Codes Used

- `200` - OK
- `201` - Created
- `400` - Bad Request (validation)
- `401` - Unauthorized (auth required)
- `403` - Forbidden (no lives, etc.)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## Next Steps

1. **Populate the database** - Create a seed script with realistic crops
2. **Tests** - Add Jest for unit and integration tests
3. **API Documentation** - Swagger/OpenAPI
4. **Logs** - Winston or Morgan for logging
5. **CI/CD** - GitHub Actions
6. **Deployment** - Heroku, Railway, or Render

## Support

For any questions or issues, consult the documentation or create an issue.

---

Developed with Node.js + Express + MongoDB for IleRise 🌱
