const express = require('express');
const pool = require('./db')
const cors = require('cors');
const { createAdmin } = require('./scripts/createAdmin');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ==========================================
// IMPORT DE ROUTERS
// ==========================================

const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const leagueRoutes = require('./routes/leagueRoutes');
const f2Routes = require('./routes/f2Routes');
const adminRoutes = require('./routes/adminRoutes');

const { healthcheck } = require('./controllers/healthcheckController');

// ==========================================
// ENDPOINTS
// ==========================================

// Healthcheck
app.get('/api/status', healthcheck);

// Routers
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/f2', f2Routes);
app.use('/api/admin', adminRoutes);

// ==========================================
// INICIO DEL SERVIDOR
// =========================================

app.listen(PORT, async () => {
    await createAdmin();
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
