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
    deleteResult
} = require('../controllers/adminController');

// Aplicamos ambos middlewares
router.use(authenticateToken);
router.use(verifyAdmin);

// Rutas de resultados
router.post('/results', createResult);
router.patch('/results/:id', updateResult);
router.delete('/results/:id', deleteResult);

module.exports = router;