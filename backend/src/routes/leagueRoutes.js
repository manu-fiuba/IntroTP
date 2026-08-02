const express = require('express');
const router = express.Router();

// ==========================================
// CONTROLADORES
// ==========================================
const {
    createLeague,
    joinLeague, 
    getLeagueDetails, 
    updateLeague, 
    deleteLeague 
} = require('../controllers/leagueController');

// ==========================================
// ENDPOINTS DE LIGAS (/api/leagues/...)
// ==========================================

router.post('/', createLeague); // C: Crea liga y genera el código alfanumérico
router.post('/join', joinLeague); // Acción: Unirse a una liga con código y contraseña
router.get('/:id', getLeagueDetails); // R: Trae datos y el Leaderboard de una liga específica
router.put('/:id', updateLeague); // U: Modificar nombre, descripción o límite (Solo para el owner)
router.delete('/:id', deleteLeague); // D: Eliminar la liga entera (Solo para el owner)

module.exports = router;