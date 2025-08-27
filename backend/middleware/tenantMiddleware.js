const mongoClient = require('../lib/mongoClient.js');

/**
 * Middleware para asegurar que todas las operaciones estén limitadas a la organización del usuario
 * Este middleware debe aplicarse DESPUÉS del middleware de autenticación
 */
const ensureTenant = (req, res, next) => {
  // Verificar que el usuario esté autenticado y tenga organization_id
  if (!req.user || !req.user.organization_id) {
    return res.status(403).json({ 
      message: 'Acceso denegado: organización no identificada',
      error: 'MISSING_ORGANIZATION'
    });
  }
  
  // Agregar el organization_id al request para fácil acceso
  req.organizationId = req.user.organization_id;
  req.userRole = req.user.role;
  
  next();
};

/**
 * Helper para crear queries seguros con filtro automático por organización
 */
const secureQuery = (req) => {
  const organizationId = req.organizationId;
  
  return {
    // ID de la organización
    organizationId,
    
    // Función para agregar WHERE clause de organización
    where: (additionalConditions = '') => {
      const orgCondition = 'organization_id = ?';
      if (additionalConditions) {
        return `${orgCondition} AND ${additionalConditions}`;
      }
      return orgCondition;
    },
    
    // Función para agregar args de organización
    args: (additionalArgs = []) => {
      return [organizationId, ...additionalArgs];
    },
    
    // Función para ejecutar query seguro
    execute: async (sql, args = []) => {
      return await mongoClient.execute({
        sql,
        args: [organizationId, ...args]
      });
    }
  };
};

/**
 * Helper para verificar si el usuario tiene permisos para una operación específica
 */
const checkPermission = (req, requiredRole) => {
  const userRole = req.userRole;
  
  // Jerarquía de roles: super_admin > admin > manager > employee
  const roleHierarchy = {
    'super_admin': 4,
    'admin': 3,
    'manager': 2,
    'employee': 1
  };
  
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
};

/**
 * Middleware para verificar roles específicos
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!checkPermission(req, requiredRole)) {
      return res.status(403).json({
        message: `Acceso denegado: se requiere rol ${requiredRole} o superior`,
        error: 'INSUFFICIENT_PERMISSIONS',
        userRole: req.userRole,
        requiredRole
      });
    }
    next();
  };
};

/**
 * Helper para logging de operaciones con contexto de organización
 */
const logTenantOperation = (req, operation, details = {}) => {
  console.log(`[TENANT-${req.organizationId}] ${operation}`, {
    userId: req.user.id,
    userRole: req.userRole,
    timestamp: new Date().toISOString(),
    ...details
  });
};

/**
 * Middleware para verificar que un recurso pertenece a la organización del usuario
 */
const verifyResourceOwnership = (tableName, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const { organizationId } = secureQuery(req);
      
      const result = await mongoClient.execute({
        sql: `SELECT id FROM ${tableName} WHERE id = ? AND organization_id = ?`,
        args: [resourceId, organizationId]
      });
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          message: 'Recurso no encontrado o no pertenece a su organización',
          error: 'RESOURCE_NOT_FOUND'
        });
      }
      
      next();
    } catch (error) {
      console.error('Error verificando propiedad del recurso:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  };
};

module.exports = {
  ensureTenant,
  secureQuery,
  checkPermission,
  requireRole,
  logTenantOperation,
  verifyResourceOwnership
};