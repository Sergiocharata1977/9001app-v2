import { useState, useCallback, useMemo } from 'react';
import { Agent } from './useAgentStatus';

export interface AgentControl {
  agentId: number;
  isActive: boolean;
  isRunning: boolean;
  canForceRun: boolean;
  lastCommand: string;
  lastCommandTime: Date;
}

export interface ControlActions {
  startAgent: (agentId: number) => void;
  stopAgent: (agentId: number) => void;
  forceRunAgent: (agentId: number) => void;
  restartAgent: (agentId: number) => void;
  resetAgent: (agentId: number) => void;
}

export const useAgentControls = () => {
  const [controls, setControls] = useState<AgentControl[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastAction, setLastAction] = useState<string>('');

  // Inicializar controles para los 8 agentes
  const initializeControls = useCallback(() => {
    const initialControls: AgentControl[] = Array.from({ length: 8 }, (_, index) => ({
      agentId: index + 1,
      isActive: index < 4, // Primeros 4 agentes activos por defecto
      isRunning: index < 3, // Primeros 3 agentes ejecutándose
      canForceRun: true,
      lastCommand: 'initialized',
      lastCommandTime: new Date()
    }));
    setControls(initialControls);
  }, []);

  // Obtener control de un agente específico
  const getAgentControl = useCallback((agentId: number): AgentControl | undefined => {
    return controls.find(control => control.agentId === agentId);
  }, [controls]);

  // Iniciar agente
  const startAgent = useCallback((agentId: number) => {
    setIsProcessing(true);
    setLastAction(`Starting agent ${agentId}`);
    
    setControls(prev => prev.map(control => 
      control.agentId === agentId 
        ? { 
            ...control, 
            isActive: true, 
            isRunning: true,
            lastCommand: 'start',
            lastCommandTime: new Date()
          }
        : control
    ));
    
    setTimeout(() => setIsProcessing(false), 1000);
  }, []);

  // Detener agente
  const stopAgent = useCallback((agentId: number) => {
    setIsProcessing(true);
    setLastAction(`Stopping agent ${agentId}`);
    
    setControls(prev => prev.map(control => 
      control.agentId === agentId 
        ? { 
            ...control, 
            isActive: false, 
            isRunning: false,
            lastCommand: 'stop',
            lastCommandTime: new Date()
          }
        : control
    ));
    
    setTimeout(() => setIsProcessing(false), 1000);
  }, []);

  // Forzar ejecución de agente
  const forceRunAgent = useCallback((agentId: number) => {
    setIsProcessing(true);
    setLastAction(`Force running agent ${agentId}`);
    
    setControls(prev => prev.map(control => 
      control.agentId === agentId 
        ? { 
            ...control, 
            isActive: true, 
            isRunning: true,
            canForceRun: false, // Deshabilitar temporalmente
            lastCommand: 'force_run',
            lastCommandTime: new Date()
          }
        : control
    ));
    
    // Rehabilitar force run después de 30 segundos
    setTimeout(() => {
      setControls(prev => prev.map(control => 
        control.agentId === agentId 
          ? { ...control, canForceRun: true }
          : control
      ));
    }, 30000);
    
    setTimeout(() => setIsProcessing(false), 2000);
  }, []);

  // Reiniciar agente
  const restartAgent = useCallback((agentId: number) => {
    setIsProcessing(true);
    setLastAction(`Restarting agent ${agentId}`);
    
    setControls(prev => prev.map(control => 
      control.agentId === agentId 
        ? { 
            ...control, 
            isActive: false, 
            isRunning: false,
            lastCommand: 'restart',
            lastCommandTime: new Date()
          }
        : control
    ));
    
    // Reactivar después de 2 segundos
    setTimeout(() => {
      setControls(prev => prev.map(control => 
        control.agentId === agentId 
          ? { 
              ...control, 
              isActive: true, 
              isRunning: true,
              lastCommand: 'restarted',
              lastCommandTime: new Date()
            }
          : control
      ));
    }, 2000);
    
    setTimeout(() => setIsProcessing(false), 3000);
  }, []);

  // Resetear agente
  const resetAgent = useCallback((agentId: number) => {
    setIsProcessing(true);
    setLastAction(`Resetting agent ${agentId}`);
    
    setControls(prev => prev.map(control => 
      control.agentId === agentId 
        ? { 
            ...control, 
            isActive: false, 
            isRunning: false,
            canForceRun: true,
            lastCommand: 'reset',
            lastCommandTime: new Date()
          }
        : control
    ));
    
    setTimeout(() => setIsProcessing(false), 1500);
  }, []);

  // Control masivo de agentes
  const startAllAgents = useCallback(() => {
    setIsProcessing(true);
    setLastAction('Starting all agents');
    
    setControls(prev => prev.map(control => ({
      ...control,
      isActive: true,
      isRunning: true,
      lastCommand: 'start_all',
      lastCommandTime: new Date()
    })));
    
    setTimeout(() => setIsProcessing(false), 2000);
  }, []);

  const stopAllAgents = useCallback(() => {
    setIsProcessing(true);
    setLastAction('Stopping all agents');
    
    setControls(prev => prev.map(control => ({
      ...control,
      isActive: false,
      isRunning: false,
      lastCommand: 'stop_all',
      lastCommandTime: new Date()
    })));
    
    setTimeout(() => setIsProcessing(false), 2000);
  }, []);

  // Memoizar estadísticas de controles
  const controlStats = useMemo(() => ({
    total: controls.length,
    active: controls.filter(c => c.isActive).length,
    running: controls.filter(c => c.isRunning).length,
    canForceRun: controls.filter(c => c.canForceRun).length,
    lastAction
  }), [controls, lastAction]);

  // Inicializar controles al montar el hook
  useMemo(() => {
    if (controls.length === 0) {
      initializeControls();
    }
  }, [controls.length, initializeControls]);

  return {
    controls,
    isProcessing,
    lastAction,
    controlStats,
    getAgentControl,
    startAgent,
    stopAgent,
    forceRunAgent,
    restartAgent,
    resetAgent,
    startAllAgents,
    stopAllAgents
  };
};