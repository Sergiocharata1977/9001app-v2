import mongoose, { Schema, Document, Types } from 'mongoose';

// Interfaces
interface IEstadoActual {
  id: string;
  nombre: string;
  color: string;
  fecha_entrada: Date;
  usuario_cambio: Types.ObjectId;
}

interface IArchivo {
  campo_id: string;
  nombre: string;
  nombre_original: string;
  url: string;
  tipo: string;
  tamaño: number;
  fecha_carga: Date;
  usuario_carga: Types.ObjectId;
  descripcion?: string;
}

interface IHistorialEstado {
  estado_id: string;
  estado_nombre: string;
  estado_color: string;
  fecha_entrada: Date;
  fecha_salida?: Date;
  duracion_dias?: number;
  duracion_horas?: number;
  usuario_cambio: Types.ObjectId;
  comentario?: string;
  datos_snapshot: any;
  archivos_adjuntos?: string[];
}

interface IComentario {
  id: string;
  texto: string;
  usuario: Types.ObjectId;
  fecha: Date;
  editado: boolean;
  fecha_edicion?: Date;
  archivos: string[];
  menciones: Types.ObjectId[];
  reacciones?: {
    tipo: string;
    usuarios: Types.ObjectId[];
  }[];
  respuesta_a?: string;
}

interface IActividad {
  tipo: 'creacion' | 'cambio_estado' | 'edicion' | 'comentario' | 'archivo' | 'asignacion' | 'vencimiento';
  descripcion: string;
  usuario: Types.ObjectId;
  fecha: Date;
  detalles: any;
  ip_address?: string;
  user_agent?: string;
}

interface IChecklistItem {
  id: string;
  texto: string;
  completado: boolean;
  usuario_completo?: Types.ObjectId;
  fecha_completo?: Date;
  orden: number;
  obligatorio: boolean;
}

interface IEtiqueta {
  nombre: string;
  color: string;
  icono?: string;
}

interface IMetricas {
  tiempo_total_dias: number;
  tiempo_total_horas: number;
  tiempo_por_estado: Map<string, number>;
  veces_reenviado: number;
  veces_rechazado: number;
  cumplimiento_tiempo: boolean;
  porcentaje_completado: number;
  campos_completados: number;
  campos_totales: number;
  eficiencia: number;
}

interface INotificacion {
  tipo: string;
  fecha_programada: Date;
  enviada: boolean;
  fecha_envio?: Date;
  destinatarios: Types.ObjectId[];
  canal: 'email' | 'sistema' | 'sms';
  contenido?: string;
}

interface IRelacion {
  tipo: 'padre' | 'hijo' | 'relacionado' | 'duplicado' | 'bloquea' | 'bloqueado_por';
  registro_id: Types.ObjectId;
  codigo_registro: string;
  descripcion?: string;
}

interface ITrazabilidad {
  codigo: string;
  vinculado: boolean;
  fecha_vinculacion?: Date;
  tipo_origen?: string;
}

interface IFirmaDigital {
  campo_id: string;
  firmante: Types.ObjectId;
  fecha_firma: Date;
  hash_documento: string;
  certificado?: string;
  imagen_firma?: string;
  ip_address: string;
  valida: boolean;
}

// Documento principal
export interface IRegistro extends Document {
  codigo: string;
  plantilla_id: Types.ObjectId;
  organizacion_id: Types.ObjectId;
  
  // Estado
  estado_actual: IEstadoActual;
  
  // Datos dinámicos (valores de los campos)
  datos: Map<string, any>;
  
  // Archivos
  archivos: IArchivo[];
  
  // Historial
  historial_estados: IHistorialEstado[];
  
  // Interacción
  comentarios: IComentario[];
  actividad: IActividad[];
  checklist: IChecklistItem[];
  
  // Organización
  etiquetas: IEtiqueta[];
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  
  // Asignación
  responsable_principal?: Types.ObjectId;
  responsables_secundarios: Types.ObjectId[];
  observadores: Types.ObjectId[];
  departamento?: string;
  area?: string;
  
  // Fechas importantes
  fecha_limite?: Date;
  fecha_inicio?: Date;
  fecha_completado?: Date;
  fecha_ultimo_cambio?: Date;
  
  // Métricas
  metricas: IMetricas;
  
  // Notificaciones
  notificaciones_programadas: INotificacion[];
  
  // Relaciones
  relaciones: IRelacion[];
  
  // Trazabilidad
  trazabilidad?: ITrazabilidad;
  
  // Firmas digitales
  firmas: IFirmaDigital[];
  
  // Versionado
  version: number;
  es_borrador: boolean;
  version_publicada?: number;
  versiones_anteriores: Types.ObjectId[];
  
  // Bloqueo
  bloqueado: boolean;
  bloqueado_por?: Types.ObjectId;
  fecha_bloqueo?: Date;
  motivo_bloqueo?: string;
  
  // Metadata
  metadata: {
    creado_por: Types.ObjectId;
    fecha_creacion: Date;
    modificado_por?: Types.ObjectId;
    fecha_modificacion?: Date;
    eliminado: boolean;
    fecha_eliminacion?: Date;
    eliminado_por?: Types.ObjectId;
    ip_creacion?: string;
    dispositivo?: string;
    navegador?: string;
  };
  
  // Campos calculados
  progreso: number;
  dias_abierto: number;
  esta_vencido: boolean;
  
  // Métodos
  cambiarEstado(nuevoEstadoId: string, comentario?: string, usuario?: Types.ObjectId): Promise<void>;
  validarDatos(): Promise<boolean>;
  calcularMetricas(): void;
  notificar(tipo: string, destinatarios: Types.ObjectId[]): Promise<void>;
  generarPDF(): Promise<Buffer>;
  clonar(): Promise<IRegistro>;
  archivar(): Promise<void>;
}

// Schema
const RegistroSchema = new Schema<IRegistro>({
  codigo: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  plantilla_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'PlantillaRegistro',
    required: true,
    index: true 
  },
  organizacion_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization',
    required: true,
    index: true 
  },
  
  // Estado actual
  estado_actual: {
    id: { type: String, required: true },
    nombre: { type: String, required: true },
    color: String,
    fecha_entrada: { type: Date, default: Date.now },
    usuario_cambio: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  
  // Datos dinámicos
  datos: {
    type: Map,
    of: Schema.Types.Mixed
  },
  
  // Archivos
  archivos: [{
    campo_id: String,
    nombre: { type: String, required: true },
    nombre_original: String,
    url: { type: String, required: true },
    tipo: String,
    tamaño: Number,
    fecha_carga: { type: Date, default: Date.now },
    usuario_carga: { type: Schema.Types.ObjectId, ref: 'User' },
    descripcion: String
  }],
  
  // Historial de estados
  historial_estados: [{
    estado_id: String,
    estado_nombre: String,
    estado_color: String,
    fecha_entrada: { type: Date, required: true },
    fecha_salida: Date,
    duracion_dias: Number,
    duracion_horas: Number,
    usuario_cambio: { type: Schema.Types.ObjectId, ref: 'User' },
    comentario: String,
    datos_snapshot: Schema.Types.Mixed,
    archivos_adjuntos: [String]
  }],
  
  // Comentarios
  comentarios: [{
    id: { type: String, required: true },
    texto: { type: String, required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fecha: { type: Date, default: Date.now },
    editado: { type: Boolean, default: false },
    fecha_edicion: Date,
    archivos: [String],
    menciones: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reacciones: [{
      tipo: String,
      usuarios: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }],
    respuesta_a: String
  }],
  
  // Actividad
  actividad: [{
    tipo: { 
      type: String,
      enum: ['creacion', 'cambio_estado', 'edicion', 'comentario', 'archivo', 'asignacion', 'vencimiento'],
      required: true
    },
    descripcion: { type: String, required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'User' },
    fecha: { type: Date, default: Date.now },
    detalles: Schema.Types.Mixed,
    ip_address: String,
    user_agent: String
  }],
  
  // Checklist
  checklist: [{
    id: { type: String, required: true },
    texto: { type: String, required: true },
    completado: { type: Boolean, default: false },
    usuario_completo: { type: Schema.Types.ObjectId, ref: 'User' },
    fecha_completo: Date,
    orden: Number,
    obligatorio: { type: Boolean, default: false }
  }],
  
  // Etiquetas
  etiquetas: [{
    nombre: { type: String, required: true },
    color: { type: String, required: true },
    icono: String
  }],
  
  // Prioridad
  prioridad: {
    type: String,
    enum: ['baja', 'media', 'alta', 'urgente'],
    default: 'media',
    index: true
  },
  
  // Asignación
  responsable_principal: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    index: true 
  },
  responsables_secundarios: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  observadores: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  departamento: String,
  area: String,
  
  // Fechas
  fecha_limite: { type: Date, index: true },
  fecha_inicio: Date,
  fecha_completado: Date,
  fecha_ultimo_cambio: Date,
  
  // Métricas
  metricas: {
    tiempo_total_dias: { type: Number, default: 0 },
    tiempo_total_horas: { type: Number, default: 0 },
    tiempo_por_estado: {
      type: Map,
      of: Number
    },
    veces_reenviado: { type: Number, default: 0 },
    veces_rechazado: { type: Number, default: 0 },
    cumplimiento_tiempo: { type: Boolean, default: true },
    porcentaje_completado: { type: Number, default: 0 },
    campos_completados: { type: Number, default: 0 },
    campos_totales: { type: Number, default: 0 },
    eficiencia: { type: Number, default: 100 }
  },
  
  // Notificaciones programadas
  notificaciones_programadas: [{
    tipo: String,
    fecha_programada: Date,
    enviada: { type: Boolean, default: false },
    fecha_envio: Date,
    destinatarios: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    canal: { 
      type: String,
      enum: ['email', 'sistema', 'sms'],
      default: 'sistema'
    },
    contenido: String
  }],
  
  // Relaciones
  relaciones: [{
    tipo: { 
      type: String,
      enum: ['padre', 'hijo', 'relacionado', 'duplicado', 'bloquea', 'bloqueado_por']
    },
    registro_id: { type: Schema.Types.ObjectId, ref: 'Registro' },
    codigo_registro: String,
    descripcion: String
  }],
  
  // Trazabilidad
  trazabilidad: {
    codigo: String,
    vinculado: { type: Boolean, default: false },
    fecha_vinculacion: Date,
    tipo_origen: String
  },
  
  // Firmas digitales
  firmas: [{
    campo_id: String,
    firmante: { type: Schema.Types.ObjectId, ref: 'User' },
    fecha_firma: { type: Date, default: Date.now },
    hash_documento: String,
    certificado: String,
    imagen_firma: String,
    ip_address: String,
    valida: { type: Boolean, default: true }
  }],
  
  // Versionado
  version: { type: Number, default: 1 },
  es_borrador: { type: Boolean, default: false },
  version_publicada: Number,
  versiones_anteriores: [{ type: Schema.Types.ObjectId, ref: 'Registro' }],
  
  // Bloqueo
  bloqueado: { type: Boolean, default: false },
  bloqueado_por: { type: Schema.Types.ObjectId, ref: 'User' },
  fecha_bloqueo: Date,
  motivo_bloqueo: String,
  
  // Metadata
  metadata: {
    creado_por: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    fecha_creacion: { 
      type: Date, 
      default: Date.now 
    },
    modificado_por: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    fecha_modificacion: Date,
    eliminado: { type: Boolean, default: false },
    fecha_eliminacion: Date,
    eliminado_por: { type: Schema.Types.ObjectId, ref: 'User' },
    ip_creacion: String,
    dispositivo: String,
    navegador: String
  },
  
  // Campos calculados
  progreso: { type: Number, default: 0 },
  dias_abierto: { type: Number, default: 0 },
  esta_vencido: { type: Boolean, default: false }
}, {
  timestamps: true,
  collection: 'registros'
});

// Índices
RegistroSchema.index({ organizacion_id: 1, plantilla_id: 1 });
RegistroSchema.index({ organizacion_id: 1, estado_actual: 1 });
RegistroSchema.index({ organizacion_id: 1, responsable_principal: 1 });
RegistroSchema.index({ organizacion_id: 1, fecha_limite: 1 });
RegistroSchema.index({ organizacion_id: 1, prioridad: 1 });
RegistroSchema.index({ 'metadata.eliminado': 1 });
RegistroSchema.index({ 'trazabilidad.codigo': 1 });
RegistroSchema.index({ esta_vencido: 1, fecha_limite: 1 });
RegistroSchema.index({ codigo: 'text', 'datos': 'text' });

// Métodos
RegistroSchema.methods.cambiarEstado = async function(
  nuevoEstadoId: string, 
  comentario?: string,
  usuario?: Types.ObjectId
): Promise<void> {
  const PlantillaRegistro = mongoose.model('PlantillaRegistro');
  const plantilla = await PlantillaRegistro.findById(this.plantilla_id);
  
  if (!plantilla) {
    throw new Error('Plantilla no encontrada');
  }
  
  const nuevoEstado = plantilla.estados.find((e: any) => e.id === nuevoEstadoId);
  
  if (!nuevoEstado) {
    throw new Error('Estado no válido');
  }
  
  // Validar transición
  if (!plantilla.validarTransicion(this.estado_actual.id, nuevoEstadoId, this.datos)) {
    throw new Error('Transición no permitida');
  }
  
  // Guardar en historial
  const estadoAnterior = this.estado_actual;
  const ahora = new Date();
  const duracion = ahora.getTime() - estadoAnterior.fecha_entrada.getTime();
  
  this.historial_estados.push({
    estado_id: estadoAnterior.id,
    estado_nombre: estadoAnterior.nombre,
    estado_color: estadoAnterior.color,
    fecha_entrada: estadoAnterior.fecha_entrada,
    fecha_salida: ahora,
    duracion_dias: Math.floor(duracion / (1000 * 60 * 60 * 24)),
    duracion_horas: Math.floor(duracion / (1000 * 60 * 60)),
    usuario_cambio: usuario || estadoAnterior.usuario_cambio,
    comentario,
    datos_snapshot: Object.fromEntries(this.datos)
  });
  
  // Actualizar estado actual
  this.estado_actual = {
    id: nuevoEstado.id,
    nombre: nuevoEstado.nombre,
    color: nuevoEstado.color,
    fecha_entrada: ahora,
    usuario_cambio: usuario || estadoAnterior.usuario_cambio
  };
  
  // Registrar actividad
  this.actividad.push({
    tipo: 'cambio_estado',
    descripcion: `Estado cambiado de ${estadoAnterior.nombre} a ${nuevoEstado.nombre}`,
    usuario: usuario || estadoAnterior.usuario_cambio,
    fecha: ahora,
    detalles: {
      estado_anterior: estadoAnterior.id,
      estado_nuevo: nuevoEstado.id,
      comentario
    }
  });
  
  // Actualizar métricas
  this.calcularMetricas();
  
  // Marcar como modificado
  this.fecha_ultimo_cambio = ahora;
  if (usuario) {
    this.metadata.modificado_por = usuario;
    this.metadata.fecha_modificacion = ahora;
  }
  
  await this.save();
};

RegistroSchema.methods.validarDatos = async function(): Promise<boolean> {
  const PlantillaRegistro = mongoose.model('PlantillaRegistro');
  const plantilla = await PlantillaRegistro.findById(this.plantilla_id);
  
  if (!plantilla) {
    return false;
  }
  
  const estadoActual = plantilla.estados.find((e: any) => e.id === this.estado_actual.id);
  
  if (!estadoActual) {
    return false;
  }
  
  // Validar campos requeridos
  for (const campo of estadoActual.campos) {
    if (campo.requerido) {
      const valor = this.datos.get(campo.id);
      if (valor === null || valor === undefined || valor === '') {
        return false;
      }
    }
    
    // Validaciones adicionales según tipo de campo
    // ... implementar validaciones específicas
  }
  
  return true;
};

RegistroSchema.methods.calcularMetricas = function(): void {
  // Calcular tiempo total
  const ahora = new Date();
  const tiempoTotal = ahora.getTime() - this.metadata.fecha_creacion.getTime();
  this.metricas.tiempo_total_dias = Math.floor(tiempoTotal / (1000 * 60 * 60 * 24));
  this.metricas.tiempo_total_horas = Math.floor(tiempoTotal / (1000 * 60 * 60));
  
  // Calcular días abierto
  this.dias_abierto = this.metricas.tiempo_total_dias;
  
  // Verificar vencimiento
  if (this.fecha_limite) {
    this.esta_vencido = ahora > this.fecha_limite;
    this.metricas.cumplimiento_tiempo = !this.esta_vencido;
  }
  
  // Calcular progreso
  if (this.checklist && this.checklist.length > 0) {
    const completados = this.checklist.filter(item => item.completado).length;
    this.progreso = Math.round((completados / this.checklist.length) * 100);
  }
  
  // Calcular campos completados
  let camposCompletados = 0;
  let camposTotales = 0;
  
  this.datos.forEach((valor, campo) => {
    camposTotales++;
    if (valor !== null && valor !== undefined && valor !== '') {
      camposCompletados++;
    }
  });
  
  this.metricas.campos_completados = camposCompletados;
  this.metricas.campos_totales = camposTotales;
  
  if (camposTotales > 0) {
    this.metricas.porcentaje_completado = Math.round((camposCompletados / camposTotales) * 100);
  }
};

RegistroSchema.methods.notificar = async function(
  tipo: string, 
  destinatarios: Types.ObjectId[]
): Promise<void> {
  // Implementar lógica de notificación
  // Esto se conectaría con un servicio de notificaciones
  console.log(`Notificación tipo ${tipo} para ${destinatarios.length} destinatarios`);
};

RegistroSchema.methods.generarPDF = async function(): Promise<Buffer> {
  // Implementar generación de PDF
  // Esto usaría una librería como puppeteer o pdfkit
  return Buffer.from('PDF generado');
};

RegistroSchema.methods.clonar = async function(): Promise<IRegistro> {
  const Registro = mongoose.model('Registro');
  
  const nuevoRegistro = new Registro({
    ...this.toObject(),
    _id: undefined,
    codigo: `${this.codigo}-COPIA-${Date.now()}`,
    estado_actual: {
      ...this.estado_actual,
      fecha_entrada: new Date()
    },
    historial_estados: [],
    comentarios: [],
    actividad: [],
    metricas: {
      tiempo_total_dias: 0,
      tiempo_total_horas: 0,
      tiempo_por_estado: new Map(),
      veces_reenviado: 0,
      veces_rechazado: 0,
      cumplimiento_tiempo: true,
      porcentaje_completado: 0,
      campos_completados: 0,
      campos_totales: 0,
      eficiencia: 100
    },
    metadata: {
      ...this.metadata,
      fecha_creacion: new Date(),
      fecha_modificacion: undefined,
      modificado_por: undefined
    },
    version: 1,
    versiones_anteriores: []
  });
  
  return await nuevoRegistro.save();
};

RegistroSchema.methods.archivar = async function(): Promise<void> {
  this.metadata.eliminado = true;
  this.metadata.fecha_eliminacion = new Date();
  await this.save();
};

// Middleware
RegistroSchema.pre('save', function(next) {
  // Calcular métricas antes de guardar
  this.calcularMetricas();
  
  // Actualizar fecha de modificación
  if (this.isModified() && !this.isNew) {
    this.metadata.fecha_modificacion = new Date();
  }
  
  next();
});

// Virtual para obtener plantilla completa
RegistroSchema.virtual('plantilla', {
  ref: 'PlantillaRegistro',
  localField: 'plantilla_id',
  foreignField: '_id',
  justOne: true
});

// Modelo
const Registro = mongoose.model<IRegistro>('Registro', RegistroSchema);

export default Registro;