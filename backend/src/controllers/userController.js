const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ==========================================
// LÓGICA DEL USUARIO
// ==========================================

// Resgistrarse
const registerUser = async (req, res) => {
    const { username, password, repeatPassword } = req.body;

    // Validaciones
    if (!username || !password || !repeatPassword) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (password !== repeatPassword) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    // Hashing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
        const query = `
            INSERT INTO users (username, password_hash)
            VALUES ($1, $2)
            RETURNING id, username;
        `;

        // Query
        const values = [username, hashedPassword];
        const result = await pool.query(query, values);

        // Respuesta exitosa
        res.status(201).json({
            message: 'Usuario registrado con éxito',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        
        // 23505: violaciones de restricción UNIQUE
        if (error.code === '23505') {
            return res.status(409).json({ error: 'El nombre de usuario ya está en uso.' });
        }

        res.status(500).json({ error: 'Error del servidor al registrar.' });
    }
};

// Iniciar Sesión
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    // Validaciones
    if (!username || !password) {
        return res.status(400).json({ error: 'El usuario y la contraseña son obligatorios.' });
    }

    try {
        // Query
        const query = 'SELECT id, username, password_hash FROM users WHERE username = $1';
        const result = await pool.query(query, [username]);
        const user = result.rows[0];

        // El usuario no existe (user result vacío)
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // Comparar la contraseña ingresada con el hash
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // Token de sesión
        const token = jwt.sign(
            { id: user.id, username: user.username }, // datos a guardar
            'firma_secreta_f2', // firma
            { expiresIn: '2h' } // El token expira en 2 horas por seguridad
        );

        // Respuesta exitosa
        res.status(200).json({
            message: 'Login exitoso',
            token: token,
            user: {
                id: user.id,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Error en el proceso de login:', error);
        res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
    }
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