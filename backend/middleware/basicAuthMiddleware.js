const jwt = require('jsonwebtoken');
import MongoDBConnection from '../config/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

/**
 * Middleware básico de autenticación + multi-tenant
 * Solo verifica que el usuario esté logueado y agrega info de organización
 */
const basicAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Obtener información completa del usuario y organización
    const userResult = await tursoClient.execute({
      sql: `SELECT u.id, u.name, u.email, u.role, u.organization_id, 
             o.name as organization_name, o.plan, o.max_users
             FROM usuarios u 
             LEFT JOIN organizations o ON u.organization_id = o.id 
             WHERE u.id = ?`,
      args: [decoded.id]
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
      organization_plan: user.plan || 'basic',
      organization_name: user.organization_name || 'Sin organización',
      max_users: Number(user.max_users) || 10
    };

    console.log(`🔐 Usuario autenticado: ${req.user.email} (Org: ${req.user.organization_name})`);

    next();
  } catch (error) {
    console.error('Error en autenticación básica:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

/**
 * Middleware para asegurar aislamiento multi-tenant
 * Agrega organization_id a todas las consultas
 */
const ensureMultiTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  // Super admin puede ver todo sin restricciones
  if (req.user.role === 'super_admin') {
    console.log('👑 Super admin - sin restricciones de organización');
    return next();
  }

  // Agregar organization_id al query params para filtrado automático
  req.tenantId = req.user.organization_id;
  
  console.log(`🏢 Multi-tenant: Filtrando por organización ${req.tenantId}`);
  
  next();
};

/**
 * Helper function para agregar filtro de organización a queries
 */
const addOrgFilter = (query, args, organizationId) => {
  if (!organizationId) return { query, args };
  
  // Si ya tiene WHERE, agregar AND
  if (query.toUpperCase().includes('WHERE')) {
    query += ' AND organization_id = ?';
  } else {
    query += ' WHERE organization_id = ?';
  }
  
  args.push(organizationId);
  
  return { query, args };
};

export default {
  basicAuth,
  ensureMultiTenant,
  addOrgFilter
}; 