import { ReactNode } from 'react';

// Estados del workflow de mejoras
export type MejoraEstado = 
  | 'deteccion'
  | 'analisis'
  | 'planificacion'
  | 'ejecucion'
  | 'verificacion'
  | 'cierre';

// Estados específicos del workflow de hallazgos
export type HallazgoEstado = 
  | 'd1_iniciado'
  | 'd2_accion_inmediata_programada'
  | 'd3_accion_inmediata_finalizada'
  | 't1_pendiente_ac'
  | 't2_cerrado';

// Prioridades
export type MejoraPrioridad = 'Alta' | 'Media' | 'Baja';
export type HallazgoPrioridad = 'Alta' | 'Media' | 'Baja';

// Tipos de mejora
export type MejoraTipo = 'hallazgo' | 'oportunidad' | 'no_conformidad' | 'accion_correctiva' | 'accion_preventiva';

// Origen de la mejora
export type MejoraOrigen = 'auditoria' | 'reclamo' | 'sugerencia' | 'indicador' | 'revision_direccion' | 'otro';

// Interfaz principal de Mejora
export interface Mejora {
  id: number;
  numeroMejora?: string;
  titulo: string;
  descripcion: string;
  estado: MejoraEstado;
  prioridad: MejoraPrioridad;
  tipo: MejoraTipo;
  origen: MejoraOrigen;
  responsable?: string;
  fechaDeteccion: string;
  fechaAnalisis?: string;
  fechaPlanificacion?: string;
  fechaEjecucion?: string;
  fechaVerificacion?: string;
  fechaCierre?: string;
  procesoId?: number;
  departamentoId?: number;
  created_at?: string;
  updated_at?: string;
}

// Interfaz para Hallazgo (extendida de Mejora)
export interface Hallazgo extends Mejora {
  numeroHallazgo?: string;
  accionInmediata?: string;
  causaRaiz?: string;
  planAccion?: string;
  evidenciaCierre?: string;
  orden?: number;
  tipo: 'hallazgo';
}

// Interfaz para el formulario de mejora
export interface MejoraFormData {
  titulo: string;
  descripcion: string;
  estado?: MejoraEstado;
  prioridad: MejoraPrioridad;
  tipo: MejoraTipo;
  origen: MejoraOrigen;
  responsable?: string;
  fechaDeteccion: string;
  fechaAnalisis?: string;
  fechaPlanificacion?: string;
  fechaEjecucion?: string;
  fechaVerificacion?: string;
  fechaCierre?: string;
  procesoId?: number;
  departamentoId?: number;
}

// Interfaz para el formulario de hallazgo
export interface HallazgoFormData extends MejoraFormData {
  numeroHallazgo?: string;
  accionInmediata?: string;
  causaRaiz?: string;
  planAccion?: string;
  evidenciaCierre?: string;
  tipo: 'hallazgo';
}

// Interfaz para las columnas del Kanban
export interface KanbanColumn {
  id: string;
  title: string;
  hallazgos: Hallazgo[];
}

// Interfaz para las estadísticas
export interface MejoraStats {
  total: number;
  deteccion: number;
  analisis: number;
  planificacion: number;
  ejecucion: number;
  verificacion: number;
  cierre: number;
  porPrioridad: {
    alta: number;
    media: number;
    baja: number;
  };
  porTipo: {
    hallazgo: number;
    oportunidad: number;
    no_conformidad: number;
    accion_correctiva: number;
    accion_preventiva: number;
  };
}

// Interfaz para el workflow
export interface WorkflowStage {
  id: string;
  title: string;
  description: string;
  estado: MejoraEstado;
  isCompleted: boolean;
  isActive: boolean;
  fecha?: string;
}

// Interfaz para las acciones del workflow
export interface WorkflowAction {
  id: string;
  title: string;
  description: string;
  estado: MejoraEstado;
  isRequired: boolean;
  isCompleted: boolean;
  fecha?: string;
  responsable?: string;
}

// Interfaz para el historial de cambios
export interface HistorialItem {
  id: number;
  mejoraId: number;
  accion: string;
  descripcion: string;
  usuario: string;
  fecha: string;
  tipo: string;
  estadoAnterior?: MejoraEstado;
  estadoNuevo?: MejoraEstado;
}

// Interfaz para los filtros
export interface MejoraFilters {
  estado?: MejoraEstado[];
  prioridad?: MejoraPrioridad[];
  tipo?: MejoraTipo[];
  origen?: MejoraOrigen[];
  responsable?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  procesoId?: number;
  departamentoId?: number;
}

// Interfaz para la paginación
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Interfaz para la respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interfaz para los eventos de drag & drop
export interface DragEvent {
  active: {
    id: string | number;
    data: {
      current: {
        type: string;
        hallazgo?: Hallazgo;
        sortable?: {
          containerId: string;
        };
      };
    };
  };
  over: {
    id: string | number;
    data?: {
      current: {
        sortable: {
          containerId: string;
        };
      };
    };
  };
}

// Interfaz para las props de los componentes
export interface KanbanBoardProps {
  hallazgos: Hallazgo[];
  onUpdate: () => void;
}

export interface KanbanCardProps {
  hallazgo: Hallazgo;
}

export interface KanbanColumnProps {
  id: string;
  title: string;
  hallazgos: Hallazgo[];
}

export interface WorkflowStepperProps {
  currentStatus: HallazgoEstado;
}

export interface WorkflowStageProps {
  config: {
    emoji: string;
    title: string;
    subtitle: string;
    bgColor: string;
    borderColor: string;
    titleColor: string;
  };
  states: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  currentState: string;
}

export interface WorkflowStateProps {
  label: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
}

export interface TiemposWorkflowProps {
  hallazgo: Hallazgo;
}

export interface HistorialItemProps {
  item: HistorialItem;
  isLast?: boolean;
}

export interface AccionItemProps {
  accion: WorkflowAction;
  onComplete: (accionId: string) => void;
}

// Interfaz para los formularios específicos
export interface AnalisisFormProps {
  hallazgoId: number;
  onUpdate: () => void;
}

export interface PlanificacionFormProps {
  mejora: Mejora;
  onSubmit: (data: Partial<MejoraFormData>) => void;
  onCancel: () => void;
}

export interface EjecucionFormProps {
  mejora: Mejora;
  onSubmit: (data: Partial<MejoraFormData>) => void;
  onCancel: () => void;
}

// Interfaz para el dashboard
export interface DashboardViewProps {
  hallazgos: Hallazgo[];
}

// Interfaz para las tarjetas de hallazgo
export interface HallazgoCardProps {
  hallazgo: Hallazgo;
  onClick: (hallazgo: Hallazgo) => void;
}

export interface HallazgoDetailModalProps {
  hallazgo: Hallazgo | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (hallazgo: Hallazgo) => void;
}

export interface HallazgoFormModalProps {
  hallazgo: Hallazgo | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HallazgoFormData) => void;
}

export interface HallazgoModalProps {
  hallazgo: Hallazgo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: HallazgoFormData) => void;
}

export interface HallazgosBoardProps {
  hallazgos: Hallazgo[];
  onUpdate: () => void;
}

export interface HallazgosListProps {
  hallazgos: Hallazgo[];
  onSelect: (hallazgo: Hallazgo) => void;
}

// Interfaz para el mapeo de estados
export interface EstadoMap {
  [key: string]: string;
}

// Interfaz para las variantes de prioridad
export interface PrioridadVariantMap {
  [key: string]: string;
}

// Interfaz para las props de InfoRow
export interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string | undefined;
}

// Interfaz para las columnas de la tabla de datos
export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: Mejora) => ReactNode;
}

// Interfaz para las acciones de la tabla de datos
export interface DataTableAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: (mejora: Mejora) => void;
  variant?: string;
  className?: string;
}
