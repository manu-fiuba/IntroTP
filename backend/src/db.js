const { Pool, types } = require('pg');

// ==========================================================
// Por defecto, node-postgres devuelve las columnas NUMERIC/DECIMAL
// (como market_price o budget_remaining) como STRING, para no perder
// precisión en números muy grandes. Acá las forzamos a número real,
// así el resto del backend y el frontend (team-builder.js, my-teams.js,
// etc.) pueden usar .toFixed() u operaciones matemáticas directamente
// sin necesidad de parsear cada campo manualmente.
//
// OID 1700 = tipo "numeric" en Postgres.
// ==========================================================
types.setTypeParser(1700, (value) => parseFloat(value));

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