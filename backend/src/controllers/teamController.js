const pool = require('../db');

// ==========================================
// LÓGICA DE EQUIPOS FANTASY
// ==========================================

// Crear equipo
const createTeam = async (req, res) => {
    const userId = req.user.id; // conocemos el usuario gracias al authenticateToken
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'El nombre del equipo es obligatorio.' });
    }

    try {
        // Inicializamos el equipo con 100M de presupuesto y 0 puntos.
        const query = `
            INSERT INTO fantasy_teams (user_id, name, budget_remaining, total_points)
            VALUES ($1, $2, 100.0, 0)
            RETURNING *;
        `;
        const result = await pool.query(query, [userId, name]);

        res.status(201).json({
            message: 'Equipo creado con éxito',
            team: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear equipo:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Obtener equipo
const getTeamById = async (req, res) => {
    const teamId = parseInt(req.params.id);

    try {
        // Datos básicos del equipo
        const teamQuery = await pool.query('SELECT * FROM fantasy_teams WHERE id = $1', [teamId]);
        if (teamQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado.' });
        }
        const team = teamQuery.rows[0];

        // Lista de pilotos
        const driversQuery = await pool.query(`
            SELECT d.id, d.name, d.market_price, d.total_points
            FROM drivers d
            JOIN fantasy_team_drivers ftd ON d.id = ftd.driver_id
            WHERE ftd.fantasy_team_id = $1
        `, [teamId]);

        // Lista de escuderías
        const constructorsQuery = await pool.query(`
            SELECT c.id, c.name, c.market_price, c.total_points
            FROM constructors c
            JOIN fantasy_team_constructors ftc ON c.id = ftc.constructor_id
            WHERE ftc.fantasy_team_id = $1
        `, [teamId]);

        // Ensamblamos todo en un solo objeto para mandarlo al frontend
        team.drivers = driversQuery.rows;
        team.constructors = constructorsQuery.rows;

        res.status(200).json(team);
    } catch (error) {
        console.error('Error al obtener equipo:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Actualizar alineación del equipo
const updateTeamRoster = async (req, res) => {
    const teamId = parseInt(req.params.id);
    const userId = req.user.id;

    const { driver_ids, constructor_ids } = req.body;

    // Validaciones (Cantidades exactas)
    if (!Array.isArray(driver_ids) || driver_ids.length !== 5) {
        return res.status(400).json({ error: 'Debes seleccionar exactamente 5 pilotos.' });
    }
    if (!Array.isArray(constructor_ids) || constructor_ids.length !== 2) {
        return res.status(400).json({ error: 'Debes seleccionar exactamente 2 escuderías.' });
    }

    const COSTO_POR_TRANSFERENCIA_EXTRA = 10;

    try {
        // Verificar que el equipo exista y le pertenezca al usuario
        // (traemos también free_transfers_remaining acá, ya que antes se
        // usaba una variable "team" que nunca se había definido)
        const teamCheck = await pool.query(
            'SELECT user_id, free_transfers_remaining FROM fantasy_teams WHERE id = $1',
            [teamId]
        );

        if (teamCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado.' });
        }
        if (teamCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ error: 'No tienes permiso para modificar este equipo.' });
        }

        // Traer el roster anterior para comparar
        const oldDriversQuery = await pool.query('SELECT driver_id FROM fantasy_team_drivers WHERE fantasy_team_id = $1', [teamId]);
        const oldConstructorsQuery = await pool.query('SELECT constructor_id FROM fantasy_team_constructors WHERE fantasy_team_id = $1', [teamId]);

        // Mapeamos los resultados para tener arrays de ids
        const oldDriverIds = oldDriversQuery.rows.map(row => row.driver_id);
        const oldConstructorIds = oldConstructorsQuery.rows.map(row => row.constructor_id);

        // Contar cuántas transferencias reales se hicieron
        let totalTransfersMade = 0;
        let remainingFree = teamCheck.rows[0].free_transfers_remaining;
        let pointsPenalty = 0;

        // Si el equipo no tenía pilotos ni escuderías, es la creación inicial
        if (oldDriverIds.length === 0 && oldConstructorIds.length === 0) {
            totalTransfersMade = 0; // No gasta transferencias
        } else {
            // Es una modificación de un equipo que ya existía
            const changedDrivers = driver_ids.filter(id => !oldDriverIds.includes(id)).length;
            const changedConstructors = constructor_ids.filter(id => !oldConstructorIds.includes(id)).length;
            totalTransfersMade = changedDrivers + changedConstructors;

            // Calcular transferencias restantes o penalidad de puntos
            if (totalTransfersMade > remainingFree) {
                const extraTransfers = totalTransfersMade - remainingFree;
                pointsPenalty = extraTransfers * COSTO_POR_TRANSFERENCIA_EXTRA;
                remainingFree = 0;
            } else {
                remainingFree = remainingFree - totalTransfersMade;
            }
        }

        // Calcular costo total de pilotos
        const driversQuery = await pool.query(
            'SELECT SUM(market_price) as total_drivers FROM drivers WHERE id IN ($1, $2, $3, $4, $5)',
            [driver_ids[0], driver_ids[1], driver_ids[2], driver_ids[3], driver_ids[4]]
        );
        const driversCost = parseFloat(driversQuery.rows[0].total_drivers || 0);

        // Calcular costo total de escuderías
        const constructorsQuery = await pool.query(
            'SELECT SUM(market_price) as total_constructors FROM constructors WHERE id IN ($1, $2)',
            [constructor_ids[0], constructor_ids[1]]
        );
        const constructorsCost = parseFloat(constructorsQuery.rows[0].total_constructors || 0);

        const totalCost = driversCost + constructorsCost;

        // Validar límite de presupuesto
        if (totalCost > 100.0) {
            return res.status(400).json({ error: `Presupuesto excedido. Costo total: ${totalCost}M. Límite: 100.0M.` });
        }

        const budgetRemaining = 100.0 - totalCost;

        // Actualizar el presupuesto restante en la tabla del equipo
        await pool.query(
            `UPDATE fantasy_teams 
             SET budget_remaining = $1, 
                 free_transfers_remaining = $2, 
                 total_points = total_points - $3
             WHERE id = $4`,
            [budgetRemaining, remainingFree, pointsPenalty, teamId]
        );

        // Borrar los jugadores y escuderías viejas de las tablas intermedias
        await pool.query('DELETE FROM fantasy_team_drivers WHERE fantasy_team_id = $1', [teamId]);
        await pool.query('DELETE FROM fantasy_team_constructors WHERE fantasy_team_id = $1', [teamId]);

        // Insertar los nuevos pilotos y escuderías
        for (const driverId of driver_ids) {
            await pool.query('INSERT INTO fantasy_team_drivers (fantasy_team_id, driver_id) VALUES ($1, $2)', [teamId, driverId]);
        }
        for (const constructorId of constructor_ids) {
            await pool.query('INSERT INTO fantasy_team_constructors (fantasy_team_id, constructor_id) VALUES ($1, $2)', [teamId, constructorId]);
        }

        res.status(200).json({
            message: 'Roster actualizado con éxito',
            budget_remaining: budgetRemaining
        });

    } catch (error) {
        console.error('Error al actualizar roster:', error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar el equipo.' });
    }
};

// Eliminar equipo
const deleteTeam = async (req, res) => {
    const teamId = parseInt(req.params.id);
    const userId = req.user.id;

    try {
        const result = await pool.query('DELETE FROM fantasy_teams WHERE id = $1 AND user_id = $2 RETURNING id', [teamId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Equipo no encontrado o no tienes permisos para borrarlo.' });
        }

        res.status(200).json({ message: 'Equipo eliminado correctamente.' });
    } catch (error) {
        console.error('Error al borrar equipo:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    createTeam,
    getTeamById,
    updateTeamRoster,
    deleteTeam
};