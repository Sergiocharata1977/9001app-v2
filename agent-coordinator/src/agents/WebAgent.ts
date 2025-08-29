import { BaseAgent } from '../core/BaseAgent';
import { AgentConfig } from '../types/agent.types';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import cors from 'cors';

export class WebAgent extends BaseAgent {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private port: number = 8000;

  constructor(config: Partial<AgentConfig> = {}) {
    super(
      'web-agent',
      'Web Dashboard Agent',
      'frontend',
      {
        maxRetries: 3,
        timeout: 0, // Sin timeout para servidor web
        autoRestart: true,
        ...config
      }
    );

    this.capabilities = [
      'web-dashboard',
      'real-time-monitoring',
      'agent-control',
      'system-status'
    ];

    this.dependencies = [];
    this.priority = 'medium';

    // Inicializar métricas
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    };

    // Inicializar health
    this.health = {
      isHealthy: true,
      lastCheck: new Date().toISOString(),
      uptime: 0,
      errorCount: 0,
      successRate: 100,
      responseTime: 0
    };

    this.initializeWebServer();
  }

  /**
   * Inicializar servidor web
   */
  private initializeWebServer(): void {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  /**
   * Configurar middleware
   */
  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../../../web-dashboard')));
  }

  /**
   * Configurar rutas de la API
   */
  private setupRoutes(): void {
    // Ruta principal del dashboard
    this.app.get('/', (req, res) => {
      res.send(this.getDashboardHTML());
    });

    // API para obtener estado de agentes
    this.app.get('/api/agents', (req, res) => {
      res.json({
        success: true,
        data: this.getAgentsStatus()
      });
    });

    // API para ejecutar agente específico
    this.app.post('/api/agents/:agentId/execute', (req, res) => {
      const { agentId } = req.params;
      
      this.logger.info(`Ejecutando agente ${agentId} via API`);
      
      // Emitir evento para ejecutar agente
      this.emit('executeAgent', { agentId });
      
      res.json({
        success: true,
        message: `Agente ${agentId} iniciado`
      });
    });

    // API para detener agente
    this.app.post('/api/agents/:agentId/stop', (req, res) => {
      const { agentId } = req.params;
      
      this.logger.info(`Deteniendo agente ${agentId} via API`);
      
      this.emit('stopAgent', { agentId });
      
      res.json({
        success: true,
        message: `Agente ${agentId} detenido`
      });
    });

    // API para obtener logs
    this.app.get('/api/logs', (req, res) => {
      const { agentId, limit = 100 } = req.query;
      
      res.json({
        success: true,
        data: this.getLogs(agentId as string, parseInt(limit as string))
      });
    });

    // API para obtener métricas del sistema
    this.app.get('/api/metrics', (req, res) => {
      res.json({
        success: true,
        data: this.getSystemMetrics()
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime
      });
    });
  }

  /**
   * Configurar handlers de Socket.IO
   */
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      this.logger.info('Cliente conectado al dashboard');

      // Enviar estado inicial
      socket.emit('agents-status', this.getAgentsStatus());
      socket.emit('system-metrics', this.getSystemMetrics());

      // Manejar solicitudes de ejecución de agentes
      socket.on('execute-agent', (data) => {
        this.logger.info(`Ejecutando agente ${data.agentId} via Socket`);
        this.emit('executeAgent', data);
      });

      socket.on('stop-agent', (data) => {
        this.logger.info(`Deteniendo agente ${data.agentId} via Socket`);
        this.emit('stopAgent', data);
      });

      socket.on('get-logs', (data) => {
        socket.emit('logs-update', this.getLogs(data.agentId, data.limit));
      });

      socket.on('disconnect', () => {
        this.logger.info('Cliente desconectado del dashboard');
      });
    });
  }

  /**
   * Ejecutar agente web (iniciar servidor)
   */
  async run(): Promise<void> {
    this.logger.info('Iniciando servidor web del dashboard...');
    this.status = 'running';
    this.emit('statusChanged', { agentId: this.id, status: this.status });

    const startTime = Date.now();

    try {
      await new Promise<void>((resolve, reject) => {
        this.server.listen(this.port, () => {
          this.logger.info(`Dashboard web iniciado en puerto ${this.port}`);
          this.logger.info(`URL: http://localhost:${this.port}`);
          resolve();
        }).on('error', reject);
      });

      this.metrics.totalExecutions++;
      this.metrics.successfulExecutions++;
      this.metrics.lastExecutionTime = Date.now() - startTime;

      this.status = 'completed';
      
      this.emit('completed', { 
        agentId: this.id, 
        results: { 
          message: 'Servidor web iniciado correctamente',
          url: `http://localhost:${this.port}`,
          port: this.port
        },
        duration: this.metrics.lastExecutionTime 
      });

      // Mantener el agente corriendo
      this.keepRunning();

    } catch (error) {
      this.metrics.totalExecutions++;
      this.metrics.failedExecutions++;
      this.health.errorCount++;
      this.status = 'failed';
      
      this.logger.error('Error iniciando servidor web:', error);
      this.emit('error', { agentId: this.id, error: error.message });
    }

    this.emit('statusChanged', { agentId: this.id, status: this.status });
  }

  /**
   * Mantener el agente corriendo
   */
  private keepRunning(): void {
    // El servidor debe mantenerse corriendo
    setInterval(() => {
      this.updateHealth();
      this.broadcastStatus();
    }, 5000);
  }

  /**
   * Actualizar estado de salud
   */
  private updateHealth(): void {
    this.health = {
      isHealthy: true,
      lastCheck: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      errorCount: this.health.errorCount,
      successRate: this.metrics.totalExecutions > 0 ? 
        (this.metrics.successfulExecutions / this.metrics.totalExecutions) * 100 : 100,
      responseTime: 0
    };
  }

  /**
   * Transmitir estado a clientes conectados
   */
  private broadcastStatus(): void {
    this.io.emit('agents-status', this.getAgentsStatus());
    this.io.emit('system-metrics', this.getSystemMetrics());
  }

  /**
   * Obtener HTML del dashboard
   */
  private getDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Coordinator Dashboard</title>
    <script src="/socket.io/socket.io.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <div id="app" class="container mx-auto px-4 py-8">
        <header class="mb-8">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">🤖 Agent Coordinator Dashboard</h1>
            <p class="text-gray-600">Sistema de control y monitoreo de agentes - 9001app-v2</p>
        </header>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-2">Agentes Totales</h3>
                <p class="text-3xl font-bold text-blue-600" id="total-agents">6</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-2">Agentes Activos</h3>
                <p class="text-3xl font-bold text-green-600" id="active-agents">0</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-2">Última Ejecución</h3>
                <p class="text-sm text-gray-600" id="last-execution">-</p>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
                <h2 class="text-2xl font-semibold">Control de Agentes</h2>
            </div>
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="agents-grid">
                    <!-- Los agentes se cargarán dinámicamente -->
                </div>
            </div>
        </div>

        <div class="mt-8 bg-white rounded-lg shadow">
            <div class="p-6 border-b">
                <h2 class="text-2xl font-semibold">Logs del Sistema</h2>
            </div>
            <div class="p-6">
                <div class="bg-gray-900 text-green-400 rounded p-4 h-64 overflow-y-auto font-mono text-sm" id="logs-container">
                    <div>Sistema iniciado...</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const socket = io();
        
        const agents = [
            { id: 'security', name: 'Security Agent', type: 'security', status: 'idle' },
            { id: 'structure', name: 'Structure Agent', type: 'structure', status: 'idle' },
            { id: 'typescript', name: 'TypeScript Agent', type: 'typescript', status: 'idle' },
            { id: 'api', name: 'API Agent', type: 'api', status: 'idle' },
            { id: 'mongodb', name: 'MongoDB Agent', type: 'database', status: 'idle' },
            { id: 'web', name: 'Web Agent', type: 'frontend', status: 'running' }
        ];

        function renderAgents() {
            const grid = document.getElementById('agents-grid');
            grid.innerHTML = '';

            agents.forEach(agent => {
                const statusColor = {
                    'idle': 'bg-gray-100 text-gray-800',
                    'running': 'bg-blue-100 text-blue-800',
                    'completed': 'bg-green-100 text-green-800',
                    'failed': 'bg-red-100 text-red-800'
                };

                const card = document.createElement('div');
                card.className = 'border rounded-lg p-4';
                card.innerHTML = \`
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="font-semibold">\${agent.name}</h3>
                        <span class="px-2 py-1 rounded text-xs \${statusColor[agent.status]}">\${agent.status}</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-3">Tipo: \${agent.type}</p>
                    <div class="flex space-x-2">
                        <button onclick="executeAgent('\${agent.id}')" 
                                class="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                            Ejecutar
                        </button>
                        <button onclick="stopAgent('\${agent.id}')" 
                                class="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                            Detener
                        </button>
                    </div>
                \`;
                grid.appendChild(card);
            });

            // Actualizar contador de activos
            const activeCount = agents.filter(a => a.status === 'running').length;
            document.getElementById('active-agents').textContent = activeCount;
        }

        function executeAgent(agentId) {
            socket.emit('execute-agent', { agentId });
            addLog(\`Ejecutando agente: \${agentId}\`);
        }

        function stopAgent(agentId) {
            socket.emit('stop-agent', { agentId });
            addLog(\`Deteniendo agente: \${agentId}\`);
        }

        function addLog(message) {
            const container = document.getElementById('logs-container');
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.textContent = \`[\${timestamp}] \${message}\`;
            container.appendChild(logEntry);
            container.scrollTop = container.scrollHeight;
        }

        // Event handlers de Socket.IO
        socket.on('agents-status', (data) => {
            addLog('Estado de agentes actualizado');
        });

        socket.on('system-metrics', (data) => {
            // Actualizar métricas si es necesario
        });

        socket.on('connect', () => {
            addLog('Conectado al sistema de agentes');
        });

        socket.on('disconnect', () => {
            addLog('Desconectado del sistema de agentes');
        });

        // Inicializar
        renderAgents();
        
        // Actualizar timestamp de última ejecución
        setInterval(() => {
            document.getElementById('last-execution').textContent = new Date().toLocaleString();
        }, 1000);
    </script>
</body>
</html>
    `;
  }

  /**
   * Obtener estado de agentes (placeholder)
   */
  private getAgentsStatus(): any[] {
    return [
      { id: 'security', name: 'Security Agent', status: 'idle', health: 'healthy' },
      { id: 'structure', name: 'Structure Agent', status: 'idle', health: 'healthy' },
      { id: 'typescript', name: 'TypeScript Agent', status: 'idle', health: 'healthy' },
      { id: 'api', name: 'API Agent', status: 'idle', health: 'healthy' },
      { id: 'mongodb', name: 'MongoDB Agent', status: 'idle', health: 'healthy' },
      { id: 'web', name: 'Web Agent', status: 'running', health: 'healthy' }
    ];
  }

  /**
   * Obtener logs del sistema
   */
  private getLogs(agentId?: string, limit: number = 100): any[] {
    // Placeholder - implementar sistema de logs real
    return [
      { timestamp: new Date().toISOString(), level: 'info', message: 'Sistema iniciado', agentId: 'system' },
      { timestamp: new Date().toISOString(), level: 'info', message: 'Web Agent activo', agentId: 'web' }
    ];
  }

  /**
   * Obtener métricas del sistema
   */
  private getSystemMetrics(): any {
    return {
      totalAgents: 6,
      activeAgents: 1,
      systemUptime: Date.now() - this.startTime,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Detener servidor web
   */
  async stop(): Promise<void> {
    if (this.server) {
      this.server.close();
      this.status = 'idle';
      this.logger.info('Servidor web detenido');
    }
  }

  /**
   * Obtener estado del agente
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      health: this.health,
      metrics: this.metrics,
      capabilities: this.capabilities,
      port: this.port,
      url: `http://localhost:${this.port}`
    };
  }
}