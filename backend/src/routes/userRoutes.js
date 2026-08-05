const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware'); // Se verifica la sesión del usuario ara rutas que requieren permisos

// ==========================================
// CONTROLADORES
// ==========================================

const {
    registerUser,
    loginUser,
    getUserById,
    getUserLeagues,
    getTeamsByUser,
    updateUser,
    updatePassword,
    deleteUser
} = require('../controllers/userController');

// ==========================================
// ENDPOINTS DEL USUARIO (/api/users/...)
// ==========================================
router.post('/', registerUser); 
router.post('/login', loginUser);

router.get('/:id', getUserById); 
router.get('/:id/teams', getTeamsByUser);
router.get('/:id/leagues', getUserLeagues);

router.patch('/:id',  authenticateToken, updateUser);
router.patch('/:id/password',  authenticateToken, updatePassword);

router.delete('/:id',  authenticateToken, deleteUser);

module.exports = router;