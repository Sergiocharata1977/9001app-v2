import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity
} from 'lucide-react';
import { Agent } from '@/hooks/useAgentStatus';

export interface AgentCardProps {
  agent: Agent;
  onToggle: (agentId: number) => void;
  onForceRun: (agentId: number) => void;
  onRestart: (agentId: number) => void;
}

const getStatusIcon = (status: Agent['status']) => {
  switch (status) {
    case 'active':
      return <Activity className="w-4 h-4 text-green-500" />;
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-blue-500" />;
    case 'error':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'inactive':
      return <Clock className="w-4 h-4 text-gray-500" />;
    default:
      return <Activity className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusColor = (status: Agent['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 60) return 'bg-blue-500';
  if (progress >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

const AgentCard = memo<AgentCardProps>(({ agent, onToggle, onForceRun, onRestart }) => {
  const isActive = agent.status === 'active';
  const isCompleted = agent.status === 'completed';
  const isError = agent.status === 'error';

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4" 
          style={{ borderLeftColor: agent.color }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{agent.icon}</div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {agent.name}
              </CardTitle>
              <p className="text-sm text-gray-600">{agent.description}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(agent.status)} border`}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(agent.status)}
              <span className="capitalize">{agent.status}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progreso</span>
            <span className="font-medium">{agent.progress}%</span>
          </div>
          <Progress 
            value={agent.progress} 
            className="h-2"
            style={{ 
              '--progress-color': getProgressColor(agent.progress) 
            } as React.CSSProperties}
          />
        </div>

        {/* Last Activity */}
        <div className="text-xs text-gray-500">
          Última actividad: {agent.lastActivity.toLocaleTimeString()}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={isActive ? "destructive" : "default"}
            onClick={() => onToggle(agent.id)}
            disabled={isCompleted}
            className="flex-1"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 mr-1" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Iniciar
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onForceRun(agent.id)}
            disabled={isCompleted || isError}
            className="flex-1"
          >
            <Zap className="w-4 h-4 mr-1" />
            Forzar
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onRestart(agent.id)}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reiniciar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

AgentCard.displayName = 'AgentCard';

export default AgentCard;