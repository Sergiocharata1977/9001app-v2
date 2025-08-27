import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  Activity, 
  Shield, 
  Database, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bot,
  Zap
} from 'lucide-react';
import { useAgentStatus } from '@/hooks/useAgentStatus';
import { useAgentMetrics } from '@/hooks/useAgentMetrics';
import AgentStatus from '@/components/AgentStatus';

const SuperAdminDashboard = () => {
  const { agents, getActiveAgents, getCompletedAgents } = useAgentStatus();
  const { systemMetrics } = useAgentMetrics();
  
  const [stats, setStats] = useState({
    organizations: 0,
    users: 0,
    activeUsers: 0,
    systemHealth: 'excellent'
  });

  useEffect(() => {
    // Simular carga de estadísticas
    setStats({
      organizations: 12,
      users: 156,
      activeUsers: 89,
      systemHealth: 'excellent'
    });
  }, []);

  const agentStats = useMemo(() => ({
    total: agents.length,
    active: getActiveAgents().length,
    completed: getCompletedAgents().length,
    averageProgress: agents.reduce((sum, agent) => sum + agent.progress, 0) / agents.length
  }), [agents, getActiveAgents, getCompletedAgents]);

  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'good': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'poor': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Super Administrador
        </h1>
        <p className="text-gray-600">
          Panel de control global del sistema ISO Flow
        </p>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Organizaciones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.organizations}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agentes Activos</p>
                <p className="text-2xl font-bold text-gray-900">{agentStats.active}</p>
              </div>
              <Bot className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progreso Total</p>
                <p className="text-2xl font-bold text-gray-900">{agentStats.averageProgress.toFixed(1)}%</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estado del Sistema</p>
                <p className={`text-2xl font-bold ${getHealthColor(stats.systemHealth)}`}>
                  {stats.systemHealth === 'excellent' ? 'Excelente' : 
                   stats.systemHealth === 'good' ? 'Bueno' : 'Crítico'}
                </p>
              </div>
              {getHealthIcon(stats.systemHealth)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secciones Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gestión de Organizaciones */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Gestión de Organizaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Organizaciones Activas</span>
                <Badge variant="secondary">{stats.organizations}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Nuevas Solicitudes</span>
                <Badge variant="outline" className="text-orange-600">3</Badge>
              </div>
              <div className="pt-4">
                <Button className="w-full" variant="outline">
                  <Building2 className="w-4 h-4 mr-2" />
                  Gestionar Organizaciones
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gestión de Usuarios */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Gestión de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Usuarios Totales</span>
                <Badge variant="secondary">{stats.users}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Usuarios Activos</span>
                <Badge variant="outline" className="text-green-600">{stats.activeUsers}</Badge>
              </div>
              <div className="pt-4">
                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Gestionar Usuarios
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Base de Datos */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Base de Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Estado de BD</span>
                <Badge variant="outline" className="text-green-600">Operativa</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Último Backup</span>
                <Badge variant="outline">Hace 2h</Badge>
              </div>
              <div className="pt-4 space-y-2">
                <Button className="w-full" variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  Ver Esquema
                </Button>
                <Button className="w-full" variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  Estructura del Proyecto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración del Sistema */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Modo Mantenimiento</span>
                <Badge variant="outline" className="text-green-600">Desactivado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Features Activas</span>
                <Badge variant="outline">24/28</Badge>
              </div>
              <div className="pt-4">
                <Button className="w-full" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Sistema
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado de Agentes */}
      <div className="mt-8">
        <AgentStatus agents={agents} showDetails={false} />
      </div>

      {/* Acciones Rápidas */}
      <div className="mt-8">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-12">
                <Bot className="w-4 h-4 mr-2" />
                Gestionar Agentes
              </Button>
              <Button variant="outline" className="h-12">
                <Zap className="w-4 h-4 mr-2" />
                Monitoreo
              </Button>
              <Button variant="outline" className="h-12">
                <Activity className="w-4 h-4 mr-2" />
                Estadísticas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
