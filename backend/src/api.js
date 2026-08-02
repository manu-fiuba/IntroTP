const express = require('express');
const pool = require('./db.js')

const app = express();
app.use(express.json());

const PORT = 3000;

app.get('/api/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as server_time');
    
    res.status(200).json({
        status: 'success',
        message: 'API funcionando correctamente',
        db_time: result.rows[0].server_time
    });
} catch (error) {
    console.error('Fallo en la conexión a la base de datos:', error);
    res.status(500).json({ 
        status: 'error', 
        message: 'Error de conexión' 
    });
}
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));