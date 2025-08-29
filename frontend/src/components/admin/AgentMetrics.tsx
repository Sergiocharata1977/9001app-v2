import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Cpu,
  HardDrive,
  Zap
} from 'lucide-react';
import { AgentStatus, SystemMetrics } from '@/services/agentService';

interface AgentMetricsProps {
  agents: AgentStatus[];
  systemMetrics: SystemMetrics | null;
}

const AgentMetrics: React.FC<AgentMetricsProps> = ({ agents, systemMetrics }) => {
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getOverallHealthScore = () => {
    if (agents.length === 0) return 100;
    
    const totalScore = agents.reduce((sum, agent) => {
      let score = 100;
      
      // Penalizar por errores
      if (agent.health.errorCount > 0) {
        score -= Math.min(agent.health.errorCount * 5, 30);
      }
      
      // Considerar tasa de éxito
      score = score * (agent.health.successRate / 100);
      
      return sum + score;
    }, 0);
    
    return Math.round(totalScore / agents.length);
  };

  const getPerformanceMetrics = () => {
    if (agents.length === 0) {
      return { totalExecutions: 0, avgExecutionTime: 0, successRate: 100 };
    }

    const totalExecutions = agents.reduce((sum, agent) => sum + agent.metrics.totalExecutions, 0);
    const totalSuccessful = agents.reduce((sum, agent) => sum + agent.metrics.successfulExecutions, 0);
    const avgExecutionTime = agents.reduce((sum, agent) => sum + agent.metrics.averageExecutionTime, 0) / agents.length;
    
    return {
      totalExecutions,
      avgExecutionTime,
      successRate: totalExecutions > 0 ? (totalSuccessful / totalExecutions) * 100 : 100
    };
  };

  const getAgentsByStatus = () => {
    const statusCount = {
      idle: 0,
      running: 0,
      completed: 0,
      failed: 0,
      paused: 0
    };

    agents.forEach(agent => {
      statusCount[agent.status] = (statusCount[agent.status] || 0) + 1;
    });

    return statusCount;
  };

  const healthScore = getOverallHealthScore();
  const performanceMetrics = getPerformanceMetrics();
  const statusDistribution = getAgentsByStatus();

  return (
    <div className="space-y-6">
      {/* Métricas principales del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Health Score</p>
                <p className="text-2xl font-bold text-gray-900">{healthScore}%</p>
                <Progress value={healthScore} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Ejecuciones Totales</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.totalExecutions}</p>
                <p className="text-sm text-gray-500">
                  {performanceMetrics.successRate.toFixed(1)}% éxito
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(performanceMetrics.avgExecutionTime)}
                </p>
                <p className="text-sm text-gray-500">Por ejecución</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Uptime Sistema</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemMetrics ? formatUptime(systemMetrics.systemUptime) : '0h 0m'}
                </p>
                <p className="text-sm text-gray-500">Tiempo activo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por estado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Distribución de Estados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const statusConfig = {
                idle: { color: 'bg-gray-100 text-gray-800', icon: Clock },
                running: { color: 'bg-blue-100 text-blue-800', icon: Activity },
                completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
                failed: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
                paused: { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
              };

              const config = statusConfig[status] || statusConfig.idle;
              const Icon = config.icon;

              return (
                <div key={status} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <Badge className={config.color}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Métricas detalladas por agente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Métricas Detalladas por Agente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{agent.name}</h3>
                  <Badge className={agent.health.isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {agent.health.isHealthy ? 'Saludable' : 'Problema'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Ejecuciones</p>
                    <p className="text-lg font-semibold">{agent.metrics.totalExecutions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tasa de Éxito</p>
                    <p className="text-lg font-semibold">{agent.health.successRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiempo Promedio</p>
                    <p className="text-lg font-semibold">
                      {formatDuration(agent.metrics.averageExecutionTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Errores</p>
                    <p className="text-lg font-semibold text-red-600">
                      {agent.health.errorCount}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tasa de Éxito</span>
                    <span className="text-sm">{agent.health.successRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={agent.health.successRate} className="h-2" />
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  <p>Última verificación: {new Date(agent.health.lastCheck).toLocaleString()}</p>
                  <p>Uptime: {formatUptime(agent.health.uptime)}</p>
                  <p>Capacidades: {agent.capabilities.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas del sistema */}
      {systemMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cpu className="w-5 h-5 mr-2" />
              Métricas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <HardDrive className="w-4 h-4 mr-2" />
                  Uso de Memoria
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">RSS:</span>
                    <span className="text-sm">{formatBytes(systemMetrics.memoryUsage.rss || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Heap Used:</span>
                    <span className="text-sm">{formatBytes(systemMetrics.memoryUsage.heapUsed || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Heap Total:</span>
                    <span className="text-sm">{formatBytes(systemMetrics.memoryUsage.heapTotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">External:</span>
                    <span className="text-sm">{formatBytes(systemMetrics.memoryUsage.external || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Estadísticas Generales</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Agentes Totales:</span>
                    <span className="text-sm font-medium">{systemMetrics.totalAgents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Agentes Activos:</span>
                    <span className="text-sm font-medium">{systemMetrics.activeAgents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Uptime:</span>
                    <span className="text-sm font-medium">{formatUptime(systemMetrics.systemUptime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Última actualización:</span>
                    <span className="text-sm font-medium">
                      {new Date(systemMetrics.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Estado del Coordinador</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Sistema Operativo</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Comunicación WebSocket</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">API REST</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentMetrics;