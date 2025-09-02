// ========== TIPOS DE API ==========

// Respuesta genérica de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Respuesta paginada
export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    from: number;
    to: number;
  };
}

// Parámetros de paginación
export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Parámetros de búsqueda
export interface ApiSearchParams extends PaginationParams {
  search?: string;
  filters?: Record<string, any>;
}

// Estados de carga
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// ========== TIPOS DE AUTENTICACIÓN ==========
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: any; // User type will be defined in common.ts
  token: string;
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ========== TIPOS DE ARCHIVOS ==========
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploaded_at: string;
}

export interface FileUploadResponse {
  file: FileUpload;
  message: string;
}

// ========== TIPOS DE NOTIFICACIONES ==========
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// ========== TIPOS DE LOGS ==========
export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ========== TIPOS DE CONFIGURACIÓN ==========
export interface AppConfig {
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: Record<string, boolean>;
  limits: Record<string, number>;
}

// ========== TIPOS DE ESTADÍSTICAS ==========
export interface DashboardStats {
  total_users: number;
  total_organizations: number;
  total_audits: number;
  total_findings: number;
  recent_activities: ActivityLog[];
  system_health: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    memory_usage: number;
    cpu_usage: number;
  };
}

// ========== TIPOS DE EXPORTACIÓN ==========
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  include_headers: boolean;
  date_format: string;
  timezone: string;
}

export interface ExportRequest {
  entity_type: string;
  filters?: Record<string, any>;
  options: ExportOptions;
}

// ========== TIPOS DE VALIDACIÓN ==========
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ========== TIPOS DE PERMISOS ==========
// Estos tipos se definen en common.ts para evitar duplicación

// ========== TIPOS DE WORKFLOW ==========
export interface WorkflowStep {
  id: string;
  name: string;
  order: number;
  required: boolean;
  assignee_type: 'user' | 'role' | 'department';
  assignee_id?: string;
  conditions?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  entity_type: string;
  steps: WorkflowStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ========== TIPOS DE TEMPLATES ==========
export interface Template {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'document' | 'report';
  content: string;
  variables: string[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

// ========== TIPOS DE INTEGRACIONES ==========
export interface Integration {
  id: string;
  name: string;
  type: 'email' | 'calendar' | 'storage' | 'api';
  provider: string;
  config: Record<string, any>;
  is_active: boolean;
  last_sync?: string;
  created_at: string;
  updated_at: string;
}
