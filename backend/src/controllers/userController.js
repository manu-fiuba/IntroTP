const pool = require('../db');

// ==========================================
// LÓGICA DEL USUARIO
// ==========================================

// Resgistrarse
const registerUser = async (req, res) => {
    const { username, password, repeatPassword } = req.body;

    // 1. Validaciones básicas
    if (!username || !password || !repeatPassword) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (password !== repeatPassword) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    try {
        const query = `
            INSERT INTO users (username, password_hash)
            VALUES ($1, $2)
            RETURNING id, username;
        `;
        
        const values = [username, password];
        const result = await pool.query(query, values);

        // Respuesta exitosa
        res.status(201).json({
            message: 'Usuario registrado con éxito',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        
        // 23505 es el código de PostgreSQL para violaciones de restricción UNIQUE
        if (error.code === '23505') {
            return res.status(409).json({ error: 'El nombre de usuario ya está en uso.' });
        }

        res.status(500).json({ error: 'Error del servidor al registrar.' });
    }
};

// Iniciar Sesión
const loginUser = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de login en construcción' });
};

// Obtener datos de usuario
const getUserById = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de obtener usuario en construcción' });
};

// Obtener ligas en las que está un usuario
const getUserLeagues = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de ligas del usuario en construcción' });
};

// Obtener Equipos del usuario
const getTeamsByUser = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de equipos del usuario en construcción' });
};

// Actualizar datos del usuario
const updateUser = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de actualizar perfil en construcción' });
};

// Actualizar contraseña
const updatePassword = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de actualizar contraseña en construcción' });
};

// Elimiar usuario
const deleteUser = async (req, res) => {
    res.status(501).json({ message: 'Endpoint de eliminar usuario en construcción' });
};

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    getUserLeagues,
    getTeamsByUser,
    updateUser,
    updatePassword,
    deleteUser
};