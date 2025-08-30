const jwt = require('jsonwebtoken');
const mongoClient = require('../lib/mongoClient.js');

// Unificar secreto con el usado al firmar en authController
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Middleware de autenticación para sistema SAAS multi-tenant
const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔐 DEBUG - authMiddleware llamado para:', req.path);
    
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    console.log('🔐 DEBUG - authHeader:', authHeader ? 'Presente' : 'Ausente');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ DEBUG - Token no válido en header');
      return res.status(401).json({ message: 'Token de acceso requerido.' });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔐 DEBUG - Token extraído:', token.substring(0, 20) + '...');

    // Verificar token JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Log para depuración
    console.log('🔓 Decoded JWT:', decoded);
    
    // Aceptar tanto 'id' como 'userId' en el token
    const userId = decoded.id || decoded.userId;
    if (!userId || (typeof userId !== 'string' && typeof userId !== 'number')) {
      console.log('❌ DEBUG - Token sin ID de usuario válido');
      return res.status(401).json({ message: 'Token sin ID de usuario válido.' });
    }
    
    console.log('👤 User ID from token:', userId);
    
    // Obtener usuario actual de la base de datos
    const userResult = await mongoClient.execute({
      sql: `SELECT _id as id, organization_id, name, email, role, is_active 
            FROM usuarios 
            WHERE _id = ? AND is_active = 1`,
      args: [userId]
    });

    if (userResult.rows.length === 0) {
      console.log('❌ DEBUG - Usuario no encontrado en BD');
      return res.status(401).json({ message: 'Usuario no válido o inactivo.' });
    }

    const user = userResult.rows[0];
    console.log('👤 User from DB:', user);

    // Agregar usuario al request para uso en controladores
    req.user = user;
    console.log('✅ DEBUG - Usuario agregado a req.user');
    next();

  } catch (error) {
    console.error('❌ DEBUG - Error en authMiddleware:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado.' });
    }
    
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = authMiddleware;
