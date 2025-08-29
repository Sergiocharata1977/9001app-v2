import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, FileText, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Hallazgo, Accion } from '../types/mejoras';

interface CardProps {
  item: Hallazgo | Accion;
  isOverlay?: boolean;
  onClick: () => void;
}

export function Card({ item, isOverlay = false, onClick }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item._id!,
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0 : 1,
  };

  const isHallazgo = 'codigo' in item; // Distinguir entre Hallazgo y Accion
  const itemNumber = isHallazgo ? (item as Hallazgo).codigo : `ACC-${(item as Accion)._id?.slice(-6)}`;
  const itemTitle = isHallazgo ? (item as Hallazgo).titulo : (item as Accion).descripcion;
  const borderColor = isHallazgo ? 'border-l-4 border-blue-500' : 'border-l-4 border-yellow-500';
  const Icon = isHallazgo ? FileText : Zap;

  return (
    <div
      ref={setNodeRef}
      style={isOverlay ? {} : style}
      {...attributes}
      className={cn(
        "bg-white p-3 mb-3 rounded-lg shadow-sm border dark:bg-gray-900 dark:border-gray-700",
        borderColor,
        isOverlay && "shadow-xl ring-2 ring-emerald-500",
        "transition-opacity duration-200"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow cursor-pointer flex items-center gap-3" onClick={onClick}>
          <Icon size={16} className={cn(isHallazgo ? "text-blue-500" : "text-yellow-500", "flex-shrink-0")} />
          <div className="flex-grow">
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{itemNumber}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{itemTitle}</p>
          </div>
        </div>
        <div {...listeners} className="p-1 cursor-grab text-gray-400 hover:text-gray-700">
          <GripVertical size={16} />
        </div>
      </div>
    </div>
  );
}