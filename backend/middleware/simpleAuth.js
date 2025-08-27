const jwt = require('jsonwebtoken');
import MongoDBConnection from '../config/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_super_secreto';

/**
 * Middleware ULTRA SIMPLE - Solo verifica que haya token válido
 * NO hay restricciones de roles, organizaciones, nada
 */
const simpleAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token requerido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Obtener usuario básico
    const userResult = await tursoClient.execute({
      sql: `SELECT u.id, u.name, u.email, u.role, u.organization_id, 
             o.name as organization_name 
             FROM usuarios u 
             LEFT JOIN organizations o ON u.organization_id = o.id 
             WHERE u.id = ?`,
      args: [decoded.userId]
    });

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];
    req.user = {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      organization_id: Number(user.organization_id),
      organization_name: user.organization_name
    };

    console.log(`🔓 Usuario autenticado: ${req.user.email} - ACCESO TOTAL`);
    console.log(`🔓 User object:`, req.user);
    next();
    
  } catch (error) {
    console.error('Error en autenticación simple:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = simpleAuth; 