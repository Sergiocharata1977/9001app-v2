import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Bot,
  Play,
  Square,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  BarChart3,
  Terminal,
  Wifi,
  WifiOff
} from 'lucide-react';
import { agentService, AgentStatus, SystemMetrics } from '@/services/agentService';
import AgentControls from './AgentControls';
import AgentLogs from './AgentLogs';
import AgentMetrics from './AgentMetrics';

const AgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    initializeDashboard();
    setupWebSocketConnection();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      
      // Verificar si el sistema está disponible
      const isHealthy = await agentService.checkHealth();
      setIsConnected(isHealthy);

      // Cargar datos iniciales
      const [agentsData, metricsData] = await Promise.all([
        agentService.getAgentsStatus(),
        agentService.getSystemMetrics()
      ]);

      setAgents(agentsData);
      setSystemMetrics(metricsData);
    } catch (error) {
      console.error('Error inicializando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocketConnection = () => {
    const socketConnection = agentService.createWebSocketConnection({
      onConnect: () => {
        setIsConnected(true);
        console.log('Conexión WebSocket establecida');
      },
      onDisconnect: () => {
        setIsConnected(false);
        console.log('Conexión WebSocket perdida');
      },
      onAgentStatusChange: (data) => {
        setAgents(data);
      },
      onSystemMetricsUpdate: (data) => {
        setSystemMetrics(data);
      }
    });

    setSocket(socketConnection);
  };

  const handleRefresh = async () => {
    await initializeDashboard();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      idle: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      running: { color: 'bg-blue-100 text-blue-800', icon: Activity },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      paused: { color: 'bg-yellow-100 text-yellow-800', icon: Square }
    };

    const config = statusConfig[status] || statusConfig.idle;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getHealthBadge = (isHealthy: boolean) => (
    <Badge className={isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
      {isHealthy ? '✓ Saludable' : '✗ Problema'}
    </Badge>
  );

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)}MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-lg">Cargando sistema de agentes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estado de conexión */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Bot className="w-8 h-8 mr-3 text-blue-600" />
            Agent Coordinator
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sistema de control y monitoreo de agentes de migración
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
            <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bot className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Agentes Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemMetrics?.totalAgents || agents.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Agentes Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agents.filter(a => a.status === 'running').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agents.length > 0 
                    ? Math.round(agents.reduce((acc, agent) => acc + agent.health.successRate, 0) / agents.length)
                    : 100}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Uptime Sistema</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemMetrics ? formatUptime(systemMetrics.systemUptime) : '0h 0m'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="controls">
            <Settings className="w-4 h-4 mr-2" />
            Controles
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Terminal className="w-4 h-4 mr-2" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Métricas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Agentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{agent.name}</h3>
                        <p className="text-sm text-gray-600">Tipo: {agent.type}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {getStatusBadge(agent.status)}
                          {getHealthBadge(agent.health.isHealthy)}
                          <Badge variant="outline">
                            {agent.metrics.totalExecutions} ejecuciones
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Última ejecución</p>
                      <p className="text-sm font-medium">
                        {agent.metrics.lastExecutionTime > 0 
                          ? `${agent.metrics.lastExecutionTime}ms`
                          : 'Nunca'
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls">
          <AgentControls 
            agents={agents} 
            onAgentUpdate={initializeDashboard}
            isConnected={isConnected}
          />
        </TabsContent>

        <TabsContent value="logs">
          <AgentLogs isConnected={isConnected} />
        </TabsContent>

        <TabsContent value="metrics">
          <AgentMetrics 
            agents={agents} 
            systemMetrics={systemMetrics} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentDashboard;