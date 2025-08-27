const { Schema, model } = require('mongoose');

const agentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['coordinator', 'database', 'frontend', 'tester', 'documenter', 'deployer', 'rehabilitator'],
    required: true
  },
  organization_id: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  apiKey: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'maintenance'],
    default: 'active'
  },
  capabilities: [{
    type: String,
    enum: [
      'database_operations',
      'user_management',
      'process_management',
      'audit_management',
      'document_management',
      'report_generation',
      'system_monitoring',
      'backup_operations',
      'security_management',
      'api_management'
    ]
  }],
  permissions: [{
    resource: {
      type: String,
      enum: ['users', 'processes', 'audits', 'documents', 'reports', 'system', 'all']
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'execute']
    }]
  }],
  config: {
    rateLimit: {
      requests: {
        type: Number,
        default: 100
      },
      window: {
        type: Number,
        default: 900000 // 15 minutos
      }
    },
    timeout: {
      type: Number,
      default: 30000 // 30 segundos
    },
    retryAttempts: {
      type: Number,
      default: 3
    }
  },
  metrics: {
    totalRequests: {
      type: Number,
      default: 0
    },
    successfulRequests: {
      type: Number,
      default: 0
    },
    failedRequests: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    lastActivity: Date
  },
  health: {
    status: {
      type: String,
      enum: ['healthy', 'warning', 'critical'],
      default: 'healthy'
    },
    lastCheck: Date,
    uptime: {
      type: Number,
      default: 0
    },
    memoryUsage: Number,
    cpuUsage: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
agentSchema.index({ name: 1 });
agentSchema.index({ type: 1 });
agentSchema.index({ organization_id: 1 });
agentSchema.index({ apiKey: 1 });
agentSchema.index({ status: 1 });
agentSchema.index({ isActive: 1 });

// Métodos de instancia
agentSchema.methods.hasCapability = function(capability) {
  return this.capabilities.includes(capability);
};

agentSchema.methods.hasPermission = function(resource, action) {
  const permission = this.permissions.find(p => p.resource === resource || p.resource === 'all');
  return permission && permission.actions.includes(action);
};

agentSchema.methods.updateMetrics = function(responseTime, success) {
  this.metrics.totalRequests += 1;
  if (success) {
    this.metrics.successfulRequests += 1;
  } else {
    this.metrics.failedRequests += 1;
  }
  
  // Calcular tiempo de respuesta promedio
  const currentAvg = this.metrics.averageResponseTime;
  const totalRequests = this.metrics.totalRequests;
  this.metrics.averageResponseTime = (currentAvg * (totalRequests - 1) + responseTime) / totalRequests;
  
  this.metrics.lastActivity = new Date();
  return this.save();
};

agentSchema.methods.updateHealth = function(healthData) {
  this.health = { ...this.health, ...healthData, lastCheck: new Date() };
  return this.save();
};

// Métodos estáticos
agentSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

agentSchema.statics.findByOrganization = function(organizationId) {
  return this.find({ organization_id: organizationId, isActive: true });
};

agentSchema.statics.findActive = function() {
  return this.find({ isActive: true, status: 'active' });
};

// Middleware pre-save
agentSchema.pre('save', function(next) {
  if (this.isNew && !this.apiKey) {
    // Generar API key única
    this.apiKey = require('crypto').randomBytes(32).toString('hex');
  }
  next();
});

module.exports = model('Agent', agentSchema);