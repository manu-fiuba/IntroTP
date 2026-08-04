const pool = require('../db');

// ==========================================
// LÓGICA DE ADMINISTRACIÓN DE RESULTADOS
// ==========================================

// FUNCIÓN AUXILIAR ACTUALIZAR PUNTOS
const applyPointsToEntities = async (entityId, entityType, pointsDelta) => {
    if (pointsDelta === 0) return; // Si no hay diferencia de puntos, no hacemos nada

    if (entityType === 'DRIVER') {
        // Actualizamos el total del piloto
        await pool.query('UPDATE drivers SET total_points = total_points + $1 WHERE id = $2', [pointsDelta, entityId]);
        
        // Actualizamos el total de TODOS los equipos fantasy que tienen a este piloto
        await pool.query(`
            UPDATE fantasy_teams 
            SET total_points = total_points + $1 
            WHERE id IN (SELECT fantasy_team_id FROM fantasy_team_drivers WHERE driver_id = $2)
        `, [pointsDelta, entityId]);

    } else if (entityType === 'CONSTRUCTOR') {
        // Actualizamos el total de la escudería
        await pool.query('UPDATE constructors SET total_points = total_points + $1 WHERE id = $2', [pointsDelta, entityId]);
        
        // Actualizamos el total de TODOS los equipos fantasy que tienen a esta escudería
        await pool.query(`
            UPDATE fantasy_teams 
            SET total_points = total_points + $1 
            WHERE id IN (SELECT fantasy_team_id FROM fantasy_team_constructors WHERE constructor_id = $2)
        `, [pointsDelta, entityId]);
    }
};

// Crear Resultado
const createResult = async (req, res) => {
    const { race_id, entity_id, entity_type, qualy_points, sprint_points, feature_points } = req.body;

    if (!race_id || !entity_id || !entity_type) {
        return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    try {
        const query = `
            INSERT INTO race_results (race_id, entity_id, entity_type, qualy_points, sprint_points, feature_points)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [race_id, entity_id, entity_type, qualy_points || 0, sprint_points || 0, feature_points || 0];
        const result = await pool.query(query, values);

        const totalNewPoints =qualy_points || 0 + sprint_points || 0 + feature_points || 0
        await applyPointsToEntities(entity_id, entity_type, totalNewPoints);

        res.status(201).json({ message: 'Resultado cargado exitosamente', result: result.rows[0] });
    } catch (error) {
        console.error('Error al cargar resultado:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Actualizar resultado
const updateResult = async (req, res) => {
    const resultId = parseInt(req.params.id);
    const { qualy_points, sprint_points, feature_points } = req.body;

    try {
        // Buscamos el resultado original para saber cuántos puntos tenía ANTES del cambio
        const oldResultQuery = await pool.query('SELECT * FROM race_results WHERE id = $1', [resultId]);
        if (oldResultQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Resultado no encontrado.' });
        }
        const old = oldResultQuery.rows[0];
        const oldTotal = (old.qualy_points || 0) + (old.sprint_points || 0) + (old.feature_points || 0);

        // Calculamos cuáles van a ser los nuevos valores
        // Si los nuevos son null utilizamos los viejos
        const newQ = qualy_points ?? old.qualy_points;
        const newS = sprint_points ?? old.sprint_points;
        const newF = feature_points ?? old.feature_points;
        
        const newTotal = newQ + newS + newF;
        // Calculamos el "Delta" (la diferencia de puntos)
        const pointsDelta = newTotal - oldTotal;

        // Actualizamos el registro en la base de datos
        const query = `
            UPDATE race_results 
            SET qualy_points = $1, sprint_points = $2, feature_points = $3
            WHERE id = $4
            RETURNING *;
        `;
        const result = await pool.query(query, [newQ, newS, newF, resultId]);

        // Sincronizamos usando solo la diferencia
        await applyPointsToEntities(old.entity_id, old.entity_type, pointsDelta);

        res.status(200).json({ message: 'Resultado actualizado y puntos corregidos.', result: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar resultado:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Borrar resultado
const deleteResult = async (req, res) => {
    const resultId = parseInt(req.params.id);

    try {
        // Buscamos el resultado original para saber cuántos puntos hay que restar
        const oldResultQuery = await pool.query('SELECT * FROM race_results WHERE id = $1', [resultId]);
        if (oldResultQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Resultado no encontrado.' });
        }
        const old = oldResultQuery.rows[0];
        const pointsToSubtract = -((old.qualy_points || 0) + (old.sprint_points || 0) + (old.feature_points || 0));

        // Borramos el resultado
        await pool.query('DELETE FROM race_results WHERE id = $1', [resultId]);

        // Sincronizamos (enviando el número en negativo para que reste)
        await applyPointsToEntities(old.entity_id, old.entity_type, pointsToSubtract);

        res.status(200).json({ message: 'Resultado eliminado y puntos descontados del registro.' });
    } catch (error) {
        console.error('Error al eliminar resultado:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    createResult,
    updateResult,
    deleteResult
};