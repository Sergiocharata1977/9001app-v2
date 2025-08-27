const { Schema, model } = require('mongoose');

const organizationSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  location: {
    type: String,
    trim: true
  },
  contact: {
    name: String,
    email: String,
    phone: String
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'es'
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
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
organizationSchema.index({ name: 1 });
organizationSchema.index({ isActive: 1 });
organizationSchema.index({ 'subscription.plan': 1 });

module.exports = model('Organization', organizationSchema);