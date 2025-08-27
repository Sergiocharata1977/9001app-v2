const mongoClient = require('../lib/mongoClient.js');
const { randomUUID } = require('crypto');

// Función para registrar una acción en los logs de auditoría
const logAuditAction = async (userId, organizationId, action, resourceType, resourceId = null, details = null, req = null) => {
  try {
    // Validar que los parámetros requeridos estén presentes
    if (!userId || !organizationId) {
      console.warn('[AUDIT] Saltando log - Usuario o organización no definidos');
      return;
    }

    const logId = randomUUID();
    const timestamp = new Date().toISOString();
    
    // Obtener información de la petición HTTP si está disponible
    const ipAddress = req ? (req.ip || req.connection.remoteAddress || req.socket.remoteAddress) : null;
    const userAgent = req ? req.get('User-Agent') : null;

    await mongoClient.execute({
      sql: `INSERT INTO audit_logs 
            (id, user_id, organization_id, action, resource_type, resource_id, details, ip_address, user_agent, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [logId, userId, organizationId, action, resourceType, resourceId, details, ipAddress, userAgent, timestamp]
    });

    console.log(`[AUDIT] ${action} - ${resourceType} - User: ${userId} - Org: ${organizationId}`);
  } catch (error) {
    console.error('Error al registrar log de auditoría:', error);
    // No lanzar el error para no interrumpir el flujo principal
  }
};

// Middleware para registrar automáticamente las acciones de auditoría
const auditMiddleware = (action, resourceType) => {
  return async (req, res, next) => {
    // Almacenar la información original del response
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Interceptar la respuesta para registrar solo operaciones exitosas
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Registrar la acción solo si fue exitosa y el usuario está completamente definido
        if (req.user && req.user.id && req.user.organization_id) {
          const resourceId = req.params.id || req.body.id || null;
          const details = JSON.stringify({
            method: req.method,
            url: req.originalUrl,
            params: req.params,
            body: req.method !== 'GET' ? req.body : undefined
          });
          
          logAuditAction(
            req.user.id,
            req.user.organization_id,
            action,
            resourceType,
            resourceId,
            details,
            req
          );
        } else {
          console.warn('[AUDIT] Saltando log - Usuario no completamente definido en send');
        }
      }
      
      return originalSend.call(this, data);
    };
    
    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Registrar la acción solo si fue exitosa y el usuario está completamente definido
        if (req.user && req.user.id && req.user.organization_id) {
          const resourceId = req.params.id || req.body.id || data?.id || null;
          const details = JSON.stringify({
            method: req.method,
            url: req.originalUrl,
            params: req.params,
            body: req.method !== 'GET' ? req.body : undefined
          });
          
          logAuditAction(
            req.user.id,
            req.user.organization_id,
            action,
            resourceType,
            resourceId,
            details,
            req
          );
        } else {
          console.warn('[AUDIT] Saltando log - Usuario no completamente definido en json');
        }
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Funciones específicas para diferentes tipos de acciones
const auditActions = {
  // Acciones de autenticación
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  
  // Acciones CRUD
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  
  // Acciones específicas
  UPLOAD_FILE: 'UPLOAD_FILE',
  DOWNLOAD_FILE: 'DOWNLOAD_FILE',
  EXPORT_DATA: 'EXPORT_DATA',
  IMPORT_DATA: 'IMPORT_DATA',
  
  // Acciones de gestión de usuarios
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  CHANGE_USER_ROLE: 'CHANGE_USER_ROLE',
  
  // Acciones de configuración
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD'
};

// Tipos de recursos
const resourceTypes = {
  USER: 'USER',
  ORGANIZATION: 'ORGANIZATION',
  DOCUMENT: 'DOCUMENT',
  HALLAZGO: 'HALLAZGO',
  PROCESO: 'PROCESO',
  AUDITORIA: 'AUDITORIA',
  PERSONAL: 'PERSONAL',
  SETTINGS: 'SETTINGS'
};

// Middleware específicos para diferentes operaciones
const auditLogin = auditMiddleware(auditActions.LOGIN, resourceTypes.USER);
const auditLogout = auditMiddleware(auditActions.LOGOUT, resourceTypes.USER);
const auditRegister = auditMiddleware(auditActions.REGISTER, resourceTypes.USER);

const auditCreateUser = auditMiddleware(auditActions.CREATE_USER, resourceTypes.USER);
const auditUpdateUser = auditMiddleware(auditActions.UPDATE_USER, resourceTypes.USER);
const auditDeleteUser = auditMiddleware(auditActions.DELETE_USER, resourceTypes.USER);

const auditCreateDocument = auditMiddleware(auditActions.CREATE, resourceTypes.DOCUMENT);
const auditUpdateDocument = auditMiddleware(auditActions.UPDATE, resourceTypes.DOCUMENT);
const auditDeleteDocument = auditMiddleware(auditActions.DELETE, resourceTypes.DOCUMENT);
const auditDownloadDocument = auditMiddleware(auditActions.DOWNLOAD_FILE, resourceTypes.DOCUMENT);

const auditCreateHallazgo = auditMiddleware(auditActions.CREATE, resourceTypes.HALLAZGO);
const auditUpdateHallazgo = auditMiddleware(auditActions.UPDATE, resourceTypes.HALLAZGO);
const auditDeleteHallazgo = auditMiddleware(auditActions.DELETE, resourceTypes.HALLAZGO);

// Función para obtener logs de auditoría de una organización
const getAuditLogs = async (organizationId, limit = 100, offset = 0, filters = {}) => {
  try {
    let sql = `
      SELECT al.*, u.name as user_name, u.email as user_email 
      FROM audit_logs al
      LEFT JOIN usuarios u ON al.user_id = u.id
      WHERE al.organization_id = ?
    `;
    
    const args = [organizationId];
    
    // Aplicar filtros
    if (filters.action) {
      sql += ` AND al.action = ?`;
      args.push(filters.action);
    }
    
    if (filters.resourceType) {
      sql += ` AND al.resource_type = ?`;
      args.push(filters.resourceType);
    }
    
    if (filters.userId) {
      sql += ` AND al.user_id = ?`;
      args.push(filters.userId);
    }
    
    if (filters.dateFrom) {
      sql += ` AND al.timestamp >= ?`;
      args.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
      sql += ` AND al.timestamp <= ?`;
      args.push(filters.dateTo);
    }
    
    sql += ` ORDER BY al.timestamp DESC LIMIT ? OFFSET ?`;
    args.push(limit, offset);
    
    const result = await mongoClient.execute({ sql, args });
    return result.rows;
  } catch (error) {
    console.error('Error al obtener logs de auditoría:', error);
    throw error;
  }
};

module.exports = {
  logAuditAction,
  auditMiddleware,
  auditActions,
  resourceTypes,
  auditLogin,
  auditLogout,
  auditRegister,
  auditCreateUser,
  auditUpdateUser,
  auditDeleteUser,
  auditCreateDocument,
  auditUpdateDocument,
  auditDeleteDocument,
  auditDownloadDocument,
  auditCreateHallazgo,
  auditUpdateHallazgo,
  auditDeleteHallazgo,
  getAuditLogs
}; 