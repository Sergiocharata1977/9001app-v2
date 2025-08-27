import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import databaseManager from '../config/database';
import { User, Organization } from '../types';
import { logAudit, logError } from '../utils/logger';

// Extender la interfaz Request para incluir información del tenant
declare global {
  namespace Express {
    interface Request {
      organizationId?: string;
      organization?: Organization;
      user?: User;
      db?: any;
      tenant?: {
        id: string;
        name: string;
        slug: string;
        settings: any;
        limits: any;
      };
    }
  }
}

// Cache para organizaciones
const organizationCache = new Map<string, { organization: Organization; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Middleware para extraer y validar el ID de organización
 */
export const extractOrganizationId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener organization ID del header, query params o body
    const organizationId = 
      req.headers['x-organization-id'] as string ||
      req.query.organizationId as string ||
      req.body?.organizationId as string;

    if (!organizationId) {
      res.status(401).json({
        error: 'Organization ID required',
        code: 'MISSING_ORGANIZATION_ID'
      });
      return;
    }

    // Validar formato del ObjectId
    if (!ObjectId.isValid(organizationId)) {
      res.status(400).json({
        error: 'Invalid organization ID format',
        code: 'INVALID_ORGANIZATION_ID'
      });
      return;
    }

    req.organizationId = organizationId;
    next();
  } catch (error) {
    logError('Error extracting organization ID', error as Error, { 
      path: req.path, 
      method: req.method 
    });
    res.status(500).json({
      error: 'Internal server error',
      code: 'ORGANIZATION_EXTRACTION_ERROR'
    });
  }
};

/**
 * Middleware para cargar información de la organización
 */
export const loadOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.organizationId) {
      res.status(401).json({
        error: 'Organization ID not found',
        code: 'MISSING_ORGANIZATION_ID'
      });
      return;
    }

    // Verificar cache
    const cached = organizationCache.get(req.organizationId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      req.organization = cached.organization;
      req.tenant = {
        id: cached.organization._id.toString(),
        name: cached.organization.name,
        slug: cached.organization.slug,
        settings: cached.organization.settings,
        limits: cached.organization.limits
      };
      next();
      return;
    }

    // Cargar desde base de datos
    const mainDb = databaseManager.getMainDatabase();
    const organization = await mainDb.collection('organizations').findOne({
      _id: new ObjectId(req.organizationId),
      status: 'active'
    });

    if (!organization) {
      res.status(404).json({
        error: 'Organization not found or inactive',
        code: 'ORGANIZATION_NOT_FOUND'
      });
      return;
    }

    // Actualizar cache
    organizationCache.set(req.organizationId, {
      organization: organization as Organization,
      timestamp: Date.now()
    });

    req.organization = organization as Organization;
    req.tenant = {
      id: organization._id.toString(),
      name: organization.name,
      slug: organization.slug,
      settings: organization.settings,
      limits: organization.limits
    };

    next();
  } catch (error) {
    logError('Error loading organization', error as Error, { 
      organizationId: req.organizationId,
      path: req.path 
    });
    res.status(500).json({
      error: 'Internal server error',
      code: 'ORGANIZATION_LOAD_ERROR'
    });
  }
};

/**
 * Middleware para configurar la base de datos del tenant
 */
export const setupTenantDatabase = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.organizationId) {
      res.status(401).json({
        error: 'Organization ID not found',
        code: 'MISSING_ORGANIZATION_ID'
      });
      return;
    }

    // Obtener base de datos específica del tenant
    const tenantDb = databaseManager.getTenantDatabase(req.organizationId);
    req.db = tenantDb;

    next();
  } catch (error) {
    logError('Error setting up tenant database', error as Error, { 
      organizationId: req.organizationId 
    });
    res.status(500).json({
      error: 'Internal server error',
      code: 'TENANT_DATABASE_ERROR'
    });
  }
};

/**
 * Middleware para validar límites de la organización
 */
export const validateOrganizationLimits = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.organization) {
      res.status(401).json({
        error: 'Organization not loaded',
        code: 'ORGANIZATION_NOT_LOADED'
      });
      return;
    }

    const { limits } = req.organization;
    const { method, path } = req;

    // Validar límites según el tipo de operación
    if (method === 'POST' && path.includes('/processes')) {
      // Contar procesos activos
      const processCount = await req.db.collection('processes').countDocuments({
        is_active: true
      });

      if (processCount >= limits.processes) {
        res.status(403).json({
          error: 'Process limit exceeded',
          code: 'PROCESS_LIMIT_EXCEEDED',
          limit: limits.processes,
          current: processCount
        });
        return;
      }
    }

    if (path.includes('/ai/')) {
      // Validar límites de IA
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const aiRequestsCount = await req.db.collection('ai_requests').countDocuments({
        organization_id: new ObjectId(req.organizationId),
        created_at: { $gte: today }
      });

      if (aiRequestsCount >= limits.ai_requests) {
        res.status(403).json({
          error: 'AI requests limit exceeded',
          code: 'AI_REQUESTS_LIMIT_EXCEEDED',
          limit: limits.ai_requests,
          current: aiRequestsCount
        });
        return;
      }
    }

    next();
  } catch (error) {
    logError('Error validating organization limits', error as Error, { 
      organizationId: req.organizationId 
    });
    res.status(500).json({
      error: 'Internal server error',
      code: 'LIMITS_VALIDATION_ERROR'
    });
  }
};

/**
 * Middleware para verificar características habilitadas
 */
export const checkFeatureEnabled = (feature: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.organization) {
        res.status(401).json({
          error: 'Organization not loaded',
          code: 'ORGANIZATION_NOT_LOADED'
        });
        return;
      }

      const { features } = req.organization.settings;
      
      if (!features.includes(feature)) {
        res.status(403).json({
          error: `Feature '${feature}' not enabled`,
          code: 'FEATURE_NOT_ENABLED',
          feature
        });
        return;
      }

      next();
    } catch (error) {
      logError('Error checking feature enabled', error as Error, { 
        feature, 
        organizationId: req.organizationId 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'FEATURE_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware para verificar permisos de usuario
 */
export const checkUserPermissions = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'User not authenticated',
          code: 'USER_NOT_AUTHENTICATED'
        });
        return;
      }

      const { permissions, role } = req.user;

      // SuperAdmin tiene todos los permisos
      if (role === 'SuperAdmin') {
        next();
        return;
      }

      // Verificar permisos específicos
      const hasAllPermissions = requiredPermissions.every(permission => 
        permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        logAudit('Permission denied', {
          user: req.user.email,
          organization: req.organization?.name,
          action: 'ACCESS_DENIED',
          resource: req.path,
          details: { requiredPermissions, userPermissions: permissions }
        });

        res.status(403).json({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: requiredPermissions,
          current: permissions
        });
        return;
      }

      next();
    } catch (error) {
      logError('Error checking user permissions', error as Error, { 
        requiredPermissions,
        userId: req.user?._id 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'PERMISSIONS_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware para verificar roles de usuario
 */
export const checkUserRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'User not authenticated',
          code: 'USER_NOT_AUTHENTICATED'
        });
        return;
      }

      const { role } = req.user;

      if (!allowedRoles.includes(role)) {
        logAudit('Role access denied', {
          user: req.user.email,
          organization: req.organization?.name,
          action: 'ROLE_ACCESS_DENIED',
          resource: req.path,
          details: { requiredRoles: allowedRoles, userRole: role }
        });

        res.status(403).json({
          error: 'Insufficient role privileges',
          code: 'INSUFFICIENT_ROLE_PRIVILEGES',
          required: allowedRoles,
          current: role
        });
        return;
      }

      next();
    } catch (error) {
      logError('Error checking user role', error as Error, { 
        allowedRoles,
        userId: req.user?._id 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'ROLE_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware para limpiar cache de organización
 */
export const clearOrganizationCache = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.organizationId) {
      organizationCache.delete(req.organizationId);
    }
    next();
  } catch (error) {
    logError('Error clearing organization cache', error as Error, { 
      organizationId: req.organizationId 
    });
    next(); // Continuar aunque falle la limpieza del cache
  }
};

/**
 * Middleware completo de tenancy
 */
export const tenantMiddleware = [
  extractOrganizationId,
  loadOrganization,
  setupTenantDatabase,
  validateOrganizationLimits
];

/**
 * Función para limpiar cache expirado
 */
export const cleanupExpiredCache = (): void => {
  const now = Date.now();
  for (const [key, value] of organizationCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      organizationCache.delete(key);
    }
  }
};

// Limpiar cache expirado cada 5 minutos
setInterval(cleanupExpiredCache, 5 * 60 * 1000);

export default {
  extractOrganizationId,
  loadOrganization,
  setupTenantDatabase,
  validateOrganizationLimits,
  checkFeatureEnabled,
  checkUserPermissions,
  checkUserRole,
  clearOrganizationCache,
  tenantMiddleware
};