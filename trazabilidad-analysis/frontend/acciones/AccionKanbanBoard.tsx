import React from 'react';
import { StandardKanbanBoard, KanbanItem } from '@/components/common/StandardKanbanBoard';
import { ACCIONES_KANBAN_CONFIG } from '@/config/kanbanConfig';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, CheckSquare, CheckCircle, Calendar, User, Target } from 'lucide-react';

interface Accion {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'Planificada' | 'En Proceso' | 'En Verificación' | 'Implementada';
  prioridad: 'alta' | 'media' | 'baja';
  responsable: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_limite: string;
  tipo_accion: string;
  hallazgo_id: string;
  proceso_afectado: string;
  accion_correctiva: string;
  accion_preventiva: string;
  evidencia: string;
  costo_estimado: number;
  costo_real: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: number;
}

interface AccionKanbanBoardProps {
  acciones: Accion[];
  onCardClick?: (accion: Accion) => void;
  onAccionStateChange?: (accionId: string, newEstado: string) => void;
}

// Componente de tarjeta personalizada para acciones
const AccionKanbanCard: React.FC<{ item: KanbanItem }> = ({ item }) => {
  const accion = item as unknown as Accion;
  
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Planificada':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'En Proceso':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'En Verificación':
        return <CheckSquare className="w-4 h-4 text-yellow-600" />;
      case 'Implementada':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'bg-red-100 text-red-700';
      case 'media':
        return 'bg-yellow-100 text-yellow-700';
      case 'baja':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getProgreso = (fechaInicio: string, fechaFin: string) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const hoy = new Date();
    
    const totalDias = fin.getTime() - inicio.getTime();
    const diasTranscurridos = hoy.getTime() - inicio.getTime();
    
    if (totalDias <= 0) return 100;
    if (diasTranscurridos <= 0) return 0;
    
    const progreso = (diasTranscurridos / totalDias) * 100;
    return Math.min(Math.max(progreso, 0), 100);
  };

  const progreso = getProgreso(accion.fecha_inicio, accion.fecha_fin);

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-semibold text-gray-800 line-clamp-2">
              {accion.titulo}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {getEstadoIcon(accion.estado)}
              <Badge variant="outline" className="text-xs">
                {accion.estado}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <div className="space-y-2 text-xs text-gray-600">
          {accion.descripcion && (
            <p className="line-clamp-2 text-gray-700">
              {accion.descripcion}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`text-xs ${getPrioridadColor(accion.prioridad)}`}>
              {accion.prioridad.toUpperCase()}
            </Badge>
            {accion.responsable && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="text-xs text-gray-500 truncate">
                  {accion.responsable}
                </span>
              </div>
            )}
          </div>

          {accion.tipo_accion && (
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span className="text-xs text-gray-500">
                {accion.tipo_accion}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span className="text-xs text-gray-500">Progreso:</span>
            </div>
            <span className="text-xs font-semibold text-blue-600">
              {progreso.toFixed(0)}%
            </span>
          </div>

          {accion.costo_estimado && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Costo:</span>
              <span className="text-xs font-mono">
                ${accion.costo_estimado.toLocaleString()}
              </span>
            </div>
          )}

          <div className="text-xs text-gray-400">
            {new Date(accion.fecha_inicio).toLocaleDateString()} - {new Date(accion.fecha_fin).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AccionKanbanBoard: React.FC<AccionKanbanBoardProps> = ({
  acciones,
  onCardClick,
  onAccionStateChange
}) => {
  // Convertir acciones a formato KanbanItem
  const kanbanItems: KanbanItem[] = acciones.map(accion => ({
    id: accion.id,
    title: accion.titulo,
    description: accion.descripcion,
    status: accion.estado,
    priority: accion.prioridad,
    assignedTo: accion.responsable,
    dueDate: accion.fecha_fin,
    // Incluir todos los datos de la acción para acceso en la tarjeta
    ...accion
  }));

  const handleStatusChange = (itemId: string, newStatus: string) => {
    if (onAccionStateChange) {
      onAccionStateChange(itemId, newStatus);
    }
  };

  const handleCardClick = (item: KanbanItem) => {
    if (onCardClick) {
      onCardClick(item as unknown as Accion);
    }
  };

  return (
    <div className="w-full">
      <StandardKanbanBoard
        items={kanbanItems}
        columns={ACCIONES_KANBAN_CONFIG}
        onItemClick={handleCardClick}
        onStatusChange={handleStatusChange}
        renderItem={(item) => <AccionKanbanCard item={item} />}
        className="p-4"
      />
    </div>
  );
};

export default AccionKanbanBoard;
