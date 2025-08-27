import mongoose, { Schema, Document } from 'mongoose';
import { IProceso } from '../types/database.types';

export interface IProcesoDocument extends Omit<IProceso, '_id'>, Document {}

const ProcesoSchema = new Schema<IProcesoDocument>({
  organizacionId: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  codigo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  departamentoId: {
    type: String,
    required: true
  },
  responsableId: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['principal', 'soporte', 'gestión'],
    required: true
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo', 'en_revision'],
    default: 'activo'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  version: {
    type: String,
    default: '1.0',
    trim: true
  },
  entrada: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
  salida: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
  recursos: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
  riesgos: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
  indicadores: [{
    type: String
  }],
  documentos: [{
    type: String
  }]
}, {
  timestamps: true,
  collection: 'procesos'
});

// Índices para optimizar consultas
ProcesoSchema.index({ organizacionId: 1 });
ProcesoSchema.index({ organizacionId: 1, codigo: 1 }, { unique: true });
ProcesoSchema.index({ departamentoId: 1 });
ProcesoSchema.index({ responsableId: 1 });
ProcesoSchema.index({ tipo: 1 });
ProcesoSchema.index({ estado: 1 });

// Métodos estáticos
ProcesoSchema.statics.findByOrganizacion = function(organizacionId: string) {
  return this.find({ organizacionId, estado: 'activo' })
    .populate('departamentoId', 'nombre')
    .populate('responsableId', 'nombre apellido')
    .sort({ nombre: 1 });
};

ProcesoSchema.statics.findByDepartamento = function(departamentoId: string, organizacionId: string) {
  return this.find({ departamentoId, organizacionId, estado: 'activo' })
    .populate('responsableId', 'nombre apellido')
    .sort({ nombre: 1 });
};

ProcesoSchema.statics.findByTipo = function(tipo: string, organizacionId: string) {
  return this.find({ tipo, organizacionId, estado: 'activo' })
    .populate('departamentoId', 'nombre')
    .populate('responsableId', 'nombre apellido')
    .sort({ nombre: 1 });
};

ProcesoSchema.statics.findByCodigo = function(codigo: string, organizacionId: string) {
  return this.findOne({ codigo, organizacionId, estado: 'activo' });
};

// Métodos de instancia
ProcesoSchema.methods.activar = function() {
  this.estado = 'activo';
  this.fechaActualizacion = new Date();
  return this.save();
};

ProcesoSchema.methods.desactivar = function() {
  this.estado = 'inactivo';
  this.fechaActualizacion = new Date();
  return this.save();
};

ProcesoSchema.methods.enviarRevision = function() {
  this.estado = 'en_revision';
  this.fechaActualizacion = new Date();
  return this.save();
};

ProcesoSchema.methods.nuevaVersion = function() {
  const versionParts = this.version.split('.');
  const major = parseInt(versionParts[0]);
  const minor = parseInt(versionParts[1]) + 1;
  this.version = `${major}.${minor}`;
  this.fechaActualizacion = new Date();
  return this.save();
};

ProcesoSchema.methods.agregarIndicador = function(indicadorId: string) {
  if (!this.indicadores.includes(indicadorId)) {
    this.indicadores.push(indicadorId);
  }
  return this.save();
};

  ProcesoSchema.methods.removerIndicador = function(indicadorId: string) {
    this.indicadores = this.indicadores.filter((id: string) => id.toString() !== indicadorId);
    return this.save();
  };

ProcesoSchema.methods.agregarDocumento = function(documentoId: string) {
  if (!this.documentos.includes(documentoId)) {
    this.documentos.push(documentoId);
  }
  return this.save();
};

  ProcesoSchema.methods.removerDocumento = function(documentoId: string) {
    this.documentos = this.documentos.filter((id: string) => id.toString() !== documentoId);
    return this.save();
  };

  // Virtual para obtener el nombre completo del proceso
  ProcesoSchema.virtual('nombreCompleto').get(function(this: any) {
    return `${this.codigo} - ${this.nombre}`;
  });

// Configurar virtuals en JSON
ProcesoSchema.set('toJSON', { virtuals: true });

  // Middleware pre-save
  ProcesoSchema.pre('save', function(this: any, next) {
    if (this.isModified()) {
      this.fechaActualizacion = new Date();
    }
    next();
  });

export default mongoose.model<IProcesoDocument>('Proceso', ProcesoSchema);