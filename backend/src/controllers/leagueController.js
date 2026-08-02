const pool = require('../db');

// ==========================================
// CONTROLADORES DE LIGAS
// ==========================================

// Crear Liga
const createLeague = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de crear liga en construcción' });
};

// Unirse a una liga
const joinLeague = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de unirse a liga en construcción' });
};

// Obtener detalles de una liga
const getLeagueDetails = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de detalles de liga en construcción' });
};

// Actualizar detalles de liga
const updateLeague = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de modificar liga en construcción' });
};

// Eliminar liga
const deleteLeague = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de eliminar liga en construcción' });
};

module.exports = {
    createLeague,
    joinLeague,
    getLeagueDetails,
    updateLeague,
    deleteLeague
};