const bcrypt = require('bcrypt');

const createAdmin = async () => {
    try {
        const adminUser = process.env.ADMIN_USER;
        const adminPass = process.env.ADMIN_PASSWORD;

        if (!adminUser || !adminPass) return;
        const check = await pool.query('SELECT id FROM users WHERE username = $1', [adminUser]);
        
        if (check.rows.length === 0) {
            const saltRounds = 10;
            const hashed = await bcrypt.hash(adminPass, saltRounds);
            
            await pool.query(
                `INSERT INTO users (username, password_hash, role, first_name, last_name) 
                 VALUES ($1, $2, 'admin', 'Admin', 'Admin')`,
                [adminUser, hashed]
            );
            console.log(`Usuario Administrador inicializado: ${adminUser}`);
        }
    } catch (error) {
        console.error('Error creando el admin por defecto:', error);
    }
};

module.exports = { createAdmin };
