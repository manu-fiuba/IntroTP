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
    deleteTeam,
    getTeamRaceHistory
} = require('../controllers/teamController');

// ==========================================
// ENDPOINTS DE EQUIPOS FANTASY (/api/teams/...)
// ==========================================

router.post('/', authenticateToken, createTeam); 
router.get('/:id', getTeamById); 
router.get('/:id/race-history', getTeamRaceHistory);
router.put('/:id', authenticateToken, updateTeamRoster); 
router.delete('/:id', authenticateToken, deleteTeam); 

module.exports = router;
