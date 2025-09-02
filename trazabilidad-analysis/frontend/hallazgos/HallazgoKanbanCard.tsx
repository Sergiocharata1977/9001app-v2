import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, FileText, Tag, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const HallazgoKanbanCard = ({ hallazgo, onCardClick, onViewDetailsClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: hallazgo.id,
    data: {
      type: 'Hallazgo',
      hallazgo,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-ES');
  };

  const getPriorityInfo = (priorityKey) => {
    const priorityMap = {
      'alta': { label: 'Alta', className: 'bg-red-500 text-white' },
      'media': { label: 'Media', className: 'bg-yellow-500 text-black' },
      'baja': { label: 'Baja', className: 'bg-green-500 text-white' },
    };
    return priorityMap[priorityKey?.toLowerCase()] || { label: priorityKey, className: 'bg-gray-200 text-gray-800' };
  };

    const priorityInfo = getPriorityInfo(hallazgo.prioridad);

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    onViewDetailsClick(hallazgo.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onCardClick(hallazgo.id)}
      className="mb-4 touch-none cursor-pointer"
    >
      <Card className="bg-card hover:shadow-lg transition-shadow duration-200 border-l-4 border-transparent hover:border-primary">
        <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base font-bold flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-muted-foreground"/>
                {hallazgo.numeroHallazgo || `H-${hallazgo.id.substring(0,4)}`}
            </CardTitle>
            <Badge variant="outline" className={priorityInfo.className}>{priorityInfo.label}</Badge>
          </div>
          <p className="text-sm font-semibold mt-1">{hallazgo.descripcion}</p>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center">
                <User className="h-3 w-3 mr-2" />
                <span>{hallazgo.responsable || 'No asignado'}</span>
            </div>
            <div className="flex items-center">
                <Clock className="h-3 w-3 mr-2" />
                <span>{formatDate(hallazgo.fecha_deteccion)}</span>
            </div>
        </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <Badge variant="secondary">{hallazgo.proceso?.nombre || 'General'}</Badge>
            <Button variant="ghost" size="icon" onClick={handleDetailsClick} className="h-6 w-6" aria-label="Ver detalles">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HallazgoKanbanCard;
