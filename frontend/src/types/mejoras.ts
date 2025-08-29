// Types for Mejoras module

export interface Hallazgo {
  _id?: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  tipo: 'no_conformidad' | 'oportunidad_mejora' | 'observacion';
  estado: 'detectado' | 'analisis' | 'planificacion' | 'ejecucion' | 'verificacion' | 'cerrado';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  proceso_id?: string;
  responsable_id: string;
  fecha_deteccion: string;
  fecha_limite?: string;
  origen: 'auditoria_interna' | 'auditoria_externa' | 'revision_direccion' | 'quejas_clientes' | 'seguimiento_procesos' | 'otro';
  evidencias?: string[];
  acciones?: Accion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Accion {
  _id?: string;
  hallazgo_id: string;
  tipo: 'correctiva' | 'preventiva' | 'mejora';
  descripcion: string;
  responsable_id: string;
  fecha_limite: string;
  estado: 'planificada' | 'en_progreso' | 'completada' | 'verificada' | 'cerrada';
  recursos_necesarios?: string;
  seguimiento?: SeguimientoAccion[];
  evidencias?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SeguimientoAccion {
  fecha: string;
  comentario: string;
  responsable_id: string;
  estado_anterior: string;
  estado_nuevo: string;
}

export interface Proceso {
  _id: string;
  nombre: string;
  codigo?: string;
  responsable_id?: string;
  descripcion?: string;
}

export interface Personal {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  departamento_id?: string;
  puesto?: string;
}

// Component Props Types
export interface HallazgoCardProps {
  hallazgo: Hallazgo;
  onEdit: (hallazgo: Hallazgo) => void;
  onDelete: (id: string) => void;
  onView: (hallazgo: Hallazgo) => void;
}

export interface AccionItemProps {
  accion: Accion;
  onEdit: (accion: Accion) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, estado: Accion['estado']) => void;
}

export interface HallazgoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  hallazgo: Hallazgo | null;
  onEdit: (hallazgo: Hallazgo) => void;
}

export interface HallazgoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hallazgo: Partial<Hallazgo>) => void;
  hallazgo?: Hallazgo | null;
}

export interface AnalisisFormProps {
  hallazgo: Hallazgo;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export interface EjecucionFormProps {
  hallazgo: Hallazgo;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export interface PlanificacionFormProps {
  hallazgo: Hallazgo;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export interface DashboardViewProps {
  hallazgos: Hallazgo[];
  loading?: boolean;
}

export interface KanbanBoardProps {
  hallazgos: Hallazgo[];
  onUpdateStatus: (hallazgoId: string, newStatus: Hallazgo['estado']) => void;
  onEdit: (hallazgo: Hallazgo) => void;
  onView: (hallazgo: Hallazgo) => void;
}

export interface KanbanColumnProps {
  title: string;
  status: Hallazgo['estado'];
  hallazgos: Hallazgo[];
  onDrop: (hallazgoId: string, newStatus: Hallazgo['estado']) => void;
  onEdit: (hallazgo: Hallazgo) => void;
  onView: (hallazgo: Hallazgo) => void;
}

export interface KanbanCardProps {
  hallazgo: Hallazgo;
  onEdit: (hallazgo: Hallazgo) => void;
  onView: (hallazgo: Hallazgo) => void;
}

export interface ColumnProps {
  title: string;
  children: React.ReactNode;
  count?: number;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface WorkflowStageProps {
  stage: Hallazgo['estado'];
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export interface WorkflowStepperProps {
  currentStage: Hallazgo['estado'];
  onStageClick: (stage: Hallazgo['estado']) => void;
}