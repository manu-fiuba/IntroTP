const pool = require('../db');

// ==========================================
// CONTROLADORES DEL CATÁLOGO F2
// ==========================================

// Obtener todos los pilotos
const getAllDrivers = async (req, res) => {
    try {
        const query = 'SELECT * FROM drivers ORDER BY team_id ASC, market_price DESC';
        const result = await pool.query(query);
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener pilotos:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Obtener un piloto
const getDriverById = async (req, res) => {
    const driverId = parseInt(req.params.id);
    
    try {
        const query = 'SELECT * FROM drivers WHERE id = $1';
        const result = await pool.query(query, [driverId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Piloto no encontrado.' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener el piloto:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Obtener todos los constructores (equipos reales)
const getAllConstructors = async (req, res) => {
    try {
        const query = 'SELECT * FROM constructors ORDER BY market_price DESC';
        const result = await pool.query(query);
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener escuderías:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Obtener un constructor
const getConstructorById = async (req, res) => {
    const constructorId = parseInt(req.params.id);
    
    try {
        const query = 'SELECT * FROM constructors WHERE id = $1';
        const result = await pool.query(query, [constructorId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Escudería no encontrada.' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener la escudería:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// FUNCIÓN AUXILIAR CUENTA REGRESIVA
const calculateCountdown = (raceDateStr) => {
    const now = new Date();
    const raceDate = new Date(raceDateStr);
    const diffMs = raceDate - now;
    
    if (diffMs > 0) {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diffMs / 1000 / 60) % 60);
        return { status: 'upcoming', countdown: `${days}d ${hours}h ${minutes}m` };
    } else {
        return { status: 'completed', countdown: 'Finalizada' };
    }
};

// Obtener todos los Grandes Premios
const getAllRaces = async (req, res) => {
    try {
        const query = 'SELECT * FROM races ORDER BY date ASC';
        const result = await pool.query(query);
        
        // Mapeamos el array de resultados para inyectarle la cuenta regresiva
        const races = result.rows.map(race => {
            const timeData = calculateCountdown(race.date);
            return {
                ...race,
                status: timeData.status,
                countdown: timeData.countdown
            };
        });
        
        res.status(200).json(races);
    } catch (error) {
        console.error('Error al obtener carreras:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Obtener próximo Gran Premio
const getNextRace = async (req, res) => {
    try {
        const query = 'SELECT * FROM races WHERE date > NOW() ORDER BY date ASC LIMIT 1';
        const result = await pool.query(query);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No hay carreras próximas programadas.' });
        }
        
        const nextRace = result.rows[0];
        const timeData = calculateCountdown(nextRace.date);
        
        res.status(200).json({
            ...nextRace,
            status: timeData.status,
            countdown: timeData.countdown
        });
    } catch (error) {
        console.error('Error al obtener la próxima carrera:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    getAllDrivers,
    getDriverById,
    getAllConstructors,
    getConstructorById,
    getAllRaces,
    getNextRace
};
