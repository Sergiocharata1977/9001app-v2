import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Database,
  Server,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  FileText,
  Code,
  Palette,
  Bot,
  Play,
  Pause
} from 'lucide-react';
import { useAgentStatus } from '@/hooks/useAgentStatus';
import { useAgentControls } from '@/hooks/useAgentControls';
import AgentStatus from '@/components/AgentStatus';

const AgentCoordination = () => {
  const { agents, getActiveAgents, getCompletedAgents } = useAgentStatus();
  const { controls, startAllAgents, stopAllAgents, isProcessing } = useAgentControls();
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simular refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Memoizar estadísticas de coordinación
  const coordinationStats = useMemo(() => ({
    totalAgents: agents.length,
    activeAgents: getActiveAgents().length,
    completedAgents: getCompletedAgents().length,
    averageProgress: agents.reduce((sum, agent) => sum + agent.progress, 0) / agents.length,
    systemHealth: agents.filter(a => a.status === 'error').length === 0 ? 'excellent' : 'good'
  }), [agents, getActiveAgents, getCompletedAgents]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'good': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'poor': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤝 Coordinación de Agentes
          </h1>
          <p className="text-gray-600">
            Sistema de coordinación de los 8 agentes de migración
          </p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estado General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Agentes</p>
                <p className="text-2xl font-bold text-gray-900">{coordinationStats.totalAgents}</p>
              </div>
              <Bot className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agentes Activos</p>
                <p className="text-2xl font-bold text-green-600">{coordinationStats.activeAgents}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progreso Total</p>
                <p className="text-2xl font-bold text-purple-600">{coordinationStats.averageProgress.toFixed(1)}%</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estado del Sistema</p>
                <p className={`text-2xl font-bold ${getHealthColor(coordinationStats.systemHealth)}`}>
                  {coordinationStats.systemHealth === 'excellent' ? 'Excelente' : 
                   coordinationStats.systemHealth === 'good' ? 'Bueno' : 'Crítico'}
                </p>
              </div>
              {getHealthIcon(coordinationStats.systemHealth)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Coordinación */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <span>Controles de Coordinación</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={startAllAgents}
              disabled={isProcessing}
              className="h-12 bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar Todos los Agentes
            </Button>
            
            <Button 
              onClick={stopAllAgents}
              disabled={isProcessing}
              variant="destructive"
              className="h-12"
            >
              <Pause className="w-4 h-4 mr-2" />
              Detener Todos los Agentes
            </Button>
            
            <Button 
              onClick={refreshData}
              disabled={isRefreshing}
              variant="outline"
              className="h-12"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar Estado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estado de Agentes */}
      <AgentStatus agents={agents} showDetails={true} />

      {/* Progreso de Coordinación */}
      <Card className="shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Progreso de Coordinación</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso General del Sistema</span>
                <span>{coordinationStats.averageProgress.toFixed(1)}%</span>
              </div>
              <Progress value={coordinationStats.averageProgress} className="h-3" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{coordinationStats.activeAgents}</p>
                <p className="text-sm text-green-700">Agentes Activos</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{coordinationStats.completedAgents}</p>
                <p className="text-sm text-blue-700">Agentes Completados</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{coordinationStats.totalAgents}</p>
                <p className="text-sm text-purple-700">Total de Agentes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentCoordination;
