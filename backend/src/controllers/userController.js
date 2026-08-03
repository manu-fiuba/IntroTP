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
    const userId = req.params.id;

    try {
        // Traemos los datos ( Sin el password_hash por seguridad)
        const query = 'SELECT id, username FROM users WHERE id = $1';
        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
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
    const userId = parseInt(req.params.id);
    const { first_name, last_name } = req.body;

    // VALIDACIÓN DE SEGURIDAD
    if (req.user.id !== userId) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este perfil.' });
    }

    try {
        const query = `
            UPDATE users 
            SET first_name = COALESCE($1, first_name), 
                last_name = COALESCE($2, last_name), 
            WHERE id = $4
            RETURNING id, username, first_name, last_name, country;
        `;
        
        // COALESCE: si el frontend no manda un campo mantenga el valor que ya tenía en la base de datos
        const values = [first_name, last_name, userId];
        const result = await pool.query(query, values);

        res.status(200).json({
            message: 'Perfil actualizado con éxito',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Actualizar contraseña
const updatePassword = async (req, res) => {
    const userId = parseInt(req.params.id);
    const { currentPassword, newPassword, repeatNewPassword } = req.body;

    // VALIDACIÓN DE SEGURIDAD
    if (req.user.id !== userId) {
        return res.status(403).json({ error: 'No tienes permiso para realizar esta acción.' });
    }

    if (!currentPassword || !newPassword || !repeatNewPassword) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    if (newPassword !== repeatNewPassword) {
        return res.status(400).json({ error: 'Las nuevas contraseñas no coinciden.' });
    }

    try {
        // Buscamos el hash actual en la DB
        const userQuery = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        const user = userQuery.rows[0];

        // Verificamos que la contraseña actual sea correcta
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
        }

        // Hasheamos la nueva contraseña
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizamos en la DB
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedNewPassword, userId]);

        res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Elimiar usuario
const deleteUser = async (req, res) => {
    const userId = parseInt(req.params.id);

    // VALIDACIÓN DE SEGURIDAD
    if (req.user.id !== userId) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar esta cuenta.' });
    }

    try {
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        
        res.status(200).json({ message: 'Cuenta eliminada permanentemente.' });
    } catch (error) {
        console.error('Error al eliminar cuenta:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
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