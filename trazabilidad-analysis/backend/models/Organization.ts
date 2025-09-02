import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  settings: {
    timezone: string;
    language: string;
    currency: string;
    dateFormat: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  address: {
    type: String,
    trim: true,
    maxlength: 200
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  website: {
    type: String,
    trim: true,
    maxlength: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    timezone: {
      type: String,
      default: 'America/Argentina/Buenos_Aires'
    },
    language: {
      type: String,
      default: 'es'
    },
    currency: {
      type: String,
      default: 'ARS'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    }
  }
}, {
  timestamps: true,
  collection: 'organizations'
});

// Índices
OrganizationSchema.index({ name: 1 });
OrganizationSchema.index({ isActive: 1 });

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);
