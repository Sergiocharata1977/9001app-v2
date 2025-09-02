// ===============================================
// TIPOS PARA PERSONAL COMERCIAL
// ===============================================

// Roles comerciales disponibles
export type RolComercial = 
  | 'vendedor'
  | 'supervisor_comercial'
  | 'especialista_tecnico'
  | 'gerente_comercial'
  | 'atencion_cliente'
  | 'ninguno';

// Clasificaciones comerciales
export type ClasificacionComercial = 
  | 'general'
  | 'comercial'
  | 'tecnico'
  | 'administrativo';

// Especialidades agro
export type EspecialidadAgro = 
  | 'semillas'
  | 'fertilizantes'
  | 'maquinaria'
  | 'servicios'
  | 'consultoria'
  | 'general';

// Zonas de venta
export type ZonaVenta = 
  | 'Zona Norte'
  | 'Zona Sur'
  | 'Zona Este'
  | 'Zona Oeste'
  | 'Zona Centro'
  | 'Todas las zonas'
  | string;

// Interface principal del personal
export interface Personal {
  id: string;
  organization_id: number;
  numero?: string;
  nombre: string;
  apellido?: string;
  puesto?: string;
  departamento?: string;
  email?: string;
  telefono?: string;
  fecha_ingreso?: string;
  documento_identidad?: string;
  direccion?: string;
  formacion_academica?: string;
  experiencia_laboral?: string;
  competencias?: string;
  evaluacion_desempeno?: string;
  capacitaciones_recibidas?: string;
  observaciones?: string;
  imagen?: string;
  estado?: string;
  created_at?: string;
  updated_at?: string;
  
  // Campos comerciales
  clasificacion_comercial?: ClasificacionComercial;
  rol_comercial?: RolComercial;
  zona_venta?: ZonaVenta;
  comision_venta?: number;
  meta_venta_mensual?: number;
  fecha_inicio_comercial?: string;
  supervisor_comercial_id?: number;
  especialidad_agro?: EspecialidadAgro;
}

// Interface para personal comercial específico
export interface PersonalComercial extends Personal {
  clasificacion_comercial: 'comercial';
  rol_comercial: Exclude<RolComercial, 'ninguno'>;
  zona_venta: ZonaVenta;
  comision_venta: number;
  meta_venta_mensual: number;
  fecha_inicio_comercial: string;
  especialidad_agro: EspecialidadAgro;
}

// Interface para vendedores
export interface Vendedor extends PersonalComercial {
  rol_comercial: 'vendedor';
  supervisor_comercial_id: number;
}

// Interface para supervisores comerciales
export interface SupervisorComercial extends PersonalComercial {
  rol_comercial: 'supervisor_comercial';
}

// Interface para gerentes comerciales
export interface GerenteComercial extends PersonalComercial {
  rol_comercial: 'gerente_comercial';
}

// Interface para especialistas técnicos
export interface EspecialistaTecnico extends PersonalComercial {
  rol_comercial: 'especialista_tecnico';
  especialidad_agro: Exclude<EspecialidadAgro, 'general'>;
}

// Interface para atención al cliente
export interface AtencionCliente extends PersonalComercial {
  rol_comercial: 'atencion_cliente';
}

// Filtros para búsqueda de personal
export interface PersonalFilters {
  search?: string;
  clasificacion_comercial?: ClasificacionComercial;
  rol_comercial?: RolComercial;
  zona_venta?: ZonaVenta;
  especialidad_agro?: EspecialidadAgro;
  departamento?: string;
  estado?: string;
  supervisor_comercial_id?: number;
}

// Datos para crear/actualizar personal
export interface PersonalFormData {
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  puesto?: string;
  departamento?: string;
  fecha_ingreso?: string;
  documento_identidad?: string;
  direccion?: string;
  formacion_academica?: string;
  experiencia_laboral?: string;
  competencias?: string;
  observaciones?: string;
  imagen?: string;
  estado?: string;
  
  // Datos comerciales
  clasificacion_comercial?: ClasificacionComercial;
  rol_comercial?: RolComercial;
  zona_venta?: ZonaVenta;
  comision_venta?: number;
  meta_venta_mensual?: number;
  fecha_inicio_comercial?: string;
  supervisor_comercial_id?: number;
  especialidad_agro?: EspecialidadAgro;
}

// Estadísticas de personal comercial
export interface PersonalComercialStats {
  total_vendedores: number;
  total_supervisores: number;
  total_gerentes: number;
  total_especialistas: number;
  total_atencion_cliente: number;
  ventas_mes_actual: number;
  meta_mes_actual: number;
  porcentaje_cumplimiento: number;
  promedio_comision: number;
  zonas_activas: string[];
  especialidades_activas: string[];
}

// Métricas de rendimiento por vendedor
export interface VendedorMetrics {
  vendedor_id: string;
  nombre: string;
  zona_venta: string;
  ventas_mes: number;
  meta_mes: number;
  porcentaje_cumplimiento: number;
  comision_ganada: number;
  clientes_asignados: number;
  prospectos_asignados: number;
  oportunidades_activas: number;
  ranking_zona: number;
  ranking_general: number;
}

// Configuración de comisiones
export interface ComisionConfig {
  rol_comercial: RolComercial;
  comision_base: number;
  comision_meta: number;
  comision_exceso: number;
  meta_minima: number;
  bonificacion_especialidad: number;
}

// Constantes para roles comerciales
export const ROLES_COMERCIALES: Record<RolComercial, string> = {
  vendedor: 'Vendedor',
  supervisor_comercial: 'Supervisor Comercial',
  especialista_tecnico: 'Especialista Técnico',
  gerente_comercial: 'Gerente Comercial',
  atencion_cliente: 'Atención al Cliente',
  ninguno: 'Sin Rol Comercial'
};

// Constantes para clasificaciones comerciales
export const CLASIFICACIONES_COMERCIALES: Record<ClasificacionComercial, string> = {
  general: 'General',
  comercial: 'Comercial',
  tecnico: 'Técnico',
  administrativo: 'Administrativo'
};

// Constantes para especialidades agro
export const ESPECIALIDADES_AGRO: Record<EspecialidadAgro, string> = {
  semillas: 'Semillas',
  fertilizantes: 'Fertilizantes',
  maquinaria: 'Maquinaria',
  servicios: 'Servicios',
  consultoria: 'Consultoría',
  general: 'General'
};

// Constantes para zonas de venta
export const ZONAS_VENTA: ZonaVenta[] = [
  'Zona Norte',
  'Zona Sur',
  'Zona Este',
  'Zona Oeste',
  'Zona Centro',
  'Todas las zonas'
];

// Configuración de comisiones por rol
export const CONFIG_COMISIONES: ComisionConfig[] = [
  {
    rol_comercial: 'vendedor',
    comision_base: 3.0,
    comision_meta: 5.0,
    comision_exceso: 7.0,
    meta_minima: 30000,
    bonificacion_especialidad: 1.0
  },
  {
    rol_comercial: 'supervisor_comercial',
    comision_base: 2.0,
    comision_meta: 3.0,
    comision_exceso: 4.0,
    meta_minima: 100000,
    bonificacion_especialidad: 0.5
  },
  {
    rol_comercial: 'gerente_comercial',
    comision_base: 1.5,
    comision_meta: 2.5,
    comision_exceso: 3.5,
    meta_minima: 500000,
    bonificacion_especialidad: 0.3
  },
  {
    rol_comercial: 'especialista_tecnico',
    comision_base: 2.5,
    comision_meta: 4.0,
    comision_exceso: 6.0,
    meta_minima: 50000,
    bonificacion_especialidad: 2.0
  },
  {
    rol_comercial: 'atencion_cliente',
    comision_base: 1.0,
    comision_meta: 2.0,
    comision_exceso: 3.0,
    meta_minima: 20000,
    bonificacion_especialidad: 0.5
  },
  {
    rol_comercial: 'ninguno',
    comision_base: 0.0,
    comision_meta: 0.0,
    comision_exceso: 0.0,
    meta_minima: 0,
    bonificacion_especialidad: 0.0
  }
];

// Función helper para obtener configuración de comisión
export const getComisionConfig = (rol: RolComercial): ComisionConfig => {
  return CONFIG_COMISIONES.find(config => config.rol_comercial === rol) || CONFIG_COMISIONES[5];
};

// Función helper para calcular comisión
export const calcularComision = (
  ventas: number,
  meta: number,
  rol: RolComercial,
  especialidad: EspecialidadAgro = 'general'
): number => {
  const config = getComisionConfig(rol);
  let comision = 0;

  if (ventas >= meta) {
    // Comisión por meta cumplida
    comision += (meta * config.comision_meta) / 100;
    
    // Comisión por exceso
    const exceso = ventas - meta;
    comision += (exceso * config.comision_exceso) / 100;
  } else {
    // Comisión base
    comision += (ventas * config.comision_base) / 100;
  }

  // Bonificación por especialidad
  if (especialidad !== 'general') {
    comision += (ventas * config.bonificacion_especialidad) / 100;
  }

  return Math.round(comision * 100) / 100; // Redondear a 2 decimales
};

// Función helper para obtener color de badge por rol
export const getRolColor = (rol: RolComercial): string => {
  switch (rol) {
    case 'vendedor':
      return 'bg-blue-100 text-blue-800';
    case 'supervisor_comercial':
      return 'bg-green-100 text-green-800';
    case 'gerente_comercial':
      return 'bg-purple-100 text-purple-800';
    case 'especialista_tecnico':
      return 'bg-orange-100 text-orange-800';
    case 'atencion_cliente':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Función helper para obtener color de badge por especialidad
export const getEspecialidadColor = (especialidad: EspecialidadAgro): string => {
  switch (especialidad) {
    case 'semillas':
      return 'bg-yellow-100 text-yellow-800';
    case 'fertilizantes':
      return 'bg-green-100 text-green-800';
    case 'maquinaria':
      return 'bg-blue-100 text-blue-800';
    case 'servicios':
      return 'bg-purple-100 text-purple-800';
    case 'consultoria':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
