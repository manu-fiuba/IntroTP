const express = require('express');
const pool = require('./db')

const PORT = 3000;
const app = express();
app.use(express.json());

// ==========================================
// IMPORTACIÓN DE CONTROLADORES
// ==========================================

// Healthcheck
const { healthcheck } = require('./controllers/healthcheckController')
/*
// Usuarios
const {
    registerUser,
    loginUser,
    getUserById,
    getUserLeagues,
    updateUser,
    updatePassword,
    deleteUser } = require('./controllers/userController');

// Catálogo F2 (Solo lectura)
const {
    getAllDrivers, 
    getDriverById } = require('./controllers/driverController');

const {
    getAllConstructors, 
    getConstructorById } = require('./controllers/constructorController');

// Equipos Fantasy
const {
    createTeam, 
    getTeamsByUser, 
    getTeamById, 
    updateTeamRoster, 
    deleteTeam } = require('./controllers/teamController');

// Ligas Privadas
const {
    createLeague,
    joinLeague, 
    getLeagueDetails, 
    updateLeague, 
    deleteLeague } = require('./controllers/leagueController');

// ==========================================
// ENDPOINTS
// ==========================================

// --- Healthcheck ---
app.get('/api/status', healthcheck);

// --- Usuarios ---
app.post('/api/users', registerUser); 
app.post('/api/users/login', loginUser);
app.get('/api/users/:id', getUserById);
app.get('/api/users/:id/teams', getTeamsByUser);
app.get('/api/users/:id/leagues', getUserLeagues);
app.patch('/api/users/:id', updateUser);
app.patch('/api/users/:id/password', updatePassword);
app.delete('/api/users/:id', deleteUser);

// --- Catálogo F2 (Solo lectura) ---
app.get('/api/drivers', getAllDrivers);
app.get('/api/drivers/:id', getDriverById);
app.get('/api/constructors', getAllConstructors);
app.get('/api/constructors/:id', getConstructorById);

// --- Módulo Equipos Fantasy (CRUD) ---
app.post('/api/teams', createTeam); // C: Crea el equipo
app.get('/api/teams/:id', getTeamById) // R: Trae el equipo, sus puntos y el roster actual
app.put('/api/teams/:id', updateTeamRoster); // U: Valida transferencias, presupuesto límite y actualiza roster
app.delete('/api/teams/:id', deleteTeam); // D: Borra el equipo del usuario

// --- Módulo Ligas Privadas (CRUD) ---
app.post('/api/leagues', createLeague); // C: Crea liga y genera el código alfanumérico
app.post('/api/leagues/join', joinLeague); // Unirse a una liga con código y contraseña
app.get('/api/leagues/:id', getLeagueDetails); // R: Trae los datos y el Leaderboard de una liga específica
app.put('/api/leagues/:id', updateLeague); // U: Modificar nombre, descripción o límite (Solo para el owner)
app.delete('/api/leagues/:id', deleteLeague); // D: Eliminar la liga entera (Solo para el owner_id)
*/

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`Servidor de F2 Fantasy corriendo en http://localhost:${PORT}`);
});