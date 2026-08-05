const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Si ocurre un error lo muestra en consola.
pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err);
});

module.exports = pool;