import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Activity,
  Settings,
  BarChart3,
  Zap,
  Database,
  Code,
  Palette,
  TestTube,
  FileText,
  Shield,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  X,
  Workflow,
  GitBranch,
  Users,
  Server
} from 'lucide-react';
import { useAgentStatus } from '@/hooks/useAgentStatus';

interface AgentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const AgentMenu = memo<AgentMenuProps>(({ isOpen, onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { agents, getActiveAgents, getCompletedAgents } = useAgentStatus();
  const [expandedSections, setExpandedSections] = React.useState<string[]>(['overview', 'agents', 'controls']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleBackToSuperAdmin = () => {
    navigate('/super-admin/dashboard');
  };

  const agentStats = React.useMemo(() => ({
    total: agents.length,
    active: getActiveAgents().length,
    completed: getCompletedAgents().length,
    averageProgress: agents.reduce((sum, agent) => sum + agent.progress, 0) / agents.length
  }), [agents, getActiveAgents, getCompletedAgents]);

  const menuSections = React.useMemo(() => [
    {
      id: 'overview',
      name: '📊 Vista General',
      icon: BarChart3,
      color: 'blue',
      items: [
        { 
          name: 'Dashboard de Agentes', 
          path: '/super-admin/agents', 
          icon: Bot,
          description: 'Vista general de todos los agentes'
        },
        { 
          name: 'Estado del Sistema', 
          path: '/super-admin/agents/status', 
          icon: Activity,
          description: 'Estado en tiempo real'
        },
        { 
          name: 'Métricas de Rendimiento', 
          path: '/super-admin/agents/metrics', 
          icon: Zap,
          description: 'Análisis de performance'
        }
      ]
    },
    {
      id: 'agents',
      name: '🤖 Gestión de Agentes',
      icon: Bot,
      color: 'indigo',
      items: [
        { 
          name: 'Coordinador Controlador Principal', 
          path: '/super-admin/agents/1', 
          icon: Shield,
          description: 'Agente 1 - Coordinación general'
        },
        { 
          name: 'Arquitecto de Base de Datos MongoDB', 
          path: '/super-admin/agents/2', 
          icon: Database,
          description: 'Agente 2 - Migración MongoDB'
        },
        { 
          name: 'Configurador de Backend', 
          path: '/super-admin/agents/3', 
          icon: Server,
          description: 'Agente 3 - Configuración backend'
        },
        { 
          name: 'Adaptador de Frontend', 
          path: '/super-admin/agents/4', 
          icon: Code,
          description: 'Agente 4 - Adaptación frontend'
        },
        { 
          name: 'Tester de Calidad', 
          path: '/super-admin/agents/5', 
          icon: TestTube,
          description: 'Agente 5 - Pruebas de calidad'
        },
        { 
          name: 'Documentador', 
          path: '/super-admin/agents/6', 
          icon: FileText,
          description: 'Agente 6 - Documentación'
        },
        { 
          name: 'Desplegador', 
          path: '/super-admin/agents/7', 
          icon: Zap,
          description: 'Agente 7 - Despliegues'
        },
        { 
          name: 'Rehabilitador de Sistema', 
          path: '/super-admin/agents/8', 
          icon: Shield,
          description: 'Agente 8 - Rehabilitación'
        }
      ]
    },
    {
      id: 'controls',
      name: '⚙️ Controles Avanzados',
      icon: Settings,
      color: 'green',
      items: [
        { 
          name: 'Coordinación de Agentes', 
          path: '/super-admin/coordination', 
          icon: Bot,
          description: 'Control de coordinación'
        },
        { 
          name: 'Sistema de Agentes Final', 
          path: '/super-admin/agents/final', 
          icon: Workflow,
          description: 'Sistema completo de agentes'
        },
        { 
          name: 'Demo de Flujo', 
          path: '/super-admin/workflow-demo', 
          icon: GitBranch,
          description: 'Demo interactivo'
        },
        { 
          name: 'Etapas Detalladas', 
          path: '/super-admin/workflow-stages', 
          icon: Code,
          description: 'Vista técnica detallada'
        }
      ]
    }
  ], []);

  const getColorClasses = React.useMemo(() => (color: string, isActive = false) => {
    const colors: Record<string, string> = {
      blue: isActive ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50',
      indigo: isActive ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50',
      green: isActive ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-50'
    };
    return colors[color] || colors.blue;
  }, []);

  return (
    <motion.div
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      className="h-full w-80 bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900 text-white flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="p-6 border-b border-indigo-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">Sistema de Agentes</div>
              <div className="text-xs text-indigo-300">Panel de Control de Agentes</div>
            </div>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-indigo-700/50"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        {/* Botón para volver al Super Admin */}
        <Button
          onClick={handleBackToSuperAdmin}
          variant="outline"
          className="w-full border-indigo-500 text-indigo-300 hover:bg-indigo-700/50 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Super Admin
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="p-4 border-b border-indigo-700/50">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-indigo-700/30 rounded-lg">
            <div className="text-lg font-bold text-white">{agentStats.active}</div>
            <div className="text-xs text-indigo-300">Activos</div>
          </div>
          <div className="text-center p-3 bg-indigo-700/30 rounded-lg">
            <div className="text-lg font-bold text-white">{agentStats.averageProgress.toFixed(0)}%</div>
            <div className="text-xs text-indigo-300">Progreso</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuSections.map((section) => (
          <div key={section.id} className="space-y-2">
            <button
              onClick={() => toggleSection(section.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                expandedSections.includes(section.id)
                  ? 'bg-indigo-700/50 text-white'
                  : 'text-indigo-200 hover:bg-indigo-700/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.name}</span>
              </div>
              {expandedSections.includes(section.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.includes(section.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 ml-8"
                >
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-indigo-200 hover:bg-indigo-700/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs opacity-75">{item.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-indigo-700/50">
        <div className="text-center">
          <div className="text-xs text-indigo-300 mb-2">
            Sistema de Agentes de Migración
          </div>
          <div className="text-xs text-indigo-400">
            © 2024 ISO Flow - Agent Control Panel
          </div>
        </div>
      </div>
    </motion.div>
  );
});

AgentMenu.displayName = 'AgentMenu';

export default AgentMenu;