const express = require('express');
const router = express.Router();

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

router.patch('/:id', updateUser);
router.patch('/:id/password', updatePassword);

router.delete('/:id', deleteUser);

module.exports = router;