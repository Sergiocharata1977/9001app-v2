import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Hallazgo } from '../types/mejoras';

interface HallazgoCardProps {
  hallazgo: Hallazgo;
  onClick: (hallazgo: Hallazgo) => void;
}

const getPriorityBadgeClass = (priority: Hallazgo['prioridad']) => {
  switch (priority?.toLowerCase()) {
    case 'critica':
      return 'bg-red-600 border-transparent text-white';
    case 'alta':
      return 'bg-red-500 border-transparent text-white';
    case 'media':
      return 'bg-yellow-500 border-transparent text-white';
    case 'baja':
      return 'bg-green-500 border-transparent text-white';
    default:
      return 'bg-gray-400 border-transparent text-white';
  }
};

const getEstadoBadgeClass = (estado: Hallazgo['estado']) => {
  switch (estado) {
    case 'detectado':
      return 'bg-purple-500 border-transparent text-white';
    case 'analisis':
      return 'bg-blue-500 border-transparent text-white';
    case 'planificacion':
      return 'bg-orange-500 border-transparent text-white';
    case 'ejecucion':
      return 'bg-indigo-500 border-transparent text-white';
    case 'verificacion':
      return 'bg-teal-500 border-transparent text-white';
    case 'cerrado':
      return 'bg-slate-600 border-transparent text-white';
    default:
      return 'bg-gray-400 border-transparent text-white';
  }
};

const getEstadoLabel = (estado: Hallazgo['estado']) => {
  switch (estado) {
    case 'detectado':
      return 'Detectado';
    case 'analisis':
      return 'En Análisis';
    case 'planificacion':
      return 'Planificación';
    case 'ejecucion':
      return 'Ejecución';
    case 'verificacion':
      return 'Verificación';
    case 'cerrado':
      return 'Cerrado';
    default:
      return estado;
  }
};

const HallazgoCard: React.FC<HallazgoCardProps> = ({ hallazgo, onClick }) => {
  if (!hallazgo) {
    return null;
  }

  return (
    <Card className="w-full overflow-hidden transition-shadow duration-300 hover:shadow-lg dark:bg-slate-800">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-gray-800 dark:text-gray-100">{hallazgo.codigo}</span>
            <Badge className={getPriorityBadgeClass(hallazgo.prioridad)}>
              {hallazgo.prioridad.charAt(0).toUpperCase() + hallazgo.prioridad.slice(1)}
            </Badge>
          </div>
          <Badge className={getEstadoBadgeClass(hallazgo.estado)}>
            {getEstadoLabel(hallazgo.estado)}
          </Badge>
        </div>

        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {hallazgo.titulo}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm min-h-[40px] line-clamp-2">
          {hallazgo.descripcion}
        </p>

        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{hallazgo.responsable_id || 'No asignado'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {hallazgo.fecha_deteccion 
                  ? format(new Date(hallazgo.fecha_deteccion), 'dd/MM/yyyy', { locale: es }) 
                  : 'N/A'
                }
              </span>
            </div>
          </div>
         
          <Button variant="ghost" size="sm" onClick={() => onClick(hallazgo)}>
            Ver Detalles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HallazgoCard;