import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Database,
  Cpu
} from 'lucide-react';
import { Agent } from '@/hooks/useAgentStatus';

export interface AgentStatusProps {
  agents: Agent[];
  isLoading?: boolean;
  showDetails?: boolean;
}

const StatusIndicator = memo<{ 
  status: Agent['status']; 
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}>(({ status, size = 'md', showLabel = false }) => {
  const getStatusConfig = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return {
          icon: <Activity className="w-4 h-4 text-green-500" />,
          color: 'bg-green-500',
          label: 'Activo',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-4 h-4 text-blue-500" />,
          color: 'bg-blue-500',
          label: 'Completado',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
          color: 'bg-red-500',
          label: 'Error',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800'
        };
      case 'inactive':
        return {
          icon: <Clock className="w-4 h-4 text-gray-500" />,
          color: 'bg-gray-500',
          label: 'Inactivo',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
      default:
        return {
          icon: <Minus className="w-4 h-4 text-gray-500" />,
          color: 'bg-gray-500',
          label: 'Desconocido',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`${sizeClasses[size]} ${config.color} rounded-full animate-pulse`}></div>
      {showLabel && (
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
      )}
    </div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

const AgentStatusCard = memo<{ agent: Agent }>(({ agent }) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (progress: number) => {
    if (progress >= 80) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (progress >= 60) return <Minus className="w-4 h-4 text-blue-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <Card className="hover:shadow-md transition-all duration-300 border-l-4" 
          style={{ borderLeftColor: agent.color }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-xl">{agent.icon}</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Agente {agent.id}
              </h3>
              <p className="text-xs text-gray-600 truncate max-w-32">
                {agent.name}
              </p>
            </div>
          </div>
          <StatusIndicator status={agent.status} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Progreso</span>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium">{agent.progress}%</span>
              {getTrendIcon(agent.progress)}
            </div>
          </div>
          <Progress 
            value={agent.progress} 
            className="h-1.5"
            style={{ 
              '--progress-color': getProgressColor(agent.progress) 
            } as React.CSSProperties}
          />
        </div>

        <div className="mt-3 text-xs text-gray-500">
          {agent.lastActivity.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
});

AgentStatusCard.displayName = 'AgentStatusCard';

const AgentStatus = memo<AgentStatusProps>(({ agents, isLoading = false, showDetails = false }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusCounts = agents.reduce((acc, agent) => {
    acc[agent.status] = (acc[agent.status] || 0) + 1;
    return acc;
  }, {} as Record<Agent['status'], number>);

  const totalProgress = agents.reduce((sum, agent) => sum + agent.progress, 0) / agents.length;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const completedAgents = agents.filter(a => a.status === 'completed').length;
  const errorAgents = agents.filter(a => a.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Estado General del Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{activeAgents}</p>
              <p className="text-sm text-green-700">Activos</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{completedAgents}</p>
              <p className="text-sm text-blue-700">Completados</p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-600">{errorAgents}</p>
              <p className="text-sm text-red-700">Con Errores</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Cpu className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{totalProgress.toFixed(1)}%</p>
              <p className="text-sm text-purple-700">Progreso Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Agent Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Estado de Agentes</span>
            <Badge variant="secondary">{agents.length} agentes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <AgentStatusCard key={agent.id} agent={agent} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Status Breakdown */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Desglose Detallado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StatusIndicator status={status as Agent['status']} showLabel />
                  </div>
                  <Badge variant="outline">{count} agentes</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

AgentStatus.displayName = 'AgentStatus';

export default AgentStatus;