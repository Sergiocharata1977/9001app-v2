import React from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { AccionKanbanCard } from './AccionKanbanCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AccionKanbanColumn({ id, title, acciones, onCardClick, colorClasses }) {
  const { setNodeRef } = useSortable({ id });

  return (
    <div ref={setNodeRef} className={`flex flex-col w-80 flex-shrink-0 rounded-lg ${colorClasses}`}>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
          {title}
          <span className="ml-2 text-sm font-normal bg-black/10 dark:bg-white/10 rounded-full px-2 py-0.5">
            {acciones.length}
          </span>
        </h3>
      </div>
      <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-black/5 dark:bg-black/10">
        <SortableContext items={acciones.map(a => a.id)}>
            {acciones.map((accion) => (
              <AccionKanbanCard key={accion.id} accion={accion} onClick={onCardClick} />
            ))}
            {acciones.length === 0 && (
              <div className="flex items-center justify-center h-full text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                No hay acciones en este estado
              </div>
            )}
        </SortableContext>
      </div>
    </div>
  );
}
