// Tipos globales para el proyecto ISO 9001 APP

declare module '*.jsx' {
  const content: any;
  export default content;
}

declare module '*.js' {
  const content: any;
  export default content;
}

declare module '@/components/ui/*' {
  const component: React.ComponentType<any>;
  export default component;
}

declare module '@/hooks/*' {
  const hook: any;
  export default hook;
}

declare module '@/services/*' {
  const service: any;
  export default service;
}

// Tipos globales para APIs
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para filtros comunes
interface BaseFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Tipos para estados comunes
type EstadoComun = 'activo' | 'inactivo' | 'pendiente' | 'completado' | 'cancelado';

// Tipos para fechas
type DateString = string; // Formato ISO 8601
type DateTimeString = string; // Formato ISO 8601 con tiempo

// Tipos para IDs
type ID = string | number;

// Tipos para formularios
interface FormErrors {
  [key: string]: string;
}

interface FormState<T = any> {
  data: T;
  errors: FormErrors;
  isValid: boolean;
  isSubmitting: boolean;
}

// Tipos para notificaciones
interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Tipos para permisos
type Permission = string;
type Role = 'admin' | 'user' | 'moderator' | 'viewer';

// Tipos para archivos
interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: DateString;
}

// Tipos para auditoría
interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: DateString;
  details?: any;
}

// Tipos para configuración
interface AppConfig {
  apiUrl: string;
  appName: string;
  version: string;
  environment: 'development' | 'production' | 'staging';
}

// Declaraciones globales
declare global {
  interface Window {
    __APP_CONFIG__: AppConfig;
  }
}

export {};
