import type { FileUpload } from './api';

// Estados de acciones según el workflow
export const ACCION_ESTADOS = {
  PLANIFICACION: 'p1_planificacion_accion',
  EJECUCION: 'e2_ejecucion_accion',
  PLANIFICACION_VERIFICACION: 'v3_planificacion_verificacion',
  EJECUCION_VERIFICACION: 'v4_ejecucion_verificacion',
  CERRADA: 'c5_cerrada',
} as const;

export type AccionEstado = typeof ACCION_ESTADOS[keyof typeof ACCION_ESTADOS];

// Tipos de prioridad
export const ACCION_PRIORIDADES = {
  ALTA: 'alta',
  MEDIA: 'media',
  BAJA: 'baja'
} as const;

export type AccionPrioridad = typeof ACCION_PRIORIDADES[keyof typeof ACCION_PRIORIDADES];

// Interfaz principal de Acción (compatible con el backend)
export interface Accion {
  id: string;
  numeroAccion: string;
  titulo?: string;
  descripcion?: string;
  estado: AccionEstado;
  prioridad?: AccionPrioridad;
  responsable?: string;
  fechaCreacion?: string;
  fechaVencimiento?: string;
  fechaCierre?: string;
  costo?: number;
  adjuntos?: FileUpload[];
  created_at?: string;
  updated_at?: string;
  
  // Campos específicos del backend
  hallazgo_id?: string;
  descripcion_accion?: string;
  responsable_accion?: string;
  fecha_plan_accion?: string;
  comentarios_ejecucion?: string;
  fecha_ejecucion?: string;
  descripcion_verificacion?: string;
  responsable_verificacion?: string;
  fecha_plan_verificacion?: string;
  comentarios_verificacion?: string;
  fecha_verificacion_finalizada?: string;
  eficacia?: string;
  evidencia_accion?: string;
  resultado_verificacion?: string;
  observaciones?: string;
}

// Datos para crear una nueva acción
export interface AccionFormData {
  titulo: string;
  descripcion?: string;
  prioridad?: AccionPrioridad;
  responsable?: string;
  fechaVencimiento?: string;
  costo?: number;
  hallazgo_id?: string;
}

// Datos para actualizar una acción
export interface AccionUpdateData extends Partial<AccionFormData> {
  estado?: AccionEstado;
  fechaCierre?: string;
  
  // Campos específicos del workflow
  comentarios_ejecucion?: string;
  fecha_ejecucion?: string;
  evidencia_accion?: string;
  descripcion_verificacion?: string;
  responsable_verificacion?: string;
  fecha_plan_verificacion?: string;
  comentarios_verificacion?: string;
  fecha_verificacion_finalizada?: string;
  resultado_verificacion?: string;
  eficacia?: string;
  observaciones?: string;
}

// Estadísticas de acciones
export interface AccionStats {
  total: number;
  planificacion: number;
  ejecucion: number;
  verificacion: number;
  cerrada: number;
}

// Filtros para acciones
export interface AccionFilters {
  searchTerm: string;
  filterEstado: string;
  filterPrioridad: string;
  filterResponsable: string;
}

// Modos de vista
export type AccionViewMode = 'kanban' | 'grid' | 'list';

// Configuración de estado
export interface AccionEstadoConfig {
  title: string;
  color: string;
  colorClasses: string;
  nextState?: AccionEstado;
  description?: string;
  component?: string;
}

// Columna de Kanban
export interface AccionKanbanColumn {
  key: string;
  label: string;
  color: string;
  filter: (accion: Accion) => boolean;
}

// Acción de tabla
export interface AccionTableAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: (accion: Accion) => void;
  variant?: 'ghost' | 'destructive' | 'default';
  show?: (accion: Accion) => boolean;
  className?: string;
}

// Columna de tabla
export interface AccionTableColumn {
  key: keyof Accion;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, accion: Accion) => React.ReactNode;
}

// Props para tarjeta de acción
export interface AccionCardProps {
  accion: Accion;
  actions: AccionTableAction[];
  onClick?: (accion: Accion) => void;
}

// Props para tarjeta Kanban
export interface AccionKanbanCardProps {
  accion: Accion;
  actions: AccionTableAction[];
  onClick?: (accion: Accion) => void;
}

// Servicio de acciones
export interface AccionService {
  getAllAcciones: (hallazgo_id?: string | null) => Promise<Accion[]>;
  getAccionById: (id: string) => Promise<Accion>;
  createAccion: (data: AccionFormData) => Promise<Accion>;
  updateAccion: (id: string, data: AccionUpdateData) => Promise<Accion>;
  deleteAccion: (id: string) => Promise<void>;
}

// Workflow de acciones
export interface AccionWorkflow {
  [key: string]: AccionEstadoConfig;
}

// Props del componente principal
export interface AccionesListingProps {
  // Props opcionales para testing o configuración
  initialData?: Accion[];
  onAccionSelect?: (accion: Accion) => void;
  onAccionUpdate?: (accion: Accion) => void;
  onAccionDelete?: (accion: Accion) => void;
}
