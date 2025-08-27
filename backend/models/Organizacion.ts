import mongoose, { Schema, Document } from 'mongoose';
import { IOrganizacion } from '../types/database.types';

export interface IOrganizacionDocument extends Omit<IOrganizacion, '_id'>, Document {}

const OrganizacionSchema = new Schema<IOrganizacionDocument>({
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  ruc: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 20
  },
  direccion: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  telefono: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  representante: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
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
  plan: {
    type: String,
    enum: ['basico', 'premium', 'enterprise'],
    default: 'basico'
  },
  configuracion: {
    logo: {
      type: String,
      trim: true
    },
    colores: {
      primario: {
        type: String,
        default: '#2563eb'
      },
      secundario: {
        type: String,
        default: '#64748b'
      }
    },
    modulos: [{
      type: String,
      enum: [
        'usuarios',
        'procesos',
        'documentos',
        'auditorias',
        'hallazgos',
        'acciones',
        'indicadores',
        'mediciones',
        'capacitaciones',
        'evaluaciones',
        'productos',
        'encuestas',
        'minutas'
      ]
    }]
  }
}, {
  timestamps: true,
  collection: 'organizaciones'
});

// Índices para optimizar consultas
OrganizacionSchema.index({ ruc: 1 }, { unique: true });
OrganizacionSchema.index({ email: 1 });
OrganizacionSchema.index({ estado: 1 });
OrganizacionSchema.index({ plan: 1 });

// Métodos estáticos
OrganizacionSchema.statics.findByRUC = function(ruc: string) {
  return this.findOne({ ruc, estado: 'activo' });
};

OrganizacionSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email, estado: 'activo' });
};

// Métodos de instancia
OrganizacionSchema.methods.activar = function() {
  this.estado = 'activo';
  return this.save();
};

OrganizacionSchema.methods.desactivar = function() {
  this.estado = 'inactivo';
  return this.save();
};

OrganizacionSchema.methods.cambiarPlan = function(nuevoPlan: 'basico' | 'premium' | 'enterprise') {
  this.plan = nuevoPlan;
  return this.save();
};

// Middleware pre-save
OrganizacionSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

export default mongoose.model<IOrganizacionDocument>('Organizacion', OrganizacionSchema);