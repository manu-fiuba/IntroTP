const pool = require('../db');

// ==========================================
// LÓGICA DE EQUIPOS FANTASY
// ==========================================

// Crear equipo
const createTeam = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de crear equipo en construcción' });
};

// Obtener equipo
const getTeamById = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de obtener equipo en construcción' });
};

// Actualizar alineación del equipo
const updateTeamRoster = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de actualizar roster en construcción' });
};

// Eliminar equipo
const deleteTeam = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de borrar equipo en construcción' });
};

module.exports = {
    createTeam,
    getTeamById,
    updateTeamRoster,
    deleteTeam
};