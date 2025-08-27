// Types Index
// Índice de tipos para el proyecto

// MongoDB Types
export * from './mongodb-types';
export * from './view-types';

// Re-export existing types (if they exist)
export * from './common';
export * from './api';
export * from './auth';

// View Types (for backward compatibility)
export type { 
  ViewMode, 
  ViewConfig, 
  CardViewConfig,
  ListViewConfig 
} from './view-types';

// MongoDB Base Types
export type { 
  MongoDBBase,
  ApiResponse,
  PaginatedResponse,
  QueryParams 
} from './mongodb-types';

// Entity Types
export type {
  User,
  Department,
  Position,
  Personnel,
  Customer,
  Lead,
  Opportunity,
  Interaction,
  Activity,
  Audit,
  Finding,
  Recommendation,
  Document,
  Agent
} from './mongodb-types';
