// Tipos para seguridad avanzada de agentes
export interface ISecurityContext {
  agentId: string;
  permissions: Permission[];
  roles: string[];
  securityLevel: SecurityLevel;
  authenticationMethod: AuthenticationMethod;
  encryptionLevel: EncryptionLevel;
  auditEnabled: boolean;
  lastSecurityCheck: string;
  metadata: SecurityMetadata;
}

export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';

export type AuthenticationMethod = 
  | 'none'
  | 'token'
  | 'certificate'
  | 'biometric'
  | 'multi_factor'
  | 'oauth'
  | 'saml'
  | 'ldap'
  | 'kerberos'
  | 'radius'
  | 'tacacs'
  | 'custom';

export type EncryptionLevel = 
  | 'none'
  | 'basic'
  | 'standard'
  | 'high'
  | 'military'
  | 'quantum';

export interface SecurityMetadata {
  version: string;
  lastUpdate: string;
  compliance: ComplianceInfo[];
  certifications: Certification[];
  policies: SecurityPolicy[];
  incidents: SecurityIncident[];
}

export interface ComplianceInfo {
  standard: string;
  version: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
  lastAudit: string;
  nextAudit: string;
  findings: ComplianceFinding[];
}

export interface ComplianceFinding {
  id: string;
  type: 'finding' | 'observation' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  dueDate: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  scope: string[];
}

export interface SecurityPolicy {
  id: string;
  name: string;
  type: PolicyType;
  version: string;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  rules: SecurityRule[];
  enforcement: PolicyEnforcement;
  exceptions: PolicyException[];
  createdAt: string;
  updatedAt: string;
}

export type PolicyType = 
  | 'access_control'
  | 'data_protection'
  | 'network_security'
  | 'application_security'
  | 'incident_response'
  | 'business_continuity'
  | 'risk_management'
  | 'compliance'
  | 'privacy'
  | 'cryptography';

export interface SecurityRule {
  id: string;
  name: string;
  type: RuleType;
  condition: string;
  action: RuleAction;
  priority: number;
  enabled: boolean;
  metadata: RuleMetadata;
}

export type RuleType = 
  | 'allow'
  | 'deny'
  | 'require'
  | 'log'
  | 'alert'
  | 'quarantine'
  | 'block'
  | 'redirect'
  | 'transform'
  | 'custom';

export interface RuleAction {
  type: string;
  parameters: Record<string, any>;
  fallback?: string;
  timeout?: number;
}

export interface RuleMetadata {
  description: string;
  category: string;
  tags: string[];
  risk: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface PolicyEnforcement {
  mode: 'strict' | 'flexible' | 'advisory';
  timeout: number;
  retryAttempts: number;
  escalation: boolean;
  monitoring: boolean;
}

export interface PolicyException {
  id: string;
  reason: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  scope: string[];
  conditions: string[];
}

export interface SecurityIncident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  detectedAt: string;
  reportedAt: string;
  resolvedAt?: string;
  affectedAgents: string[];
  impact: IncidentImpact;
  response: IncidentResponse;
  lessons: string[];
  metadata: IncidentMetadata;
}

export type IncidentType = 
  | 'unauthorized_access'
  | 'data_breach'
  | 'malware_infection'
  | 'denial_of_service'
  | 'privilege_escalation'
  | 'data_exfiltration'
  | 'insider_threat'
  | 'social_engineering'
  | 'physical_security'
  | 'configuration_error'
  | 'vulnerability_exploit'
  | 'credential_compromise'
  | 'api_abuse'
  | 'resource_exhaustion'
  | 'network_intrusion'
  | 'application_attack'
  | 'database_breach'
  | 'cloud_security'
  | 'mobile_security'
  | 'iot_security';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 
  | 'detected'
  | 'investigating'
  | 'contained'
  | 'resolved'
  | 'closed'
  | 'escalated'
  | 'false_positive';

export interface IncidentImpact {
  affectedSystems: number;
  affectedUsers: number;
  dataExposed: boolean;
  downtime: number;
  financialLoss: number;
  reputationDamage: number;
  complianceImpact: boolean;
  operationalImpact: boolean;
}

export interface IncidentResponse {
  team: string[];
  timeline: ResponseTimeline[];
  actions: ResponseAction[];
  communications: Communication[];
  evidence: Evidence[];
  lessons: string[];
}

export interface ResponseTimeline {
  timestamp: string;
  event: string;
  actor: string;
  details: string;
  evidence: string[];
}

export interface ResponseAction {
  id: string;
  type: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  result?: string;
}

export interface Communication {
  id: string;
  type: 'internal' | 'external' | 'regulatory' | 'public';
  audience: string[];
  content: string;
  sentAt: string;
  delivered: boolean;
  acknowledged: boolean;
}

export interface Evidence {
  id: string;
  type: 'log' | 'file' | 'memory' | 'network' | 'physical' | 'witness';
  source: string;
  description: string;
  collectedAt: string;
  preserved: boolean;
  chainOfCustody: string[];
}

export interface IncidentMetadata {
  category: string;
  tags: string[];
  priority: number;
  sla: number;
  escalation: boolean;
  notification: boolean;
  reporting: boolean;
}

// Tipos para autenticación
export interface IAuthenticationManager {
  id: string;
  name: string;
  type: AuthenticationType;
  config: AuthenticationConfig;
  methods: AuthenticationMethod[];
  policies: AuthenticationPolicy[];
  sessions: Session[];
  status: AuthenticationStatus;
  metrics: AuthenticationMetrics;
}

export type AuthenticationType = 
  | 'local'
  | 'ldap'
  | 'active_directory'
  | 'oauth'
  | 'saml'
  | 'openid_connect'
  | 'kerberos'
  | 'radius'
  | 'tacacs'
  | 'biometric'
  | 'multi_factor'
  | 'federated'
  | 'custom';

export interface AuthenticationConfig {
  enabled: boolean;
  timeout: number;
  maxAttempts: number;
  lockoutDuration: number;
  passwordPolicy: PasswordPolicy;
  sessionPolicy: SessionPolicy;
  mfaPolicy: MFAPolicy;
  auditPolicy: AuditPolicy;
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  expirationDays: number;
  historyCount: number;
  complexityScore: number;
}

export interface SessionPolicy {
  maxSessions: number;
  sessionTimeout: number;
  idleTimeout: number;
  absoluteTimeout: number;
  concurrentSessions: boolean;
  sessionFixation: boolean;
  secureCookies: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

export interface MFAPolicy {
  enabled: boolean;
  methods: MFAMethod[];
  required: boolean;
  gracePeriod: number;
  backupCodes: boolean;
  rememberDevice: boolean;
  deviceTrust: boolean;
}

export type MFAMethod = 
  | 'totp'
  | 'hotp'
  | 'sms'
  | 'email'
  | 'push'
  | 'biometric'
  | 'hardware_token'
  | 'smart_card'
  | 'certificate'
  | 'custom';

export interface AuditPolicy {
  enabled: boolean;
  events: AuditEvent[];
  retention: number;
  encryption: boolean;
  integrity: boolean;
  realTime: boolean;
}

export interface AuthenticationPolicy {
  id: string;
  name: string;
  type: 'allow' | 'deny' | 'require';
  conditions: AuthenticationCondition[];
  actions: AuthenticationAction[];
  priority: number;
  enabled: boolean;
}

export interface AuthenticationCondition {
  type: 'time' | 'location' | 'device' | 'network' | 'risk' | 'custom';
  expression: string;
  parameters: Record<string, any>;
}

export interface AuthenticationAction {
  type: string;
  parameters: Record<string, any>;
  fallback?: string;
}

export interface Session {
  id: string;
  userId: string;
  agentId: string;
  startTime: string;
  lastActivity: string;
  expiresAt: string;
  status: SessionStatus;
  metadata: SessionMetadata;
}

export type SessionStatus = 'active' | 'expired' | 'terminated' | 'suspended';

export interface SessionMetadata {
  ipAddress: string;
  userAgent: string;
  location: string;
  device: string;
  risk: number;
  mfaVerified: boolean;
  trusted: boolean;
}

export type AuthenticationStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface AuthenticationMetrics {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  lockouts: number;
  mfaChallenges: number;
  mfaSuccesses: number;
  mfaFailures: number;
  averageResponseTime: number;
  errorRate: number;
}

// Tipos para autorización
export interface IAuthorizationManager {
  id: string;
  name: string;
  model: AuthorizationModel;
  policies: AuthorizationPolicy[];
  roles: AuthorizationRole[];
  permissions: AuthorizationPermission[];
  resources: Resource[];
  status: AuthorizationStatus;
  metrics: AuthorizationMetrics;
}

export type AuthorizationModel = 
  | 'role_based'
  | 'attribute_based'
  | 'policy_based'
  | 'identity_based'
  | 'hybrid'
  | 'zero_trust'
  | 'just_in_time'
  | 'risk_based';

export interface AuthorizationPolicy {
  id: string;
  name: string;
  type: 'allow' | 'deny' | 'require' | 'quarantine';
  subjects: Subject[];
  resources: Resource[];
  actions: Action[];
  conditions: AuthorizationCondition[];
  effects: PolicyEffect[];
  priority: number;
  enabled: boolean;
  metadata: PolicyMetadata;
}

export interface Subject {
  type: 'user' | 'group' | 'role' | 'agent' | 'service' | 'system';
  id: string;
  attributes: Record<string, any>;
}

export interface Resource {
  id: string;
  type: string;
  name: string;
  path: string;
  attributes: Record<string, any>;
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  classification: string[];
}

export interface Action {
  name: string;
  type: string;
  parameters: Record<string, any>;
  risk: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuthorizationCondition {
  type: 'time' | 'location' | 'device' | 'network' | 'risk' | 'context' | 'custom';
  expression: string;
  parameters: Record<string, any>;
  operator: 'and' | 'or' | 'not';
}

export interface PolicyEffect {
  type: 'allow' | 'deny' | 'require' | 'log' | 'alert' | 'quarantine';
  parameters: Record<string, any>;
  obligations: Obligation[];
}

export interface Obligation {
  type: string;
  parameters: Record<string, any>;
  timeout: number;
  retry: boolean;
}

export interface PolicyMetadata {
  description: string;
  category: string;
  tags: string[];
  version: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  compliance: string[];
}

export interface AuthorizationRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  constraints: RoleConstraint[];
  hierarchy: string[];
  metadata: RoleMetadata;
}

export interface RoleConstraint {
  type: 'time' | 'location' | 'device' | 'network' | 'risk' | 'custom';
  expression: string;
  parameters: Record<string, any>;
  enforcement: 'strict' | 'flexible' | 'advisory';
}

export interface RoleMetadata {
  category: string;
  tags: string[];
  version: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  usage: number;
}

export interface AuthorizationPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions: AuthorizationCondition[];
  scope: 'global' | 'hierarchy' | 'agent' | 'task' | 'data';
  metadata: PermissionMetadata;
}

export interface PermissionMetadata {
  description: string;
  category: string;
  tags: string[];
  risk: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  version: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export type AuthorizationStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface AuthorizationMetrics {
  totalRequests: number;
  allowedRequests: number;
  deniedRequests: number;
  cachedDecisions: number;
  averageResponseTime: number;
  errorRate: number;
  policyEvaluations: number;
  roleAssignments: number;
  permissionChecks: number;
}

// Tipos para encriptación
export interface IEncryptionManager {
  id: string;
  name: string;
  algorithms: EncryptionAlgorithm[];
  keys: EncryptionKey[];
  policies: EncryptionPolicy[];
  status: EncryptionStatus;
  metrics: EncryptionMetrics;
}

export interface EncryptionAlgorithm {
  name: string;
  type: AlgorithmType;
  keySize: number;
  mode: string;
  padding: string;
  strength: number;
  status: 'active' | 'deprecated' | 'disabled';
}

export type AlgorithmType = 
  | 'symmetric'
  | 'asymmetric'
  | 'hash'
  | 'hmac'
  | 'kdf'
  | 'prng'
  | 'quantum'
  | 'post_quantum';

export interface EncryptionKey {
  id: string;
  name: string;
  type: KeyType;
  algorithm: string;
  keySize: number;
  status: KeyStatus;
  created: string;
  expires?: string;
  usage: KeyUsage[];
  metadata: KeyMetadata;
}

export type KeyType = 
  | 'master'
  | 'data'
  | 'session'
  | 'transport'
  | 'backup'
  | 'recovery'
  | 'signing'
  | 'verification';

export type KeyStatus = 'active' | 'inactive' | 'expired' | 'compromised' | 'revoked';

export interface KeyUsage {
  type: 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'wrap' | 'unwrap';
  enabled: boolean;
  restrictions: string[];
}

export interface KeyMetadata {
  version: string;
  source: string;
  protection: string;
  backup: boolean;
  rotation: boolean;
  compliance: string[];
}

export interface EncryptionPolicy {
  id: string;
  name: string;
  type: 'data_at_rest' | 'data_in_transit' | 'data_in_use';
  algorithms: string[];
  keyManagement: KeyManagementPolicy;
  compliance: CompliancePolicy;
  monitoring: MonitoringPolicy;
  enabled: boolean;
}

export interface KeyManagementPolicy {
  rotation: boolean;
  rotationInterval: number;
  backup: boolean;
  backupInterval: number;
  recovery: boolean;
  escrow: boolean;
  destruction: boolean;
  audit: boolean;
}

export interface CompliancePolicy {
  standards: string[];
  requirements: string[];
  reporting: boolean;
  validation: boolean;
  certification: boolean;
}

export interface MonitoringPolicy {
  enabled: boolean;
  events: string[];
  alerts: boolean;
  logging: boolean;
  metrics: boolean;
}

export type EncryptionStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface EncryptionMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTime: number;
  errorRate: number;
  keyUsage: Record<string, number>;
  algorithmUsage: Record<string, number>;
  performance: PerformanceMetrics;
}

export interface PerformanceMetrics {
  throughput: number;
  latency: number;
  cpuUsage: number;
  memoryUsage: number;
  queueSize: number;
}

// Tipos para auditoría
export interface IAuditManager {
  id: string;
  name: string;
  events: AuditEvent[];
  policies: AuditPolicy[];
  storage: AuditStorage;
  analysis: AuditAnalysis;
  reporting: AuditReporting;
  status: AuditStatus;
  metrics: AuditMetrics;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  type: string;
  category: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  actor: string;
  target: string;
  action: string;
  result: 'success' | 'failure' | 'unknown';
  details: Record<string, any>;
  metadata: EventMetadata;
}

export interface EventMetadata {
  sessionId: string;
  correlationId: string;
  requestId: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  device: string;
  risk: number;
  tags: string[];
}

export interface AuditStorage {
  type: 'database' | 'file' | 'cloud' | 'distributed';
  config: StorageConfig;
  retention: RetentionPolicy;
  encryption: boolean;
  compression: boolean;
  indexing: boolean;
}

export interface StorageConfig {
  location: string;
  format: 'json' | 'xml' | 'binary' | 'custom';
  partitioning: boolean;
  replication: boolean;
  backup: boolean;
}

export interface RetentionPolicy {
  duration: number;
  unit: 'days' | 'months' | 'years';
  archive: boolean;
  delete: boolean;
  legalHold: boolean;
}

export interface AuditAnalysis {
  enabled: boolean;
  patterns: AnalysisPattern[];
  anomalies: AnomalyDetection;
  correlation: CorrelationAnalysis;
  machineLearning: MLConfig;
}

export interface AnalysisPattern {
  name: string;
  description: string;
  query: string;
  threshold: number;
  action: string;
  enabled: boolean;
}

export interface AnomalyDetection {
  enabled: boolean;
  algorithms: string[];
  sensitivity: number;
  trainingPeriod: number;
  alerting: boolean;
}

export interface CorrelationAnalysis {
  enabled: boolean;
  rules: CorrelationRule[];
  timeWindow: number;
  threshold: number;
}

export interface CorrelationRule {
  name: string;
  events: string[];
  conditions: string[];
  action: string;
  enabled: boolean;
}

export interface MLConfig {
  enabled: boolean;
  models: string[];
  training: boolean;
  prediction: boolean;
  accuracy: number;
}

export interface AuditReporting {
  enabled: boolean;
  reports: Report[];
  scheduling: ReportScheduling;
  delivery: ReportDelivery;
  compliance: ComplianceReporting;
}

export interface Report {
  id: string;
  name: string;
  type: string;
  template: string;
  parameters: Record<string, any>;
  schedule: string;
  recipients: string[];
  enabled: boolean;
}

export interface ReportScheduling {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  time: string;
  timezone: string;
  retry: boolean;
  maxRetries: number;
}

export interface ReportDelivery {
  method: 'email' | 'api' | 'file' | 'dashboard';
  config: Record<string, any>;
  encryption: boolean;
  compression: boolean;
}

export interface ComplianceReporting {
  enabled: boolean;
  standards: string[];
  templates: string[];
  validation: boolean;
  certification: boolean;
}

export type AuditStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface AuditMetrics {
  totalEvents: number;
  eventsPerSecond: number;
  storageSize: number;
  retentionCompliance: number;
  analysisAccuracy: number;
  reportDelivery: number;
  errorRate: number;
  performance: PerformanceMetrics;
}