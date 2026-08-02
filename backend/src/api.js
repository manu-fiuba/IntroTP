const express = require('express');
const pool = require('./db')

const PORT = 3000;
const app = express();
app.use(express.json());

// ==========================================
// IMPORT DE ROUTERS
// ==========================================

const userRoutes = require('./routes/userRoutes');
/*
const teamRoutes = require('./routes/teamRoutes');
const leagueRoutes = require('./routes/leagueRoutes');
const f2Routes = require('./routes/f2Routes');
*/
const { healthcheck } = require('./controllers/healthcheckController');

// ==========================================
// ENDPOINTS
// ==========================================

// Healthcheck
app.get('/api/status', healthcheck);

// Routers
app.use('/api/users', userRoutes);
/*
app.use('/api/teams', teamRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/f2', f2Routes);
*/
// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`Servidor de F2 Fantasy corriendo en http://localhost:${PORT}`);
});