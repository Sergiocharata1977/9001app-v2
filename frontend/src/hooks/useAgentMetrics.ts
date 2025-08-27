import { useState, useEffect, useMemo, useCallback } from 'react';
import { Agent } from './useAgentStatus';

export interface AgentMetrics {
  agentId: number;
  performance: number;
  errors: number;
  uptime: number;
  responseTime: number;
  throughput: number;
  lastUpdate: Date;
}

export interface SystemMetrics {
  totalPerformance: number;
  totalErrors: number;
  systemUptime: number;
  averageResponseTime: number;
  totalThroughput: number;
}

export const useAgentMetrics = (agentId?: number) => {
  const [metrics, setMetrics] = useState<AgentMetrics[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Simular métricas en tiempo real
  const generateMetrics = useCallback((agentId: number): AgentMetrics => ({
    agentId,
    performance: Math.random() * 100,
    errors: Math.floor(Math.random() * 10),
    uptime: Math.random() * 100,
    responseTime: Math.random() * 1000,
    throughput: Math.random() * 1000,
    lastUpdate: new Date()
  }), []);

  // Actualizar métricas para un agente específico
  const updateAgentMetrics = useCallback((agentId: number) => {
    setMetrics(prev => {
      const existingIndex = prev.findIndex(m => m.agentId === agentId);
      const newMetrics = generateMetrics(agentId);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newMetrics;
        return updated;
      } else {
        return [...prev, newMetrics];
      }
    });
  }, [generateMetrics]);

  // Actualizar métricas del sistema
  const updateSystemMetrics = useCallback(() => {
    if (metrics.length === 0) return;

    const totalPerformance = metrics.reduce((sum, m) => sum + m.performance, 0) / metrics.length;
    const totalErrors = metrics.reduce((sum, m) => sum + m.errors, 0);
    const systemUptime = metrics.reduce((sum, m) => sum + m.uptime, 0) / metrics.length;
    const averageResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
    const totalThroughput = metrics.reduce((sum, m) => sum + m.throughput, 0);

    setSystemMetrics({
      totalPerformance,
      totalErrors,
      systemUptime,
      averageResponseTime,
      totalThroughput
    });
  }, [metrics]);

  // Obtener métricas de un agente específico
  const getAgentMetrics = useCallback((agentId: number): AgentMetrics | null => {
    return metrics.find(m => m.agentId === agentId) || null;
  }, [metrics]);

  // Obtener métricas filtradas por rango de performance
  const getMetricsByPerformance = useCallback((minPerformance: number, maxPerformance: number): AgentMetrics[] => {
    return metrics.filter(m => m.performance >= minPerformance && m.performance <= maxPerformance);
  }, [metrics]);

  // Obtener agentes con errores
  const getAgentsWithErrors = useCallback((): AgentMetrics[] => {
    return metrics.filter(m => m.errors > 0);
  }, [metrics]);

  // Memoizar estadísticas de rendimiento
  const performanceStats = useMemo(() => {
    if (metrics.length === 0) return null;

    const sortedByPerformance = [...metrics].sort((a, b) => b.performance - a.performance);
    const sortedByErrors = [...metrics].sort((a, b) => b.errors - a.errors);

    return {
      topPerformers: sortedByPerformance.slice(0, 3),
      worstPerformers: sortedByPerformance.slice(-3),
      mostErrors: sortedByErrors.slice(0, 3),
      averagePerformance: metrics.reduce((sum, m) => sum + m.performance, 0) / metrics.length
    };
  }, [metrics]);

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    if (agentId) {
      // Actualizar métricas para agente específico
      const interval = setInterval(() => {
        updateAgentMetrics(agentId);
      }, 5000);

      return () => clearInterval(interval);
    } else {
      // Actualizar métricas para todos los agentes
      const interval = setInterval(() => {
        for (let i = 1; i <= 8; i++) {
          updateAgentMetrics(i);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [agentId, updateAgentMetrics]);

  // Actualizar métricas del sistema cuando cambian las métricas de agentes
  useEffect(() => {
    updateSystemMetrics();
  }, [metrics, updateSystemMetrics]);

  return {
    metrics: agentId ? getAgentMetrics(agentId) : metrics,
    systemMetrics,
    loading,
    performanceStats,
    getAgentMetrics,
    getMetricsByPerformance,
    getAgentsWithErrors,
    updateAgentMetrics
  };
};