// Tipos para comunicación entre agentes
export interface IMessage {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  type: MessageType;
  protocol: CommunicationProtocol;
  payload: any;
  priority: MessagePriority;
  timestamp: string;
  correlationId?: string;
  responseRequired: boolean;
  timeout: number;
  retries: number;
  status: MessageStatus;
  metadata: MessageMetadata;
}

export type MessageType = 
  | 'task_assignment'
  | 'task_completion'
  | 'task_failure'
  | 'health_check'
  | 'status_update'
  | 'resource_request'
  | 'error_notification'
  | 'coordination_signal'
  | 'hierarchy_update'
  | 'role_change'
  | 'permission_request'
  | 'recovery_signal'
  | 'performance_alert'
  | 'security_alert'
  | 'workflow_start'
  | 'workflow_complete'
  | 'workflow_fail'
  | 'backup_request'
  | 'restore_request'
  | 'maintenance_notice'
  | 'system_broadcast'
  | 'heartbeat'
  | 'ping'
  | 'pong';

export type CommunicationProtocol = 
  | 'http'
  | 'websocket'
  | 'redis'
  | 'rabbitmq'
  | 'kafka'
  | 'grpc'
  | 'internal'
  | 'tcp'
  | 'udp'
  | 'mqtt';

export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

export type MessageStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'acknowledged'
  | 'failed'
  | 'timeout'
  | 'cancelled'
  | 'retrying';

export interface MessageMetadata {
  version: string;
  encryption: boolean;
  compression: boolean;
  checksum: string;
  size: number;
  routing: MessageRouting;
  security: MessageSecurity;
  tracking: MessageTracking;
}

export interface MessageRouting {
  path: string[];
  hops: number;
  maxHops: number;
  routingStrategy: 'direct' | 'broadcast' | 'multicast' | 'anycast';
  loadBalancing: boolean;
}

export interface MessageSecurity {
  encrypted: boolean;
  signed: boolean;
  authenticated: boolean;
  authorizationRequired: boolean;
  auditTrail: boolean;
}

export interface MessageTracking {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  tags: Record<string, string>;
  metrics: MessageMetrics;
}

export interface MessageMetrics {
  sendTime: number;
  receiveTime?: number;
  processingTime?: number;
  responseTime?: number;
  latency: number;
  bandwidth: number;
}

// Tipos para eventos de comunicación
export interface ICommunicationEvent {
  id: string;
  type: CommunicationEventType;
  timestamp: string;
  agentId: string;
  messageId: string;
  data: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  correlationId?: string;
}

export type CommunicationEventType = 
  | 'message_sent'
  | 'message_received'
  | 'message_delivered'
  | 'message_acknowledged'
  | 'message_failed'
  | 'message_timeout'
  | 'message_retry'
  | 'connection_established'
  | 'connection_lost'
  | 'connection_failed'
  | 'protocol_error'
  | 'authentication_failed'
  | 'authorization_failed'
  | 'encryption_error'
  | 'decryption_error'
  | 'routing_error'
  | 'load_balancing_error'
  | 'queue_overflow'
  | 'bandwidth_exceeded'
  | 'latency_high';

// Tipos para canales de comunicación
export interface ICommunicationChannel {
  id: string;
  name: string;
  type: ChannelType;
  protocol: CommunicationProtocol;
  status: ChannelStatus;
  agents: string[];
  config: ChannelConfig;
  metrics: ChannelMetrics;
  createdAt: string;
  updatedAt: string;
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

export type ChannelStatus = 
  | 'active'
  | 'inactive'
  | 'connecting'
  | 'disconnected'
  | 'error'
  | 'maintenance';

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

export interface ChannelMetrics {
  messagesSent: number;
  messagesReceived: number;
  messagesFailed: number;
  averageLatency: number;
  bandwidthUsage: number;
  connectionCount: number;
  errorRate: number;
  throughput: number;
}

// Tipos para adaptadores de comunicación
export interface ICommunicationAdapter {
  id: string;
  name: string;
  protocol: CommunicationProtocol;
  version: string;
  status: AdapterStatus;
  config: AdapterConfig;
  capabilities: AdapterCapabilities;
  metrics: AdapterMetrics;
}

export type AdapterStatus = 
  | 'active'
  | 'inactive'
  | 'initializing'
  | 'error'
  | 'maintenance';

export interface AdapterConfig {
  host: string;
  port: number;
  credentials: AdapterCredentials;
  timeout: number;
  retryAttempts: number;
  connectionPool: number;
  ssl: boolean;
  compression: boolean;
}

export interface AdapterCredentials {
  username?: string;
  password?: string;
  token?: string;
  certificate?: string;
  key?: string;
}

export interface AdapterCapabilities {
  supportsEncryption: boolean;
  supportsCompression: boolean;
  supportsLoadBalancing: boolean;
  supportsFailover: boolean;
  supportsMonitoring: boolean;
  maxMessageSize: number;
  maxConnections: number;
  supportedProtocols: CommunicationProtocol[];
}

export interface AdapterMetrics {
  connections: number;
  messagesSent: number;
  messagesReceived: number;
  errors: number;
  latency: number;
  bandwidth: number;
  uptime: number;
}

// Tipos para colas de mensajes
export interface IMessageQueue {
  id: string;
  name: string;
  type: QueueType;
  status: QueueStatus;
  config: QueueConfig;
  metrics: QueueMetrics;
  messages: IMessage[];
}

export type QueueType = 
  | 'fifo'
  | 'lifo'
  | 'priority'
  | 'round_robin'
  | 'weighted'
  | 'dead_letter';

export type QueueStatus = 
  | 'active'
  | 'paused'
  | 'full'
  | 'empty'
  | 'error'
  | 'maintenance';

export interface QueueConfig {
  maxSize: number;
  maxMessages: number;
  timeout: number;
  retryAttempts: number;
  deadLetterQueue?: string;
  priorityLevels: number;
  persistence: boolean;
  monitoring: boolean;
}

export interface QueueMetrics {
  size: number;
  messageCount: number;
  enqueueRate: number;
  dequeueRate: number;
  averageWaitTime: number;
  maxWaitTime: number;
  errorRate: number;
  throughput: number;
}

// Tipos para protocolos de comunicación
export interface ICommunicationProtocol {
  name: string;
  version: string;
  type: ProtocolType;
  features: ProtocolFeature[];
  config: ProtocolConfig;
  handlers: ProtocolHandlers;
}

export type ProtocolType = 
  | 'request_response'
  | 'publish_subscribe'
  | 'stream'
  | 'message_queue'
  | 'rpc'
  | 'event_driven';

export interface ProtocolFeature {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface ProtocolConfig {
  timeout: number;
  retryAttempts: number;
  compression: boolean;
  encryption: boolean;
  authentication: boolean;
  authorization: boolean;
  monitoring: boolean;
}

export interface ProtocolHandlers {
  onMessage: (message: IMessage) => Promise<void>;
  onError: (error: Error) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onTimeout: (messageId: string) => void;
}

// Tipos para enrutamiento de mensajes
export interface IMessageRouter {
  id: string;
  name: string;
  type: RouterType;
  rules: RoutingRule[];
  config: RouterConfig;
  metrics: RouterMetrics;
}

export type RouterType = 
  | 'direct'
  | 'topic'
  | 'header'
  | 'content'
  | 'load_balancer'
  | 'failover'
  | 'multicast';

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

export interface RouterConfig {
  defaultRoute: string;
  timeout: number;
  retryAttempts: number;
  loadBalancing: boolean;
  failover: boolean;
  monitoring: boolean;
}

export interface RouterMetrics {
  messagesRouted: number;
  messagesFiltered: number;
  messagesTransformed: number;
  routingErrors: number;
  averageRoutingTime: number;
  loadBalancingHits: number;
  failoverEvents: number;
}