const pool = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // nativo de Node js, genera códigos aleatorios

// ==========================================
// LÓGICA DE LIGAS
// ==========================================

// Crear Liga
const createLeague = async (req, res) => {
    const ownerId = req.user.id;
    const { name, description, max_participants, password } = req.body;

    if (!name || !max_participants || !password) {
        return res.status(400).json({ error: 'Nombre, límite de participantes y contraseña son obligatorios.' });
    }

    try {
        // Generar código alfanumérico único de 6 caracteres
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
        let joinCode = '';

        for (let i = 0; i < 6; i++) {
            joinCode += caracteres[crypto.randomInt(0, caracteres.length)];
        }

        // Hashear la contraseña de la liga
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insertar en la base de datos
        const query = `
            INSERT INTO leagues (owner_id, name, description, max_participants, join_code, password_hash)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, join_code;
        `;
        const values = [ownerId, name, description, max_participants, joinCode, passwordHash];
        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Liga creada con éxito.',
            league: result.rows[0]
        });

    } catch (error) {
        console.error('Error al crear liga:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Unirse a una liga
const joinLeague = async (req, res) => {
    const userId = req.user.id;
    const { join_code, password, fantasy_team_id } = req.body;

    if (!join_code || !password || !fantasy_team_id) {
        return res.status(400).json({ error: 'Código de liga, contraseña e ID de tu equipo son obligatorios.' });
    }

    try {
        // Verificar que el equipo enviado pertenezca al usuario que hace la petición
        const teamCheck = await pool.query('SELECT id FROM fantasy_teams WHERE id = $1 AND user_id = $2', [fantasy_team_id, userId]);
        if (teamCheck.rows.length === 0) {
            return res.status(403).json({ error: 'El equipo no te pertenece o no existe.' });
        }

        // Buscar la liga por su código
        const leagueQuery = await pool.query('SELECT * FROM leagues WHERE join_code = $1', [join_code]);
        if (leagueQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Liga no encontrada.' });
        }
        const league = leagueQuery.rows[0];

        // Validar la contraseña de la liga
        const isMatch = await bcrypt.compare(password, league.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Contraseña de liga incorrecta.' });
        }

        // Verificar si la liga ya está llena
        const countQuery = await pool.query('SELECT COUNT(*) as total_members FROM league_members WHERE league_id = $1', [league.id]);
        const currentMembers = parseInt(countQuery.rows[0].total_members);

        if (currentMembers >= league.max_participants) {
            return res.status(400).json({ error: 'La liga ya ha alcanzado su límite de participantes.' });
        }

        // Verificar que el equipo no esté ya en esa liga
        const memberCheck = await pool.query('SELECT * FROM league_members WHERE league_id = $1 AND fantasy_team_id = $2', [league.id, fantasy_team_id]);
        if (memberCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Tu equipo ya forma parte de esta liga.' });
        }

        // Insertar en la tabla intermedia (Unir a la liga)
        await pool.query('INSERT INTO league_members (league_id, fantasy_team_id) VALUES ($1, $2)', [league.id, fantasy_team_id]);

        res.status(200).json({ message: 'Te has unido a la liga exitosamente.' });

    } catch (error) {
        console.error('Error al unirse a la liga:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Obtener detalles de una liga
const getLeagueDetails = async (req, res) => {
    const leagueId = parseInt(req.params.id);

    try {
        // Datos de la liga (sin el password_hash)
        const leagueQuery = await pool.query('SELECT id, name, description, max_participants, owner_id FROM leagues WHERE id = $1', [leagueId]);
        if (leagueQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Liga no encontrada.' });
        }
        const league = leagueQuery.rows[0];

        // Armar el Leaderboard a partir de league_members con fantasy_teams y users
        const leaderboardQuery = await pool.query(`
            SELECT ft.id AS team_id, ft.name AS team_name, u.username AS manager_name, ft.total_points
            FROM league_members lm
            JOIN fantasy_teams ft ON lm.fantasy_team_id = ft.id
            JOIN users u ON ft.user_id = u.id
            WHERE lm.league_id = $1
            ORDER BY ft.total_points DESC
        `, [leagueId]);

        // Devolver al front
        league.leaderboard = leaderboardQuery.rows;

        res.status(200).json(league);
    } catch (error) {
        console.error('Error al obtener detalles de la liga:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Actualizar detalles de liga
const updateLeague = async (req, res) => {
    const leagueId = parseInt(req.params.id);
    const userId = req.user.id;
    const { name, description, max_participants } = req.body;

    try {
        // Validar que el usuario sea el creador de la liga
        const checkOwner = await pool.query('SELECT owner_id FROM leagues WHERE id = $1', [leagueId]);
        if (checkOwner.rows.length === 0) {
            return res.status(404).json({ error: 'Liga no encontrada.' });
        }
        if (checkOwner.rows[0].owner_id !== userId) {
            return res.status(403).json({ error: 'Solo el creador puede modificar la liga.' });
        }

        // Actualizar datos básicos (COALESCE: si el frontend manda algún campo vacío queda como estaba)
        const query = `
            UPDATE leagues 
            SET name = COALESCE($1, name), 
                description = COALESCE($2, description), 
                max_participants = COALESCE($3, max_participants)
            WHERE id = $4
            RETURNING id, name, description, max_participants;
        `;
        const result = await pool.query(query, [name, description, max_participants, leagueId]);

        res.status(200).json({
            message: 'Liga actualizada correctamente',
            league: result.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar liga:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Eliminar liga
const deleteLeague = async (req, res) => {
    const leagueId = parseInt(req.params.id);
    const userId = req.user.id;

    try {
        // Validación de seguridad directa: owner_id = userId en el WHERE
        const result = await pool.query('DELETE FROM leagues WHERE id = $1 AND owner_id = $2 RETURNING id', [leagueId, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Liga no encontrada o permisos insuficientes.' });
        }

        res.status(200).json({ message: 'Liga eliminada permanentemente.' });
    } catch (error) {
        console.error('Error al eliminar liga:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    createLeague,
    joinLeague,
    getLeagueDetails,
    updateLeague,
    deleteLeague
};
