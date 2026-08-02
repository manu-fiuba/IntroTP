const express = require('express');
const router = express.Router();

// ==========================================
// CONTROLADORES
// ==========================================
const {
    getAllDrivers, 
    getDriverById,
    getAllConstructors, 
    getConstructorById 
} = require('../controllers/f2Controller');

// ==========================================
// ENDPOINTS DEL CATÁLOGO F2 (/api/f2/...)
// ==========================================

// -- Pilotos --
router.get('/drivers', getAllDrivers);
router.get('/drivers/:id', getDriverById);

// -- Escuderías --
router.get('/constructors', getAllConstructors);
router.get('/constructors/:id', getConstructorById);

module.exports = router;