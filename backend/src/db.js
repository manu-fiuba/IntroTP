const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'f2fantasy_db',
    password: 'password',
    port: 5432,
});

// Si ocurre un error lo muestra en consola.
pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err);
});

module.exports = pool;