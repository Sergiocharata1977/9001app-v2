// ========== TIPOS BASE PARA FORMULARIOS ==========

export interface BaseFormData {
  id?: string | number;
  created_at?: string;
  updated_at?: string;
}

// ========== TIPOS PARA USUARIOS ==========

export interface UsuarioFormData extends BaseFormData {
  name: string;
  email: string;
  password?: string;
  role: 'employee' | 'manager' | 'admin';
  is_active?: boolean;
}

// ========== TIPOS PARA AUDITORÍAS ==========

export interface AuditoriaFormData extends BaseFormData {
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  tipo: 'interna' | 'externa' | 'seguimiento';
  estado: 'planificada' | 'en_progreso' | 'completada' | 'cancelada';
  auditor_responsable?: string;
  departamento?: string;
  alcance?: string;
  criterios?: string;
  observaciones?: string;
}

// ========== TIPOS PARA CAPACITACIONES ==========

export interface CapacitacionFormData extends BaseFormData {
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  tipo: 'presencial' | 'virtual' | 'mixta';
  estado: 'planificada' | 'en_progreso' | 'completada' | 'cancelada';
  instructor?: string;
  participantes?: string[];
  duracion_horas?: number;
  lugar?: string;
  materiales?: string;
  evaluacion?: string;
}

// ========== TIPOS PARA HALLAZGOS ==========

export interface HallazgoFormData extends BaseFormData {
  titulo: string;
  descripcion: string;
  tipo: 'no_conformidad' | 'observacion' | 'oportunidad_mejora';
  severidad: 'baja' | 'media' | 'alta' | 'crítica';
  estado: 'abierto' | 'en_analisis' | 'en_correccion' | 'verificado' | 'cerrado';
  departamento_responsable?: string;
  responsable?: string;
  fecha_limite?: string;
  accion_correctiva?: string;
  evidencia?: string;
  auditoria_id?: string | number;
}

// ========== TIPOS PARA ACCIONES ==========

export interface AccionFormData extends BaseFormData {
  titulo: string;
  descripcion: string;
  tipo: 'correctiva' | 'preventiva' | 'mejora';
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'verificada' | 'cancelada';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  responsable?: string;
  fecha_inicio?: string;
  fecha_limite?: string;
  fecha_completado?: string;
  recursos?: string;
  costo_estimado?: number;
  costo_real?: number;
  hallazgo_id?: string | number;
}

// ========== TIPOS PARA PROCESOS ==========

export interface ProcesoFormData extends BaseFormData {
  nombre: string;
  descripcion?: string;
  codigo?: string;
  responsable?: string;
  departamento?: string;
  estado: 'activo' | 'inactivo' | 'en_revision';
  version?: string;
  fecha_ultima_revision?: string;
  documentos_relacionados?: string[];
  indicadores?: string[];
  riesgos?: string[];
}

// ========== TIPOS PARA DOCUMENTOS ==========

export interface DocumentoFormData extends BaseFormData {
  titulo: string;
  descripcion?: string;
  tipo: 'procedimiento' | 'instruccion' | 'formulario' | 'registro' | 'manual' | 'politica';
  codigo?: string;
  version: string;
  estado: 'borrador' | 'en_revision' | 'aprobado' | 'obsoleto';
  autor?: string;
  revisor?: string;
  aprobador?: string;
  fecha_aprobacion?: string;
  fecha_vencimiento?: string;
  proceso_id?: string | number;
  archivo_url?: string;
  tags?: string[];
}

// ========== TIPOS PARA PERSONAL ==========

export interface PersonalFormData extends BaseFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  puesto: string;
  departamento?: string;
  fecha_ingreso?: string;
  fecha_nacimiento?: string;
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'licencia';
  supervisor?: string;
  competencias?: string[];
  capacitaciones?: string[];
  evaluaciones?: string[];
}

// ========== TIPOS PARA PRODUCTOS ==========

export interface ProductoFormData extends BaseFormData {
  nombre: string;
  descripcion?: string;
  codigo?: string;
  categoria?: string;
  estado: 'activo' | 'inactivo' | 'en_desarrollo';
  version?: string;
  especificaciones?: string;
  requisitos?: string[];
  proceso_id?: string | number;
  responsable?: string;
  fecha_lanzamiento?: string;
  fecha_retiro?: string;
}

// ========== TIPOS PARA MINUTAS ==========

export interface MinutaFormData extends BaseFormData {
  titulo: string;
  fecha: string;
  hora_inicio?: string;
  hora_fin?: string;
  tipo: 'reunion' | 'auditoria' | 'revision' | 'capacitacion';
  participantes?: string[];
  agenda?: string;
  acuerdos?: string;
  acciones?: string;
  proxima_reunion?: string;
  estado: 'borrador' | 'finalizada' | 'aprobada';
  moderador?: string;
  secretario?: string;
}

// ========== TIPOS PARA CRM ==========

export interface ClienteFormData extends BaseFormData {
  nombre: string;
  tipo: 'empresa' | 'individual';
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  pais?: string;
  industria?: string;
  tamano?: 'pequena' | 'mediana' | 'grande';
  estado_cliente: 'prospecto' | 'activo' | 'inactivo' | 'perdido';
  fuente?: string;
  vendedor_asignado?: string;
  notas?: string;
}

export interface OportunidadFormData extends BaseFormData {
  titulo: string;
  descripcion?: string;
  cliente_id: string | number;
  tipo: 'nuevo_servicio' | 'renovacion' | 'upgrade' | 'consulta';
  valor_estimado?: number;
  probabilidad: number; // 0-100
  estado: 'prospecto' | 'calificado' | 'propuesta' | 'negociacion' | 'ganada' | 'perdida';
  fecha_cierre_esperada?: string;
  fecha_cierre_real?: string;
  vendedor_asignado?: string;
  actividades?: string[];
  notas?: string;
}

export interface ActividadFormData extends BaseFormData {
  titulo: string;
  descripcion?: string;
  tipo: 'llamada' | 'email' | 'reunion' | 'visita' | 'propuesta' | 'seguimiento';
  cliente_id?: string | number;
  oportunidad_id?: string | number;
  fecha_planificada: string;
  fecha_realizada?: string;
  duracion_minutos?: number;
  resultado?: string;
  proxima_accion?: string;
  responsable?: string;
  estado: 'planificada' | 'en_progreso' | 'completada' | 'cancelada';
}

// ========== TIPOS PARA FILTROS ==========

export interface BaseFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Note: AuditoriaFilters and CapacitacionFilters are defined in their respective type files
// to avoid duplication and maintain consistency

export interface HallazgoFilters extends BaseFilters {
  tipo?: string[];
  severidad?: string[];
  estado?: string[];
  departamento_responsable?: string;
  responsable?: string;
  fecha_limite_inicio?: string;
  fecha_limite_fin?: string;
}

export interface AccionFilters extends BaseFilters {
  tipo?: string[];
  estado?: string[];
  prioridad?: string[];
  responsable?: string;
  fecha_limite_inicio?: string;
  fecha_limite_fin?: string;
}

// ========== TIPOS PARA VALIDACIÓN ==========

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ========== TIPOS PARA RESPUESTAS DE API ==========

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ========== TIPOS PARA ESTADOS DE FORMULARIOS ==========

export interface FormState<T> {
  data: T;
  isLoading: boolean;
  isSubmitting: boolean;
  errors: ValidationError[];
  isDirty: boolean;
  isValid: boolean;
}

// ========== TIPOS PARA EVENTOS DE FORMULARIOS ==========

export interface FormEventHandlers<T> {
  onSubmit: (data: T) => void;
  onCancel?: () => void;
  onDelete?: (id: string | number) => void;
  onValidate?: (data: T) => ValidationResult;
  onChange?: (data: T) => void;
}

// ========== TIPOS PARA CONFIGURACIÓN DE FORMULARIOS ==========

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  disabled?: boolean;
  hidden?: boolean;
  className?: string;
}

export interface FormConfig<T> {
  fields: FormField[];
  initialData?: Partial<T>;
  validationSchema?: any; // Zod schema
  submitButtonText?: string;
  cancelButtonText?: string;
  deleteButtonText?: string;
  showDeleteButton?: boolean;
  showCancelButton?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
}
