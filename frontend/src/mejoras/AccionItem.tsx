import React from 'react';
import { cn } from '@/lib/utils';
import type { Accion } from '../types/mejoras';

interface AccionItemProps {
  accion: Accion;
}

const getActionTypeInfo = (type: Accion['tipo']) => {
  switch (type) {
    case 'correctiva':
      return {
        title: 'Acción Correctiva',
        className: 'border-red-500',
      };
    case 'preventiva':
      return {
        title: 'Acción Preventiva',
        className: 'border-blue-500',
      };
    case 'mejora':
      return {
        title: 'Acción de Mejora',
        className: 'border-green-500',
      };
    default:
      return {
        title: 'Acción',
        className: 'border-gray-500',
      };
  }
};

const AccionItem: React.FC<AccionItemProps> = ({ accion }) => {
  const { title, className } = getActionTypeInfo(accion.tipo);

  return (
    <div className={cn('flex items-start p-3 bg-white rounded-lg border-l-4 shadow-sm', className)}>
      <div className="flex-grow">
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{accion.descripcion}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Fecha límite: {new Date(accion.fecha_limite).toLocaleDateString()} | 
          Estado: <span className="font-medium capitalize">{accion.estado.replace('_', ' ')}</span>
        </p>
      </div>
    </div>
  );
};

export default AccionItem;