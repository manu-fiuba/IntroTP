const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware'); // Se verifica la sesión del usuario ara rutas que requieren permisos

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

router.post('/', authenticateToken, createTeam);  // C: Crea el equipo
router.get('/:id', getTeamById); // R: Trae el equipo, sus puntos y el roster actual
router.put('/:id', authenticateToken, updateTeamRoster); // U: Actualiza roster validando transferencias y presupuesto
router.delete('/:id', authenticateToken, deleteTeam); // D: Borra el equipo del usuario

module.exports = router;
