// ========== EXPORTACIONES CENTRALIZADAS DE TIPOS ==========

// Tipos comunes (primero para evitar referencias circulares)
export * from './common';

// Tipos de API (con alias para evitar conflictos)
export type { 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams, 
  ApiSearchParams, 
  LoadingState,
  LoginCredentials,
  AuthResponse,
  RefreshTokenRequest,
  FileUpload,
  FileUploadResponse,
  Notification,
  ActivityLog,
  AppConfig,
  DashboardStats,
  ExportOptions,
  ExportRequest,
  ValidationError,
  ApiValidationResult,
  WorkflowStep,
  Workflow,
  Template,
  Integration
} from './api';

// Tipos de formularios
export * from './forms';

// Tipos de acciones (con alias para evitar conflictos)
export type {
  Accion,
  AccionEstado,
  AccionPrioridad,
  AccionFormData as AccionFormDataType,
  AccionFilters as AccionFiltersType,
  AccionUpdateData,
  AccionStats,
  AccionViewMode,
  AccionEstadoConfig,
  AccionKanbanColumn,
  AccionTableAction,
  AccionTableColumn,
  AccionCardProps,
  AccionKanbanCardProps,
  AccionService,
  AccionWorkflow,
  AccionesListingProps
} from './acciones';

// Tipos de procesos SGC
export * from './procesos';

// Tipos de minutas SGC
export * from './minutas';

// Importaciones específicas para evitar errores de linter
import type { User, Department, Address, ContactInfo } from './common';
import type { FileUpload } from './api';

// Definición temporal de Process para evitar errores
interface Process {
  id: string;
  name: string;
  description?: string;
}

// ========== TIPOS SGC ESTANDARIZADO ==========

// Tipos para el sistema SGC estandarizado
export interface SgcPersonalRelacion {
  id: string;
  organization_id: number;
  entidad_tipo: 'minuta' | 'auditoria' | 'capacitacion' | 'proceso' | 'hallazgo' | 'evaluacion' | 'revision_direccion';
  entidad_id: string;
  personal_id: string;
  rol: string;
  asistio?: boolean;
  justificacion_ausencia?: string;
  observaciones?: string;
  datos_adicionales?: string; // JSON string
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

export interface SgcDocumentoRelacionado {
  id: string;
  organization_id: number;
  entidad_tipo: 'minuta' | 'auditoria' | 'capacitacion' | 'proceso' | 'hallazgo' | 'evaluacion' | 'revision_direccion';
  entidad_id: string;
  documento_id: number;
  tipo_relacion: 'adjunto' | 'evidencia' | 'material' | 'resultado' | 'entrada' | 'salida';
  descripcion?: string;
  es_obligatorio: boolean;
  datos_adicionales?: string; // JSON string
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

export interface SgcNormaRelacionada {
  id: string;
  organization_id: number;
  entidad_tipo: 'minuta' | 'auditoria' | 'capacitacion' | 'proceso' | 'hallazgo' | 'evaluacion' | 'revision_direccion';
  entidad_id: string;
  norma_id: number;
  punto_norma: string;
  clausula_descripcion?: string;
  tipo_relacion: 'aplica' | 'no_aplica' | 'competencia' | 'requisito';
  nivel_cumplimiento: 'cumple' | 'no_cumple' | 'parcial' | 'pendiente' | 'no_aplica';
  observaciones?: string;
  evidencias?: string;
  acciones_requeridas?: string;
  datos_adicionales?: string; // JSON string
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

// Tipos para vistas SGC completas
export interface SgcPersonalRelacionCompleto extends SgcPersonalRelacion {
  personal?: {
    id: string;
    nombre_completo: string;
    puesto: string;
    departamento: string;
    email: string;
  };
}

export interface SgcDocumentoRelacionadoCompleto extends SgcDocumentoRelacionado {
  documento?: {
    id: number;
    nombre: string;
    tipo: string;
    ruta_archivo: string;
  };
}

export interface SgcNormaRelacionadaCompleto extends SgcNormaRelacionada {
  norma?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
}

// Tipos para estadísticas SGC
export interface SgcEstadisticas {
  total_participantes: number;
  total_documentos: number;
  total_normas: number;
  distribucion_roles: Array<{
    rol: string;
    cantidad: number;
  }>;
  cumplimiento_normas: Array<{
    nivel_cumplimiento: string;
    cantidad: number;
  }>;
}

// ========== TIPOS ADICIONALES ESPECÍFICOS ==========

// Tipos de productos y servicios
export interface Producto {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  estado: 'planificacion' | 'entrada' | 'diseno' | 'verificacion' | 'validacion' | 'aprobado' | 'produccion' | 'obsoleto';
  tipo: 'producto' | 'servicio';
  categoria: string;
  responsable: string;
  fecha_creacion: string;
  fecha_revision: string;
  version: string;
  especificaciones: string;
  requisitos_calidad: string;
  proceso_aprobacion: string;
  documentos_asociados: string;
  observaciones: string;
  created_at: string;
  updated_at: string;
}

// Datos para creación/actualización de productos
export interface ProductoFormData {
  nombre: string;
  codigo: string;
  descripcion: string;
  estado?: 'planificacion' | 'entrada' | 'diseno' | 'verificacion' | 'validacion' | 'aprobado' | 'produccion' | 'obsoleto';
  tipo: 'producto' | 'servicio';
  categoria: string;
  responsable: string;
  fecha_creacion?: string;
  fecha_revision?: string;
  version?: string;
  especificaciones?: string;
  requisitos_calidad?: string;
  proceso_aprobacion?: string;
  documentos_asociados?: string;
  observaciones?: string;
}

// Tipos de documentos del sistema
export interface DocumentoSistema {
  id: number;
  nombre: string;
  tipo: 'minuta' | 'auditoria' | 'procedimiento' | 'politica' | 'registro' | 'manual' | 'otro';
  descripcion?: string;
  ruta_archivo: string;
  tamaño?: number;
  mime_type?: string;
  version?: string;
  estado: 'borrador' | 'revision' | 'aprobado' | 'obsoleto';
  autor_id?: string;
  autor?: User;
  fecha_creacion: string;
  fecha_modificacion?: string;
  fecha_aprobacion?: string;
  tags?: string[];
  metadatos?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Datos para creación/actualización de documentos
export interface DocumentoFormData {
  nombre: string;
  tipo: 'minuta' | 'auditoria' | 'procedimiento' | 'politica' | 'registro' | 'manual' | 'otro';
  descripcion?: string;
  version?: string;
  estado?: 'borrador' | 'revision' | 'aprobado' | 'obsoleto';
  autor_id?: string;
  fecha_creacion?: string;
  fecha_modificacion?: string;
  fecha_aprobacion?: string;
  tags?: string[];
  metadatos?: Record<string, any>;
}

// Tipos de minutas
export interface Minuta {
  id: string;
  titulo: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  lugar: string;
  tipo: 'reunion' | 'auditoria' | 'revision' | 'capacitacion';
  organizador_id: string;
  organizador?: any; // User type from common.ts
  participantes: any[]; // User[] type from common.ts
  agenda: string;
  conclusiones: string;
  acuerdos: string[];
  proxima_reunion?: string;
  adjuntos: any[]; // FileUpload[] type from api.ts
  created_at: string;
  updated_at: string;
}

// Tipos de tickets/soporte
export interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'bug' | 'feature' | 'support' | 'question';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  estado: 'abierto' | 'en_proceso' | 'esperando_respuesta' | 'resuelto' | 'cerrado';
  solicitante_id: string;
  solicitante?: User;
  asignado_id?: string;
  asignado?: User;
  departamento_id?: string;
  departamento?: Department;
  categoria: string;
  etiquetas: string[];
  fecha_limite?: string;
  tiempo_estimado?: number;
  tiempo_real?: number;
  comentarios: TicketComment[];
  adjuntos: FileUpload[];
  created_at: string;
  updated_at: string;
}

// Comentario de ticket
export interface TicketComment {
  id: string;
  ticket_id: string;
  autor_id: string;
  autor?: User;
  contenido: string;
  es_interno: boolean;
  adjuntos: FileUpload[];
  created_at: string;
}

// Tipos de eventos del calendario
export interface CalendarEvent {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  todo_dia: boolean;
  tipo: 'reunion' | 'auditoria' | 'capacitacion' | 'revision' | 'evento';
  color?: string;
  ubicacion?: string;
  organizador_id: string;
  organizador?: User;
  participantes: User[];
  recordatorio?: number; // minutos antes
  recurrente?: {
    tipo: 'diario' | 'semanal' | 'mensual' | 'anual';
    intervalo: number;
    fin?: string;
  };
  created_at: string;
  updated_at: string;
}

// Tipos de reportes
export interface Report {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'auditoria' | 'hallazgos' | 'acciones' | 'indicadores' | 'personal' | 'documentos';
  formato: 'pdf' | 'excel' | 'csv' | 'html';
  parametros: ReportParameter[];
  programado?: {
    frecuencia: 'diario' | 'semanal' | 'mensual' | 'trimestral' | 'anual';
    hora: string;
    dia_semana?: number;
    dia_mes?: number;
    destinatarios: string[];
  };
  ultima_ejecucion?: string;
  proxima_ejecucion?: string;
  creador_id: string;
  creador?: User;
  created_at: string;
  updated_at: string;
}

// Parámetro de reporte
export interface ReportParameter {
  nombre: string;
  tipo: 'texto' | 'numero' | 'fecha' | 'lista' | 'booleano';
  requerido: boolean;
  valor_por_defecto?: any;
  opciones?: string[];
  descripcion?: string;
}

// Tipos de indicadores de calidad
export interface QualityIndicator {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'proceso' | 'producto' | 'servicio' | 'sistema';
  unidad: string;
  formula?: string;
  meta: number;
  tolerancia?: {
    inferior: number;
    superior: number;
  };
  frecuencia_medicion: 'diario' | 'semanal' | 'mensual' | 'trimestral' | 'anual';
  responsable_id: string;
  responsable?: User;
  departamento_id?: string;
  departamento?: Department;
  proceso_id?: string;
  proceso?: Process;
  valores: IndicatorValue[];
  grafico_tipo: 'linea' | 'barras' | 'pastel' | 'dispersión';
  created_at: string;
  updated_at: string;
}

// Valor de indicador
export interface IndicatorValue {
  id: string;
  indicador_id: string;
  fecha: string;
  valor: number;
  observaciones?: string;
  registrado_por_id: string;
  registrado_por?: User;
  created_at: string;
}

// Tipos de no conformidades
export interface NonConformity {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'producto' | 'proceso' | 'sistema' | 'documento';
  severidad: 'menor' | 'mayor' | 'crítica';
  estado: 'abierta' | 'en_analisis' | 'accion_correctiva' | 'verificacion' | 'cerrada';
  origen: 'auditoria' | 'cliente' | 'proveedor' | 'personal' | 'otro';
  fecha_deteccion: string;
  fecha_limite?: string;
  responsable_id: string;
  responsable?: User;
  departamento_id?: string;
  departamento?: Department;
  proceso_id?: string;
  proceso?: Process;
  causa_raiz?: string;
  accion_correctiva?: string;
  accion_preventiva?: string;
  fecha_cierre?: string;
  verificacion_efectividad?: string;
  costo?: number;
  adjuntos: FileUpload[];
  created_at: string;
  updated_at: string;
}

// Tipos de proveedores
export interface Supplier {
  id: string;
  nombre: string;
  razon_social: string;
  rfc?: string;
  direccion: Address;
  contacto: ContactInfo;
  tipo_servicio: string[];
  categoria: 'A' | 'B' | 'C';
  estado: 'activo' | 'suspendido' | 'inactivo';
  fecha_evaluacion?: string;
  puntuacion?: number;
  documentos: SupplierDocument[];
  evaluaciones: SupplierEvaluation[];
  created_at: string;
  updated_at: string;
}

// Documento de proveedor
export interface SupplierDocument {
  id: string;
  proveedor_id: string;
  tipo: 'certificado' | 'poliza' | 'evaluacion' | 'contrato' | 'otro';
  nombre: string;
  archivo: FileUpload;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  estado: 'vigente' | 'por_vencer' | 'vencido';
  created_at: string;
}

// Evaluación de proveedor
export interface SupplierEvaluation {
  id: string;
  proveedor_id: string;
  fecha: string;
  evaluador_id: string;
  evaluador?: User;
  criterios: EvaluationCriterion[];
  puntuacion_total: number;
  conclusiones: string;
  recomendaciones: string[];
  adjuntos: FileUpload[];
  created_at: string;
}

// Criterio de evaluación
export interface EvaluationCriterion {
  id: string;
  nombre: string;
  descripcion: string;
  peso: number;
  puntuacion: number;
  observaciones?: string;
}

// Tipos de clientes
export interface Customer {
  id: string;
  nombre: string;
  razon_social: string;
  rfc?: string;
  direccion: Address;
  contacto: ContactInfo;
  tipo_cliente: 'potencial' | 'activo' | 'inactivo';
  categoria: 'A' | 'B' | 'C';
  fecha_registro: string;
  representante_legal?: string;
  documentos: CustomerDocument[];
  quejas: CustomerComplaint[];
  created_at: string;
  updated_at: string;
}

// Documento de cliente
export interface CustomerDocument {
  id: string;
  cliente_id: string;
  tipo: 'contrato' | 'factura' | 'certificado' | 'otro';
  nombre: string;
  archivo: FileUpload;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  created_at: string;
}

// Queja de cliente
export interface CustomerComplaint {
  id: string;
  cliente_id: string;
  cliente?: Customer;
  titulo: string;
  descripcion: string;
  fecha_recepcion: string;
  tipo: 'producto' | 'servicio' | 'atencion' | 'otro';
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'recibida' | 'en_analisis' | 'en_proceso' | 'resuelta' | 'cerrada';
  responsable_id?: string;
  responsable?: User;
  fecha_limite?: string;
  fecha_resolucion?: string;
  accion_correctiva?: string;
  satisfaccion_cliente?: number;
  adjuntos: FileUpload[];
  created_at: string;
  updated_at: string;
}

// ========== TIPOS DE UTILIDADES ==========

// Opciones de configuración
export interface ConfigOption {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  category: string;
  editable: boolean;
}

// Historial de cambios
export interface ChangeHistory {
  id: string;
  entidad_tipo: string;
  entidad_id: string;
  accion: 'crear' | 'actualizar' | 'eliminar';
  usuario_id: string;
  usuario?: User;
  cambios: {
    campo: string;
    valor_anterior: any;
    valor_nuevo: any;
  }[];
  fecha: string;
  ip_address?: string;
  user_agent?: string;
}

// Nota o comentario
export interface Note {
  id: string;
  contenido: string;
  tipo: 'comentario' | 'nota' | 'recordatorio';
  autor_id: string;
  autor?: User;
  entidad_tipo?: string;
  entidad_id?: string;
  privada: boolean;
  adjuntos: FileUpload[];
  created_at: string;
  updated_at: string;
}

// Etiqueta
export interface Tag {
  id: string;
  nombre: string;
  color: string;
  descripcion?: string;
  categoria?: string;
  created_at: string;
}

// ========== TIPOS DE ESTADOS Y WORKFLOWS ==========

// Estado de workflow
export interface WorkflowState {
  id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  orden: number;
  es_inicial: boolean;
  es_final: boolean;
  permite_edicion: boolean;
  requiere_aprobacion: boolean;
  aprobadores: User[];
  condiciones?: Record<string, any>;
}

// Transición de workflow
export interface WorkflowTransition {
  id: string;
  nombre: string;
  estado_origen_id: string;
  estado_destino_id: string;
  condiciones?: Record<string, any>;
  acciones?: string[];
  requiere_comentario: boolean;
  roles_permitidos: string[];
  usuarios_permitidos: string[];
}

// ========== TIPOS DE EXPORTACIÓN ==========

// Configuración de exportación
export interface ExportConfig {
  formato: 'pdf' | 'excel' | 'csv' | 'json';
  incluir_encabezados: boolean;
  incluir_filtros: boolean;
  incluir_totales: boolean;
  orientacion?: 'portrait' | 'landscape';
  tamano_papel?: 'a4' | 'letter' | 'legal';
  margenes?: {
    superior: number;
    inferior: number;
    izquierdo: number;
    derecho: number;
  };
  formato_fecha: string;
  zona_horaria: string;
  idioma: string;
}

// Tipos para exportación de datos
export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: 'text' | 'number' | 'date' | 'currency' | 'percentage';
}

export interface ExportData {
  [key: string]: any;
}

// ========== TIPOS DE NOTIFICACIONES AVANZADAS ==========

// Plantilla de notificación
export interface NotificationTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'email' | 'sms' | 'push' | 'in_app';
  asunto?: string;
  contenido: string;
  variables: string[];
  activa: boolean;
  created_at: string;
  updated_at: string;
}

// Configuración de notificaciones por usuario
export interface UserNotificationSettings {
  usuario_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  tipos_notificacion: {
    [tipo: string]: boolean;
  };
  horario: {
    inicio: string;
    fin: string;
    dias: number[];
  };
  created_at: string;
  updated_at: string;
}
