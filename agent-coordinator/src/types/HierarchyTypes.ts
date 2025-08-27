// Tipos para jerarquía multi-nivel de agentes
export interface IAgentHierarchy {
  id: string;
  name: string;
  level: HierarchyLevel;
  type: HierarchyType;
  agents: IAgent[];
  parent?: IAgentHierarchy;
  children: IAgentHierarchy[];
  coordinator: IAgent;
  status: HierarchyStatus;
  load: number;
  capacity: number;
  config: HierarchyConfig;
  metrics: HierarchyMetrics;
  policies: HierarchyPolicies;
  createdAt: string;
  updatedAt: string;
}

export type HierarchyLevel = 
  | 'level_1' // Super Coordinador
  | 'level_2' // Coordinadores de Área
  | 'level_3'; // Agentes Especializados

export type HierarchyType = 
  | 'super_coordinator'
  | 'area_coordinator'
  | 'specialized_group'
  | 'task_group'
  | 'service_group'
  | 'domain_group'
  | 'functional_group'
  | 'geographic_group'
  | 'temporal_group'
  | 'priority_group';

export type HierarchyStatus = 
  | 'active'
  | 'inactive'
  | 'overloaded'
  | 'maintenance'
  | 'recovering'
  | 'scaling'
  | 'migrating'
  | 'backup'
  | 'restore';

export interface HierarchyConfig {
  maxAgents: number;
  maxChildren: number;
  loadBalancing: boolean;
  failover: boolean;
  autoScaling: boolean;
  monitoring: boolean;
  backup: boolean;
  recovery: boolean;
  security: SecurityConfig;
  communication: CommunicationConfig;
  resourceManagement: ResourceManagementConfig;
}

export interface SecurityConfig {
  authentication: boolean;
  authorization: boolean;
  encryption: boolean;
  audit: boolean;
  isolation: boolean;
  accessControl: AccessControlConfig;
}

export interface AccessControlConfig {
  type: 'role_based' | 'attribute_based' | 'policy_based' | 'identity_based';
  policies: AccessPolicy[];
  roles: Role[];
  permissions: Permission[];
  constraints: Constraint[];
}

export interface AccessPolicy {
  id: string;
  name: string;
  type: 'allow' | 'deny' | 'require';
  subjects: string[];
  resources: string[];
  actions: string[];
  conditions: Condition[];
  priority: number;
  enabled: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  constraints: Constraint[];
  hierarchy: string[];
  metadata: Record<string, any>;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions: Condition[];
  scope: 'global' | 'hierarchy' | 'agent' | 'task';
}

export interface Condition {
  type: 'time' | 'location' | 'resource' | 'state' | 'custom';
  expression: string;
  parameters: Record<string, any>;
  operator: 'and' | 'or' | 'not';
}

export interface Constraint {
  type: 'resource' | 'time' | 'location' | 'state' | 'custom';
  expression: string;
  parameters: Record<string, any>;
  enforcement: 'strict' | 'flexible' | 'advisory';
}

export interface CommunicationConfig {
  protocols: CommunicationProtocol[];
  channels: CommunicationChannel[];
  routing: RoutingConfig;
  security: CommunicationSecurityConfig;
  monitoring: CommunicationMonitoringConfig;
}

export interface CommunicationProtocol {
  name: string;
  version: string;
  enabled: boolean;
  config: Record<string, any>;
  security: ProtocolSecurityConfig;
}

export interface CommunicationChannel {
  id: string;
  name: string;
  type: ChannelType;
  protocol: string;
  agents: string[];
  config: ChannelConfig;
  status: ChannelStatus;
}

export type ChannelType = 
  | 'direct'
  | 'broadcast'
  | 'multicast'
  | 'anycast'
  | 'queue'
  | 'pubsub'
  | 'stream'
  | 'rpc';

export interface ChannelConfig {
  maxConnections: number;
  maxMessages: number;
  timeout: number;
  retryAttempts: number;
  encryption: boolean;
  compression: boolean;
  loadBalancing: boolean;
  failover: boolean;
  monitoring: boolean;
}

export type ChannelStatus = 
  | 'active'
  | 'inactive'
  | 'connecting'
  | 'disconnected'
  | 'error'
  | 'maintenance';

export interface RoutingConfig {
  strategy: RoutingStrategy;
  rules: RoutingRule[];
  loadBalancing: LoadBalancingConfig;
  failover: FailoverConfig;
  monitoring: RoutingMonitoringConfig;
}

export type RoutingStrategy = 
  | 'direct'
  | 'hierarchical'
  | 'peer_to_peer'
  | 'hub_and_spoke'
  | 'mesh'
  | 'tree'
  | 'ring'
  | 'star';

export interface RoutingRule {
  id: string;
  name: string;
  condition: RoutingCondition;
  action: RoutingAction;
  priority: number;
  enabled: boolean;
}

export interface RoutingCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex' | 'range' | 'exists';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface RoutingAction {
  type: 'route' | 'transform' | 'filter' | 'duplicate' | 'delay';
  target: string;
  config: Record<string, any>;
}

export interface LoadBalancingConfig {
  enabled: boolean;
  algorithm: LoadBalancingAlgorithm;
  healthCheck: boolean;
  sessionAffinity: boolean;
  weights: Record<string, number>;
}

export type LoadBalancingAlgorithm = 
  | 'round_robin'
  | 'least_connections'
  | 'weighted_round_robin'
  | 'least_response_time'
  | 'ip_hash'
  | 'url_hash'
  | 'random'
  | 'custom';

export interface FailoverConfig {
  enabled: boolean;
  strategy: FailoverStrategy;
  healthCheck: boolean;
  timeout: number;
  maxAttempts: number;
  recovery: RecoveryConfig;
}

export type FailoverStrategy = 
  | 'active_passive'
  | 'active_active'
  | 'n_plus_1'
  | 'geographic'
  | 'load_based'
  | 'priority_based';

export interface RecoveryConfig {
  automatic: boolean;
  timeout: number;
  maxAttempts: number;
  strategy: RecoveryStrategy;
  validation: boolean;
}

export type RecoveryStrategy = 
  | 'restart'
  | 'redeploy'
  | 'migrate'
  | 'restore'
  | 'rebuild'
  | 'custom';

export interface CommunicationSecurityConfig {
  encryption: EncryptionConfig;
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  audit: AuditConfig;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  keySize: number;
  mode: string;
  padding: string;
  keyManagement: KeyManagementConfig;
}

export interface KeyManagementConfig {
  type: 'manual' | 'automatic' | 'hybrid';
  rotation: boolean;
  rotationInterval: number;
  storage: string;
  backup: boolean;
}

export interface AuthenticationConfig {
  enabled: boolean;
  method: AuthenticationMethod;
  timeout: number;
  retryAttempts: number;
  multiFactor: boolean;
  sessionManagement: SessionManagementConfig;
}

export type AuthenticationMethod = 
  | 'none'
  | 'token'
  | 'certificate'
  | 'biometric'
  | 'multi_factor'
  | 'oauth'
  | 'saml'
  | 'ldap'
  | 'kerberos';

export interface SessionManagementConfig {
  enabled: boolean;
  timeout: number;
  maxSessions: number;
  storage: string;
  cleanup: boolean;
}

export interface AuthorizationConfig {
  enabled: boolean;
  model: AuthorizationModel;
  policies: AuthorizationPolicy[];
  roles: AuthorizationRole[];
  permissions: AuthorizationPermission[];
}

export type AuthorizationModel = 
  | 'role_based'
  | 'attribute_based'
  | 'policy_based'
  | 'identity_based'
  | 'hybrid';

export interface AuthorizationPolicy {
  id: string;
  name: string;
  type: 'allow' | 'deny' | 'require';
  subjects: string[];
  resources: string[];
  actions: string[];
  conditions: AuthorizationCondition[];
  priority: number;
  enabled: boolean;
}

export interface AuthorizationCondition {
  type: 'time' | 'location' | 'resource' | 'state' | 'custom';
  expression: string;
  parameters: Record<string, any>;
  operator: 'and' | 'or' | 'not';
}

export interface AuthorizationRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  constraints: AuthorizationConstraint[];
  hierarchy: string[];
  metadata: Record<string, any>;
}

export interface AuthorizationPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions: AuthorizationCondition[];
  scope: 'global' | 'hierarchy' | 'agent' | 'task';
}

export interface AuthorizationConstraint {
  type: 'resource' | 'time' | 'location' | 'state' | 'custom';
  expression: string;
  parameters: Record<string, any>;
  enforcement: 'strict' | 'flexible' | 'advisory';
}

export interface AuditConfig {
  enabled: boolean;
  events: AuditEvent[];
  storage: string;
  retention: number;
  encryption: boolean;
  integrity: boolean;
}

export interface AuditEvent {
  type: string;
  enabled: boolean;
  level: 'info' | 'warning' | 'error' | 'critical';
  details: boolean;
}

export interface CommunicationMonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alerts: CommunicationAlert[];
  logging: CommunicationLoggingConfig;
  tracing: CommunicationTracingConfig;
}

export interface CommunicationAlert {
  id: string;
  type: string;
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: string;
  recipients: string[];
}

export interface CommunicationLoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text' | 'structured';
  destination: string[];
  retention: number;
}

export interface CommunicationTracingConfig {
  enabled: boolean;
  sampling: number;
  tags: Record<string, string>;
  baggage: Record<string, string>;
}

export interface RoutingMonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alerts: RoutingAlert[];
  logging: RoutingLoggingConfig;
}

export interface RoutingAlert {
  id: string;
  type: string;
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: string;
  recipients: string[];
}

export interface RoutingLoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text' | 'structured';
  destination: string[];
  retention: number;
}

export interface ResourceManagementConfig {
  allocation: ResourceAllocationConfig;
  monitoring: ResourceMonitoringConfig;
  optimization: ResourceOptimizationConfig;
  backup: ResourceBackupConfig;
  recovery: ResourceRecoveryConfig;
}

export interface ResourceAllocationConfig {
  strategy: AllocationStrategy;
  policies: AllocationPolicy[];
  constraints: ResourceConstraint[];
  optimization: boolean;
}

export type AllocationStrategy = 
  | 'static'
  | 'dynamic'
  | 'demand_based'
  | 'priority_based'
  | 'fair_share'
  | 'custom';

export interface AllocationPolicy {
  id: string;
  name: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'custom';
  rules: AllocationRule[];
  priority: number;
  enabled: boolean;
}

export interface AllocationRule {
  condition: string;
  action: string;
  parameters: Record<string, any>;
  priority: number;
}

export interface ResourceConstraint {
  type: 'hard' | 'soft' | 'advisory';
  resource: string;
  limit: number;
  unit: string;
  enforcement: 'strict' | 'flexible' | 'advisory';
}

export interface ResourceMonitoringConfig {
  enabled: boolean;
  metrics: string[];
  thresholds: ResourceThreshold[];
  alerts: ResourceAlert[];
  logging: ResourceLoggingConfig;
}

export interface ResourceThreshold {
  resource: string;
  warning: number;
  critical: number;
  unit: string;
  action: string;
}

export interface ResourceAlert {
  id: string;
  type: string;
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: string;
  recipients: string[];
}

export interface ResourceLoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text' | 'structured';
  destination: string[];
  retention: number;
}

export interface ResourceOptimizationConfig {
  enabled: boolean;
  strategy: OptimizationStrategy;
  algorithms: OptimizationAlgorithm[];
  constraints: OptimizationConstraint[];
  monitoring: boolean;
}

export type OptimizationStrategy = 
  | 'performance'
  | 'cost'
  | 'energy'
  | 'quality'
  | 'balanced'
  | 'custom';

export interface OptimizationAlgorithm {
  name: string;
  type: string;
  parameters: Record<string, any>;
  enabled: boolean;
  priority: number;
}

export interface OptimizationConstraint {
  type: 'resource' | 'performance' | 'cost' | 'quality' | 'custom';
  expression: string;
  parameters: Record<string, any>;
  enforcement: 'strict' | 'flexible' | 'advisory';
}

export interface ResourceBackupConfig {
  enabled: boolean;
  strategy: BackupStrategy;
  schedule: BackupSchedule;
  retention: BackupRetention;
  encryption: boolean;
  compression: boolean;
}

export type BackupStrategy = 
  | 'full'
  | 'incremental'
  | 'differential'
  | 'snapshot'
  | 'continuous'
  | 'hybrid';

export interface BackupSchedule {
  type: 'manual' | 'scheduled' | 'event_based' | 'continuous';
  interval: number;
  time: string;
  days: string[];
  events: string[];
}

export interface BackupRetention {
  copies: number;
  days: number;
  months: number;
  years: number;
  policy: 'delete' | 'archive' | 'compress';
}

export interface ResourceRecoveryConfig {
  enabled: boolean;
  strategy: RecoveryStrategy;
  timeout: number;
  maxAttempts: number;
  validation: boolean;
  testing: boolean;
}

export interface HierarchyMetrics {
  totalAgents: number;
  activeAgents: number;
  failedAgents: number;
  totalChildren: number;
  activeChildren: number;
  failedChildren: number;
  load: number;
  capacity: number;
  utilization: number;
  performance: PerformanceMetrics;
  communication: CommunicationMetrics;
  security: SecurityMetrics;
  resource: ResourceMetrics;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  efficiency: number;
  qualityScore: number;
}

export interface CommunicationMetrics {
  messagesSent: number;
  messagesReceived: number;
  messagesFailed: number;
  averageLatency: number;
  bandwidthUsage: number;
  connectionCount: number;
  errorRate: number;
  throughput: number;
}

export interface SecurityMetrics {
  authenticationSuccess: number;
  authenticationFailures: number;
  authorizationSuccess: number;
  authorizationFailures: number;
  securityViolations: number;
  encryptionUsage: number;
  auditEvents: number;
}

export interface ResourceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
  connectionCount: number;
  threadCount: number;
  queueSize: number;
  errorCount: number;
}

export interface HierarchyPolicies {
  scaling: ScalingPolicy;
  failover: FailoverPolicy;
  backup: BackupPolicy;
  recovery: RecoveryPolicy;
  security: SecurityPolicy;
  monitoring: MonitoringPolicy;
  communication: CommunicationPolicy;
  resource: ResourcePolicy;
}

export interface ScalingPolicy {
  enabled: boolean;
  type: ScalingType;
  triggers: ScalingTrigger[];
  actions: ScalingAction[];
  constraints: ScalingConstraint[];
  monitoring: boolean;
}

export type ScalingType = 
  | 'horizontal'
  | 'vertical'
  | 'auto'
  | 'manual'
  | 'hybrid';

export interface ScalingTrigger {
  type: 'load' | 'time' | 'event' | 'metric' | 'custom';
  condition: string;
  threshold: number;
  duration: number;
  action: string;
}

export interface ScalingAction {
  type: 'add' | 'remove' | 'resize' | 'migrate' | 'custom';
  target: string;
  parameters: Record<string, any>;
  validation: boolean;
}

export interface ScalingConstraint {
  type: 'resource' | 'cost' | 'performance' | 'quality' | 'custom';
  expression: string;
  parameters: Record<string, any>;
  enforcement: 'strict' | 'flexible' | 'advisory';
}

export interface FailoverPolicy {
  enabled: boolean;
  strategy: FailoverStrategy;
  healthCheck: boolean;
  timeout: number;
  maxAttempts: number;
  recovery: RecoveryConfig;
  monitoring: boolean;
}

export interface BackupPolicy {
  enabled: boolean;
  strategy: BackupStrategy;
  schedule: BackupSchedule;
  retention: BackupRetention;
  encryption: boolean;
  compression: boolean;
  validation: boolean;
}

export interface RecoveryPolicy {
  enabled: boolean;
  strategy: RecoveryStrategy;
  timeout: number;
  maxAttempts: number;
  validation: boolean;
  testing: boolean;
  monitoring: boolean;
}

export interface SecurityPolicy {
  enabled: boolean;
  authentication: boolean;
  authorization: boolean;
  encryption: boolean;
  audit: boolean;
  isolation: boolean;
  monitoring: boolean;
}

export interface MonitoringPolicy {
  enabled: boolean;
  metrics: string[];
  alerts: MonitoringAlert[];
  logging: boolean;
  tracing: boolean;
  healthChecks: boolean;
  performanceMonitoring: boolean;
  resourceMonitoring: boolean;
}

export interface MonitoringAlert {
  id: string;
  type: string;
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: string;
  recipients: string[];
}

export interface CommunicationPolicy {
  enabled: boolean;
  protocols: string[];
  channels: string[];
  routing: boolean;
  loadBalancing: boolean;
  failover: boolean;
  security: boolean;
  monitoring: boolean;
}

export interface ResourcePolicy {
  enabled: boolean;
  allocation: boolean;
  monitoring: boolean;
  optimization: boolean;
  backup: boolean;
  recovery: boolean;
  constraints: boolean;
}