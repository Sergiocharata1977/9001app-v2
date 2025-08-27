// Tipos para monitoreo avanzado de agentes
export interface IAgentMonitoring {
  id: string;
  agentId: string;
  timestamp: string;
  health: IAgentHealth;
  metrics: IAgentMetrics;
  alerts: IAlert[];
  events: IEvent[];
  performance: IPerformanceData;
  resources: IResourceUsage;
  status: MonitoringStatus;
}

export type MonitoringStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface IAlert {
  id: string;
  agentId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  actionRequired: boolean;
  metadata: AlertMetadata;
}

export type AlertType = 
  | 'health_degraded'
  | 'performance_degraded'
  | 'resource_exhausted'
  | 'communication_failed'
  | 'task_failed'
  | 'security_violation'
  | 'hierarchy_conflict'
  | 'permission_denied'
  | 'timeout'
  | 'error_rate_high'
  | 'latency_high'
  | 'throughput_low'
  | 'memory_high'
  | 'cpu_high'
  | 'disk_full'
  | 'network_issue'
  | 'connection_lost'
  | 'authentication_failed'
  | 'authorization_failed'
  | 'encryption_error';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AlertMetadata {
  source: string;
  category: string;
  tags: string[];
  context: Record<string, any>;
  recommendations: string[];
  autoResolve: boolean;
  escalation: boolean;
}

export interface IEvent {
  id: string;
  agentId: string;
  type: EventType;
  timestamp: string;
  data: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  correlationId?: string;
  metadata: EventMetadata;
}

export type EventType = 
  | 'agent_started'
  | 'agent_stopped'
  | 'task_started'
  | 'task_completed'
  | 'task_failed'
  | 'health_check'
  | 'resource_low'
  | 'error_occurred'
  | 'recovery_attempted'
  | 'role_changed'
  | 'permission_granted'
  | 'permission_denied'
  | 'hierarchy_updated'
  | 'communication_sent'
  | 'communication_received'
  | 'workflow_started'
  | 'workflow_completed'
  | 'workflow_failed'
  | 'backup_started'
  | 'backup_completed'
  | 'restore_started'
  | 'restore_completed'
  | 'maintenance_started'
  | 'maintenance_completed'
  | 'scaling_started'
  | 'scaling_completed'
  | 'failover_triggered'
  | 'recovery_started'
  | 'recovery_completed'
  | 'security_audit'
  | 'performance_test'
  | 'load_test'
  | 'stress_test'
  | 'integration_test'
  | 'unit_test'
  | 'e2e_test';

export interface EventMetadata {
  category: string;
  tags: string[];
  context: Record<string, any>;
  duration?: number;
  result?: any;
  error?: string;
}

export interface IPerformanceData {
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  efficiency: number;
  qualityScore: number;
  latency: number;
  bandwidth: number;
  concurrency: number;
  queueSize: number;
  processingTime: number;
  waitTime: number;
}

export interface IResourceUsage {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  connections: number;
  threads: number;
  processes: number;
  handles: number;
  sockets: number;
  files: number;
}

// Tipos para métricas del sistema
export interface ISystemMetrics {
  totalAgents: number;
  activeAgents: number;
  failedAgents: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageResponseTime: number;
  systemHealth: number;
  resourceUtilization: IResourceUtilization;
  performanceMetrics: IPerformanceMetrics;
  securityMetrics: ISecurityMetrics;
  communicationMetrics: ICommunicationMetrics;
  workflowMetrics: IWorkflowMetrics;
  hierarchyMetrics: IHierarchyMetrics;
}

export interface IResourceUtilization {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  connections: number;
  threads: number;
  processes: number;
  handles: number;
  sockets: number;
  files: number;
}

export interface IPerformanceMetrics {
  throughput: number;
  latency: number;
  errorRate: number;
  availability: number;
  efficiency: number;
  qualityScore: number;
  responseTime: number;
  processingTime: number;
  waitTime: number;
  queueSize: number;
  concurrency: number;
  bandwidth: number;
}

export interface ISecurityMetrics {
  authenticationSuccess: number;
  authenticationFailures: number;
  authorizationSuccess: number;
  authorizationFailures: number;
  securityViolations: number;
  encryptionUsage: number;
  auditEvents: number;
  failedLogins: number;
  blockedRequests: number;
  suspiciousActivities: number;
  policyViolations: number;
  dataBreaches: number;
}

export interface ICommunicationMetrics {
  messagesSent: number;
  messagesReceived: number;
  messagesFailed: number;
  averageLatency: number;
  bandwidthUsage: number;
  connectionCount: number;
  errorRate: number;
  throughput: number;
  queueSize: number;
  retryCount: number;
  timeoutCount: number;
  protocolUsage: Record<string, number>;
}

export interface IWorkflowMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  averageWorkflowDuration: number;
  workflowSuccessRate: number;
  taskCompletionRate: number;
  parallelExecutionRate: number;
  rollbackCount: number;
  recoveryCount: number;
}

export interface IHierarchyMetrics {
  totalHierarchies: number;
  activeHierarchies: number;
  failedHierarchies: number;
  totalLevels: number;
  averageAgentsPerLevel: number;
  hierarchyDepth: number;
  coordinationEfficiency: number;
  loadDistribution: number;
  failoverEvents: number;
  scalingEvents: number;
}

// Tipos para reportes
export interface IPerformanceReport {
  id: string;
  agentId: string;
  timestamp: string;
  period: string;
  metrics: IPerformanceData;
  trends: PerformanceTrend[];
  recommendations: string[];
  status: ReportStatus;
}

export interface PerformanceTrend {
  metric: string;
  value: number;
  change: number;
  direction: 'increasing' | 'decreasing' | 'stable';
  significance: 'low' | 'medium' | 'high';
}

export type ReportStatus = 'draft' | 'generated' | 'delivered' | 'archived';

export interface IHealthReport {
  id: string;
  agentId: string;
  timestamp: string;
  health: IAgentHealth;
  checks: HealthCheck[];
  issues: HealthIssue[];
  recommendations: string[];
  status: ReportStatus;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  timestamp: string;
  duration: number;
  details: Record<string, any>;
}

export interface HealthIssue {
  type: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  resolved: boolean;
  resolution?: string;
}

export interface IErrorReport {
  id: string;
  agentId: string;
  timestamp: string;
  errors: ErrorEntry[];
  patterns: ErrorPattern[];
  impact: ErrorImpact;
  recommendations: string[];
  status: ReportStatus;
}

export interface ErrorEntry {
  id: string;
  type: string;
  message: string;
  stack?: string;
  timestamp: string;
  context: Record<string, any>;
  severity: AlertSeverity;
  resolved: boolean;
}

export interface ErrorPattern {
  type: string;
  count: number;
  frequency: number;
  firstOccurrence: string;
  lastOccurrence: string;
  commonContext: Record<string, any>;
}

export interface ErrorImpact {
  affectedAgents: number;
  affectedTasks: number;
  affectedWorkflows: number;
  downtime: number;
  performanceDegradation: number;
  userImpact: number;
}

export interface IMetricsReport {
  id: string;
  agentId: string;
  timestamp: string;
  metrics: IAgentMetrics;
  analysis: MetricsAnalysis;
  trends: MetricsTrend[];
  recommendations: string[];
  status: ReportStatus;
}

export interface MetricsAnalysis {
  summary: string;
  highlights: string[];
  concerns: string[];
  improvements: string[];
  score: number;
}

export interface MetricsTrend {
  metric: string;
  values: number[];
  timestamps: string[];
  trend: 'up' | 'down' | 'stable';
  change: number;
  significance: 'low' | 'medium' | 'high';
}

// Tipos para visualizaciones
export interface IAgentMap {
  id: string;
  name: string;
  agents: AgentNode[];
  connections: AgentConnection[];
  hierarchies: HierarchyNode[];
  layout: MapLayout;
  filters: MapFilter[];
  status: MapStatus;
}

export interface AgentNode {
  id: string;
  name: string;
  type: string;
  level: string;
  status: string;
  position: Position;
  metrics: NodeMetrics;
  health: NodeHealth;
}

export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface NodeMetrics {
  load: number;
  performance: number;
  errors: number;
  uptime: number;
}

export interface NodeHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number;
  lastCheck: string;
}

export interface AgentConnection {
  from: string;
  to: string;
  type: string;
  strength: number;
  status: string;
  metrics: ConnectionMetrics;
}

export interface ConnectionMetrics {
  latency: number;
  throughput: number;
  errors: number;
  reliability: number;
}

export interface HierarchyNode {
  id: string;
  name: string;
  level: string;
  agents: string[];
  children: string[];
  status: string;
  metrics: HierarchyNodeMetrics;
}

export interface HierarchyNodeMetrics {
  totalAgents: number;
  activeAgents: number;
  load: number;
  efficiency: number;
}

export interface MapLayout {
  type: 'hierarchical' | 'force_directed' | 'circular' | 'grid' | 'custom';
  config: Record<string, any>;
  autoLayout: boolean;
}

export interface MapFilter {
  type: string;
  field: string;
  value: any;
  operator: 'equals' | 'contains' | 'regex' | 'range';
  enabled: boolean;
}

export type MapStatus = 'loading' | 'ready' | 'error' | 'updating';

export interface IPerformanceChart {
  id: string;
  name: string;
  type: ChartType;
  data: ChartData[];
  config: ChartConfig;
  filters: ChartFilter[];
  status: ChartStatus;
}

export type ChartType = 
  | 'line'
  | 'bar'
  | 'area'
  | 'pie'
  | 'scatter'
  | 'heatmap'
  | 'gauge'
  | 'radar'
  | 'funnel'
  | 'tree'
  | 'network'
  | 'timeline';

export interface ChartData {
  timestamp: string;
  values: Record<string, number>;
  metadata: Record<string, any>;
}

export interface ChartConfig {
  title: string;
  description: string;
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  series: SeriesConfig[];
  colors: string[];
  animations: boolean;
  responsive: boolean;
}

export interface AxisConfig {
  label: string;
  type: 'linear' | 'log' | 'time' | 'category';
  format?: string;
  min?: number;
  max?: number;
  ticks?: number;
}

export interface SeriesConfig {
  name: string;
  type: string;
  color: string;
  visible: boolean;
  config: Record<string, any>;
}

export interface ChartFilter {
  field: string;
  value: any;
  operator: 'equals' | 'contains' | 'regex' | 'range';
  enabled: boolean;
}

export type ChartStatus = 'loading' | 'ready' | 'error' | 'updating';

export interface IHealthDashboard {
  id: string;
  name: string;
  agents: DashboardAgent[];
  metrics: DashboardMetrics;
  alerts: DashboardAlert[];
  status: DashboardStatus;
  layout: DashboardLayout;
}

export interface DashboardAgent {
  id: string;
  name: string;
  type: string;
  status: string;
  health: number;
  lastUpdate: string;
  metrics: AgentDashboardMetrics;
}

export interface AgentDashboardMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  errors: number;
  uptime: number;
}

export interface DashboardMetrics {
  totalAgents: number;
  healthyAgents: number;
  degradedAgents: number;
  unhealthyAgents: number;
  systemHealth: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
}

export interface DashboardAlert {
  id: string;
  type: string;
  severity: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export type DashboardStatus = 'loading' | 'ready' | 'error' | 'updating';

export interface DashboardLayout {
  type: 'grid' | 'flexible' | 'custom';
  columns: number;
  rows: number;
  widgets: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: Record<string, any>;
  data: any;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface IMetricsGraph {
  id: string;
  name: string;
  type: GraphType;
  nodes: GraphNode[];
  edges: GraphEdge[];
  metrics: GraphMetrics;
  config: GraphConfig;
  status: GraphStatus;
}

export type GraphType = 
  | 'dependency'
  | 'communication'
  | 'workflow'
  | 'hierarchy'
  | 'performance'
  | 'resource'
  | 'security'
  | 'custom';

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  data: any;
  position: Position;
  metrics: NodeMetrics;
  status: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  data: any;
  metrics: EdgeMetrics;
  status: string;
}

export interface EdgeMetrics {
  weight: number;
  capacity: number;
  utilization: number;
  reliability: number;
}

export interface GraphMetrics {
  totalNodes: number;
  totalEdges: number;
  averageDegree: number;
  density: number;
  diameter: number;
  clustering: number;
}

export interface GraphConfig {
  layout: GraphLayout;
  styling: GraphStyling;
  interactions: GraphInteractions;
  animations: boolean;
  responsive: boolean;
}

export interface GraphLayout {
  type: 'force' | 'hierarchical' | 'circular' | 'grid' | 'custom';
  config: Record<string, any>;
  autoLayout: boolean;
}

export interface GraphStyling {
  nodeColors: Record<string, string>;
  edgeColors: Record<string, string>;
  nodeSizes: Record<string, number>;
  edgeWidths: Record<string, number>;
  labels: boolean;
  tooltips: boolean;
}

export interface GraphInteractions {
  zoom: boolean;
  pan: boolean;
  select: boolean;
  drag: boolean;
  hover: boolean;
  click: boolean;
}

export type GraphStatus = 'loading' | 'ready' | 'error' | 'updating';