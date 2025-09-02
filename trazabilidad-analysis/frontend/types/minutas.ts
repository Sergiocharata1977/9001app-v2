// ========== TIPOS PARA MINUTAS SGC ==========

import { SgcPersonalRelacion, SgcDocumentoRelacionado, SgcNormaRelacionada } from './index';

// Tipo principal de Minuta SGC
export interface Minuta {
  id: string;
  organization_id: number;
  titulo: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  lugar: string;
  tipo: 'reunion' | 'auditoria' | 'revision' | 'capacitacion';
  organizador_id: string;
  organizador?: {
    id: string;
    nombre_completo: string;
    email: string;
  };
  agenda: string;
  conclusiones?: string;
  acuerdos?: string[];
  proxima_reunion?: string;
  estado: 'programada' | 'en_proceso' | 'completada' | 'cancelada';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

// Minuta SGC con información completa
export interface MinutaCompleta extends Minuta {
  participantes: SgcPersonalRelacion[];
  documentos: SgcDocumentoRelacionado[];
  normas: SgcNormaRelacionada[];
  estadisticas_sgc: {
    total_participantes: number;
    total_documentos: number;
    total_normas: number;
  };
}

// Formulario para crear/editar minuta
export interface MinutaForm {
  titulo: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  lugar: string;
  tipo: 'reunion' | 'auditoria' | 'revision' | 'capacitacion';
  organizador_id: string;
  agenda: string;
  conclusiones?: string;
  acuerdos?: string[];
  proxima_reunion?: string;
  estado?: 'programada' | 'en_proceso' | 'completada' | 'cancelada';
}

// Filtros para búsqueda de minutas
export interface MinutaFiltros {
  search?: string;
  tipo?: 'reunion' | 'auditoria' | 'revision' | 'capacitacion';
  estado?: 'programada' | 'en_proceso' | 'completada' | 'cancelada';
  fecha_desde?: string;
  fecha_hasta?: string;
  organizador_id?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Dashboard de minutas SGC
export interface MinutaDashboard {
  resumen: {
    total_minutas: number;
    programadas: number;
    en_proceso: number;
    completadas: number;
    canceladas: number;
  };
  distribucion_tipos: Array<{
    tipo: string;
    cantidad: number;
  }>;
  minutas_recientes: Minuta[];
}

// Tipos para participantes de minuta
export interface MinutaParticipante {
  id: string;
  minuta_id: string;
  personal_id: string;
  personal?: {
    id: string;
    nombre_completo: string;
    email: string;
    puesto: string;
  };
  rol: string;
  asistio?: boolean;
  justificacion_ausencia?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Tipos para acuerdos de minuta
export interface MinutaAcuerdo {
  id: string;
  minuta_id: string;
  descripcion: string;
  responsable_id?: string;
  responsable?: {
    id: string;
    nombre_completo: string;
    email: string;
  };
  fecha_limite?: string;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  prioridad: 'baja' | 'media' | 'alta';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

// Tipos para conclusiones de minuta
export interface MinutaConclusion {
  id: string;
  minuta_id: string;
  conclusion: string;
  tipo: 'hallazgo' | 'observacion' | 'recomendacion' | 'decision';
  prioridad: 'baja' | 'media' | 'alta';
  responsable_id?: string;
  responsable?: {
    id: string;
    nombre_completo: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

// Tipos para seguimiento de minutas
export interface MinutaSeguimiento {
  id: string;
  minuta_id: string;
  tipo_seguimiento: 'recordatorio' | 'recordatorio_avanzado' | 'recordatorio_urgente';
  fecha_recordatorio: string;
  estado: 'pendiente' | 'enviado' | 'leido' | 'respondido';
  destinatarios: string[];
  mensaje?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

// Tipos para plantillas de minutas
export interface MinutaPlantilla {
  id: string;
  organization_id: number;
  nombre: string;
  descripcion?: string;
  tipo: 'reunion' | 'auditoria' | 'revision' | 'capacitacion';
  agenda_template: string;
  acuerdos_template?: string[];
  conclusiones_template?: string;
  participantes_default?: string[];
  documentos_default?: number[];
  normas_default?: number[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

// Tipos para reportes de minutas
export interface MinutaReporte {
  id: string;
  minuta_id: string;
  tipo_reporte: 'acta' | 'resumen' | 'seguimiento' | 'estadisticas';
  formato: 'pdf' | 'docx' | 'html';
  contenido: string;
  fecha_generacion: string;
  generado_por_id: string;
  generado_por?: {
    id: string;
    nombre_completo: string;
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Tipos para estadísticas de minutas
export interface MinutaEstadisticas {
  total_minutas: number;
  minutas_por_tipo: Array<{
    tipo: string;
    cantidad: number;
    porcentaje: number;
  }>;
  minutas_por_estado: Array<{
    estado: string;
    cantidad: number;
    porcentaje: number;
  }>;
  minutas_por_mes: Array<{
    mes: string;
    cantidad: number;
  }>;
  participacion_promedio: number;
  duracion_promedio: number;
  acuerdos_completados: number;
  acuerdos_pendientes: number;
}

// Tipos adicionales para TypeScript
export type MinutaTipo = 'reunion' | 'auditoria' | 'revision' | 'capacitacion';
export type MinutaEstado = 'programada' | 'en_proceso' | 'completada' | 'cancelada';
