import React from 'react';
import { StandardKanbanBoard, KanbanItem } from '@/components/common/StandardKanbanBoard';
import { HALLAZGOS_KANBAN_CONFIG } from '@/config/kanbanConfig';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Eye, Zap, CheckSquare, CheckCircle, Calendar, User } from 'lucide-react';

interface Hallazgo {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'Identificado' | 'En Análisis' | 'En Acción' | 'En Verificación' | 'Cerrado';
  prioridad: 'alta' | 'media' | 'baja';
  responsable: string;
  fecha_identificacion: string;
  fecha_limite: string;
  norma_iso: string;
  proceso_afectado: string;
  accion_correctiva: string;
  evidencia: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: number;
}

interface HallazgoKanbanBoardProps {
  hallazgos: Hallazgo[];
  onCardClick?: (hallazgo: Hallazgo) => void;
  onHallazgoStateChange?: (hallazgoId: string, newEstado: string) => void;
}

// Componente de tarjeta personalizada para hallazgos
const HallazgoKanbanCard: React.FC<{ item: KanbanItem }> = ({ item }) => {
  const hallazgo = item as unknown as Hallazgo;
  
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Identificado':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'En Análisis':
        return <Eye className="w-4 h-4 text-orange-600" />;
      case 'En Acción':
        return <Zap className="w-4 h-4 text-blue-600" />;
      case 'En Verificación':
        return <CheckSquare className="w-4 h-4 text-yellow-600" />;
      case 'Cerrado':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
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

  const getDiasRestantes = (fechaLimite: string) => {
    const limite = new Date(fechaLimite);
    const hoy = new Date();
    const diffTime = limite.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const diasRestantes = getDiasRestantes(hallazgo.fecha_limite);

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-semibold text-gray-800 line-clamp-2">
              {hallazgo.titulo}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {getEstadoIcon(hallazgo.estado)}
              <Badge variant="outline" className="text-xs">
                {hallazgo.estado}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <div className="space-y-2 text-xs text-gray-600">
          {hallazgo.descripcion && (
            <p className="line-clamp-2 text-gray-700">
              {hallazgo.descripcion}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`text-xs ${getPrioridadColor(hallazgo.prioridad)}`}>
              {hallazgo.prioridad.toUpperCase()}
            </Badge>
            {hallazgo.responsable && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="text-xs text-gray-500 truncate">
                  {hallazgo.responsable}
                </span>
              </div>
            )}
          </div>

          {hallazgo.norma_iso && (
            <div className="text-xs text-gray-500">
              ISO: {hallazgo.norma_iso}
            </div>
          )}

          {hallazgo.proceso_afectado && (
            <div className="text-xs text-gray-500">
              Proceso: {hallazgo.proceso_afectado}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span className="text-xs text-gray-500">Límite:</span>
            </div>
            <span className={`text-xs font-semibold ${
              diasRestantes < 0 ? 'text-red-600' : 
              diasRestantes <= 3 ? 'text-orange-600' : 'text-gray-600'
            }`}>
              {diasRestantes < 0 ? `${Math.abs(diasRestantes)} días vencido` :
               diasRestantes === 0 ? 'Hoy' : `${diasRestantes} días`}
            </span>
          </div>

          <div className="text-xs text-gray-400">
            {new Date(hallazgo.fecha_identificacion).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const HallazgoKanbanBoard: React.FC<HallazgoKanbanBoardProps> = ({
  hallazgos,
  onCardClick,
  onHallazgoStateChange
}) => {
  // Convertir hallazgos a formato KanbanItem
  const kanbanItems: KanbanItem[] = hallazgos.map(hallazgo => ({
    id: hallazgo.id,
    title: hallazgo.titulo,
    description: hallazgo.descripcion,
    status: hallazgo.estado,
    priority: hallazgo.prioridad,
    assignedTo: hallazgo.responsable,
    dueDate: hallazgo.fecha_limite,
    // Incluir todos los datos del hallazgo para acceso en la tarjeta
    ...hallazgo
  }));

  const handleStatusChange = (itemId: string, newStatus: string) => {
    if (onHallazgoStateChange) {
      onHallazgoStateChange(itemId, newStatus);
    }
  };

  const handleCardClick = (item: KanbanItem) => {
    if (onCardClick) {
      onCardClick(item as unknown as Hallazgo);
    }
  };

  return (
    <div className="w-full">
      <StandardKanbanBoard
        items={kanbanItems}
        columns={HALLAZGOS_KANBAN_CONFIG}
        onItemClick={handleCardClick}
        onStatusChange={handleStatusChange}
        renderItem={(item) => <HallazgoKanbanCard item={item} />}
        className="p-4"
      />
    </div>
  );
};

export default HallazgoKanbanBoard;
