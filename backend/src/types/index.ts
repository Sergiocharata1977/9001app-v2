import { ObjectId } from 'mongodb';

// ============================================================================
// TIPOS BASE
// ============================================================================

export interface BaseEntity {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
}

export interface BaseOrganizationEntity extends BaseEntity {
  organization_id: ObjectId;
}

// ============================================================================
// ORGANIZACIÓN Y TENANCY
// ============================================================================

export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  settings: {
    timezone: string;
    locale: string;
    features: string[];
    ai_enabled: boolean;
    theme: {
      primary_color: string;
      secondary_color: string;
      logo_url?: string;
    };
  };
  limits: {
    users: number;
    storage: number;
    ai_requests: number;
    processes: number;
  };
  status: 'active' | 'suspended' | 'pending';
  subscription: {
    plan: 'free' | 'basic' | 'professional' | 'enterprise';
    start_date: Date;
    end_date: Date;
    features: string[];
  };
}

export interface User extends BaseOrganizationEntity {
  email: string;
  name: string;
  role: 'SuperAdmin' | 'OrgAdmin' | 'Auditor' | 'Operador' | 'Invitado';
  permissions: string[];
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      slack: boolean;
    };
    dashboard_layout: Record<string, any>;
  };
  last_login: Date;
  is_active: boolean;
  avatar_url?: string;
  department?: string;
  position?: string;
}

// ============================================================================
// PROCESOS Y WORKFLOWS
// ============================================================================

export interface Process extends BaseOrganizationEntity {
  type: string;
  name: string;
  description?: string;
  version: number;
  states: ProcessState[];
  transitions: ProcessTransition[];
  fields: ProcessField[];
  policies: ProcessPolicy[];
  ai_assistance: {
    enabled: boolean;
    suggestions: boolean;
    validation: boolean;
    auto_complete: boolean;
    analysis: boolean;
  };
  metadata: {
    category: string;
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimated_duration: number; // en horas
  };
  is_active: boolean;
  is_template: boolean;
  template_id?: ObjectId;
}

export interface ProcessState {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
  validators: string[];
  required_fields: string[];
  sla_hours?: number;
  auto_actions?: AutoAction[];
  permissions: {
    view: string[];
    edit: string[];
    transition: string[];
  };
  ui_config: {
    layout: 'form' | 'kanban' | 'timeline' | 'custom';
    fields_order: string[];
    custom_component?: string;
  };
}

export interface ProcessTransition {
  id: string;
  from: string;
  to: string;
  name: string;
  description?: string;
  roles: string[];
  conditions: TransitionCondition[];
  validators: string[];
  auto_actions?: AutoAction[];
  ui_config: {
    button_text: string;
    button_color: string;
    confirmation_required: boolean;
    confirmation_message?: string;
  };
}

export interface ProcessField {
  name: string;
  type: 'string' | 'number' | 'date' | 'select' | 'multiselect' | 'file' | 'boolean' | 'json' | 'email' | 'phone' | 'url' | 'textarea' | 'richtext';
  label: string;
  description?: string;
  required: boolean;
  read_only: boolean;
  options?: string[];
  pattern?: string;
  pii: boolean;
  default_value?: any;
  validation_rules?: ValidationRule[];
  ai_assistance?: {
    auto_complete: boolean;
    suggestions: boolean;
    validation: boolean;
    context_fields?: string[];
  };
  ui_config: {
    placeholder?: string;
    help_text?: string;
    min_length?: number;
    max_length?: number;
    min_value?: number;
    max_value?: number;
    step?: number;
    rows?: number;
    cols?: number;
    accept?: string;
    multiple?: boolean;
  };
}

export interface ProcessPolicy {
  id: string;
  name: string;
  type: 'validation' | 'notification' | 'automation' | 'security';
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  priority: number;
  is_active: boolean;
}

// ============================================================================
// INSTANCIAS DE PROCESO
// ============================================================================

export interface ProcessInstance extends BaseOrganizationEntity {
  process_id: ObjectId;
  current_state: string;
  data: Record<string, any>;
  history: ProcessHistory[];
  assigned_to?: ObjectId;
  created_by: ObjectId;
  completed_at?: Date;
  metadata: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    external_id?: string;
    source?: string;
  };
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  sla_status: 'on_time' | 'at_risk' | 'overdue';
  estimated_completion?: Date;
}

export interface ProcessHistory {
  id: string;
  timestamp: Date;
  state: string;
  action: string;
  user_id: ObjectId;
  data_changes?: Record<string, any>;
  comments?: string;
  ai_suggestions?: AISuggestion[];
  metadata: {
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
  };
}

// ============================================================================
// AGENTES DE IA
// ============================================================================

export interface AIAgent extends BaseOrganizationEntity {
  name: string;
  type: 'super' | 'org' | 'user';
  capabilities: string[];
  configuration: Record<string, any>;
  status: 'active' | 'inactive' | 'error' | 'training';
  model_config: {
    provider: 'openai' | 'anthropic' | 'local' | 'custom';
    model_name: string;
    temperature: number;
    max_tokens: number;
    system_prompt: string;
  };
  metrics: {
    requests_total: number;
    requests_success: number;
    requests_failed: number;
    avg_response_time: number;
    last_activity: Date;
    tokens_used: number;
    cost_total: number;
  };
  training_data?: {
    documents: ObjectId[];
    examples: AITrainingExample[];
    last_training: Date;
    performance_score: number;
  };
}

export interface AISuggestion {
  id: string;
  type: 'field_completion' | 'validation' | 'next_action' | 'optimization' | 'analysis' | 'recommendation';
  confidence: number;
  content: string;
  metadata?: Record<string, any>;
  created_at: Date;
  applied?: boolean;
  applied_at?: Date;
  applied_by?: ObjectId;
  feedback?: {
    rating: number;
    comment?: string;
    user_id: ObjectId;
  };
}

export interface AITrainingExample {
  id: string;
  input: Record<string, any>;
  output: Record<string, any>;
  context: Record<string, any>;
  quality_score: number;
  created_at: Date;
}

// ============================================================================
// OVERRIDES Y PERSONALIZACIÓN
// ============================================================================

export interface OrgOverride extends BaseOrganizationEntity {
  process_type: string;
  add_states?: ProcessState[];
  hide_states?: string[];
  add_fields?: ProcessField[];
  restrict_transitions?: ProcessTransition[];
  ai_assistance?: {
    enabled: boolean;
    suggestions: boolean;
    validation: boolean;
    auto_complete: boolean;
  };
  status: 'pending' | 'approved' | 'rejected' | 'active';
  approved_by?: ObjectId;
  approved_at?: Date;
  rejection_reason?: string;
  version: number;
  changes_summary: string;
  impact_analysis?: {
    affected_instances: number;
    risk_level: 'low' | 'medium' | 'high';
    estimated_impact: string;
  };
}

// ============================================================================
// RAG (RETRIEVAL AUGMENTED GENERATION)
// ============================================================================

export interface RAGDocument extends BaseOrganizationEntity {
  title: string;
  content: string;
  type: 'pdf' | 'docx' | 'txt' | 'html' | 'markdown';
  source: 'upload' | 'url' | 'api';
  metadata: {
    author?: string;
    date_created?: Date;
    tags: string[];
    category: string;
    language: string;
    file_size: number;
    pages?: number;
  };
  embeddings: {
    vector: number[];
    chunk_id: string;
    chunk_text: string;
  }[];
  status: 'processing' | 'ready' | 'error';
  processing_metadata?: {
    chunks_count: number;
    processing_time: number;
    error_message?: string;
  };
}

export interface RAGQuery {
  id: string;
  organization_id: ObjectId;
  query: string;
  context: Record<string, any>;
  results: RAGQueryResult[];
  created_at: Date;
  user_id: ObjectId;
  metadata: {
    response_time: number;
    tokens_used: number;
    confidence_score: number;
  };
}

export interface RAGQueryResult {
  document_id: ObjectId;
  chunk_id: string;
  content: string;
  relevance_score: number;
  metadata: Record<string, any>;
}

// ============================================================================
// MÉTRICAS Y OBSERVABILIDAD
// ============================================================================

export interface SuperMetrics {
  total_organizations: number;
  active_organizations: number;
  total_processes: number;
  total_instances: number;
  ai_requests_total: number;
  avg_response_time: number;
  error_rate: number;
  storage_usage: number;
  cost_per_org: number;
  revenue_total: number;
  churn_rate: number;
}

export interface OrgMetrics {
  total_users: number;
  active_users: number;
  total_process_instances: number;
  completed_processes: number;
  avg_completion_time: number;
  ai_suggestions_used: number;
  validation_errors: number;
  storage_usage: number;
  rag_queries: number;
  user_engagement: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
  };
}

export interface UserMetrics {
  processes_created: number;
  processes_completed: number;
  ai_suggestions_accepted: number;
  avg_session_duration: number;
  features_used: string[];
  last_activity: Date;
  productivity_score: number;
}

// ============================================================================
// EVENTOS Y AUDITORÍA
// ============================================================================

export interface ProcessEvent extends BaseOrganizationEntity {
  process_id: ObjectId;
  event_type: string;
  event_data: Record<string, any>;
  user_id: ObjectId;
  version: number;
  metadata: {
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
  };
}

export interface ProcessChangelog extends BaseOrganizationEntity {
  process_id: ObjectId;
  change_type: 'create' | 'update' | 'delete';
  changes: Record<string, any>;
  approved_by: ObjectId;
  approved_at: Date;
  version: number;
  reason?: string;
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

export interface AutoAction {
  type: 'notification' | 'assignment' | 'validation' | 'integration' | 'ai_analysis';
  config: Record<string, any>;
  conditions?: Record<string, any>;
}

export interface TransitionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logical_operator?: 'and' | 'or';
}

export interface ValidationRule {
  type: 'required' | 'min_length' | 'max_length' | 'pattern' | 'custom';
  value: any;
  message: string;
}

export interface PolicyCondition {
  field: string;
  operator: string;
  value: any;
}

export interface PolicyAction {
  type: string;
  config: Record<string, any>;
}

export interface Alert {
  id: string;
  organization_id: ObjectId;
  type: 'sla_breach' | 'ai_failure' | 'high_error_rate' | 'storage_limit' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata: Record<string, any>;
  created_at: Date;
  resolved_at?: Date;
  resolved_by?: ObjectId;
  status: 'active' | 'resolved' | 'acknowledged';
}

// ============================================================================
// TIPOS DE API
// ============================================================================

export interface CreateOrgOverrideRequest {
  process_type: string;
  add_states?: ProcessState[];
  hide_states?: string[];
  add_fields?: ProcessField[];
  restrict_transitions?: ProcessTransition[];
  ai_assistance?: {
    enabled: boolean;
    suggestions: boolean;
    validation: boolean;
    auto_complete: boolean;
  };
}

export interface AISuggestionResponse {
  suggestions: AISuggestion[];
  confidence: number;
  reasoning: string;
  metadata?: Record<string, any>;
}

export interface ProcessTransitionRequest {
  to_state: string;
  data?: Record<string, any>;
  comments?: string;
  force?: boolean;
}

export interface ProcessTransitionResponse {
  success: boolean;
  new_state: string;
  validation_errors?: string[];
  ai_suggestions?: AISuggestion[];
  next_actions?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  impact?: {
    affected_instances: number;
    risk_level: 'low' | 'medium' | 'high';
    estimated_impact: string;
  };
}

// ============================================================================
// TIPOS DE CONFIGURACIÓN
// ============================================================================

export interface DatabaseConfig {
  mongodb: {
    uri: string;
    database: string;
    options: {
      maxPoolSize: number;
      serverSelectionTimeoutMS: number;
      socketTimeoutMS: number;
    };
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    database: number;
  };
}

export interface AIConfig {
  openai: {
    api_key: string;
    organization: string;
    default_model: string;
    max_tokens: number;
    temperature: number;
  };
  anthropic: {
    api_key: string;
    default_model: string;
    max_tokens: number;
    temperature: number;
  };
  embeddings: {
    provider: 'openai' | 'local';
    model: string;
    dimensions: number;
  };
}

export interface SecurityConfig {
  jwt: {
    secret: string;
    expires_in: string;
    refresh_expires_in: string;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
  rate_limit: {
    window_ms: number;
    max_requests: number;
  };
}

// ============================================================================
// TIPOS DE ENUMERACIONES
// ============================================================================

export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  OrgAdmin = 'OrgAdmin',
  Auditor = 'Auditor',
  Operador = 'Operador',
  Invitado = 'Invitado'
}

export enum ProcessStatus {
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Paused = 'paused'
}

export enum AIAgentType {
  Super = 'super',
  Org = 'org',
  User = 'user'
}

export enum SuggestionType {
  FieldCompletion = 'field_completion',
  Validation = 'validation',
  NextAction = 'next_action',
  Optimization = 'optimization',
  Analysis = 'analysis',
  Recommendation = 'recommendation'
}

export enum AlertSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}