import axios from 'axios';

const AGENT_COORDINATOR_BASE_URL = 'http://localhost:8000';

export interface AgentStatus {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused' | 'recovering';
  health: {
    isHealthy: boolean;
    lastCheck: string;
    uptime: number;
    errorCount: number;
    successRate: number;
    responseTime: number;
  };
  metrics: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    lastExecutionTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  capabilities: string[];
}

export interface SystemMetrics {
  totalAgents: number;
  activeAgents: number;
  systemUptime: number;
  memoryUsage: any;
  timestamp: string;
}

export interface AgentLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  agentId: string;
}

export interface ExecutionResult {
  success: boolean;
  agentId: string;
  duration?: number;
  results?: any;
  error?: string;
}

class AgentService {
  private baseURL: string;

  constructor() {
    this.baseURL = AGENT_COORDINATOR_BASE_URL;
  }

  /**
   * Verificar si el sistema de agentes está disponible
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.warn('Agent Coordinator no está disponible:', error);
      return false;
    }
  }

  /**
   * Obtener estado de todos los agentes
   */
  async getAgentsStatus(): Promise<AgentStatus[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/agents`);
      return response.data.data || this.getMockAgentsStatus();
    } catch (error) {
      console.warn('Error obteniendo estado de agentes, usando datos mock:', error);
      return this.getMockAgentsStatus();
    }
  }

  /**
   * Obtener métricas del sistema
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const response = await axios.get(`${this.baseURL}/api/metrics`);
      return response.data.data || this.getMockSystemMetrics();
    } catch (error) {
      console.warn('Error obteniendo métricas del sistema, usando datos mock:', error);
      return this.getMockSystemMetrics();
    }
  }

  /**
   * Ejecutar un agente específico
   */
  async executeAgent(agentId: string): Promise<ExecutionResult> {
    try {
      const response = await axios.post(`${this.baseURL}/api/agents/${agentId}/execute`);
      return {
        success: true,
        agentId,
        results: response.data
      };
    } catch (error) {
      console.error(`Error ejecutando agente ${agentId}:`, error);
      return {
        success: false,
        agentId,
        error: error.message || 'Error desconocido'
      };
    }
  }

  /**
   * Detener un agente específico
   */
  async stopAgent(agentId: string): Promise<ExecutionResult> {
    try {
      const response = await axios.post(`${this.baseURL}/api/agents/${agentId}/stop`);
      return {
        success: true,
        agentId,
        results: response.data
      };
    } catch (error) {
      console.error(`Error deteniendo agente ${agentId}:`, error);
      return {
        success: false,
        agentId,
        error: error.message || 'Error desconocido'
      };
    }
  }

  /**
   * Ejecutar todos los agentes (migración completa)
   */
  async executeAllAgents(): Promise<ExecutionResult[]> {
    const agents = ['security', 'structure', 'typescript', 'api', 'mongodb'];
    const results: ExecutionResult[] = [];

    for (const agentId of agents) {
      try {
        const result = await this.executeAgent(agentId);
        results.push(result);
        
        // Esperar un poco entre ejecuciones para no sobrecargar
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        results.push({
          success: false,
          agentId,
          error: error.message || 'Error desconocido'
        });
      }
    }

    return results;
  }

  /**
   * Obtener logs del sistema
   */
  async getLogs(agentId?: string, limit: number = 100): Promise<AgentLog[]> {
    try {
      const params = new URLSearchParams();
      if (agentId) params.append('agentId', agentId);
      params.append('limit', limit.toString());

      const response = await axios.get(`${this.baseURL}/api/logs?${params}`);
      return response.data.data || this.getMockLogs();
    } catch (error) {
      console.warn('Error obteniendo logs, usando datos mock:', error);
      return this.getMockLogs();
    }
  }

  /**
   * Datos mock para cuando el sistema de agentes no está disponible
   */
  private getMockAgentsStatus(): AgentStatus[] {
    const baseMetrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    };

    const baseHealth = {
      isHealthy: true,
      lastCheck: new Date().toISOString(),
      uptime: 0,
      errorCount: 0,
      successRate: 100,
      responseTime: 0
    };

    return [
      {
        id: 'security-agent',
        name: 'Security Audit Agent',
        type: 'security',
        status: 'idle',
        health: baseHealth,
        metrics: baseMetrics,
        capabilities: ['security-audit', 'vulnerability-scan', 'dependency-check']
      },
      {
        id: 'structure-agent',
        name: 'Project Structure Agent',
        type: 'structure',
        status: 'idle',
        health: baseHealth,
        metrics: baseMetrics,
        capabilities: ['structure-analysis', 'code-organization', 'file-management']
      },
      {
        id: 'typescript-agent',
        name: 'TypeScript Migration Agent',
        type: 'typescript',
        status: 'idle',
        health: baseHealth,
        metrics: baseMetrics,
        capabilities: ['typescript-migration', 'type-checking', 'code-conversion']
      },
      {
        id: 'api-agent',
        name: 'API Optimization Agent',
        type: 'api',
        status: 'idle',
        health: baseHealth,
        metrics: baseMetrics,
        capabilities: ['api-analysis', 'endpoint-optimization', 'performance-monitoring']
      },
      {
        id: 'mongodb-agent',
        name: 'MongoDB Migration Agent',
        type: 'database',
        status: 'idle',
        health: baseHealth,
        metrics: baseMetrics,
        capabilities: ['database-migration', 'schema-optimization', 'data-validation']
      },
      {
        id: 'web-agent',
        name: 'Web Dashboard Agent',
        type: 'frontend',
        status: 'idle',
        health: baseHealth,
        metrics: baseMetrics,
        capabilities: ['web-dashboard', 'real-time-monitoring', 'agent-control']
      }
    ];
  }

  private getMockSystemMetrics(): SystemMetrics {
    return {
      totalAgents: 6,
      activeAgents: 0,
      systemUptime: 0,
      memoryUsage: {
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0
      },
      timestamp: new Date().toISOString()
    };
  }

  private getMockLogs(): AgentLog[] {
    return [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Sistema de agentes no disponible - usando modo mock',
        agentId: 'system'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'warn',
        message: 'Para activar los agentes, ejecute: cd agent-coordinator && npm start',
        agentId: 'system'
      }
    ];
  }

  /**
   * Crear conexión WebSocket para actualizaciones en tiempo real
   */
  createWebSocketConnection(callbacks: {
    onAgentStatusChange?: (data: any) => void;
    onSystemMetricsUpdate?: (data: any) => void;
    onLogUpdate?: (data: any) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
  }) {
    try {
      // Verificar si existe io en el objeto global
      if (typeof window !== 'undefined' && (window as any).io) {
        const socket = (window as any).io(this.baseURL);

        socket.on('connect', () => {
          console.log('Conectado al sistema de agentes');
          callbacks.onConnect?.();
        });

        socket.on('disconnect', () => {
          console.log('Desconectado del sistema de agentes');
          callbacks.onDisconnect?.();
        });

        socket.on('agents-status', (data: any) => {
          callbacks.onAgentStatusChange?.(data);
        });

        socket.on('system-metrics', (data: any) => {
          callbacks.onSystemMetricsUpdate?.(data);
        });

        socket.on('logs-update', (data: any) => {
          callbacks.onLogUpdate?.(data);
        });

        return socket;
      } else {
        console.warn('Socket.IO no está disponible');
        return null;
      }
    } catch (error) {
      console.warn('Error creando conexión WebSocket:', error);
      return null;
    }
  }
}

export const agentService = new AgentService();