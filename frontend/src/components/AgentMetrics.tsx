import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle,
  Clock,
  Zap,
  Database,
  Cpu
} from 'lucide-react';
import { AgentMetrics as AgentMetricsType, SystemMetrics } from '@/hooks/useAgentMetrics';

export interface AgentMetricsProps {
  agentId: number;
  metrics: AgentMetricsType | null;
  systemMetrics: SystemMetrics | null;
  isLoading?: boolean;
}

const MetricCard = memo<{ 
  title: string; 
  value: number; 
  unit: string; 
  icon: React.ReactNode; 
  color: string;
  trend?: 'up' | 'down' | 'stable';
}>(({ title, value, unit, icon, color, trend }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold" style={{ color }}>
            {value.toFixed(1)}{unit}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {icon}
          {trend && (
            <div className={`text-sm ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
               trend === 'down' ? <TrendingDown className="w-4 h-4" /> : 
               <Clock className="w-4 h-4" />}
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
));

MetricCard.displayName = 'MetricCard';

const AgentMetrics = memo<AgentMetricsProps>(({ agentId, metrics, systemMetrics, isLoading = false }) => {
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

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>No hay métricas disponibles para el agente {agentId}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 80) return '#10B981';
    if (performance >= 60) return '#3B82F6';
    if (performance >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const getPerformanceTrend = (performance: number) => {
    if (performance >= 80) return 'up' as const;
    if (performance >= 60) return 'stable' as const;
    return 'down' as const;
  };

  return (
    <div className="space-y-6">
      {/* Agent Specific Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Métricas del Agente {agentId}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Rendimiento"
              value={metrics.performance}
              unit="%"
              icon={<Cpu className="w-5 h-5" />}
              color={getPerformanceColor(metrics.performance)}
              trend={getPerformanceTrend(metrics.performance)}
            />
            
            <MetricCard
              title="Errores"
              value={metrics.errors}
              unit=""
              icon={<AlertTriangle className="w-5 h-5" />}
              color={metrics.errors > 5 ? '#EF4444' : '#10B981'}
              trend={metrics.errors > 5 ? 'down' : 'up'}
            />
            
            <MetricCard
              title="Tiempo Activo"
              value={metrics.uptime}
              unit="%"
              icon={<Clock className="w-5 h-5" />}
              color="#3B82F6"
              trend="stable"
            />
            
            <MetricCard
              title="Tiempo de Respuesta"
              value={metrics.responseTime}
              unit="ms"
              icon={<Zap className="w-5 h-5" />}
              color={metrics.responseTime > 500 ? '#EF4444' : '#10B981'}
              trend={metrics.responseTime > 500 ? 'down' : 'up'}
            />
          </div>

          {/* Throughput Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Throughput</span>
              <span className="font-medium">{metrics.throughput.toFixed(0)} req/s</span>
            </div>
            <Progress 
              value={(metrics.throughput / 1000) * 100} 
              className="h-2"
            />
          </div>

          {/* Last Update */}
          <div className="mt-4 text-xs text-gray-500">
            Última actualización: {metrics.lastUpdate.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics Comparison */}
      {systemMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Comparación con Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Rendimiento vs Sistema</p>
                <p className={`text-2xl font-bold ${
                  metrics.performance > systemMetrics.totalPerformance ? 'text-green-600' : 'text-red-600'
                }`}>
                  {((metrics.performance / systemMetrics.totalPerformance) * 100).toFixed(1)}%
                </p>
                <Badge variant={metrics.performance > systemMetrics.totalPerformance ? "default" : "destructive"}>
                  {metrics.performance > systemMetrics.totalPerformance ? 'Mejor' : 'Inferior'}
                </Badge>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Errores vs Promedio</p>
                <p className={`text-2xl font-bold ${
                  metrics.errors < (systemMetrics.totalErrors / 8) ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.errors}
                </p>
                <Badge variant={metrics.errors < (systemMetrics.totalErrors / 8) ? "default" : "destructive"}>
                  {metrics.errors < (systemMetrics.totalErrors / 8) ? 'Bajo' : 'Alto'}
                </Badge>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Tiempo de Respuesta</p>
                <p className={`text-2xl font-bold ${
                  metrics.responseTime < systemMetrics.averageResponseTime ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.responseTime.toFixed(0)}ms
                </p>
                <Badge variant={metrics.responseTime < systemMetrics.averageResponseTime ? "default" : "destructive"}>
                  {metrics.responseTime < systemMetrics.averageResponseTime ? 'Rápido' : 'Lento'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

AgentMetrics.displayName = 'AgentMetrics';

export default AgentMetrics;