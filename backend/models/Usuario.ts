import mongoose, { Schema, Document } from 'mongoose';
import { IUsuario } from '../types/database.types';

export interface IUsuarioDocument extends Omit<IUsuario, '_id'>, Document {}

const UsuarioSchema = new Schema<IUsuarioDocument>({
  organizacionId: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  apellido: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  rol: {
    type: String,
    enum: ['admin', 'supervisor', 'usuario', 'auditor'],
    default: 'usuario'
  },
  departamentoId: {
    type: String
  },
  puesto: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  telefono: {
    type: String,
    trim: true,
    maxlength: 20
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  ultimoAcceso: {
    type: Date
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo', 'bloqueado'],
    default: 'activo'
  },
  permisos: [{
    type: String,
    enum: [
      'usuarios.crear',
      'usuarios.editar',
      'usuarios.eliminar',
      'usuarios.ver',
      'procesos.crear',
      'procesos.editar',
      'procesos.eliminar',
      'procesos.ver',
      'documentos.crear',
      'documentos.editar',
      'documentos.eliminar',
      'documentos.ver',
      'auditorias.crear',
      'auditorias.editar',
      'auditorias.eliminar',
      'auditorias.ver',
      'hallazgos.crear',
      'hallazgos.editar',
      'hallazgos.eliminar',
      'hallazgos.ver',
      'acciones.crear',
      'acciones.editar',
      'acciones.eliminar',
      'acciones.ver',
      'indicadores.crear',
      'indicadores.editar',
      'indicadores.eliminar',
      'indicadores.ver',
      'mediciones.crear',
      'mediciones.editar',
      'mediciones.eliminar',
      'mediciones.ver',
      'capacitaciones.crear',
      'capacitaciones.editar',
      'capacitaciones.eliminar',
      'capacitaciones.ver',
      'evaluaciones.crear',
      'evaluaciones.editar',
      'evaluaciones.eliminar',
      'evaluaciones.ver',
      'productos.crear',
      'productos.editar',
      'productos.eliminar',
      'productos.ver',
      'encuestas.crear',
      'encuestas.editar',
      'encuestas.eliminar',
      'encuestas.ver',
      'minutas.crear',
      'minutas.editar',
      'minutas.eliminar',
      'minutas.ver',
      'reportes.ver',
      'configuracion.editar'
    ]
  }],
  avatar: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'usuarios'
});

// Índices para optimizar consultas
UsuarioSchema.index({ organizacionId: 1 });
UsuarioSchema.index({ email: 1 });
UsuarioSchema.index({ organizacionId: 1, email: 1 }, { unique: true });
UsuarioSchema.index({ rol: 1 });
UsuarioSchema.index({ estado: 1 });
UsuarioSchema.index({ departamentoId: 1 });

// Métodos estáticos
UsuarioSchema.statics.findByEmail = function(email: string, organizacionId: string) {
  return this.findOne({ email, organizacionId, estado: 'activo' });
};

UsuarioSchema.statics.findByOrganizacion = function(organizacionId: string) {
  return this.find({ organizacionId, estado: 'activo' }).populate('departamentoId');
};

UsuarioSchema.statics.findByRol = function(rol: string, organizacionId: string) {
  return this.find({ rol, organizacionId, estado: 'activo' });
};

// Métodos de instancia
UsuarioSchema.methods.activar = function() {
  this.estado = 'activo';
  return this.save();
};

UsuarioSchema.methods.desactivar = function() {
  this.estado = 'inactivo';
  return this.save();
};

UsuarioSchema.methods.bloquear = function() {
  this.estado = 'bloqueado';
  return this.save();
};

UsuarioSchema.methods.actualizarUltimoAcceso = function() {
  this.ultimoAcceso = new Date();
  return this.save();
};

UsuarioSchema.methods.agregarPermiso = function(permiso: string) {
  if (!this.permisos.includes(permiso)) {
    this.permisos.push(permiso);
  }
  return this.save();
};

  UsuarioSchema.methods.removerPermiso = function(permiso: string) {
    this.permisos = this.permisos.filter((p: string) => p !== permiso);
    return this.save();
  };

UsuarioSchema.methods.tienePermiso = function(permiso: string): boolean {
  return this.permisos.includes(permiso);
};

  // Virtual para nombre completo
  UsuarioSchema.virtual('nombreCompleto').get(function(this: any) {
    return `${this.nombre} ${this.apellido}`;
  });

// Configurar virtuals en JSON
UsuarioSchema.set('toJSON', { virtuals: true });

  // Middleware pre-save
  UsuarioSchema.pre('save', function(this: any, next) {
    if (this.isModified('email')) {
      this.email = this.email.toLowerCase();
    }
    next();
  });

export default mongoose.model<IUsuarioDocument>('Usuario', UsuarioSchema);