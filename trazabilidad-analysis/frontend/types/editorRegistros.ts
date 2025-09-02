// Tipos para el Editor de Registros Dinámicos

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

export interface IOpcionCampo {
  valor: string;
  etiqueta: string;
  color?: string;
}

export interface IConfiguracionCampo {
  opciones?: IOpcionCampo[];
  minimo?: number;
  maximo?: number;
  decimales?: number;
  minimo_caracteres?: number;
  maximo_caracteres?: number;
  patron_regex?: string;
  fecha_minima?: Date;
  fecha_maxima?: Date;
  tipos_permitidos?: string[];
  tamaño_maximo_mb?: number;
  multiples_archivos?: boolean;
  formula?: string;
  campos_referencia?: string[];
  coleccion_referencia?: string;
  campo_mostrar?: string;
  filtro_query?: any;
}

export interface IValidacionCampo {
  tipo: 'regex' | 'rango' | 'unico' | 'dependiente' | 'custom';
  configuracion: any;
  mensaje_error: string;
}

export interface IPermisosCampo {
  ver: string[];
  editar: string[];
  requerido_para: string[];
}

export interface ICampo {
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

export interface ICondicionTransicion {
  campo_id: string;
  operador: 'igual' | 'diferente' | 'mayor' | 'menor' | 'contiene' | 'no_contiene' | 'vacio' | 'no_vacio';
  valor?: any;
}

export interface ITransicion {
  estado_destino_id: string;
  condiciones: ICondicionTransicion[];
  requiere_comentario: boolean;
  roles_permitidos: string[];
  mensaje_confirmacion?: string;
}

export interface IAccionAutomatica {
  tipo: 'enviar_email' | 'asignar_usuario' | 'calcular_campo' | 'crear_tarea' | 'webhook';
  trigger: 'al_entrar' | 'al_salir' | 'al_vencer' | 'al_crear' | 'al_modificar';
  configuracion: any;
  activa: boolean;
}

export interface IConfiguracionTiempo {
  dias_maximo?: number;
  dias_alerta?: number;
  excluir_fines_semana: boolean;
  excluir_feriados: boolean;
}

export interface IEstado {
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

export interface IConfiguracionVisual {
  icono: string;
  color_primario: string;
  color_secundario?: string;
  vista_default: 'kanban' | 'tabla' | 'calendario' | 'lista';
  mostrar_progreso: boolean;
  mostrar_tiempo: boolean;
  mostrar_responsable: boolean;
}

export interface IConfiguracionNumeracion {
  activa: boolean;
  prefijo: string;
  sufijo?: string;
  longitud_numero: number;
  reiniciar_anual: boolean;
  reiniciar_mensual: boolean;
  ultimo_numero?: number;
  formato?: string;
}

export interface IConfiguracionVersionado {
  activo: boolean;
  guardar_borradores: boolean;
  requiere_aprobacion: boolean;
  maximo_versiones?: number;
}

export interface IConfiguracionNotificaciones {
  al_crear: boolean;
  al_cambiar_estado: boolean;
  al_vencer: boolean;
  al_comentar: boolean;
  al_asignar: boolean;
  destinatarios_default: string[];
  canal_default: 'email' | 'sistema' | 'ambos';
}

export interface IConfiguracionIntegraciones {
  webhook_url?: string;
  eventos: string[];
  api_key?: string;
  headers_custom?: any;
}

export interface IConfiguracionAvanzada {
  numeracion_automatica: IConfiguracionNumeracion;
  versionado?: IConfiguracionVersionado;
  notificaciones?: IConfiguracionNotificaciones;
  integraciones?: IConfiguracionIntegraciones;
  permitir_comentarios: boolean;
  permitir_archivos_adjuntos: boolean;
  permitir_checklist: boolean;
  permitir_etiquetas: boolean;
  requerir_firma_digital?: boolean;
  habilitar_recordatorios?: boolean;
}

export interface IPermisos {
  crear: string[];
  ver: string[];
  editar: string[];
  eliminar: string[];
  editar_plantilla?: string[];
  exportar?: string[];
  importar?: string[];
}

export interface ICambioHistorial {
  fecha: Date;
  usuario: string;
  tipo_cambio: string;
  descripcion: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
}

export interface IAuditoria {
  creado_por: string;
  fecha_creacion: Date;
  modificado_por?: string;
  fecha_modificacion?: Date;
  version: number;
  cambios_historial: ICambioHistorial[];
}

export interface IPlantillaRegistro {
  _id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  organizacion_id: string;
  activo: boolean;
  categoria?: string;
  modulo?: string;
  tags?: string[];
  configuracion_visual: IConfiguracionVisual;
  estados: IEstado[];
  configuracion_avanzada: IConfiguracionAvanzada;
  permisos: IPermisos;
  estadisticas?: {
    registros_creados: number;
    ultimo_uso: Date;
    usuarios_activos: number;
  };
  auditoria: IAuditoria;
  eliminado: boolean;
  fecha_eliminacion?: Date;
  eliminado_por?: string;
}

// Tipos para Registros

export interface IEstadoActual {
  id: string;
  nombre: string;
  color: string;
  fecha_entrada: Date;
  usuario_cambio: string;
}

export interface IArchivo {
  campo_id: string;
  nombre: string;
  nombre_original: string;
  url: string;
  tipo: string;
  tamaño: number;
  fecha_carga: Date;
  usuario_carga: string;
  descripcion?: string;
}

export interface IHistorialEstado {
  estado_id: string;
  estado_nombre: string;
  estado_color: string;
  fecha_entrada: Date;
  fecha_salida?: Date;
  duracion_dias?: number;
  duracion_horas?: number;
  usuario_cambio: string;
  comentario?: string;
  datos_snapshot: any;
  archivos_adjuntos?: string[];
}

export interface IComentario {
  id: string;
  texto: string;
  usuario: string;
  fecha: Date;
  editado: boolean;
  fecha_edicion?: Date;
  archivos: string[];
  menciones: string[];
  reacciones?: {
    tipo: string;
    usuarios: string[];
  }[];
  respuesta_a?: string;
}

export interface IActividad {
  tipo: 'creacion' | 'cambio_estado' | 'edicion' | 'comentario' | 'archivo' | 'asignacion' | 'vencimiento';
  descripcion: string;
  usuario: string;
  fecha: Date;
  detalles: any;
  ip_address?: string;
  user_agent?: string;
}

export interface IChecklistItem {
  id: string;
  texto: string;
  completado: boolean;
  usuario_completo?: string;
  fecha_completo?: Date;
  orden: number;
  obligatorio: boolean;
}

export interface IEtiqueta {
  nombre: string;
  color: string;
  icono?: string;
}

export interface IMetricas {
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

export interface INotificacion {
  tipo: string;
  fecha_programada: Date;
  enviada: boolean;
  fecha_envio?: Date;
  destinatarios: string[];
  canal: 'email' | 'sistema' | 'sms';
  contenido?: string;
}

export interface IRelacion {
  tipo: 'padre' | 'hijo' | 'relacionado' | 'duplicado' | 'bloquea' | 'bloqueado_por';
  registro_id: string;
  codigo_registro: string;
  descripcion?: string;
}

export interface ITrazabilidad {
  codigo: string;
  vinculado: boolean;
  fecha_vinculacion?: Date;
  tipo_origen?: string;
}

export interface IFirmaDigital {
  campo_id: string;
  firmante: string;
  fecha_firma: Date;
  hash_documento: string;
  certificado?: string;
  imagen_firma?: string;
  ip_address: string;
  valida: boolean;
}

export interface IRegistro {
  _id: string;
  codigo: string;
  plantilla_id: string;
  organizacion_id: string;
  estado_actual: IEstadoActual;
  datos: Record<string, any>;
  archivos: IArchivo[];
  historial_estados: IHistorialEstado[];
  comentarios: IComentario[];
  actividad: IActividad[];
  checklist: IChecklistItem[];
  etiquetas: IEtiqueta[];
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  responsable_principal?: string;
  responsables_secundarios: string[];
  observadores: string[];
  departamento?: string;
  area?: string;
  fecha_limite?: Date;
  fecha_inicio?: Date;
  fecha_completado?: Date;
  fecha_ultimo_cambio?: Date;
  metricas: IMetricas;
  notificaciones_programadas: INotificacion[];
  relaciones: IRelacion[];
  trazabilidad?: ITrazabilidad;
  firmas: IFirmaDigital[];
  version: number;
  es_borrador: boolean;
  version_publicada?: number;
  versiones_anteriores: string[];
  bloqueado: boolean;
  bloqueado_por?: string;
  fecha_bloqueo?: Date;
  motivo_bloqueo?: string;
  metadata: {
    creado_por: string;
    fecha_creacion: Date;
    modificado_por?: string;
    fecha_modificacion?: Date;
    eliminado: boolean;
    fecha_eliminacion?: Date;
    eliminado_por?: string;
    ip_creacion?: string;
    dispositivo?: string;
    navegador?: string;
  };
  progreso: number;
  dias_abierto: number;
  esta_vencido: boolean;
}