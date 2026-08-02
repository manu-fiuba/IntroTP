const express = require('express');
const router = express.Router();

// ==========================================
// CONTROLADORES
// ==========================================
const {
    createTeam, 
    getTeamById, 
    updateTeamRoster, 
    deleteTeam 
} = require('../controllers/teamController');

// ==========================================
// ENDPOINTS DE EQUIPOS FANTASY (/api/teams/...)
// ==========================================

router.post('/', createTeam); // C: Crea el equipo
router.get('/:id', getTeamById); // R: Trae el equipo, sus puntos y el roster actual
router.put('/:id', updateTeamRoster); // U: Actualiza roster validando transferencias y presupuesto
router.delete('/:id', deleteTeam); // D: Borra el equipo del usuario

module.exports = router;