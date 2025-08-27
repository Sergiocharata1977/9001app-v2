import mongoose, { Schema, Document } from 'mongoose';
import { IDepartamento } from '../types/database.types';

export interface IDepartamentoDocument extends Omit<IDepartamento, '_id'>, Document {}

const DepartamentoSchema = new Schema<IDepartamentoDocument>({
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
    trim: true,
    maxlength: 1000
  },
  responsableId: {
    type: String
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  },
  jerarquia: {
    type: Number,
    default: 1,
    min: 1
  },
  color: {
    type: String,
    default: '#3b82f6',
    trim: true
  }
}, {
  timestamps: true,
  collection: 'departamentos'
});

// Índices para optimizar consultas
DepartamentoSchema.index({ organizacionId: 1 });
DepartamentoSchema.index({ organizacionId: 1, nombre: 1 }, { unique: true });
DepartamentoSchema.index({ estado: 1 });
DepartamentoSchema.index({ responsableId: 1 });
DepartamentoSchema.index({ jerarquia: 1 });

// Métodos estáticos
DepartamentoSchema.statics.findByOrganizacion = function(organizacionId: string) {
  return this.find({ organizacionId, estado: 'activo' })
    .populate('responsableId', 'nombre apellido email')
    .sort({ jerarquia: 1, nombre: 1 });
};

DepartamentoSchema.statics.findByResponsable = function(responsableId: string, organizacionId: string) {
  return this.find({ responsableId, organizacionId, estado: 'activo' });
};

DepartamentoSchema.statics.findByNombre = function(nombre: string, organizacionId: string) {
  return this.findOne({ nombre, organizacionId, estado: 'activo' });
};

// Métodos de instancia
DepartamentoSchema.methods.activar = function() {
  this.estado = 'activo';
  return this.save();
};

DepartamentoSchema.methods.desactivar = function() {
  this.estado = 'inactivo';
  return this.save();
};

DepartamentoSchema.methods.asignarResponsable = function(responsableId: string) {
  this.responsableId = responsableId;
  return this.save();
};

DepartamentoSchema.methods.cambiarJerarquia = function(nuevaJerarquia: number) {
  this.jerarquia = nuevaJerarquia;
  return this.save();
};

  // Middleware pre-save para validar jerarquía única
  DepartamentoSchema.pre('save', async function(this: any, next) {
    if (this.isModified('jerarquia') || this.isModified('organizacionId')) {
      const existingDept = await this.constructor.findOne({
        organizacionId: this.organizacionId,
        jerarquia: this.jerarquia,
        _id: { $ne: this._id }
      });
      
      if (existingDept) {
        throw new Error(`Ya existe un departamento con la jerarquía ${this.jerarquia} en esta organización`);
      }
    }
    next();
  });

export default mongoose.model<IDepartamentoDocument>('Departamento', DepartamentoSchema);