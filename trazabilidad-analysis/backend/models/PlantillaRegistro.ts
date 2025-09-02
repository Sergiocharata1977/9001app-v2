import mongoose, { Schema, Document, Types } from 'mongoose';

// Tipos de campos soportados
export enum TipoCampo {
  // BÁSICOS
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  DECIMAL = 'decimal',
  
  // FECHAS
  DATE = 'date',
  DATETIME = 'datetime',
  TIME = 'time',
  
  // SELECCIÓN
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  CHECKBOX_GROUP = 'checkbox_group',
  
  // ARCHIVOS
  FILE = 'file',
  FILES = 'files',
  IMAGE = 'image',
  
  // USUARIOS
  USER = 'user',
  USERS = 'users',
  
  // ESPECIALES
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url',
  COLOR = 'color',
  RATING = 'rating',
  SLIDER = 'slider',
  SWITCH = 'switch',
  
  // AVANZADOS
  FORMULA = 'formula',
  RELATION = 'relation',
  LOCATION = 'location',
  SIGNATURE = 'signature',
  BARCODE = 'barcode',
  QR = 'qr',
  
  // VISUALES
  SEPARATOR = 'separator',
  TITLE = 'title',
  HTML = 'html',
  PROGRESS = 'progress'
}

// Interfaces
interface IOpcionCampo {
  valor: string;
  etiqueta: string;
  color?: string;
}

interface IConfiguracionCampo {
  // Para select/multiselect
  opciones?: IOpcionCampo[];
  
  // Para number/decimal
  minimo?: number;
  maximo?: number;
  decimales?: number;
  
  // Para text/textarea
  minimo_caracteres?: number;
  maximo_caracteres?: number;
  patron_regex?: string;
  
  // Para date/datetime
  fecha_minima?: Date;
  fecha_maxima?: Date;
  
  // Para file/files/image
  tipos_permitidos?: string[];
  tamaño_maximo_mb?: number;
  multiples_archivos?: boolean;
  
  // Para formula
  formula?: string;
  campos_referencia?: string[];
  
  // Para relation
  coleccion_referencia?: string;
  campo_mostrar?: string;
  filtro_query?: any;
}

interface IValidacionCampo {
  tipo: 'regex' | 'rango' | 'unico' | 'dependiente' | 'custom';
  configuracion: any;
  mensaje_error: string;
}

interface IPermisosCampo {
  ver: string[];
  editar: string[];
  requerido_para: string[];
}

interface ICampo {
  id: string;
  codigo: string;
  etiqueta: string;
  descripcion?: string;
  tipo: TipoCampo;
  requerido: boolean;
  solo_lectura: boolean;
  visible_tarjeta: boolean;
  orden_tarjeta: number;
  orden_formulario: number;
  configuracion: IConfiguracionCampo;
  validaciones: IValidacionCampo[];
  permisos: IPermisosCampo;
  valor_default?: any;
  ayuda?: string;
  placeholder?: string;
  grupo?: string;
}

interface ICondicionTransicion {
  campo_id: string;
  operador: 'igual' | 'diferente' | 'mayor' | 'menor' | 'contiene' | 'no_contiene' | 'vacio' | 'no_vacio';
  valor?: any;
}

interface ITransicion {
  estado_destino_id: string;
  condiciones: ICondicionTransicion[];
  requiere_comentario: boolean;
  roles_permitidos: string[];
  mensaje_confirmacion?: string;
}

interface IAccionAutomatica {
  tipo: 'enviar_email' | 'asignar_usuario' | 'calcular_campo' | 'crear_tarea' | 'webhook';
  trigger: 'al_entrar' | 'al_salir' | 'al_vencer' | 'al_crear' | 'al_modificar';
  configuracion: any;
  activa: boolean;
}

interface IConfiguracionTiempo {
  dias_maximo?: number;
  dias_alerta?: number;
  excluir_fines_semana: boolean;
  excluir_feriados: boolean;
}

interface IEstado {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  color: string;
  icono?: string;
  es_inicial: boolean;
  es_final: boolean;
  campos: ICampo[];
  transiciones_permitidas: ITransicion[];
  acciones_automaticas: IAccionAutomatica[];
  tiempo: IConfiguracionTiempo;
  permisos: {
    puede_crear: string[];
    puede_editar: string[];
    puede_mover_desde: string[];
    puede_mover_hacia: string[];
  };
}

interface IConfiguracionVisual {
  icono: string;
  color_primario: string;
  color_secundario?: string;
  vista_default: 'kanban' | 'tabla' | 'calendario' | 'lista';
  mostrar_progreso: boolean;
  mostrar_tiempo: boolean;
  mostrar_responsable: boolean;
}

interface IConfiguracionNumeracion {
  activa: boolean;
  prefijo: string;
  sufijo?: string;
  longitud_numero: number;
  reiniciar_anual: boolean;
  reiniciar_mensual: boolean;
  ultimo_numero?: number;
  formato?: string;
}

interface IConfiguracionVersionado {
  activo: boolean;
  guardar_borradores: boolean;
  requiere_aprobacion: boolean;
  maximo_versiones?: number;
}

interface IConfiguracionNotificaciones {
  al_crear: boolean;
  al_cambiar_estado: boolean;
  al_vencer: boolean;
  al_comentar: boolean;
  al_asignar: boolean;
  destinatarios_default: string[];
  canal_default: 'email' | 'sistema' | 'ambos';
}

interface IConfiguracionIntegraciones {
  webhook_url?: string;
  eventos: string[];
  api_key?: string;
  headers_custom?: any;
}

interface IConfiguracionAvanzada {
  numeracion_automatica: IConfiguracionNumeracion;
  versionado: IConfiguracionVersionado;
  notificaciones: IConfiguracionNotificaciones;
  integraciones: IConfiguracionIntegraciones;
  permitir_comentarios: boolean;
  permitir_archivos_adjuntos: boolean;
  permitir_checklist: boolean;
  permitir_etiquetas: boolean;
  requerir_firma_digital: boolean;
  habilitar_recordatorios: boolean;
}

interface IPermisos {
  crear: string[];
  ver: string[];
  editar: string[];
  eliminar: string[];
  editar_plantilla: string[];
  exportar: string[];
  importar: string[];
}

interface ICambioHistorial {
  fecha: Date;
  usuario: Types.ObjectId;
  tipo_cambio: string;
  descripcion: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
}

interface IAuditoria {
  creado_por: Types.ObjectId;
  fecha_creacion: Date;
  modificado_por?: Types.ObjectId;
  fecha_modificacion?: Date;
  version: number;
  cambios_historial: ICambioHistorial[];
}

// Documento principal
export interface IPlantillaRegistro extends Document {
  codigo: string;
  nombre: string;
  descripcion?: string;
  organizacion_id: Types.ObjectId;
  activo: boolean;
  
  // Categorización
  categoria?: string;
  modulo?: string;
  tags?: string[];
  
  // Configuración
  configuracion_visual: IConfiguracionVisual;
  estados: IEstado[];
  configuracion_avanzada: IConfiguracionAvanzada;
  permisos: IPermisos;
  
  // Estadísticas de uso
  estadisticas?: {
    registros_creados: number;
    ultimo_uso: Date;
    usuarios_activos: number;
  };
  
  // Auditoría
  auditoria: IAuditoria;
  
  // Soft delete
  eliminado: boolean;
  fecha_eliminacion?: Date;
  eliminado_por?: Types.ObjectId;
  
  // Métodos
  generarCodigo(): Promise<string>;
  validarTransicion(estadoOrigen: string, estadoDestino: string, datos: any): boolean;
  obtenerCamposEstado(estadoId: string): ICampo[];
  clonar(): Promise<IPlantillaRegistro>;
}

// Schema
const PlantillaRegistroSchema = new Schema<IPlantillaRegistro>({
  codigo: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  nombre: { 
    type: String, 
    required: true 
  },
  descripcion: String,
  organizacion_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization',
    required: true,
    index: true 
  },
  activo: { 
    type: Boolean, 
    default: true 
  },
  
  // Categorización
  categoria: String,
  modulo: String,
  tags: [String],
  
  // Configuración visual
  configuracion_visual: {
    icono: { type: String, default: 'document' },
    color_primario: { type: String, default: '#3B82F6' },
    color_secundario: String,
    vista_default: { 
      type: String, 
      enum: ['kanban', 'tabla', 'calendario', 'lista'],
      default: 'kanban' 
    },
    mostrar_progreso: { type: Boolean, default: true },
    mostrar_tiempo: { type: Boolean, default: true },
    mostrar_responsable: { type: Boolean, default: true }
  },
  
  // Estados
  estados: [{
    id: { type: String, required: true },
    codigo: { type: String, required: true },
    nombre: { type: String, required: true },
    descripcion: String,
    orden: { type: Number, required: true },
    color: { type: String, required: true },
    icono: String,
    es_inicial: { type: Boolean, default: false },
    es_final: { type: Boolean, default: false },
    
    // Campos del estado
    campos: [{
      id: { type: String, required: true },
      codigo: { type: String, required: true },
      etiqueta: { type: String, required: true },
      descripcion: String,
      tipo: { 
        type: String, 
        enum: Object.values(TipoCampo),
        required: true 
      },
      requerido: { type: Boolean, default: false },
      solo_lectura: { type: Boolean, default: false },
      visible_tarjeta: { type: Boolean, default: false },
      orden_tarjeta: { type: Number, default: 0 },
      orden_formulario: { type: Number, default: 0 },
      
      configuracion: {
        opciones: [{
          valor: String,
          etiqueta: String,
          color: String
        }],
        minimo: Number,
        maximo: Number,
        decimales: Number,
        minimo_caracteres: Number,
        maximo_caracteres: Number,
        patron_regex: String,
        fecha_minima: Date,
        fecha_maxima: Date,
        tipos_permitidos: [String],
        tamaño_maximo_mb: Number,
        multiples_archivos: Boolean,
        formula: String,
        campos_referencia: [String],
        coleccion_referencia: String,
        campo_mostrar: String,
        filtro_query: Schema.Types.Mixed
      },
      
      validaciones: [{
        tipo: { 
          type: String,
          enum: ['regex', 'rango', 'unico', 'dependiente', 'custom']
        },
        configuracion: Schema.Types.Mixed,
        mensaje_error: String
      }],
      
      permisos: {
        ver: [String],
        editar: [String],
        requerido_para: [String]
      },
      
      valor_default: Schema.Types.Mixed,
      ayuda: String,
      placeholder: String,
      grupo: String
    }],
    
    // Transiciones
    transiciones_permitidas: [{
      estado_destino_id: String,
      condiciones: [{
        campo_id: String,
        operador: { 
          type: String,
          enum: ['igual', 'diferente', 'mayor', 'menor', 'contiene', 'no_contiene', 'vacio', 'no_vacio']
        },
        valor: Schema.Types.Mixed
      }],
      requiere_comentario: { type: Boolean, default: false },
      roles_permitidos: [String],
      mensaje_confirmacion: String
    }],
    
    // Acciones automáticas
    acciones_automaticas: [{
      tipo: { 
        type: String,
        enum: ['enviar_email', 'asignar_usuario', 'calcular_campo', 'crear_tarea', 'webhook']
      },
      trigger: { 
        type: String,
        enum: ['al_entrar', 'al_salir', 'al_vencer', 'al_crear', 'al_modificar']
      },
      configuracion: Schema.Types.Mixed,
      activa: { type: Boolean, default: true }
    }],
    
    // Configuración de tiempo
    tiempo: {
      dias_maximo: Number,
      dias_alerta: Number,
      excluir_fines_semana: { type: Boolean, default: false },
      excluir_feriados: { type: Boolean, default: false }
    },
    
    // Permisos del estado
    permisos: {
      puede_crear: [String],
      puede_editar: [String],
      puede_mover_desde: [String],
      puede_mover_hacia: [String]
    }
  }],
  
  // Configuración avanzada
  configuracion_avanzada: {
    numeracion_automatica: {
      activa: { type: Boolean, default: true },
      prefijo: String,
      sufijo: String,
      longitud_numero: { type: Number, default: 4 },
      reiniciar_anual: { type: Boolean, default: false },
      reiniciar_mensual: { type: Boolean, default: false },
      ultimo_numero: { type: Number, default: 0 },
      formato: String
    },
    versionado: {
      activo: { type: Boolean, default: false },
      guardar_borradores: { type: Boolean, default: false },
      requiere_aprobacion: { type: Boolean, default: false },
      maximo_versiones: Number
    },
    notificaciones: {
      al_crear: { type: Boolean, default: true },
      al_cambiar_estado: { type: Boolean, default: true },
      al_vencer: { type: Boolean, default: true },
      al_comentar: { type: Boolean, default: false },
      al_asignar: { type: Boolean, default: true },
      destinatarios_default: [String],
      canal_default: { 
        type: String,
        enum: ['email', 'sistema', 'ambos'],
        default: 'sistema'
      }
    },
    integraciones: {
      webhook_url: String,
      eventos: [String],
      api_key: String,
      headers_custom: Schema.Types.Mixed
    },
    permitir_comentarios: { type: Boolean, default: true },
    permitir_archivos_adjuntos: { type: Boolean, default: true },
    permitir_checklist: { type: Boolean, default: true },
    permitir_etiquetas: { type: Boolean, default: true },
    requerir_firma_digital: { type: Boolean, default: false },
    habilitar_recordatorios: { type: Boolean, default: true }
  },
  
  // Permisos
  permisos: {
    crear: [String],
    ver: [String],
    editar: [String],
    eliminar: [String],
    editar_plantilla: [String],
    exportar: [String],
    importar: [String]
  },
  
  // Estadísticas
  estadisticas: {
    registros_creados: { type: Number, default: 0 },
    ultimo_uso: Date,
    usuarios_activos: { type: Number, default: 0 }
  },
  
  // Auditoría
  auditoria: {
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
    version: { type: Number, default: 1 },
    cambios_historial: [{
      fecha: { type: Date, default: Date.now },
      usuario: { type: Schema.Types.ObjectId, ref: 'User' },
      tipo_cambio: String,
      descripcion: String,
      datos_anteriores: Schema.Types.Mixed,
      datos_nuevos: Schema.Types.Mixed
    }]
  },
  
  // Soft delete
  eliminado: { type: Boolean, default: false },
  fecha_eliminacion: Date,
  eliminado_por: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  collection: 'plantillas_registro'
});

// Índices
PlantillaRegistroSchema.index({ organizacion_id: 1, activo: 1 });
PlantillaRegistroSchema.index({ organizacion_id: 1, codigo: 1 }, { unique: true });
PlantillaRegistroSchema.index({ 'estados.id': 1 });
PlantillaRegistroSchema.index({ 'estados.campos.id': 1 });
PlantillaRegistroSchema.index({ tags: 1 });
PlantillaRegistroSchema.index({ categoria: 1, modulo: 1 });
PlantillaRegistroSchema.index({ eliminado: 1 });

// Métodos
PlantillaRegistroSchema.methods.generarCodigo = async function(): Promise<string> {
  const config = this.configuracion_avanzada.numeracion_automatica;
  
  if (!config.activa) {
    throw new Error('Numeración automática no está activa');
  }
  
  // Incrementar contador
  const PlantillaRegistro = mongoose.model('PlantillaRegistro');
  const plantilla = await PlantillaRegistro.findByIdAndUpdate(
    this._id,
    { $inc: { 'configuracion_avanzada.numeracion_automatica.ultimo_numero': 1 } },
    { new: true }
  );
  
  const numero = plantilla.configuracion_avanzada.numeracion_automatica.ultimo_numero;
  const numeroFormateado = numero.toString().padStart(config.longitud_numero, '0');
  
  // Construir código
  let codigo = config.prefijo || '';
  
  if (config.reiniciar_anual) {
    codigo += new Date().getFullYear() + '-';
  }
  
  if (config.reiniciar_mensual) {
    codigo += (new Date().getMonth() + 1).toString().padStart(2, '0') + '-';
  }
  
  codigo += numeroFormateado;
  
  if (config.sufijo) {
    codigo += config.sufijo;
  }
  
  return codigo;
};

PlantillaRegistroSchema.methods.validarTransicion = function(
  estadoOrigen: string, 
  estadoDestino: string, 
  datos: any
): boolean {
  const estado = this.estados.find((e: IEstado) => e.id === estadoOrigen);
  
  if (!estado) {
    return false;
  }
  
  const transicion = estado.transiciones_permitidas.find(
    (t: ITransicion) => t.estado_destino_id === estadoDestino
  );
  
  if (!transicion) {
    return false;
  }
  
  // Validar condiciones
  for (const condicion of transicion.condiciones) {
    const valor = datos[condicion.campo_id];
    
    switch (condicion.operador) {
      case 'igual':
        if (valor !== condicion.valor) return false;
        break;
      case 'diferente':
        if (valor === condicion.valor) return false;
        break;
      case 'mayor':
        if (valor <= condicion.valor) return false;
        break;
      case 'menor':
        if (valor >= condicion.valor) return false;
        break;
      case 'contiene':
        if (!valor || !valor.includes(condicion.valor)) return false;
        break;
      case 'no_contiene':
        if (valor && valor.includes(condicion.valor)) return false;
        break;
      case 'vacio':
        if (valor !== null && valor !== undefined && valor !== '') return false;
        break;
      case 'no_vacio':
        if (valor === null || valor === undefined || valor === '') return false;
        break;
    }
  }
  
  return true;
};

PlantillaRegistroSchema.methods.obtenerCamposEstado = function(estadoId: string): ICampo[] {
  const estado = this.estados.find((e: IEstado) => e.id === estadoId);
  return estado ? estado.campos : [];
};

PlantillaRegistroSchema.methods.clonar = async function(): Promise<IPlantillaRegistro> {
  const PlantillaRegistro = mongoose.model('PlantillaRegistro');
  
  const nuevaPlantilla = new PlantillaRegistro({
    ...this.toObject(),
    _id: undefined,
    codigo: `${this.codigo}-COPIA-${Date.now()}`,
    nombre: `${this.nombre} (Copia)`,
    estadisticas: {
      registros_creados: 0,
      ultimo_uso: null,
      usuarios_activos: 0
    },
    auditoria: {
      creado_por: this.auditoria.modificado_por || this.auditoria.creado_por,
      fecha_creacion: new Date(),
      version: 1,
      cambios_historial: []
    }
  });
  
  return await nuevaPlantilla.save();
};

// Middleware
PlantillaRegistroSchema.pre('save', function(next) {
  // Asegurar que hay al menos un estado inicial
  const tieneInicial = this.estados.some(e => e.es_inicial);
  if (!tieneInicial && this.estados.length > 0) {
    this.estados[0].es_inicial = true;
  }
  
  // Ordenar campos por orden_formulario
  this.estados.forEach(estado => {
    estado.campos.sort((a, b) => a.orden_formulario - b.orden_formulario);
  });
  
  // Ordenar estados por orden
  this.estados.sort((a, b) => a.orden - b.orden);
  
  next();
});

// Modelo
const PlantillaRegistro = mongoose.model<IPlantillaRegistro>('PlantillaRegistro', PlantillaRegistroSchema);

export default PlantillaRegistro;