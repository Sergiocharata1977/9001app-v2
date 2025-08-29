import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play,
  Square,
  RefreshCw,
  Zap,
  Bot,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';
import { agentService, AgentStatus, ExecutionResult } from '@/services/agentService';

interface AgentControlsProps {
  agents: AgentStatus[];
  onAgentUpdate: () => void;
  isConnected: boolean;
}

const AgentControls: React.FC<AgentControlsProps> = ({ 
  agents, 
  onAgentUpdate, 
  isConnected 
}) => {
  const [executingAgents, setExecutingAgents] = useState<Set<string>>(new Set());
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([]);
  const [isExecutingAll, setIsExecutingAll] = useState(false);

  const handleExecuteAgent = async (agentId: string) => {
    setExecutingAgents(prev => new Set(prev).add(agentId));
    
    try {
      const result = await agentService.executeAgent(agentId);
      
      setExecutionResults(prev => [result, ...prev.slice(0, 9)]); // Mantener últimos 10 resultados
      
      if (result.success) {
        // Actualizar estado después de un delay para permitir que el agente complete
        setTimeout(() => {
          onAgentUpdate();
        }, 2000);
      }
    } catch (error) {
      console.error(`Error ejecutando agente ${agentId}:`, error);
      setExecutionResults(prev => [{
        success: false,
        agentId,
        error: error.message || 'Error desconocido'
      }, ...prev.slice(0, 9)]);
    } finally {
      setExecutingAgents(prev => {
        const newSet = new Set(prev);
        newSet.delete(agentId);
        return newSet;
      });
    }
  };

  const handleStopAgent = async (agentId: string) => {
    try {
      const result = await agentService.stopAgent(agentId);
      setExecutionResults(prev => [result, ...prev.slice(0, 9)]);
      
      if (result.success) {
        setTimeout(() => {
          onAgentUpdate();
        }, 1000);
      }
    } catch (error) {
      console.error(`Error deteniendo agente ${agentId}:`, error);
    }
  };

  const handleExecuteAll = async () => {
    setIsExecutingAll(true);
    
    try {
      const results = await agentService.executeAllAgents();
      setExecutionResults(prev => [...results, ...prev.slice(0, 5)]);
      
      // Actualizar estado después de completar todas las ejecuciones
      setTimeout(() => {
        onAgentUpdate();
      }, 3000);
    } catch (error) {
      console.error('Error ejecutando todos los agentes:', error);
    } finally {
      setIsExecutingAll(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAgentTypeColor = (type: string) => {
    const colors = {
      security: 'bg-red-100 text-red-800',
      structure: 'bg-blue-100 text-blue-800',
      typescript: 'bg-purple-100 text-purple-800',
      api: 'bg-green-100 text-green-800',
      database: 'bg-yellow-100 text-yellow-800',
      frontend: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const isAgentExecuting = (agentId: string) => {
    return executingAgents.has(agentId) || agents.find(a => a.id === agentId)?.status === 'running';
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Sistema de agentes no disponible. Para activar los agentes:
              <br />
              <code className="bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                cd agent-coordinator && npm install && npm start
              </code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Controles Principales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleExecuteAll}
              disabled={isExecutingAll || agents.some(a => a.status === 'running')}
              className="flex items-center space-x-2"
              size="lg"
            >
              {isExecutingAll ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>
                {isExecutingAll ? 'Ejecutando...' : 'Ejecutar Migración Completa'}
              </span>
            </Button>

            <Button
              onClick={onAgentUpdate}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar Estado</span>
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              <strong>Migración Completa:</strong> Ejecuta todos los agentes en secuencia para una migración completa del sistema.
            </p>
            <p className="mt-1">
              Orden: Security → Structure → TypeScript → API → MongoDB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Control individual de agentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Control Individual de Agentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{agent.name}</h3>
                      {getStatusIcon(agent.status)}
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getAgentTypeColor(agent.type)}>
                        {agent.type}
                      </Badge>
                      <Badge variant="outline">
                        {agent.metrics.totalExecutions} ejecuciones
                      </Badge>
                      <Badge variant="outline">
                        {agent.health.successRate.toFixed(1)}% éxito
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>Capacidades: {agent.capabilities.slice(0, 2).join(', ')}</span>
                        {agent.capabilities.length > 2 && (
                          <span>+{agent.capabilities.length - 2} más</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleExecuteAgent(agent.id)}
                    disabled={isAgentExecuting(agent.id)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    {isAgentExecuting(agent.id) ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span>{isAgentExecuting(agent.id) ? 'Ejecutando' : 'Ejecutar'}</span>
                  </Button>

                  {agent.status === 'running' && (
                    <Button
                      onClick={() => handleStopAgent(agent.id)}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                    >
                      <Square className="w-4 h-4" />
                      <span>Detener</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historial de ejecuciones */}
      {executionResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Historial de Ejecuciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {executionResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        Agente: {agents.find(a => a.id === result.agentId)?.name || result.agentId}
                      </p>
                      {result.error && (
                        <p className="text-sm text-red-600">{result.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {result.duration && (
                      <p>{result.duration}ms</p>
                    )}
                    <p>{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentControls;