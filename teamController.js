const pool = require('../db');

// ==========================================
// LÓGICA DE EQUIPOS FANTASY
// ==========================================

const createTeam = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de crear equipo en construcción' });
};

const getTeamById = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de obtener equipo en construcción' });
};

const updateTeamRoster = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de actualizar roster en construcción' });
};

const deleteTeam = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de borrar equipo en construcción' });
};

module.exports = {
    createTeam,
    getTeamById,
    updateTeamRoster,
    deleteTeam
};
