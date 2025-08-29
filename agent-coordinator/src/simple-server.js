#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { createServer } = require('http');
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Estado de los agentes (simulado)
let agentsState = [
  {
    id: 'security-agent',
    name: 'Security Audit Agent',
    type: 'security',
    status: 'idle',
    health: {
      isHealthy: true,
      lastCheck: new Date().toISOString(),
      uptime: 0,
      errorCount: 0,
      successRate: 100,
      responseTime: 0
    },
    metrics: {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    },
    capabilities: ['security-audit', 'vulnerability-scan', 'dependency-check']
  },
  {
    id: 'structure-agent',
    name: 'Project Structure Agent',
    type: 'structure',
    status: 'idle',
    health: {
      isHealthy: true,
      lastCheck: new Date().toISOString(),
      uptime: 0,
      errorCount: 0,
      successRate: 100,
      responseTime: 0
    },
    metrics: {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    },
    capabilities: ['structure-analysis', 'code-organization', 'file-management']
  },
  {
    id: 'typescript-agent',
    name: 'TypeScript Migration Agent',
    type: 'typescript',
    status: 'idle',
    health: {
      isHealthy: true,
      lastCheck: new Date().toISOString(),
      uptime: 0,
      errorCount: 0,
      successRate: 100,
      responseTime: 0
    },
    metrics: {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    },
    capabilities: ['typescript-migration', 'type-checking', 'code-conversion']
  },
  {
    id: 'api-agent',
    name: 'API Optimization Agent',
    type: 'api',
    status: 'idle',
    health: {
      isHealthy: true,
      lastCheck: new Date().toISOString(),
      uptime: 0,
      errorCount: 0,
      successRate: 100,
      responseTime: 0
    },
    metrics: {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    },
    capabilities: ['api-analysis', 'endpoint-optimization', 'performance-monitoring']
  },
  {
    id: 'mongodb-agent',
    name: 'MongoDB Migration Agent',
    type: 'database',
    status: 'idle',
    health: {
      isHealthy: true,
      lastCheck: new Date().toISOString(),
      uptime: 0,
      errorCount: 0,
      successRate: 100,
      responseTime: 0
    },
    metrics: {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    },
    capabilities: ['database-migration', 'schema-optimization', 'data-validation']
  },
  {
    id: 'web-agent',
    name: 'Web Dashboard Agent',
    type: 'frontend',
    status: 'running',
    health: {
      isHealthy: true,
      lastCheck: new Date().toISOString(),
      uptime: Date.now(),
      errorCount: 0,
      successRate: 100,
      responseTime: 0
    },
    metrics: {
      totalExecutions: 1,
      successfulExecutions: 1,
      failedExecutions: 0,
      averageExecutionTime: 500,
      lastExecutionTime: 500,
      memoryUsage: 0,
      cpuUsage: 0
    },
    capabilities: ['web-dashboard', 'real-time-monitoring', 'agent-control']
  }
];

const systemMetrics = {
  totalAgents: 6,
  activeAgents: 1,
  systemUptime: Date.now(),
  memoryUsage: {
    rss: 50000000,
    heapTotal: 30000000,
    heapUsed: 20000000,
    external: 1000000
  },
  timestamp: new Date().toISOString()
};

const logs = [
  {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Sistema de agentes iniciado correctamente',
    agentId: 'system'
  },
  {
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Web Agent activo en puerto 8000',
    agentId: 'web-agent'
  }
];

// Funciones simuladas de agentes
function simulateAgentExecution(agentId) {
  const agent = agentsState.find(a => a.id === agentId);
  if (!agent) return { success: false, error: 'Agente no encontrado' };

  // Simular ejecución
  agent.status = 'running';
  agent.health.lastCheck = new Date().toISOString();
  
  // Agregar log
  logs.unshift({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: `Iniciando ejecución del agente ${agent.name}`,
    agentId: agentId
  });

  // Simular tiempo de ejecución
  setTimeout(() => {
    const success = Math.random() > 0.1; // 90% probabilidad de éxito
    
    if (success) {
      agent.status = 'completed';
      agent.metrics.totalExecutions++;
      agent.metrics.successfulExecutions++;
      agent.metrics.lastExecutionTime = Math.floor(Math.random() * 5000) + 1000;
      agent.metrics.averageExecutionTime = 
        (agent.metrics.averageExecutionTime * (agent.metrics.totalExecutions - 1) + agent.metrics.lastExecutionTime) / 
        agent.metrics.totalExecutions;
      
      logs.unshift({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Agente ${agent.name} completado exitosamente en ${agent.metrics.lastExecutionTime}ms`,
        agentId: agentId
      });
    } else {
      agent.status = 'failed';
      agent.metrics.totalExecutions++;
      agent.metrics.failedExecutions++;
      agent.health.errorCount++;
      
      logs.unshift({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Error en la ejecución del agente ${agent.name}`,
        agentId: agentId
      });
    }
    
    agent.health.successRate = agent.metrics.totalExecutions > 0 ? 
      (agent.metrics.successfulExecutions / agent.metrics.totalExecutions) * 100 : 100;

    // Emitir actualización por socket
    io.emit('agents-status', agentsState);
    io.emit('logs-update', logs.slice(0, 10));

    // Volver a idle después de un momento
    setTimeout(() => {
      agent.status = 'idle';
      io.emit('agents-status', agentsState);
    }, 2000);
    
  }, Math.floor(Math.random() * 3000) + 2000); // Entre 2-5 segundos

  return { success: true };
}

// Routes de la API
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent Coordinator Dashboard</title>
    <script src="/socket.io/socket.io.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
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
                <p class="text-3xl font-bold text-green-600" id="active-agents">1</p>
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
                    <!-- Los logs se cargarán dinámicamente -->
                </div>
            </div>
        </div>
    </div>

    <script>
        const socket = io();
        let agentsData = [];

        function renderAgents() {
            const grid = document.getElementById('agents-grid');
            grid.innerHTML = '';

            agentsData.forEach(agent => {
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
                    <p class="text-sm text-gray-600 mb-3">Ejecuciones: \${agent.metrics.totalExecutions}</p>
                    <div class="flex space-x-2">
                        <button onclick="executeAgent('\${agent.id}')" 
                                class="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                \${agent.status === 'running' ? 'disabled' : ''}>
                            \${agent.status === 'running' ? 'Ejecutando...' : 'Ejecutar'}
                        </button>
                    </div>
                \`;
                grid.appendChild(card);
            });

            // Actualizar contador de activos
            const activeCount = agentsData.filter(a => a.status === 'running').length;
            document.getElementById('active-agents').textContent = activeCount;
        }

        function renderLogs(logs) {
            const container = document.getElementById('logs-container');
            container.innerHTML = '';
            
            logs.forEach(log => {
                const logEntry = document.createElement('div');
                const timestamp = new Date(log.timestamp).toLocaleTimeString();
                logEntry.innerHTML = \`[\${timestamp}] [\${log.level.toUpperCase()}] [\${log.agentId}] \${log.message}\`;
                container.appendChild(logEntry);
            });
        }

        function executeAgent(agentId) {
            fetch(\`/api/agents/\${agentId}/execute\`, { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    console.log('Agente ejecutado:', data);
                })
                .catch(error => console.error('Error:', error));
        }

        // Cargar datos iniciales
        fetch('/api/agents')
            .then(response => response.json())
            .then(data => {
                agentsData = data.data;
                renderAgents();
            });

        fetch('/api/logs')
            .then(response => response.json())
            .then(data => {
                renderLogs(data.data);
            });

        // Event handlers de Socket.IO
        socket.on('agents-status', (data) => {
            agentsData = data;
            renderAgents();
        });

        socket.on('logs-update', (data) => {
            renderLogs(data);
        });

        socket.on('connect', () => {
            console.log('Conectado al sistema de agentes');
        });

        // Actualizar timestamp
        setInterval(() => {
            document.getElementById('last-execution').textContent = new Date().toLocaleString();
        }, 1000);
    </script>
</body>
</html>
  `);
});

app.get('/api/agents', (req, res) => {
  res.json({
    success: true,
    data: agentsState
  });
});

app.post('/api/agents/:agentId/execute', (req, res) => {
  const { agentId } = req.params;
  console.log(`Ejecutando agente: ${agentId}`);
  
  const result = simulateAgentExecution(agentId);
  
  res.json({
    success: result.success,
    message: result.success ? `Agente ${agentId} iniciado` : result.error
  });
});

app.post('/api/agents/:agentId/stop', (req, res) => {
  const { agentId } = req.params;
  
  const agent = agentsState.find(a => a.id === agentId);
  if (agent) {
    agent.status = 'idle';
    
    logs.unshift({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: `Agente ${agent.name} detenido manualmente`,
      agentId: agentId
    });
    
    io.emit('agents-status', agentsState);
    io.emit('logs-update', logs.slice(0, 10));
  }
  
  res.json({
    success: true,
    message: `Agente ${agentId} detenido`
  });
});

app.get('/api/logs', (req, res) => {
  const { agentId, limit = 100 } = req.query;
  
  let filteredLogs = logs;
  if (agentId && agentId !== 'all') {
    filteredLogs = logs.filter(log => log.agentId === agentId);
  }
  
  res.json({
    success: true,
    data: filteredLogs.slice(0, parseInt(limit))
  });
});

app.get('/api/metrics', (req, res) => {
  systemMetrics.activeAgents = agentsState.filter(a => a.status === 'running').length;
  systemMetrics.timestamp = new Date().toISOString();
  systemMetrics.systemUptime = Date.now() - systemMetrics.systemUptime;
  
  res.json({
    success: true,
    data: systemMetrics
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime() * 1000
  });
});

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log('Cliente conectado al dashboard');

  // Enviar estado inicial
  socket.emit('agents-status', agentsState);
  socket.emit('system-metrics', systemMetrics);
  socket.emit('logs-update', logs.slice(0, 10));

  socket.on('execute-agent', (data) => {
    console.log(`Ejecutando agente ${data.agentId} via Socket`);
    simulateAgentExecution(data.agentId);
  });

  socket.on('stop-agent', (data) => {
    console.log(`Deteniendo agente ${data.agentId} via Socket`);
    const agent = agentsState.find(a => a.id === data.agentId);
    if (agent) {
      agent.status = 'idle';
      socket.emit('agents-status', agentsState);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado del dashboard');
  });
});

// Actualizar métricas periódicamente
setInterval(() => {
  agentsState.forEach(agent => {
    agent.health.lastCheck = new Date().toISOString();
    agent.health.uptime = Date.now();
  });
  
  io.emit('system-metrics', {
    ...systemMetrics,
    activeAgents: agentsState.filter(a => a.status === 'running').length,
    timestamp: new Date().toISOString()
  });
}, 5000);

// Iniciar servidor
server.listen(PORT, () => {
  console.log('🤖 Agent Coordinator Dashboard iniciado');
  console.log(`📊 Dashboard disponible en: http://localhost:${PORT}`);
  console.log(`🔗 API disponible en: http://localhost:${PORT}/api`);
  console.log(`✅ Sistema listo para recibir comandos`);
});

process.on('SIGINT', () => {
  console.log('\\nCerrando Agent Coordinator...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});