const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware'); // Se verifica la sesión del usuario ara rutas que requieren permisos

// ==========================================
// CONTROLADORES
// ==========================================
const {
    createLeague,
    joinLeague,
    getLeagueDetails,
    updateLeague,
    deleteLeague,
    leaveLeague
} = require('../controllers/leagueController');

// ==========================================
// ENDPOINTS DE LIGAS (/api/leagues/...)
// ==========================================

router.post('/', authenticateToken, createLeague); // C: Crea liga y genera el código alfanumérico
router.post('/join', authenticateToken, joinLeague); // Acción: Unirse a una liga con código y contraseña
router.get('/:id', getLeagueDetails); // R: Trae datos y el Leaderboard de una liga específica
router.put('/:id', authenticateToken, updateLeague); // U: Modificar nombre, descripción o límite (Solo para el owner)
router.delete('/:id', authenticateToken, deleteLeague); // D: Eliminar la liga entera (Solo para el owner)
router.delete('/:id/members/:teamId', authenticateToken, leaveLeague); // Acción: Un miembro abandona la liga sin borrarla

module.exports = router;