const express = require('express');
const router = express.Router();

const authenticateToken = require('../middlewares/authMiddleware');
const verifyAdmin = require('../middlewares/adminMiddleware');

// ==========================================
// CONTROLADORES
// ==========================================
const {
    createResult,
    updateResult,
    deleteResult,
    closeRaceWeekend
} = require('../controllers/adminController');

// Aplicamos ambos middlewares
router.use(authenticateToken);
router.use(verifyAdmin);

// ==========================================
// ENDPOINTS DE ADMINISTRADOR
// ==========================================

router.post('/results', createResult);
router.patch('/results/:id', updateResult);
router.delete('/results/:id', deleteResult);
router.post('/close-weekend', closeRaceWeekend);

module.exports = router;