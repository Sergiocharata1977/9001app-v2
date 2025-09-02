import mongoose, { Document, Schema } from 'mongoose';

export interface IAudit extends Document {
  title: string;
  description?: string;
  type: 'internal' | 'external' | 'follow-up';
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  organizationId: string;
  auditorId: string;
  auditeeId?: string;
  startDate: Date;
  endDate?: Date;
  scope: string;
  objectives: string[];
  findings: {
    id: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    status: 'open' | 'in-progress' | 'closed';
    correctiveAction?: string;
    dueDate?: Date;
  }[];
  recommendations: string[];
  attachments: {
    filename: string;
    path: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AuditSchema = new Schema<IAudit>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    required: true,
    enum: ['internal', 'external', 'follow-up'],
    default: 'internal'
  },
  status: {
    type: String,
    required: true,
    enum: ['planned', 'in-progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  organizationId: {
    type: String,
    required: true,
    index: true
  },
  auditorId: {
    type: String,
    required: true,
    index: true
  },
  auditeeId: {
    type: String,
    index: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  scope: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  objectives: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  findings: [{
    id: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    status: {
      type: String,
      required: true,
      enum: ['open', 'in-progress', 'closed'],
      default: 'open'
    },
    correctiveAction: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    dueDate: {
      type: Date
    }
  }],
  recommendations: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  collection: 'audits'
});

// Índices para optimizar consultas
AuditSchema.index({ organizationId: 1, status: 1 });
AuditSchema.index({ auditorId: 1 });
AuditSchema.index({ startDate: 1 });
AuditSchema.index({ type: 1, status: 1 });

export default mongoose.model<IAudit>('Audit', AuditSchema);
