const express = require('express');
const router = express.Router();

const authenticateToken = require('../middlewares/authMiddleware');
const verifyAdmin = require('../middlewares/adminMiddleware');

// ==========================================
// CONTROLADORES
// ==========================================
const {
    createResult,
    getResults,
    updateResult,
    deleteResult,
    closeRaceWeekend
} = require('../controllers/adminController');

// Aplicamos ambos middlewares
router.use(authenticateToken);
router.use(verifyAdmin);

// ==========================================
// ENDPOINTS DE ADMINISTRADOR (/api/admin/...)
// ==========================================

router.post('/results', createResult);
router.get('/results/race/:race_id', getResults);
router.patch('/results/:id', updateResult);
router.delete('/results/:id', deleteResult);
router.post('/close-weekend', closeRaceWeekend);
router.get('/results/race/:race_id', getResults);

module.exports = router;