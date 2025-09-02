// ========== TIPOS PARA PROCESOS SGC ==========

import { SgcPersonalRelacion, SgcDocumentoRelacionado, SgcNormaRelacionada } from './index';

// Tipo principal de Proceso SGC
export interface ProcesoSgc {
  id: string;
  organization_id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  objetivo?: string;
  alcance?: string;
  version: string;
  tipo: 'estrategico' | 'operativo' | 'apoyo' | 'mejora';
  categoria: 'proceso' | 'subproceso' | 'actividad';
  nivel_critico: 'bajo' | 'medio' | 'alto' | 'critico';
  estado: 'activo' | 'inactivo' | 'obsoleto' | 'en_revision';
  responsable_id?: string;
  departamento_id?: string;
  supervisor_id?: string;
  entradas?: string;
  salidas?: string;
  proveedores?: string;
  clientes?: string;
  recursos_requeridos?: string;
  competencias_requeridas?: string;
  indicadores?: string;
  metodos_seguimiento?: string;
  criterios_control?: string;
  procedimientos_documentados?: string;
  registros_requeridos?: string;
  riesgos_identificados?: string;
  oportunidades_mejora?: string;
  fecha_vigencia?: string;
  fecha_revision?: string;
  motivo_cambio?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

// Proceso SGC con información completa
export interface ProcesoSgcCompleto extends ProcesoSgc {
  responsable?: {
    id: string;
    nombre_completo: string;
    puesto: string;
    email: string;
  };
  departamento?: {
    id: string;
    nombre: string;
    descripcion?: string;
  };
  supervisor?: {
    id: string;
    nombre_completo: string;
    puesto: string;
    email: string;
  };
  participantes: SgcPersonalRelacion[];
  documentos: SgcDocumentoRelacionado[];
  normas: SgcNormaRelacionada[];
  estadisticas_sgc: {
    total_participantes: number;
    total_documentos: number;
    total_normas: number;
  };
}

// Formulario para crear/editar proceso
export interface ProcesoSgcForm {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  objetivo?: string;
  alcance?: string;
  version?: string;
  tipo?: 'estrategico' | 'operativo' | 'apoyo' | 'mejora';
  categoria?: 'proceso' | 'subproceso' | 'actividad';
  nivel_critico?: 'bajo' | 'medio' | 'alto' | 'critico';
  responsable_id?: string;
  departamento_id?: string;
  supervisor_id?: string;
  entradas?: string;
  salidas?: string;
  proveedores?: string;
  clientes?: string;
  recursos_requeridos?: string;
  competencias_requeridas?: string;
  indicadores?: string;
  metodos_seguimiento?: string;
  criterios_control?: string;
  procedimientos_documentados?: string;
  registros_requeridos?: string;
  riesgos_identificados?: string;
  oportunidades_mejora?: string;
  fecha_vigencia?: string;
  fecha_revision?: string;
  motivo_cambio?: string;
}

// Filtros para búsqueda de procesos
export interface ProcesoSgcFiltros {
  search?: string;
  tipo?: 'estrategico' | 'operativo' | 'apoyo' | 'mejora';
  categoria?: 'proceso' | 'subproceso' | 'actividad';
  nivel_critico?: 'bajo' | 'medio' | 'alto' | 'critico';
  estado?: 'activo' | 'inactivo' | 'obsoleto' | 'en_revision';
  responsable_id?: string;
  departamento_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

// Dashboard de procesos SGC
export interface ProcesoSgcDashboard {
  resumen: {
    total_procesos: number;
    activos: number;
    estrategicos: number;
    operativos: number;
    apoyo: number;
  };
  distribucion_tipos: Array<{
    tipo: string;
    categoria: string;
    cantidad: number;
  }>;
  cumplimiento_normas: Array<{
    nivel_cumplimiento: string;
    cantidad: number;
  }>;
  procesos_recientes: ProcesoSgc[];
  procesos_criticos: ProcesoSgc[];
}

// Tipos para relaciones entre procesos
export interface ProcesoRelacion {
  id: string;
  organization_id: number;
  proceso_origen_id: string;
  proceso_destino_id: string;
  tipo_relacion: 'entrada' | 'salida' | 'control' | 'apoyo' | 'mejora';
  descripcion?: string;
  prioridad: 'baja' | 'media' | 'alta';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

// Proceso con sus relaciones
export interface ProcesoSgcConRelaciones extends ProcesoSgcCompleto {
  relaciones_entrada: ProcesoRelacion[];
  relaciones_salida: ProcesoRelacion[];
  relaciones_control: ProcesoRelacion[];
  relaciones_apoyo: ProcesoRelacion[];
}

// Tipos para auditoría de procesos
export interface ProcesoSgcAuditoria {
  id: string;
  proceso_id: string;
  fecha_auditoria: string;
  auditor_id: string;
  tipo_auditoria: 'interna' | 'externa' | 'seguimiento';
  alcance: string;
  criterios: string;
  hallazgos: string;
  conclusiones: string;
  recomendaciones: string;
  estado: 'planificada' | 'en_proceso' | 'completada' | 'cancelada';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

// Tipos para indicadores de proceso
export interface ProcesoSgcIndicador {
  id: string;
  proceso_id: string;
  nombre: string;
  descripcion?: string;
  tipo: 'efectividad' | 'eficiencia' | 'satisfaccion' | 'cumplimiento';
  unidad: string;
  formula?: string;
  meta: number;
  tolerancia_inferior?: number;
  tolerancia_superior?: number;
  frecuencia_medicion: 'diario' | 'semanal' | 'mensual' | 'trimestral' | 'anual';
  responsable_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

// Tipos para valores de indicadores
export interface ProcesoSgcIndicadorValor {
  id: string;
  indicador_id: string;
  fecha: string;
  valor: number;
  observaciones?: string;
  registrado_por_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

// Tipos para riesgos de proceso
export interface ProcesoSgcRiesgo {
  id: string;
  proceso_id: string;
  descripcion: string;
  probabilidad: 'baja' | 'media' | 'alta';
  impacto: 'bajo' | 'medio' | 'alto';
  nivel_riesgo: 'bajo' | 'medio' | 'alto' | 'critico';
  medidas_control?: string;
  responsable_id?: string;
  fecha_evaluacion: string;
  fecha_revision?: string;
  estado: 'activo' | 'mitigado' | 'aceptado' | 'transferido';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}

// Tipos para oportunidades de mejora
export interface ProcesoSgcOportunidad {
  id: string;
  proceso_id: string;
  descripcion: string;
  tipo: 'eficiencia' | 'efectividad' | 'satisfaccion' | 'innovacion';
  beneficio_esperado: string;
  recursos_requeridos?: string;
  prioridad: 'baja' | 'media' | 'alta';
  responsable_id?: string;
  fecha_identificacion: string;
  fecha_implementacion?: string;
  estado: 'identificada' | 'en_analisis' | 'aprobada' | 'en_implementacion' | 'implementada' | 'cancelada';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
}
