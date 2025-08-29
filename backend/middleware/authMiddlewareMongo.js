const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Secreto JWT desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Middleware de autenticación para MongoDB
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
    
    // Obtener usuario actual de MongoDB
    const usersCollection = mongoose.connection.db.collection('users');
    const user = await usersCollection.findOne({
      $or: [
        { _id: userId },
        { id: userId },
        { _id: new mongoose.Types.ObjectId(userId) }
      ],
      is_active: true
    });

    if (!user) {
      console.log('❌ DEBUG - Usuario no encontrado en MongoDB');
      return res.status(401).json({ message: 'Usuario no válido o inactivo.' });
    }

    console.log('👤 User from MongoDB:', user);

    // Agregar usuario al request para uso en controladores
    req.user = {
      id: user._id || user.id,
      organization_id: user.organization_id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    };
    
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