import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, FileText, Tag } from 'lucide-react';
// Diseño avanzado Kanban para Acciones
// - Colores de columna y badges según prioridad
// - Métricas, etiquetas, responsable, fecha, prioridad, botones
// - Sin DragOverlay, solo useSortable

const prioridadVariantMap = {
  Alta: 'destructive',
  Media: 'warning',
  Baja: 'default',
};

const InfoRow = ({ icon: Icon, text }) => (
  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
    <Icon className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
    <span className="truncate">{text || 'No disponible'}</span>
  </div>
);

// Tarjeta Kanban avanzada para Acciones
// Props:
// - accion: objeto con los datos de la acción
// - columnColor: color opcional para el borde (lo puede pasar la columna)
export function AccionKanbanCard({ accion, columnColor, onClick }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: accion.id,
    data: { type: 'Accion', accion },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  // TODO: Adaptar la navegación y los datos mostrados a la "acción" en lugar del "hallazgo"
  const handleCardClick = (e) => {
    if (e.target.closest('a, button')) return;
    // navigate(`/acciones/${accion.id}`); // La ruta podría ser diferente
  };

  // Puedes pasar el color de borde desde la columna, o usar uno por defecto
  const borderColor = columnColor || 'border-blue-400';

  // Badge de prioridad
  const prioridadLabel = accion.prioridad || 'Media';
  const prioridadColor = {
    Alta: 'bg-red-500 text-white',
    Media: 'bg-yellow-400 text-black',
    Baja: 'bg-green-500 text-white',
  }[prioridadLabel] || 'bg-gray-200 text-gray-800';

  // Etiquetas/categorías
  const etiquetas = accion.etiquetas || accion.categorias || [];
  // Métricas, si existen
  const metricas = accion.metricas || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(accion.id)}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className={`bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow border-l-4 ${borderColor}`}>
        {/* Header: Prioridad y Título */}
        <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-base font-bold text-gray-800 dark:text-white mb-1">
              {accion.titulo || accion.descripcion}
            </CardTitle>
            <div className="flex flex-wrap gap-1 mb-1">
              {etiquetas.map((et, idx) => (
                <Badge key={idx} variant="outline" className="text-xs flex items-center">
                  <Tag className="h-3 w-3 mr-1" />{et}
                </Badge>
              ))}
            </div>
          </div>
          <Badge className={`text-xs px-2 py-1 rounded ${prioridadColor}`}>{prioridadLabel}</Badge>
        </CardHeader>
        {/* Descripción */}
        <CardContent className="p-4 pt-0 text-sm text-gray-700 dark:text-gray-200">
          <div>{accion.descripcion}</div>
          {/* Métricas (si existen) */}
          {metricas.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {metricas.map((met, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">{met}</Badge>
              ))}
            </div>
          )}
        </CardContent>
        {/* Info: Responsable, Fecha, etc. */}
        <CardContent className="p-4 pt-0 space-y-2 border-t dark:border-gray-700">
          <InfoRow icon={User} text={accion.responsable} />
          <InfoRow icon={Calendar} text={accion.fecha_fin ? new Date(accion.fecha_fin).toLocaleDateString() : 'Sin fecha'} />
        </CardContent>
        {/* Footer: Botón de detalles */}
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          {/* Puedes agregar más botones aquí */}
          <a href={`#`} className="text-xs font-semibold text-blue-600 hover:underline">Ver detalles</a>
        </CardFooter>
      </Card>
    </div>
  );
}
