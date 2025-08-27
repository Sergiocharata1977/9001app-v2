/**
 * Sistema de roles jerárquico para ISOFlow4
 * Roles ordenados por nivel de permisos (menor a mayor)
 */
export enum Role {
  // Externo - Nivel más bajo
  PROVEEDOR = 'proveedor',           // Proveedores externos con acceso limitado
  
  // Usuarios internos básicos
  USUARIO = 'usuario',               // Usuario básico del sistema
  
  // Gestores de proceso
  DUENO_PROCESO = 'dueno_proceso',   // Dueño de proceso específico
  
  // Auditores
  AUDITOR = 'auditor',               // Auditor interno/externo
  
  // Administradores organizacionales
  ORG_ADMIN = 'org_admin',           // Administrador de organización
  
  // Super administrador - Nivel más alto
  SUPER_ADMIN = 'super_admin',       // Super administrador del sistema
}

/**
 * Jerarquía de roles para validación de permisos
 * Un rol superior incluye todos los permisos de los roles inferiores
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.PROVEEDOR]: 1,
  [Role.USUARIO]: 2,
  [Role.DUENO_PROCESO]: 3,
  [Role.AUDITOR]: 4,
  [Role.ORG_ADMIN]: 5,
  [Role.SUPER_ADMIN]: 6,
};

/**
 * Verifica si un rol tiene permisos suficientes
 * @param userRole Rol del usuario
 * @param requiredRole Rol requerido
 * @returns true si el usuario tiene permisos suficientes
 */
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Obtiene todos los roles que tienen permisos menores o iguales al rol dado
 * @param role Rol base
 * @returns Array de roles con permisos menores o iguales
 */
export function getSubordinateRoles(role: Role): Role[] {
  const roleLevel = ROLE_HIERARCHY[role];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level <= roleLevel)
    .map(([roleName, _]) => roleName as Role);
}

/**
 * Permisos específicos por módulo y acción
 */
export const ROLE_PERMISSIONS = {
  // Gestión de tenants
  tenants: {
    create: [Role.SUPER_ADMIN],
    read: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
    update: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
    delete: [Role.SUPER_ADMIN],
    list: [Role.SUPER_ADMIN],
  },
  
  // Gestión de usuarios
  users: {
    create: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
    read: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR],
    update: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
    delete: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
    list: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR],
    assign_roles: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
  },
  
  // Gestión documental
  documents: {
    create: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO, Role.USUARIO],
    read: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO, Role.USUARIO, Role.PROVEEDOR],
    update: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO],
    delete: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
    approve: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO],
    publish: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO],
    obsolete: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO],
  },
  
  // Gestión de procesos
  processes: {
    create: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO],
    read: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO, Role.USUARIO],
    update: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO],
    delete: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
    assign_owner: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
  },
  
  // Auditorías
  audits: {
    create: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR],
    read: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO],
    update: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR],
    delete: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
    plan: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR],
    execute: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR],
    report: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR],
  },
  
  // No conformidades y CAPA
  nonConformities: {
    create: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO, Role.USUARIO],
    read: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO, Role.USUARIO],
    update: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO],
    delete: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
    close: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR],
    verify_effectiveness: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR],
  },
  
  // Capacitaciones
  training: {
    create: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO],
    read: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO, Role.USUARIO],
    update: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO],
    delete: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
    assign: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO],
    evaluate: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO],
  },
  
  // Indicadores
  indicators: {
    create: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO],
    read: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO, Role.USUARIO],
    update: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO],
    delete: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
    collect_data: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO, Role.USUARIO],
  },
  
  // Reportes
  reports: {
    create: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO],
    read: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO],
    export: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO],
    share: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
  },
  
  // Notificaciones
  notifications: {
    send: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.DUENO_PROCESO],
    read: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO, Role.USUARIO, Role.PROVEEDOR],
    mark_read: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO, Role.USUARIO, Role.PROVEEDOR],
  },
  
  // Búsqueda
  search: {
    basic: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO, Role.USUARIO, Role.PROVEEDOR],
    advanced: [Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.AUDITOR, Role.DUENO_PROCESO],
    index: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
  },
  
  // Configuración del sistema
  system: {
    configure: [Role.SUPER_ADMIN],
    monitor: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
    backup: [Role.SUPER_ADMIN],
    restore: [Role.SUPER_ADMIN],
    logs: [Role.SUPER_ADMIN, Role.ORG_ADMIN],
  },
} as const;

/**
 * Verifica si un rol tiene permiso para una acción específica
 * @param userRole Rol del usuario
 * @param module Módulo del sistema
 * @param action Acción a verificar
 * @returns true si el usuario tiene permiso
 */
export function hasPermission(
  userRole: Role,
  module: keyof typeof ROLE_PERMISSIONS,
  action: string,
): boolean {
  const modulePermissions = ROLE_PERMISSIONS[module];
  if (!modulePermissions || !modulePermissions[action]) {
    return false;
  }
  
  return modulePermissions[action].includes(userRole);
}