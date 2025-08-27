/**
 * Estados de un tenant/organización en el sistema
 */
export enum TenantStatus {
  // Estado inicial
  PENDING = 'pending',           // Pendiente de activación
  
  // Estados activos
  ACTIVE = 'active',             // Activo y operativo
  TRIAL = 'trial',               // En período de prueba
  
  // Estados de suspensión
  SUSPENDED = 'suspended',       // Suspendido temporalmente
  PAYMENT_REQUIRED = 'payment_required', // Requiere pago
  
  // Estados finales
  CANCELLED = 'cancelled',       // Cancelado por el cliente
  TERMINATED = 'terminated',     // Terminado por el sistema
}

/**
 * Planes de suscripción disponibles
 */
export enum TenantPlan {
  // Plan gratuito
  FREE = 'free',                 // Plan gratuito con limitaciones
  
  // Planes de pago
  BASIC = 'basic',               // Plan básico
  STANDARD = 'standard',         // Plan estándar
  PREMIUM = 'premium',           // Plan premium
  ENTERPRISE = 'enterprise',     // Plan empresarial
  
  // Planes especiales
  TRIAL = 'trial',               // Plan de prueba temporal
  CUSTOM = 'custom',             // Plan personalizado
}

/**
 * Límites por plan de suscripción
 */
export const PLAN_LIMITS = {
  [TenantPlan.FREE]: {
    maxUsers: 5,
    maxDocuments: 100,
    maxProcesses: 10,
    maxAudits: 5,
    maxStorage: 1024 * 1024 * 1024, // 1GB
    maxApiCalls: 1000,
    maxIntegrations: 1,
    features: {
      advancedReports: false,
      customWorkflows: false,
      ssoIntegration: false,
      apiAccess: true,
      mobileApp: false,
      prioritySupport: false,
      multiLanguage: false,
      auditTrail: false,
      backup: false,
      customBranding: false,
    },
  },
  
  [TenantPlan.BASIC]: {
    maxUsers: 25,
    maxDocuments: 1000,
    maxProcesses: 50,
    maxAudits: 25,
    maxStorage: 5 * 1024 * 1024 * 1024, // 5GB
    maxApiCalls: 10000,
    maxIntegrations: 3,
    features: {
      advancedReports: true,
      customWorkflows: false,
      ssoIntegration: false,
      apiAccess: true,
      mobileApp: true,
      prioritySupport: false,
      multiLanguage: true,
      auditTrail: true,
      backup: true,
      customBranding: false,
    },
  },
  
  [TenantPlan.STANDARD]: {
    maxUsers: 100,
    maxDocuments: 5000,
    maxProcesses: 200,
    maxAudits: 100,
    maxStorage: 20 * 1024 * 1024 * 1024, // 20GB
    maxApiCalls: 50000,
    maxIntegrations: 10,
    features: {
      advancedReports: true,
      customWorkflows: true,
      ssoIntegration: true,
      apiAccess: true,
      mobileApp: true,
      prioritySupport: true,
      multiLanguage: true,
      auditTrail: true,
      backup: true,
      customBranding: true,
    },
  },
  
  [TenantPlan.PREMIUM]: {
    maxUsers: 500,
    maxDocuments: 25000,
    maxProcesses: 1000,
    maxAudits: 500,
    maxStorage: 100 * 1024 * 1024 * 1024, // 100GB
    maxApiCalls: 250000,
    maxIntegrations: 25,
    features: {
      advancedReports: true,
      customWorkflows: true,
      ssoIntegration: true,
      apiAccess: true,
      mobileApp: true,
      prioritySupport: true,
      multiLanguage: true,
      auditTrail: true,
      backup: true,
      customBranding: true,
    },
  },
  
  [TenantPlan.ENTERPRISE]: {
    maxUsers: -1, // Ilimitado
    maxDocuments: -1, // Ilimitado
    maxProcesses: -1, // Ilimitado
    maxAudits: -1, // Ilimitado
    maxStorage: -1, // Ilimitado
    maxApiCalls: -1, // Ilimitado
    maxIntegrations: -1, // Ilimitado
    features: {
      advancedReports: true,
      customWorkflows: true,
      ssoIntegration: true,
      apiAccess: true,
      mobileApp: true,
      prioritySupport: true,
      multiLanguage: true,
      auditTrail: true,
      backup: true,
      customBranding: true,
    },
  },
  
  [TenantPlan.TRIAL]: {
    maxUsers: 10,
    maxDocuments: 500,
    maxProcesses: 25,
    maxAudits: 10,
    maxStorage: 2 * 1024 * 1024 * 1024, // 2GB
    maxApiCalls: 5000,
    maxIntegrations: 2,
    features: {
      advancedReports: true,
      customWorkflows: true,
      ssoIntegration: false,
      apiAccess: true,
      mobileApp: true,
      prioritySupport: false,
      multiLanguage: true,
      auditTrail: true,
      backup: false,
      customBranding: false,
    },
  },
  
  [TenantPlan.CUSTOM]: {
    maxUsers: -1, // Definido por contrato
    maxDocuments: -1, // Definido por contrato
    maxProcesses: -1, // Definido por contrato
    maxAudits: -1, // Definido por contrato
    maxStorage: -1, // Definido por contrato
    maxApiCalls: -1, // Definido por contrato
    maxIntegrations: -1, // Definido por contrato
    features: {
      advancedReports: true,
      customWorkflows: true,
      ssoIntegration: true,
      apiAccess: true,
      mobileApp: true,
      prioritySupport: true,
      multiLanguage: true,
      auditTrail: true,
      backup: true,
      customBranding: true,
    },
  },
} as const;

/**
 * Configuraciones de retención de datos por plan
 */
export const DATA_RETENTION_POLICIES = {
  [TenantPlan.FREE]: {
    auditLogDays: 30,
    backupRetentionDays: 7,
    deletedItemRetentionDays: 7,
  },
  [TenantPlan.BASIC]: {
    auditLogDays: 90,
    backupRetentionDays: 30,
    deletedItemRetentionDays: 30,
  },
  [TenantPlan.STANDARD]: {
    auditLogDays: 365,
    backupRetentionDays: 90,
    deletedItemRetentionDays: 90,
  },
  [TenantPlan.PREMIUM]: {
    auditLogDays: 1095, // 3 años
    backupRetentionDays: 365,
    deletedItemRetentionDays: 365,
  },
  [TenantPlan.ENTERPRISE]: {
    auditLogDays: 2555, // 7 años
    backupRetentionDays: 1095, // 3 años
    deletedItemRetentionDays: 1095, // 3 años
  },
  [TenantPlan.TRIAL]: {
    auditLogDays: 30,
    backupRetentionDays: 0, // Sin backup
    deletedItemRetentionDays: 7,
  },
  [TenantPlan.CUSTOM]: {
    auditLogDays: -1, // Definido por contrato
    backupRetentionDays: -1, // Definido por contrato
    deletedItemRetentionDays: -1, // Definido por contrato
  },
} as const;

/**
 * Verifica si un tenant puede realizar una acción basada en los límites de su plan
 * @param plan Plan del tenant
 * @param resource Recurso a verificar
 * @param currentUsage Uso actual
 * @returns true si puede realizar la acción
 */
export function canPerformAction(
  plan: TenantPlan,
  resource: keyof typeof PLAN_LIMITS[TenantPlan.FREE],
  currentUsage: number,
): boolean {
  const limits = PLAN_LIMITS[plan];
  const limit = limits[resource];
  
  // -1 significa ilimitado
  if (limit === -1) {
    return true;
  }
  
  return currentUsage < limit;
}

/**
 * Verifica si un tenant tiene acceso a una funcionalidad específica
 * @param plan Plan del tenant
 * @param feature Funcionalidad a verificar
 * @returns true si tiene acceso
 */
export function hasFeatureAccess(
  plan: TenantPlan,
  feature: keyof typeof PLAN_LIMITS[TenantPlan.FREE]['features'],
): boolean {
  const limits = PLAN_LIMITS[plan];
  return limits.features[feature];
}

/**
 * Obtiene el porcentaje de uso de un recurso
 * @param plan Plan del tenant
 * @param resource Recurso a verificar
 * @param currentUsage Uso actual
 * @returns Porcentaje de uso (0-100, -1 para ilimitado)
 */
export function getUsagePercentage(
  plan: TenantPlan,
  resource: keyof typeof PLAN_LIMITS[TenantPlan.FREE],
  currentUsage: number,
): number {
  const limits = PLAN_LIMITS[plan];
  const limit = limits[resource];
  
  // -1 significa ilimitado
  if (limit === -1) {
    return -1;
  }
  
  return Math.min(100, (currentUsage / limit) * 100);
}