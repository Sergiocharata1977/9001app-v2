// Interfaces TypeScript para modelos de datos MongoDB
// Sistema de Gestión de Calidad ISO 9001

export interface IOrganizacion {
  _id?: string;
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  representante: string;
  fechaCreacion: Date;
  estado: 'activo' | 'inactivo';
  plan: 'basico' | 'premium' | 'enterprise';
  configuracion: {
    logo?: string;
    colores: {
      primario: string;
      secundario: string;
    };
    modulos: string[];
  };
}

export interface IUsuario {
  _id?: string;
  organizacionId: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: 'admin' | 'supervisor' | 'usuario' | 'auditor';
  departamentoId?: string;
  puesto: string;
  telefono?: string;
  fechaCreacion: Date;
  ultimoAcceso?: Date;
  estado: 'activo' | 'inactivo' | 'bloqueado';
  permisos: string[];
  avatar?: string;
}

export interface IDepartamento {
  _id?: string;
  organizacionId: string;
  nombre: string;
  descripcion?: string;
  responsableId?: string;
  fechaCreacion: Date;
  estado: 'activo' | 'inactivo';
  jerarquia: number;
  color?: string;
}

export interface IProceso {
  _id?: string;
  organizacionId: string;
  nombre: string;
  descripcion: string;
  codigo: string;
  departamentoId: string;
  responsableId: string;
  tipo: 'principal' | 'soporte' | 'gestión';
  estado: 'activo' | 'inactivo' | 'en_revision';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  version: string;
  entrada: string[];
  salida: string[];
  recursos: string[];
  riesgos: string[];
  indicadores: string[];
  documentos: string[];
}

export interface IDocumento {
  _id?: string;
  organizacionId: string;
  titulo: string;
  codigo: string;
  tipo: 'procedimiento' | 'instruccion' | 'formato' | 'manual' | 'politica';
  version: string;
  estado: 'borrador' | 'revision' | 'aprobado' | 'obsoleto';
  procesoId?: string;
  departamentoId?: string;
  autorId: string;
  revisorId?: string;
  aprobadorId?: string;
  fechaCreacion: Date;
  fechaRevision?: Date;
  fechaAprobacion?: Date;
  contenido: string;
  archivo?: string;
  tags: string[];
  clasificacion: 'interno' | 'confidencial' | 'publico';
}

export interface IAuditoria {
  _id?: string;
  organizacionId: string;
  tipo: 'interna' | 'externa' | 'seguimiento';
  alcance: string;
  fechaInicio: Date;
  fechaFin: Date;
  auditorLiderId: string;
  auditores: string[];
  departamentos: string[];
  procesos: string[];
  estado: 'planificada' | 'en_curso' | 'finalizada' | 'cancelada';
  objetivo: string;
  criterios: string[];
  hallazgos: string[];
  conclusiones?: string;
  recomendaciones?: string[];
  fechaCreacion: Date;
}

export interface IHallazgo {
  _id?: string;
  organizacionId: string;
  auditoriaId: string;
  titulo: string;
  descripcion: string;
  tipo: 'no_conformidad' | 'observacion' | 'oportunidad_mejora';
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  procesoId?: string;
  departamentoId?: string;
  responsableId?: string;
  fechaDeteccion: Date;
  fechaLimite: Date;
  estado: 'abierto' | 'en_proceso' | 'cerrado' | 'verificado';
  acciones: string[];
  evidencia?: string[];
  fechaCreacion: Date;
  fechaCierre?: Date;
}

export interface IAccion {
  _id?: string;
  organizacionId: string;
  hallazgoId?: string;
  titulo: string;
  descripcion: string;
  tipo: 'correctiva' | 'preventiva' | 'mejora';
  responsableId: string;
  fechaInicio: Date;
  fechaLimite: Date;
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'verificada';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  recursos: string[];
  costo?: number;
  resultado?: string;
  evidencia?: string[];
  fechaCreacion: Date;
  fechaCompletado?: Date;
  fechaVerificacion?: Date;
}

export interface IIndicador {
  _id?: string;
  organizacionId: string;
  nombre: string;
  descripcion: string;
  codigo: string;
  tipo: 'efectividad' | 'eficiencia' | 'satisfaccion' | 'financiero';
  unidad: string;
  formula?: string;
  meta: number;
  tolerancia: {
    minimo: number;
    maximo: number;
  };
  frecuencia: 'diaria' | 'semanal' | 'mensual' | 'trimestral' | 'anual';
  procesoId?: string;
  departamentoId?: string;
  responsableId: string;
  estado: 'activo' | 'inactivo';
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface IMedicion {
  _id?: string;
  organizacionId: string;
  indicadorId: string;
  valor: number;
  fecha: Date;
  periodo: string;
  fuente: string;
  responsableId: string;
  observaciones?: string;
  estado: 'dentro_limites' | 'fuera_limites' | 'pendiente';
  evidencia?: string[];
  fechaCreacion: Date;
}

export interface ICapacitacion {
  _id?: string;
  organizacionId: string;
  titulo: string;
  descripcion: string;
  tipo: 'induccion' | 'especifica' | 'continua' | 'certificacion';
  modalidad: 'presencial' | 'virtual' | 'hibrida';
  duracion: number; // en horas
  instructor: string;
  fechaInicio: Date;
  fechaFin: Date;
  participantes: string[];
  estado: 'planificada' | 'en_curso' | 'finalizada' | 'cancelada';
  recursos: string[];
  costo?: number;
  evaluacion?: string;
  fechaCreacion: Date;
}

export interface IEvaluacion {
  _id?: string;
  organizacionId: string;
  capacitacionId?: string;
  empleadoId: string;
  tipo: 'conocimiento' | 'habilidad' | 'actitud' | 'desempeno';
  titulo: string;
  descripcion: string;
  fecha: Date;
  evaluadorId: string;
  puntaje: number;
  puntajeMaximo: number;
  porcentaje: number;
  resultado: 'aprobado' | 'reprobado' | 'pendiente';
  observaciones?: string;
  recomendaciones?: string[];
  fechaCreacion: Date;
}

export interface IProducto {
  _id?: string;
  organizacionId: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  categoria: string;
  especificaciones: Record<string, any>;
  procesoId?: string;
  responsableId: string;
  estado: 'desarrollo' | 'produccion' | 'discontinuado';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  version: string;
  calidad: {
    especificaciones: string[];
    pruebas: string[];
    certificaciones: string[];
  };
}

export interface IEncuesta {
  _id?: string;
  organizacionId: string;
  titulo: string;
  descripcion: string;
  tipo: 'satisfaccion' | 'clima_laboral' | 'evaluacion' | 'feedback';
  preguntas: Array<{
    id: string;
    pregunta: string;
    tipo: 'texto' | 'opcion_unica' | 'opcion_multiple' | 'escala' | 'fecha';
    opciones?: string[];
    requerida: boolean;
  }>;
  fechaInicio: Date;
  fechaFin: Date;
  participantes: string[];
  estado: 'borrador' | 'activa' | 'cerrada' | 'analizada';
  respuestas: number;
  fechaCreacion: Date;
}

export interface IMinuta {
  _id?: string;
  organizacionId: string;
  titulo: string;
  tipo: 'reunion' | 'auditoria' | 'revision' | 'capacitacion';
  fecha: Date;
  duracion: number; // en minutos
  lugar: string;
  participantes: string[];
  agenda: string[];
  acuerdos: Array<{
    descripcion: string;
    responsableId: string;
    fechaLimite: Date;
    estado: 'pendiente' | 'en_proceso' | 'completado';
  }>;
  conclusiones: string[];
  proximaReunion?: Date;
  estado: 'borrador' | 'aprobada' | 'cerrada';
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// Interfaces para estadísticas y reportes
export interface IEstadistica {
  _id?: string;
  organizacionId: string;
  tipo: 'indicadores' | 'auditorias' | 'hallazgos' | 'acciones' | 'capacitaciones';
  periodo: string;
  datos: Record<string, any>;
  fechaCreacion: Date;
}

// Interfaces para configuración del sistema
export interface IConfiguracionSistema {
  _id?: string;
  organizacionId: string;
  modulo: string;
  configuracion: Record<string, any>;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// Interfaces para logs y auditoría del sistema
export interface ILogSistema {
  _id?: string;
  organizacionId: string;
  usuarioId?: string;
  accion: string;
  modulo: string;
  detalles: Record<string, any>;
  ip?: string;
  userAgent?: string;
  fecha: Date;
  nivel: 'info' | 'warning' | 'error' | 'debug';
}