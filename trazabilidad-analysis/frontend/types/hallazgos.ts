export interface Hallazgo {
  id: number;
  numeroHallazgo?: string;
  titulo?: string;
  descripcion?: string;
  estado: HallazgoEstado;
  fecha_deteccion?: string;
  responsable?: string;
  prioridad?: HallazgoPrioridad;
  fecha_planificacion?: string;
  fecha_ejecucion?: string;
  fecha_verificacion?: string;
  accion_inmediata?: string;
  causa_raiz?: string;
  plan_accion?: string;
  evidencia_cierre?: string;
  created_at?: string;
  updated_at?: string;
}

export type HallazgoEstado = 
  | 'deteccion'
  | 'd1_iniciado'
  | 'planificacion_ai'
  | 'd1_accion_inmediata_programada'
  | 'd2_accion_inmediata_programada'
  | 'ejecucion_ai'
  | 'd2_analisis_causa_raiz_programado'
  | 'analisis_plan_accion'
  | 'd3_plan_accion_definido'
  | 'verificacion_cierre'
  | 'd4_verificacion_programada'
  | 'd5_verificacion_eficacia_realizada';

export type HallazgoPrioridad = 'alta' | 'media' | 'baja';

export interface HallazgoStats {
  total: number;
  deteccion: number;
  tratamiento: number;
  verificacion: number;
}

export interface HallazgoFormData {
  numeroHallazgo?: string;
  titulo?: string;
  descripcion?: string;
  responsable?: string;
  prioridad?: HallazgoPrioridad;
  estado?: HallazgoEstado;
  fecha_deteccion?: string;
  fecha_planificacion?: string;
  fecha_ejecucion?: string;
  fecha_verificacion?: string;
  accion_inmediata?: string;
  causa_raiz?: string;
  plan_accion?: string;
  evidencia_cierre?: string;
}

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: Hallazgo) => React.ReactNode;
}

export interface DataTableAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: (hallazgo: Hallazgo) => void;
  variant?: string;
  className?: string;
}

export interface KanbanColumn {
  key: string;
  label: string;
  color: string;
  filter: (hallazgo: Hallazgo) => boolean;
}

export interface WorkflowFormData {
  [key: string]: any;
}
