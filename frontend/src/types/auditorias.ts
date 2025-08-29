// Types for Auditorias module

export interface Auditoria {
  _id?: string;
  codigo: string;
  titulo: string;
  areas: string[];
  responsable_id: string;
  fecha_programada: string;
  objetivos: string;
  alcance: string;
  criterios: string;
  estado: 'planificada' | 'en_progreso' | 'completada' | 'cancelada';
  fecha_inicio?: string;
  fecha_fin?: string;
  hallazgos?: string[];
  acciones_correctivas?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditoriaFormData {
  codigo: string;
  titulo: string;
  areas: string[];
  responsable_id: string;
  fecha_programada: string;
  objetivos: string;
  alcance: string;
  criterios: string;
  estado: 'planificada' | 'en_progreso' | 'completada' | 'cancelada';
}

export interface Personal {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  departamento_id?: string;
  puesto?: string;
}

export interface Departamento {
  _id: string;
  nombre: string;
  descripcion?: string;
  responsable_id?: string;
}

export interface AuditoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (auditoria: AuditoriaFormData) => void;
  auditoria?: Auditoria | null;
}

export interface AuditoriaListProps {
  auditorias: Auditoria[];
  onEdit: (auditoria: Auditoria) => void;
  onDelete: (id: string) => void;
  onView: (auditoria: Auditoria) => void;
  loading?: boolean;
}

export interface AuditoriaSingleProps {
  auditoriaId: string;
}

export interface AuditoriaFormProps {
  auditoria?: Auditoria | null;
  onSave: (auditoria: AuditoriaFormData) => void;
  onCancel: () => void;
}

export interface AuditoriaRelacionesProps {
  auditoriaId: string;
  auditoria: Auditoria;
}