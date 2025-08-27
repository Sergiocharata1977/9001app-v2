import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap,
  Power,
  PowerOff,
  Settings,
  Activity,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { AgentControl } from '@/hooks/useAgentControls';

export interface AgentControlsProps {
  agentId: number;
  control: AgentControl | undefined;
  isProcessing: boolean;
  onStart: (agentId: number) => void;
  onStop: (agentId: number) => void;
  onForceRun: (agentId: number) => void;
  onRestart: (agentId: number) => void;
  onReset: (agentId: number) => void;
}

const AgentControls = memo<AgentControlsProps>(({
  agentId,
  control,
  isProcessing,
  onStart,
  onStop,
  onForceRun,
  onRestart,
  onReset
}) => {
  if (!control) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Control no disponible para el agente {agentId}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (isActive: boolean, isRunning: boolean) => {
    if (isRunning) return 'bg-green-100 text-green-800 border-green-200';
    if (isActive) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (isActive: boolean, isRunning: boolean) => {
    if (isRunning) return 'Ejecutándose';
    if (isActive) return 'Activo';
    return 'Inactivo';
  };

  const getStatusIcon = (isActive: boolean, isRunning: boolean) => {
    if (isRunning) return <Activity className="w-4 h-4 text-green-500" />;
    if (isActive) return <Clock className="w-4 h-4 text-yellow-500" />;
    return <PowerOff className="w-4 h-4 text-gray-500" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Controles del Agente {agentId}</span>
          </CardTitle>
          <Badge className={`${getStatusColor(control.isActive, control.isRunning)} border`}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(control.isActive, control.isRunning)}
              <span>{getStatusText(control.isActive, control.isRunning)}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Estado</p>
            <p className="font-semibold">
              {control.isActive ? 'Activo' : 'Inactivo'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Ejecución</p>
            <p className="font-semibold">
              {control.isRunning ? 'En Progreso' : 'Detenido'}
            </p>
          </div>
        </div>

        {/* Last Command */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Último Comando</p>
          <div className="flex items-center justify-between">
            <p className="font-medium capitalize">{control.lastCommand.replace('_', ' ')}</p>
            <p className="text-xs text-gray-500">
              {control.lastCommandTime.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Main Controls */}
        <div className="space-y-3">
          {/* Power Switch */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Power className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Estado del Agente</p>
                <p className="text-sm text-gray-500">
                  {control.isActive ? 'Agente habilitado' : 'Agente deshabilitado'}
                </p>
              </div>
            </div>
            <Switch
              checked={control.isActive}
              onCheckedChange={() => control.isActive ? onStop(agentId) : onStart(agentId)}
              disabled={isProcessing}
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={control.isRunning ? "destructive" : "default"}
              onClick={() => control.isRunning ? onStop(agentId) : onStart(agentId)}
              disabled={isProcessing || !control.isActive}
              className="h-12"
            >
              {control.isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => onRestart(agentId)}
              disabled={isProcessing}
              className="h-12"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
          </div>

          {/* Advanced Controls */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => onForceRun(agentId)}
              disabled={isProcessing || !control.canForceRun}
              className="h-12"
            >
              <Zap className="w-4 h-4 mr-2" />
              Forzar Ejecución
            </Button>

            <Button
              variant="outline"
              onClick={() => onReset(agentId)}
              disabled={isProcessing}
              className="h-12"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetear
            </Button>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm text-blue-600">Procesando comando...</span>
          </div>
        )}

        {/* Force Run Warning */}
        {!control.canForceRun && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Force Run temporalmente deshabilitado (30s)
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

AgentControls.displayName = 'AgentControls';

export default AgentControls;