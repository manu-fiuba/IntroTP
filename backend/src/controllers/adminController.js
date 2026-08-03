const pool = require('../db');

// ==========================================
// LÓGICA DE ADMINISTRACIÓN DE RESULTADOS
// ==========================================

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
        const query = `
            UPDATE race_results 
            SET qualy_points = COALESCE($1, qualy_points),
                sprint_points = COALESCE($2, sprint_points),
                feature_points = COALESCE($3, feature_points)
            WHERE id = $4
            RETURNING *;
        `;
        const result = await pool.query(query, [qualy_points, sprint_points, feature_points, resultId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Resultado no encontrado.' });
        }

        res.status(200).json({ message: 'Resultado actualizado', result: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar resultado:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Borrar resultado
const deleteResult = async (req, res) => {
    const resultId = parseInt(req.params.id);

    try {
        const result = await pool.query('DELETE FROM race_results WHERE id = $1 RETURNING id', [resultId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Resultado no encontrado.' });
        }

        res.status(200).json({ message: 'Resultado eliminado del registro.' });
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