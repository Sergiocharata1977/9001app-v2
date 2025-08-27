import { useState, useCallback, useMemo } from 'react';

export interface Agent {
  id: number;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'completed';
  progress: number;
  lastActivity: Date;
  description: string;
  icon: string;
  color: string;
}

export interface AgentStatus {
  agents: Agent[];
  loading: boolean;
  error: string | null;
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: 1,
    name: 'Coordinador Controlador Principal',
    status: 'active',
    progress: 85,
    lastActivity: new Date(),
    description: 'Coordina todos los agentes de migración',
    icon: '🎯',
    color: '#8B5CF6'
  },
  {
    id: 2,
    name: 'Arquitecto de Base de Datos MongoDB',
    status: 'active',
    progress: 72,
    lastActivity: new Date(),
    description: 'Gestiona la migración de MongoDB',
    icon: '🗄️',
    color: '#10B981'
  },
  {
    id: 3,
    name: 'Configurador de Backend',
    status: 'inactive',
    progress: 45,
    lastActivity: new Date(),
    description: 'Configura el backend Node.js',
    icon: '⚙️',
    color: '#F59E0B'
  },
  {
    id: 4,
    name: 'Adaptador de Frontend',
    status: 'active',
    progress: 90,
    lastActivity: new Date(),
    description: 'Adapta componentes React/TypeScript',
    icon: '🎨',
    color: '#3B82F6'
  },
  {
    id: 5,
    name: 'Tester de Calidad',
    status: 'error',
    progress: 30,
    lastActivity: new Date(),
    description: 'Ejecuta pruebas de calidad',
    icon: '🧪',
    color: '#EF4444'
  },
  {
    id: 6,
    name: 'Documentador',
    status: 'completed',
    progress: 100,
    lastActivity: new Date(),
    description: 'Genera documentación técnica',
    icon: '📚',
    color: '#059669'
  },
  {
    id: 7,
    name: 'Desplegador',
    status: 'inactive',
    progress: 0,
    lastActivity: new Date(),
    description: 'Gestiona despliegues automáticos',
    icon: '🚀',
    color: '#7C3AED'
  },
  {
    id: 8,
    name: 'Rehabilitador de Sistema de Agentes',
    status: 'active',
    progress: 60,
    lastActivity: new Date(),
    description: 'Rehabilita y optimiza agentes',
    icon: '🔧',
    color: '#DC2626'
  }
];

export const useAgentStatus = (): AgentStatus & {
  toggleAgent: (agentId: number) => void;
  forceRunAgent: (agentId: number) => void;
  getAgentById: (agentId: number) => Agent | undefined;
  getActiveAgents: () => Agent[];
  getCompletedAgents: () => Agent[];
} => {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const toggleAgent = useCallback((agentId: number) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { 
            ...agent, 
            status: agent.status === 'active' ? 'inactive' : 'active',
            lastActivity: new Date()
          }
        : agent
    ));
  }, []);

  const forceRunAgent = useCallback((agentId: number) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { 
            ...agent, 
            status: 'active',
            progress: Math.min(agent.progress + 10, 100),
            lastActivity: new Date()
          }
        : agent
    ));
  }, []);

  const getAgentById = useCallback((agentId: number): Agent | undefined => {
    return agents.find(agent => agent.id === agentId);
  }, [agents]);

  const getActiveAgents = useCallback((): Agent[] => {
    return agents.filter(agent => agent.status === 'active');
  }, [agents]);

  const getCompletedAgents = useCallback((): Agent[] => {
    return agents.filter(agent => agent.status === 'completed');
  }, [agents]);

  // Memoizar estadísticas para evitar recálculos
  const agentStats = useMemo(() => ({
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    completed: agents.filter(a => a.status === 'completed').length,
    error: agents.filter(a => a.status === 'error').length,
    averageProgress: agents.reduce((sum, agent) => sum + agent.progress, 0) / agents.length
  }), [agents]);

  return {
    agents,
    loading,
    error,
    toggleAgent,
    forceRunAgent,
    getAgentById,
    getActiveAgents,
    getCompletedAgents
  };
};