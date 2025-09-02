// Interfaces para el sistema de auditorías ISO 9001

export interface Auditoria {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  estado: AuditoriaEstado;
  fecha_programada: string | null;
  fecha_realizacion: string | null;
  auditor_lider: string;
  auditores: string[];
  alcance: string;
  criterios: string;
  tipo: AuditoriaTipo;
  areas: string[] | string; // Puede ser array o string JSON
  duracion_estimada: string;
  total_aspectos: number;
  total_relaciones: number;
  created_at?: string;
  updated_at?: string;
  organization_id?: number;
}

export type AuditoriaEstado = 
  | 'programacion' 
  | 'planificacion' 
  | 'ejecucion' 
  | 'informe' 
  | 'seguimiento' 
  | 'completada' 
  | 'cancelada';

export type AuditoriaTipo = 'interna' | 'externa' | 'proveedor' | 'cliente';

export interface AuditoriaEstadoConfig {
  value: AuditoriaEstado;
  label: string;
  color: string;
  bgColor: string;
  icon?: string;
}

export interface AuditoriaFormData {
  codigo: string;
  titulo: string;
  descripcion: string;
  estado: AuditoriaEstado;
  fecha_programada: string | null;
  fecha_realizacion: string | null;
  auditor_lider: string;
  auditores: string[];
  alcance: string;
  criterios: string;
  tipo: AuditoriaTipo;
  areas: string[];
  duracion_estimada: string;
}

export interface AuditoriaAspecto {
  id: string;
  auditoria_id: string;
  aspecto: string;
  cumplimiento: 'cumple' | 'no_cumple' | 'observacion';
  observaciones: string;
  accion_correctiva?: string;
  responsable?: string;
  fecha_limite?: string;
  estado?: string;
}

export interface AuditoriaRelacion {
  id: string;
  auditoria_id: string;
  proceso_id: string;
  indicador_id?: string;
  hallazgo_id?: string;
  accion_id?: string;
  tipo_relacion: 'proceso' | 'indicador' | 'hallazgo' | 'accion';
  observaciones?: string;
}

export interface AuditoriaFilters {
  estado?: AuditoriaEstado;
  tipo?: AuditoriaTipo;
  auditor_lider?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  areas?: string[];
}

export interface AuditoriaStats {
  total: number;
  por_estado: Record<AuditoriaEstado, number>;
  por_tipo: Record<AuditoriaTipo, number>;
  proximas: number;
  vencidas: number;
}
