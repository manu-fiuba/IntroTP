const pool = require('../db');

// ==========================================
// CONTROLADORES DEL CATÁLOGO F2
// ==========================================

// Obtener todos los pilotos
const getAllDrivers = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de listar pilotos en construcción' });
};

// Obtener un piloto
const getDriverById = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de obtener piloto por ID en construcción' });
};

// Obtener todos los constructores (equipos reales)
const getAllConstructors = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de listar escuderías en construcción' });
};

// Obtener un constructor
const getConstructorById = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de obtener escudería por ID en construcción' });
};

module.exports = {
    getAllDrivers,
    getDriverById,
    getAllConstructors,
    getConstructorById
};