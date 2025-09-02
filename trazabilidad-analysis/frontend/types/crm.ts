// ===============================================
// TIPOS PARA MÓDULO CRM
// Agente: CRM CON VENDEDORES
// ===============================================

import { Personal } from './personal';

// ========== TIPOS DE CLIENTES ==========

export type TipoCliente = 'potencial' | 'activo' | 'inactivo';
export type CategoriaCliente = 'A' | 'B' | 'C';

export interface Cliente {
  id: string;
  organization_id: number;
  nombre: string;
  razon_social?: string;
  rfc?: string;
  tipo_cliente: TipoCliente;
  categoria: CategoriaCliente;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  pais?: string;
  telefono?: string;
  email?: string;
  sitio_web?: string;
  representante_legal?: string;
  fecha_registro: string;
  fecha_ultimo_contacto?: string;
  vendedor_asignado_id?: string;
  supervisor_comercial_id?: string;
  zona_venta?: string;
  especialidad_interes?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
  
  // Relaciones
  vendedor_asignado?: Personal;
  supervisor_comercial?: Personal;
}

export interface ClienteFormData {
  nombre: string;
  razon_social?: string;
  rfc?: string;
  tipo_cliente: TipoCliente;
  categoria: CategoriaCliente;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  pais?: string;
  telefono?: string;
  email?: string;
  sitio_web?: string;
  representante_legal?: string;
  vendedor_asignado_id?: string;
  supervisor_comercial_id?: string;
  zona_venta?: string;
  especialidad_interes?: string;
  observaciones?: string;
}

// ========== TIPOS DE OPORTUNIDADES ==========

export type TipoOportunidad = 'nueva' | 'renovacion' | 'ampliacion' | 'referido';
export type EtapaOportunidad = 'prospeccion' | 'calificacion' | 'propuesta' | 'negociacion' | 'cerrada_ganada' | 'cerrada_perdida';

export interface Oportunidad {
  id: string;
  organization_id: number;
  cliente_id: string;
  vendedor_id: string;
  supervisor_id?: string;
  titulo: string;
  descripcion?: string;
  tipo_oportunidad: TipoOportunidad;
  etapa: EtapaOportunidad;
  probabilidad: number;
  valor_estimado: number;
  moneda: string;
  fecha_cierre_esperada?: string;
  fecha_cierre_real?: string;
  motivo_cierre?: string;
  productos_servicios?: string;
  competencia?: string;
  recursos_requeridos?: string;
  riesgos?: string;
  estrategia_venta?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
  
  // Relaciones
  cliente?: Cliente;
  vendedor?: Personal;
  supervisor?: Personal;
  productos?: ProductoOportunidad[];
  actividades?: ActividadCRM[];
}

export interface OportunidadFormData {
  cliente_id: string;
  vendedor_id: string;
  supervisor_id?: string;
  titulo: string;
  descripcion?: string;
  tipo_oportunidad: TipoOportunidad;
  etapa: EtapaOportunidad;
  probabilidad: number;
  valor_estimado: number;
  moneda: string;
  fecha_cierre_esperada?: string;
  productos_servicios?: string;
  competencia?: string;
  recursos_requeridos?: string;
  riesgos?: string;
  estrategia_venta?: string;
  observaciones?: string;
}

// ========== TIPOS DE ACTIVIDADES CRM ==========

export type TipoActividad = 'llamada' | 'email' | 'reunion' | 'visita' | 'propuesta' | 'seguimiento' | 'otro';
export type EstadoActividad = 'programada' | 'en_proceso' | 'completada' | 'cancelada';
export type PrioridadActividad = 'baja' | 'media' | 'alta' | 'urgente';

export interface ActividadCRM {
  id: string;
  organization_id: number;
  oportunidad_id?: string;
  cliente_id?: string;
  vendedor_id: string;
  tipo_actividad: TipoActividad;
  titulo: string;
  descripcion?: string;
  fecha_actividad: string;
  duracion_minutos: number;
  estado: EstadoActividad;
  resultado?: string;
  proxima_accion?: string;
  fecha_proxima_accion?: string;
  prioridad: PrioridadActividad;
  ubicacion?: string;
  participantes?: string;
  adjuntos?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  is_active: boolean;
  
  // Relaciones
  oportunidad?: Oportunidad;
  cliente?: Cliente;
  vendedor?: Personal;
}

export interface ActividadCRMFormData {
  oportunidad_id?: string;
  cliente_id?: string;
  vendedor_id: string;
  tipo_actividad: TipoActividad;
  titulo: string;
  descripcion?: string;
  fecha_actividad: string;
  duracion_minutos: number;
  estado: EstadoActividad;
  resultado?: string;
  proxima_accion?: string;
  fecha_proxima_accion?: string;
  prioridad: PrioridadActividad;
  ubicacion?: string;
  participantes?: string;
  observaciones?: string;
}

// ========== TIPOS DE PRODUCTOS ==========

export interface ProductoOportunidad {
  id: string;
  organization_id: number;
  oportunidad_id: string;
  producto_servicio: string;
  descripcion?: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface ProductoOportunidadFormData {
  producto_servicio: string;
  descripcion?: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
}

// ========== TIPOS DE MÉTRICAS ==========

export interface MetricasVendedor {
  id: string;
  organization_id: number;
  vendedor_id: string;
  periodo: string; // formato: YYYY-MM
  clientes_asignados: number;
  oportunidades_activas: number;
  oportunidades_ganadas: number;
  oportunidades_perdidas: number;
  valor_ventas: number;
  meta_mensual: number;
  porcentaje_cumplimiento: number;
  actividades_completadas: number;
  actividades_pendientes: number;
  tiempo_promedio_cierre: number; // en días
  tasa_conversion: number; // porcentaje
  created_at: string;
  updated_at: string;
  
  // Relaciones
  vendedor?: Personal;
}

// ========== TIPOS DE FILTROS ==========

export interface ClienteFilters {
  search?: string;
  tipo_cliente?: TipoCliente;
  categoria?: CategoriaCliente;
  vendedor_id?: string;
  zona_venta?: string;
  fecha_registro_desde?: string;
  fecha_registro_hasta?: string;
}

export interface OportunidadFilters {
  search?: string;
  etapa?: EtapaOportunidad;
  tipo_oportunidad?: TipoOportunidad;
  vendedor_id?: string;
  cliente_id?: string;
  fecha_cierre_desde?: string;
  fecha_cierre_hasta?: string;
  valor_minimo?: number;
  valor_maximo?: number;
}

export interface ActividadCRMFilters {
  search?: string;
  tipo_actividad?: TipoActividad;
  estado?: EstadoActividad;
  prioridad?: PrioridadActividad;
  vendedor_id?: string;
  cliente_id?: string;
  oportunidad_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

// ========== TIPOS DE ESTADÍSTICAS ==========

export interface EstadisticasCRM {
  total_clientes: number;
  clientes_potenciales: number;
  clientes_activos: number;
  clientes_inactivos: number;
  total_oportunidades: number;
  oportunidades_activas: number;
  oportunidades_ganadas: number;
  oportunidades_perdidas: number;
  valor_total_ventas: number;
  valor_pipeline: number;
  total_actividades: number;
  actividades_completadas: number;
  actividades_pendientes: number;
  tasa_conversion_global: number;
  tiempo_promedio_cierre: number;
}

export interface EstadisticasVendedor {
  vendedor_id: string;
  vendedor_nombre: string;
  clientes_asignados: number;
  oportunidades_activas: number;
  oportunidades_ganadas: number;
  valor_ventas: number;
  meta_mensual: number;
  porcentaje_cumplimiento: number;
  actividades_completadas: number;
  tasa_conversion: number;
}

// ========== CONSTANTES ==========

export const TIPOS_CLIENTE: { value: TipoCliente; label: string; color: string }[] = [
  { value: 'potencial', label: 'Potencial', color: 'blue' },
  { value: 'activo', label: 'Activo', color: 'green' },
  { value: 'inactivo', label: 'Inactivo', color: 'gray' }
];

export const CATEGORIAS_CLIENTE: { value: CategoriaCliente; label: string; color: string }[] = [
  { value: 'A', label: 'Categoría A', color: 'green' },
  { value: 'B', label: 'Categoría B', color: 'yellow' },
  { value: 'C', label: 'Categoría C', color: 'red' }
];

export const TIPOS_OPORTUNIDAD: { value: TipoOportunidad; label: string; color: string }[] = [
  { value: 'nueva', label: 'Nueva', color: 'blue' },
  { value: 'renovacion', label: 'Renovación', color: 'green' },
  { value: 'ampliacion', label: 'Ampliación', color: 'purple' },
  { value: 'referido', label: 'Referido', color: 'orange' }
];

export const ETAPAS_OPORTUNIDAD: { value: EtapaOportunidad; label: string; color: string; probabilidad: number }[] = [
  { value: 'prospeccion', label: 'Prospección', color: 'gray', probabilidad: 10 },
  { value: 'calificacion', label: 'Calificación', color: 'blue', probabilidad: 25 },
  { value: 'propuesta', label: 'Propuesta', color: 'yellow', probabilidad: 50 },
  { value: 'negociacion', label: 'Negociación', color: 'orange', probabilidad: 75 },
  { value: 'cerrada_ganada', label: 'Cerrada Ganada', color: 'green', probabilidad: 100 },
  { value: 'cerrada_perdida', label: 'Cerrada Perdida', color: 'red', probabilidad: 0 }
];

export const TIPOS_ACTIVIDAD: { value: TipoActividad; label: string; icon: string; color: string }[] = [
  { value: 'llamada', label: 'Llamada', icon: 'phone', color: 'blue' },
  { value: 'email', label: 'Email', icon: 'mail', color: 'green' },
  { value: 'reunion', label: 'Reunión', icon: 'users', color: 'purple' },
  { value: 'visita', label: 'Visita', icon: 'map-pin', color: 'orange' },
  { value: 'propuesta', label: 'Propuesta', icon: 'file-text', color: 'yellow' },
  { value: 'seguimiento', label: 'Seguimiento', icon: 'refresh-cw', color: 'cyan' },
  { value: 'otro', label: 'Otro', icon: 'more-horizontal', color: 'gray' }
];

export const ESTADOS_ACTIVIDAD: { value: EstadoActividad; label: string; color: string }[] = [
  { value: 'programada', label: 'Programada', color: 'blue' },
  { value: 'en_proceso', label: 'En Proceso', color: 'yellow' },
  { value: 'completada', label: 'Completada', color: 'green' },
  { value: 'cancelada', label: 'Cancelada', color: 'red' }
];

export const PRIORIDADES_ACTIVIDAD: { value: PrioridadActividad; label: string; color: string }[] = [
  { value: 'baja', label: 'Baja', color: 'gray' },
  { value: 'media', label: 'Media', color: 'blue' },
  { value: 'alta', label: 'Alta', color: 'orange' },
  { value: 'urgente', label: 'Urgente', color: 'red' }
];

// ========== FUNCIONES UTILITARIAS ==========

export const getTipoClienteColor = (tipo: TipoCliente): string => {
  return TIPOS_CLIENTE.find(t => t.value === tipo)?.color || 'gray';
};

export const getCategoriaClienteColor = (categoria: CategoriaCliente): string => {
  return CATEGORIAS_CLIENTE.find(c => c.value === categoria)?.color || 'gray';
};

export const getEtapaOportunidadColor = (etapa: EtapaOportunidad): string => {
  return ETAPAS_OPORTUNIDAD.find(e => e.value === etapa)?.color || 'gray';
};

export const getTipoActividadColor = (tipo: TipoActividad): string => {
  return TIPOS_ACTIVIDAD.find(t => t.value === tipo)?.color || 'gray';
};

export const getEstadoActividadColor = (estado: EstadoActividad): string => {
  return ESTADOS_ACTIVIDAD.find(e => e.value === estado)?.color || 'gray';
};

export const getPrioridadActividadColor = (prioridad: PrioridadActividad): string => {
  return PRIORIDADES_ACTIVIDAD.find(p => p.value === prioridad)?.color || 'gray';
};

export const calcularProbabilidadEtapa = (etapa: EtapaOportunidad): number => {
  return ETAPAS_OPORTUNIDAD.find(e => e.value === etapa)?.probabilidad || 0;
};

export const formatearMoneda = (valor: number, moneda: string = 'MXN'): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: moneda
  }).format(valor);
};

export const calcularTiempoCierre = (fechaInicio: string, fechaCierre: string): number => {
  const inicio = new Date(fechaInicio);
  const cierre = new Date(fechaCierre);
  const diffTime = Math.abs(cierre.getTime() - inicio.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // días
};
