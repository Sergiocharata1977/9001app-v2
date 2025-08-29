import React from 'react';
import { GitCommit, PlusCircle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistorialItemData {
  tipo: 'estado' | 'creacion' | 'accion' | 'comentario';
  descripcion: string;
  fecha: string;
  usuario: string;
}

interface HistorialItemProps {
  item: HistorialItemData;
  isLast: boolean;
}

interface HistoryTypeInfo {
  Icon: LucideIcon;
  className: string;
}

const getHistoryTypeInfo = (type: HistorialItemData['tipo']): HistoryTypeInfo => {
  switch (type) {
    case 'estado':
      return {
        Icon: GitCommit,
        className: 'text-blue-500 bg-blue-100',
      };
    case 'creacion':
      return {
        Icon: PlusCircle,
        className: 'text-green-500 bg-green-100',
      };
    case 'accion':
      return {
        Icon: GitCommit,
        className: 'text-orange-500 bg-orange-100',
      };
    case 'comentario':
      return {
        Icon: GitCommit,
        className: 'text-purple-500 bg-purple-100',
      };
    default:
      return {
        Icon: GitCommit,
        className: 'text-gray-500 bg-gray-100',
      };
  }
};

const HistorialItem: React.FC<HistorialItemProps> = ({ item, isLast }) => {
  const { Icon, className } = getHistoryTypeInfo(item.tipo);

  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-4">
        <div className={cn('flex items-center justify-center w-8 h-8 rounded-full z-10', className)}>
          <Icon className="w-5 h-5" />
        </div>
        {!isLast && <div className="w-px h-full bg-gray-300" />}
      </div>
      <div className="flex-grow pb-8">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-700">{item.descripcion}</p>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{item.fecha}</p>
            <p className="text-xs text-muted-foreground">{item.usuario}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialItem;