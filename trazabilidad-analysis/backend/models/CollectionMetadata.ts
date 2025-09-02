import { Document, Schema, model } from 'mongoose';

export interface ICollectionMetadata extends Document {
  collectionName: string;
  module: string;
  category: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const collectionMetadataSchema = new Schema<ICollectionMetadata>({
  collectionName: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  module: {
    type: String,
    required: true,
    enum: ['CRM', 'SGC', 'RRHH', 'RAG', 'SISTEMA', 'ADMIN'],
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      // CRM Categories
      'CLIENTES', 'ACTIVIDADES', 'ACTIVOS', 'ANALISIS_RIESGO', 'FINANZAS', 'CULTIVOS',
      // SGC Categories  
      'AUDITORIAS', 'ACCIONES', 'HALLAZGOS', 'PROCESOS', 'DOCUMENTOS', 'MEJORAS',
      // RRHH Categories
      'PERSONAL', 'COMPETENCIAS', 'CAPACITACIONES', 'PUESTOS', 'EVALUACIONES',
      // RAG Categories
      'CONFIGURACION', 'EMBEDDINGS', 'QUERIES', 'SOURCES',
      // Sistema Categories
      'USUARIOS', 'PERMISOS', 'SUSCRIPCIONES', 'LOGS'
    ],
    index: true
  },
  description: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices compuestos para consultas eficientes
collectionMetadataSchema.index({ module: 1, category: 1 });
collectionMetadataSchema.index({ module: 1, isActive: 1 });

export const CollectionMetadata = model<ICollectionMetadata>('collection_metadata', collectionMetadataSchema);
