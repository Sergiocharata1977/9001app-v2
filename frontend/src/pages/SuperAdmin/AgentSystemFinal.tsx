import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Play, 
  Pause, 
  RotateCcw,
  Settings, 
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Database,
  Code,
  Palette,
  TestTube,
  Users,
  GitBranch,
  MessageSquare,
  FileText,
  Shield,
  ArrowRight,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useAgentStatus } from '@/hooks/useAgentStatus';
import { useAgentControls } from '@/hooks/useAgentControls';
import { useAgentMetrics } from '@/hooks/useAgentMetrics';
import AgentCards from '@/components/AgentCards';
import AgentControls from '@/components/AgentControls';
import AgentMetrics from '@/components/AgentMetrics';

const AgentSystemFinal = () => {
  const [activeTab, setActiveTab] = useState('agents');
  const [selectedAgent, setSelectedAgent] = useState<number>(1);
  
  const { agents, toggleAgent, forceRunAgent } = useAgentStatus();
  const { controls, isProcessing, startAgent, stopAgent, restartAgent, resetAgent } = useAgentControls();
  const { metrics, systemMetrics } = useAgentMetrics();

  // Memoizar estadísticas del sistema
  const systemStats = useMemo(() => ({
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    completedAgents: agents.filter(a => a.status === 'completed').length,
    errorAgents: agents.filter(a => a.status === 'error').length,
    averageProgress: agents.reduce((sum, agent) => sum + agent.progress, 0) / agents.length
  }), [agents]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sistema de Agentes Final
        </h1>
        <p className="text-gray-600">
          Coordinación avanzada de los 8 agentes de migración
        </p>
      </div>

      {/* Estadísticas del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Agentes</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalAgents}</p>
              </div>
              <Bot className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">{systemStats.activeAgents}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-blue-600">{systemStats.completedAgents}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Con Errores</p>
                <p className="text-2xl font-bold text-red-600">{systemStats.errorAgents}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progreso Total</p>
                <p className="text-2xl font-bold text-purple-600">{systemStats.averageProgress.toFixed(1)}%</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="controls">Controles</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        {/* Tab de Agentes */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <AgentCards
                key={agent.id}
                agent={agent}
                onToggle={toggleAgent}
                onForceRun={forceRunAgent}
                onRestart={restartAgent}
              />
            ))}
          </div>
        </TabsContent>

        {/* Tab de Controles */}
        <TabsContent value="controls" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <AgentControls
                key={agent.id}
                agentId={agent.id}
                control={controls.find(c => c.agentId === agent.id)}
                isProcessing={isProcessing}
                onStart={startAgent}
                onStop={stopAgent}
                onForceRun={forceRunAgent}
                onRestart={restartAgent}
                onReset={resetAgent}
              />
            ))}
          </div>
        </TabsContent>

        {/* Tab de Métricas */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <AgentMetrics
                key={agent.id}
                agentId={agent.id}
                metrics={metrics.find(m => m.agentId === agent.id)}
                systemMetrics={systemMetrics}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentSystemFinal;
