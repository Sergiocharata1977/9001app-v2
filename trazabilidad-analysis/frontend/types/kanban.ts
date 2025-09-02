// Tipos base para Kanban
export interface KanbanColumn {
  id: string;
  title: string;
  states: string[];
  colorClasses: string;
  bgColor: string;
  icon?: React.ComponentType<any>;
}

export interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: 'alta' | 'media' | 'baja';
  assignedTo?: string;
  dueDate?: string;
  [key: string]: any; // Para campos específicos de cada módulo
}

export interface StandardKanbanBoardProps {
  items: KanbanItem[];
  columns: KanbanColumn[];
  onItemClick?: (item: KanbanItem) => void;
  onStatusChange?: (itemId: string, newStatus: string) => void;
  renderItem?: (item: KanbanItem) => React.ReactNode;
  className?: string;
}

// Tipos específicos para Hallazgos
export interface Hallazgo {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'Identificado' | 'En Análisis' | 'En Acción' | 'En Verificación' | 'Cerrado';
  prioridad: 'alta' | 'media' | 'baja';
  responsable: string;
  fecha_identificacion: string;
  fecha_limite: string;
  norma_iso: string;
  proceso_afectado: string;
  accion_correctiva: string;
  evidencia: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: number;
}

// Tipos específicos para Acciones
export interface Accion {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'Planificada' | 'En Proceso' | 'En Verificación' | 'Implementada';
  prioridad: 'alta' | 'media' | 'baja';
  responsable: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_limite: string;
  tipo_accion: string;
  hallazgo_id: string;
  proceso_afectado: string;
  accion_correctiva: string;
  accion_preventiva: string;
  evidencia: string;
  costo_estimado: number;
  costo_real: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: number;
}

// Tipos específicos para Capacitaciones
export interface Capacitacion {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'Planificada' | 'En Preparación' | 'En Evaluación' | 'Completada';
  tipo_capacitacion: string;
  modalidad: string;
  duracion_horas: number;
  fecha_inicio: string;
  fecha_fin: string;
  instructor: string;
  participantes_max: number;
  participantes_actual: number;
  lugar: string;
  costo: number;
  temas: string[];
  materiales: string[];
  evaluacion: string;
  observaciones: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: number;
}

// Tipos específicos para Oportunidades Agro
export interface OportunidadAgro {
  id: string;
  organization_id: string;
  cliente_id: string;
  titulo: string;
  descripcion: string;
  tipo_oportunidad: 'nueva' | 'renovacion' | 'ampliacion' | 'servicio_tecnico';
  etapa: 'prospeccion' | 'diagnostico' | 'propuesta_tecnica' | 'demostracion' | 'negociacion' | 'cerrada_ganada' | 'cerrada_perdida';
  cultivo_objetivo: string;
  superficie_objetivo: number;
  temporada_objetivo: string;
  necesidad_tecnica: string;
  probabilidad: number;
  valor_estimado: number;
  moneda: string;
  fecha_cierre_esperada: string;
  fecha_cierre_real: string;
  fecha_siembra_objetivo: string;
  vendedor_id: string;
  tecnico_id: string;
  supervisor_id: string;
  competencia: string;
  estrategia_venta: string;
  observaciones: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: number;
}

// Tipos específicos para Productos
export interface Producto {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  estado: 'borrador' | 'en_revision' | 'aprobado' | 'en_produccion' | 'descontinuado';
  tipo: 'producto' | 'servicio';
  categoria: string;
  responsable: string;
  fecha_creacion: string;
  fecha_revision: string;
  version: string;
  especificaciones: string;
  requisitos_calidad: string;
  proceso_aprobacion: string;
  documentos_asociados: string;
  observaciones: string;
  created_at: string;
  updated_at: string;
}

// Tipos específicos para Análisis de Riesgo
export interface AnalisisRiesgo {
  id: string;
  organization_id: string;
  cliente_id: string;
  fecha_analisis: string;
  periodo_analisis: string;
  puntaje_riesgo: number;
  categoria_riesgo: 'baja' | 'media' | 'alta' | 'muy_alta';
  capacidad_pago: number;
  ingresos_mensuales: number;
  gastos_mensuales: number;
  margen_utilidad: number;
  liquidez: number;
  solvencia: number;
  endeudamiento: number;
  recomendaciones: string;
  observaciones: string;
  estado: 'identificado' | 'evaluado' | 'mitigado' | 'monitoreado' | 'cerrado';
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: number;
}

// Tipos para datos de creación
export interface CreateHallazgoData {
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  responsable: string;
  fecha_identificacion: string;
  fecha_limite: string;
  norma_iso?: string;
  proceso_afectado?: string;
  accion_correctiva?: string;
  evidencia?: string;
}

export interface CreateAccionData {
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  responsable: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_limite: string;
  tipo_accion: string;
  hallazgo_id: string;
  proceso_afectado?: string;
  accion_correctiva?: string;
  accion_preventiva?: string;
  evidencia?: string;
  costo_estimado?: number;
  costo_real?: number;
}

export interface CreateCapacitacionData {
  titulo: string;
  descripcion: string;
  estado: string;
  tipo_capacitacion: string;
  modalidad: string;
  duracion_horas: number;
  fecha_inicio: string;
  fecha_fin: string;
  instructor: string;
  participantes_max: number;
  participantes_actual?: number;
  lugar?: string;
  costo?: number;
  temas?: string[];
  materiales?: string[];
  evaluacion?: string;
  observaciones?: string;
}

export interface CreateOportunidadAgroData {
  organization_id: string;
  cliente_id: string;
  titulo: string;
  descripcion: string;
  tipo_oportunidad: string;
  etapa: string;
  cultivo_objetivo?: string;
  superficie_objetivo?: number;
  temporada_objetivo?: string;
  necesidad_tecnica?: string;
  probabilidad: number;
  valor_estimado: number;
  moneda: string;
  fecha_cierre_esperada?: string;
  fecha_cierre_real?: string;
  fecha_siembra_objetivo?: string;
  vendedor_id: string;
  tecnico_id?: string;
  supervisor_id?: string;
  competencia?: string;
  estrategia_venta?: string;
  observaciones?: string;
}

export interface CreateProductoData {
  nombre: string;
  codigo: string;
  descripcion: string;
  estado: string;
  tipo: string;
  categoria: string;
  responsable: string;
  fecha_creacion: string;
  fecha_revision: string;
  version: string;
  especificaciones?: string;
  requisitos_calidad?: string;
  proceso_aprobacion?: string;
  documentos_asociados?: string;
  observaciones?: string;
}

export interface CreateAnalisisRiesgoData {
  organization_id: string;
  cliente_id: string;
  fecha_analisis: string;
  periodo_analisis: string;
  puntaje_riesgo: number;
  categoria_riesgo: string;
  capacidad_pago?: number;
  ingresos_mensuales?: number;
  gastos_mensuales?: number;
  margen_utilidad?: number;
  liquidez?: number;
  solvencia?: number;
  endeudamiento?: number;
  recomendaciones?: string;
  observaciones?: string;
  estado?: string;
}

// Tipos para datos de actualización (parciales)
export interface UpdateHallazgoData extends Partial<CreateHallazgoData> {
  id: string;
}

export interface UpdateAccionData extends Partial<CreateAccionData> {
  id: string;
}

export interface UpdateCapacitacionData extends Partial<CreateCapacitacionData> {
  id: string;
}

export interface UpdateOportunidadAgroData extends Partial<CreateOportunidadAgroData> {
  id: string;
}

export interface UpdateProductoData extends Partial<CreateProductoData> {
  id: number;
}

export interface UpdateAnalisisRiesgoData extends Partial<CreateAnalisisRiesgoData> {
  id: string;
}

// Tipos para props de componentes Kanban
export interface HallazgoKanbanBoardProps {
  hallazgos: Hallazgo[];
  onCardClick?: (hallazgo: Hallazgo) => void;
  onHallazgoStateChange?: (hallazgoId: string, newEstado: string) => void;
}

export interface AccionKanbanBoardProps {
  acciones: Accion[];
  onCardClick?: (accion: Accion) => void;
  onAccionStateChange?: (accionId: string, newEstado: string) => void;
}

export interface CapacitacionKanbanBoardProps {
  capacitaciones: Capacitacion[];
  onCardClick?: (capacitacion: Capacitacion) => void;
  onCapacitacionStateChange?: (capacitacionId: string, newEstado: string) => void;
}

export interface OportunidadAgroKanbanBoardProps {
  oportunidades: OportunidadAgro[];
  onCardClick?: (oportunidad: OportunidadAgro) => void;
  onOportunidadStateChange?: (oportunidadId: string, newEstado: string) => void;
}

export interface ProductoKanbanBoardProps {
  productos: Producto[];
  onCardClick?: (producto: Producto) => void;
  onProductoStateChange?: (productoId: number, newEstado: string) => void;
}

export interface AnalisisRiesgoKanbanBoardProps {
  analisisRiesgo: AnalisisRiesgo[];
  onCardClick?: (analisis: AnalisisRiesgo) => void;
  onAnalisisStateChange?: (analisisId: string, newEstado: string) => void;
}
