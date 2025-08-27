// MongoDB Types for 9001app-v2
// Tipos específicos para MongoDB Atlas

export interface MongoDBBase {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

// User Types
export interface User extends MongoDBBase {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  preferences: UserPreferences;
  permissions: string[];
}

export type UserRole = 'admin' | 'manager' | 'user' | 'auditor' | 'coordinator';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'es' | 'en';
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface DashboardSettings {
  layout: 'grid' | 'list' | 'compact';
  widgets: string[];
  refreshInterval: number;
}

// Department Types
export interface Department extends MongoDBBase {
  name: string;
  code: string;
  description?: string;
  managerId: string;
  parentDepartmentId?: string;
  isActive: boolean;
  metadata: {
    budget?: number;
    location?: string;
    contactInfo?: ContactInfo;
  };
}

// Position Types
export interface Position extends MongoDBBase {
  title: string;
  code: string;
  departmentId: string;
  description?: string;
  requirements: string[];
  responsibilities: string[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  isActive: boolean;
}

// Personnel Types
export interface Personnel extends MongoDBBase {
  employeeId: string;
  userId: string;
  positionId: string;
  departmentId: string;
  hireDate: Date;
  contractType: ContractType;
  status: PersonnelStatus;
  personalInfo: PersonalInfo;
  skills: Skill[];
  certifications: Certification[];
  evaluations: Evaluation[];
}

export type ContractType = 'full-time' | 'part-time' | 'contract' | 'intern';
export type PersonnelStatus = 'active' | 'inactive' | 'suspended' | 'terminated';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  bankInfo?: BankInfo;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface BankInfo {
  accountNumber: string;
  bankName: string;
  accountType: string;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  certified: boolean;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  status: 'active' | 'expired' | 'pending';
}

export interface Evaluation {
  type: 'performance' | 'competency' | 'training';
  evaluatorId: string;
  score: number;
  comments: string;
  date: Date;
  nextReviewDate?: Date;
}

// CRM Types
export interface Customer extends MongoDBBase {
  customerId: string;
  name: string;
  type: CustomerType;
  industry: string;
  contactInfo: ContactInfo;
  address: Address;
  status: CustomerStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  leads: Lead[];
  opportunities: Opportunity[];
  interactions: Interaction[];
  documents: Document[];
}

export type CustomerType = 'prospect' | 'lead' | 'customer' | 'partner';
export type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'lost';

export interface ContactInfo {
  email: string;
  phone: string;
  website?: string;
  socialMedia?: SocialMedia;
}

export interface SocialMedia {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface Lead extends MongoDBBase {
  customerId: string;
  source: LeadSource;
  status: LeadStatus;
  value: number;
  probability: number;
  assignedTo: string;
  notes: string;
  activities: Activity[];
}

export type LeadSource = 'website' | 'referral' | 'social' | 'advertising' | 'event' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Opportunity extends MongoDBBase {
  customerId: string;
  leadId?: string;
  title: string;
  description: string;
  value: number;
  probability: number;
  expectedCloseDate: Date;
  stage: OpportunityStage;
  assignedTo: string;
  activities: Activity[];
  documents: Document[];
}

export type OpportunityStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

export interface Interaction extends MongoDBBase {
  customerId: string;
  type: InteractionType;
  subject: string;
  description: string;
  contactPerson: string;
  date: Date;
  duration: number;
  outcome: string;
  nextAction?: string;
  assignedTo: string;
}

export type InteractionType = 'call' | 'email' | 'meeting' | 'visit' | 'presentation' | 'follow-up';

export interface Activity extends MongoDBBase {
  type: ActivityType;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: ActivityStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedTo?: {
    type: 'customer' | 'lead' | 'opportunity';
    id: string;
  };
}

export type ActivityType = 'task' | 'call' | 'email' | 'meeting' | 'follow-up';
export type ActivityStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

// Audit Types
export interface Audit extends MongoDBBase {
  auditId: string;
  type: AuditType;
  title: string;
  description: string;
  scope: string;
  status: AuditStatus;
  plannedDate: Date;
  actualDate?: Date;
  duration: number;
  auditorIds: string[];
  auditees: string[];
  departmentId: string;
  findings: Finding[];
  recommendations: Recommendation[];
  documents: Document[];
  metadata: AuditMetadata;
}

export type AuditType = 'internal' | 'external' | 'surveillance' | 'certification' | 'follow-up';
export type AuditStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled' | 'delayed';

export interface Finding extends MongoDBBase {
  auditId: string;
  type: FindingType;
  severity: FindingSeverity;
  title: string;
  description: string;
  requirement: string;
  evidence: string;
  correctiveAction?: string;
  responsiblePerson: string;
  dueDate: Date;
  status: FindingStatus;
}

export type FindingType = 'non-conformity' | 'observation' | 'opportunity' | 'compliant';
export type FindingSeverity = 'minor' | 'major' | 'critical';
export type FindingStatus = 'open' | 'in-progress' | 'closed' | 'verified';

export interface Recommendation extends MongoDBBase {
  auditId: string;
  findingId?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  responsiblePerson: string;
  dueDate: Date;
  status: RecommendationStatus;
}

export type RecommendationStatus = 'pending' | 'in-progress' | 'implemented' | 'cancelled';

export interface AuditMetadata {
  standard: string;
  version: string;
  scope: string;
  objectives: string[];
  criteria: string[];
}

// Document Types
export interface Document extends MongoDBBase {
  documentId: string;
  title: string;
  description?: string;
  type: DocumentType;
  category: string;
  version: string;
  status: DocumentStatus;
  fileInfo: FileInfo;
  metadata: DocumentMetadata;
  relatedTo?: {
    type: 'customer' | 'audit' | 'opportunity' | 'personnel';
    id: string;
  };
}

export type DocumentType = 'policy' | 'procedure' | 'form' | 'manual' | 'report' | 'certificate' | 'contract';
export type DocumentStatus = 'draft' | 'review' | 'approved' | 'obsolete';

export interface FileInfo {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  checksum: string;
}

export interface DocumentMetadata {
  author: string;
  reviewers: string[];
  approvalDate?: Date;
  effectiveDate: Date;
  expiryDate?: Date;
  tags: string[];
  confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';
}

// Agent Types
export interface Agent extends MongoDBBase {
  agentId: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: string[];
  configuration: AgentConfig;
  performance: AgentPerformance;
  logs: AgentLog[];
}

export type AgentType = 'coordinator' | 'architect' | 'backend' | 'frontend' | 'tester' | 'documenter' | 'deployer' | 'rehabilitator';
export type AgentStatus = 'active' | 'inactive' | 'busy' | 'error';

export interface AgentConfig {
  apiEndpoint: string;
  timeout: number;
  retryAttempts: number;
  priority: number;
  dependencies: string[];
}

export interface AgentPerformance {
  tasksCompleted: number;
  successRate: number;
  averageResponseTime: number;
  lastActivity: Date;
  errors: AgentError[];
}

export interface AgentError {
  timestamp: Date;
  error: string;
  stackTrace?: string;
  context?: Record<string, any>;
}

export interface AgentLog extends MongoDBBase {
  agentId: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
}

// Common Types
export interface ContactInfo {
  email: string;
  phone: string;
  website?: string;
  socialMedia?: SocialMedia;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

// View Types for UI Components
export type ViewMode = 'card' | 'list' | 'calendar' | 'kanban';

export interface ViewConfig {
  mode: ViewMode;
  columns: string[];
  filters: FilterConfig[];
  sort: SortConfig;
  pagination: PaginationConfig;
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex';
  value: any;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
}

// Export all types for easy import
export type {
  User, Department, Position, Personnel, Customer, Lead, Opportunity,
  Interaction, Activity, Audit, Finding, Recommendation, Document, Agent
};