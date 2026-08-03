const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Buscamos el token en los headers de la petición HTTP.
    // El frontend debe mandar un header llamado 'Authorization' con el formato: "Bearer [token]"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Si no hay token 401 Unauthorized
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Se requiere un token de autenticación.' });
    }

    try {
        // misma clave secreta que pusimos en el login
        const decoded = jwt.verify(token, 'firma_secreta_f2');
        req.user = decoded;
        next(); //Se ejecuta el controlador
        
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = authenticateToken;
