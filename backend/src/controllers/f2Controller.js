const pool = require('../db');

// ==========================================
// CONTROLADORES DEL CATÁLOGO F2
// ==========================================

// Obtener todos los pilotos
const getAllDrivers = async (req, res) => {
    try {
        const query = 'SELECT * FROM drivers ORDER BY price DESC';
        const result = await pool.query(query);
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener pilotos:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Obtener un piloto
const getDriverById = async (req, res) => {
    const driverId = parseInt(req.params.id);
    
    try {
        const query = 'SELECT * FROM drivers WHERE id = $1';
        const result = await pool.query(query, [driverId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Piloto no encontrado.' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener el piloto:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Obtener todos los constructores (equipos reales)
const getAllConstructors = async (req, res) => {
    try {
        const query = 'SELECT * FROM constructors ORDER BY price DESC';
        const result = await pool.query(query);
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener escuderías:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Obtener un constructor
const getConstructorById = async (req, res) => {
    const constructorId = parseInt(req.params.id);
    
    try {
        const query = 'SELECT * FROM constructors WHERE id = $1';
        const result = await pool.query(query, [constructorId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Escudería no encontrada.' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener la escudería:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    getAllDrivers,
    getDriverById,
    getAllConstructors,
    getConstructorById
};
