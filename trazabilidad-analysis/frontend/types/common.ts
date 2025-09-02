// ========== TIPOS COMUNES ==========

// Usuario del sistema
export interface User {
  id: string;
  email: string;
  name: string;
  last_name?: string;
  full_name: string;
  avatar?: string;
  role: Role;
  department?: Department;
  position?: string;
  phone?: string;
  is_active: boolean;
  email_verified_at?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// Organización
export interface Organization {
  id: string;
  name: string;
  legal_name: string;
  tax_id?: string;
  address: Address;
  contact_info: ContactInfo;
  logo?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large';
  is_active: boolean;
  settings: OrganizationSettings;
  created_at: string;
  updated_at: string;
}

// Departamento
export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  manager?: User;
  organization_id: string;
  organization?: Organization;
  parent_department_id?: string;
  parent_department?: Department;
  child_departments?: Department[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Puesto de trabajo
export interface Position {
  id: string;
  title: string;
  description?: string;
  department_id: string;
  department?: Department;
  requirements?: string[];
  responsibilities?: string[];
  salary_range?: {
    min: number;
    max: number;
    currency: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Dirección física
export interface Address {
  street: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Información de contacto
export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Configuración de organización
export interface OrganizationSettings {
  timezone: string;
  language: string;
  date_format: string;
  currency: string;
  working_hours: {
    start: string;
    end: string;
    days: number[];
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  security: {
    password_policy: {
      min_length: number;
      require_uppercase: boolean;
      require_lowercase: boolean;
      require_numbers: boolean;
      require_symbols: boolean;
    };
    session_timeout: number;
    mfa_required: boolean;
  };
}

// Rol de usuario
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  is_system: boolean;
  organization_id?: string;
  organization?: Organization;
  created_at: string;
  updated_at: string;
}

// Permiso
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// ========== TIPOS DE AUDITORÍA ==========

import type { FileUpload } from './api';

// Auditoría
export interface Audit {
  id: string;
  title: string;
  description?: string;
  type: 'internal' | 'external' | 'supplier' | 'certification';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scope: string;
  objectives: string[];
  criteria: string[];
  start_date: string;
  end_date: string;
  lead_auditor_id: string;
  lead_auditor?: User;
  team_members: User[];
  auditee_id: string;
  auditee?: User;
  department_id?: string;
  department?: Department;
  organization_id: string;
  organization?: Organization;
  findings: Finding[];
  conclusions: string;
  recommendations: string[];
  attachments: FileUpload[];
  created_at: string;
  updated_at: string;
}

// Hallazgo de auditoría
export interface Finding {
  id: string;
  audit_id: string;
  audit?: Audit;
  title: string;
  description: string;
  type: 'non_conformity' | 'observation' | 'opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  clause?: string;
  requirement?: string;
  evidence?: string;
  root_cause?: string;
  corrective_action?: string;
  preventive_action?: string;
  responsible_id?: string;
  responsible?: User;
  due_date?: string;
  completed_date?: string;
  attachments: FileUpload[];
  created_at: string;
  updated_at: string;
}

// ========== TIPOS DE ACCIONES ==========

// Acción correctiva/preventiva
export interface Action {
  id: string;
  title: string;
  description: string;
  type: 'corrective' | 'preventive' | 'improvement';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source_type: 'audit' | 'complaint' | 'incident' | 'review' | 'other';
  source_id?: string;
  responsible_id: string;
  responsible?: User;
  assigned_to_id?: string;
  assigned_to?: User;
  department_id?: string;
  department?: Department;
  due_date?: string;
  completed_date?: string;
  effectiveness_review_date?: string;
  cost?: number;
  attachments: FileUpload[];
  created_at: string;
  updated_at: string;
}

// ========== TIPOS DE DOCUMENTOS ==========

// Documento
export interface Document {
  id: string;
  title: string;
  description?: string;
  type: 'policy' | 'procedure' | 'work_instruction' | 'form' | 'record' | 'manual';
  category: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'obsolete';
  author_id: string;
  author?: User;
  reviewer_id?: string;
  reviewer?: User;
  approver_id?: string;
  approver?: User;
  department_id?: string;
  department?: Department;
  organization_id: string;
  organization?: Organization;
  keywords: string[];
  effective_date?: string;
  review_date?: string;
  file: FileUpload;
  related_documents: Document[];
  created_at: string;
  updated_at: string;
}

// ========== TIPOS DE PROCESOS ==========

// Proceso
export interface Process {
  id: string;
  name: string;
  description: string;
  type: 'core' | 'support' | 'management';
  owner_id: string;
  owner?: User;
  department_id?: string;
  department?: Department;
  organization_id: string;
  organization?: Organization;
  inputs: string[];
  outputs: string[];
  activities: ProcessActivity[];
  risks: ProcessRisk[];
  indicators: ProcessIndicator[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Actividad de proceso
export interface ProcessActivity {
  id: string;
  name: string;
  description: string;
  order: number;
  responsible_id?: string;
  responsible?: User;
  duration?: number;
  resources?: string[];
  inputs?: string[];
  outputs?: string[];
}

// Riesgo de proceso
export interface ProcessRisk {
  id: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  responsible_id?: string;
  responsible?: User;
}

// Indicador de proceso
export interface ProcessIndicator {
  id: string;
  name: string;
  description: string;
  type: 'input' | 'output' | 'process';
  unit: string;
  target?: number;
  current_value?: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  responsible_id?: string;
  responsible?: User;
}

// ========== TIPOS DE CAPACITACIÓN ==========

// Capacitación
export interface Training {
  id: string;
  title: string;
  description: string;
  type: 'internal' | 'external' | 'online' | 'workshop';
  category: string;
  duration: number; // en horas
  provider?: string;
  instructor_id?: string;
  instructor?: User;
  materials: FileUpload[];
  objectives: string[];
  requirements?: string[];
  max_participants?: number;
  cost?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Registro de capacitación
export interface TrainingRecord {
  id: string;
  training_id: string;
  training?: Training;
  participant_id: string;
  participant?: User;
  status: 'enrolled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  enrollment_date: string;
  completion_date?: string;
  score?: number;
  certificate?: FileUpload;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ========== TIPOS DE EVALUACIÓN ==========

// Evaluación de competencias
export interface CompetencyEvaluation {
  id: string;
  employee_id: string;
  employee?: User;
  evaluator_id: string;
  evaluator?: User;
  position_id: string;
  position?: Position;
  evaluation_date: string;
  next_evaluation_date: string;
  status: 'draft' | 'completed' | 'approved';
  competencies: CompetencyScore[];
  overall_score: number;
  comments: string;
  recommendations: string[];
  created_at: string;
  updated_at: string;
}

// Puntuación de competencia
export interface CompetencyScore {
  competency_id: string;
  competency: Competency;
  score: number; // 1-5
  comments?: string;
}

// Competencia
export interface Competency {
  id: string;
  name: string;
  description: string;
  category: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  criteria: string[];
  position_id?: string;
  position?: Position;
  created_at: string;
  updated_at: string;
}

// ========== TIPOS DE ENCUESTAS ==========

// Encuesta
export interface Survey {
  id: string;
  title: string;
  description: string;
  type: 'satisfaction' | 'feedback' | 'assessment' | 'research';
  target_audience: string[];
  questions: SurveyQuestion[];
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  anonymous: boolean;
  allow_multiple_responses: boolean;
  created_by_id: string;
  created_by?: User;
  organization_id: string;
  organization?: Organization;
  created_at: string;
  updated_at: string;
}

// Pregunta de encuesta
export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'rating' | 'boolean';
  required: boolean;
  options?: string[];
  min_value?: number;
  max_value?: number;
  order: number;
}

// Respuesta de encuesta
export interface SurveyResponse {
  id: string;
  survey_id: string;
  survey?: Survey;
  respondent_id?: string;
  respondent?: User;
  answers: SurveyAnswer[];
  submitted_at: string;
  ip_address?: string;
  user_agent?: string;
}

// Respuesta individual
export interface SurveyAnswer {
  question_id: string;
  question?: SurveyQuestion;
  answer: string | number | boolean | string[];
}
