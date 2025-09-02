import React from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import HallazgoKanbanCard from './HallazgoKanbanCard';

const HallazgoKanbanColumn = ({ id, title, hallazgos, onCardClick, onViewDetailsClick, colorClasses }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
        <div className={`flex flex-col w-full md:w-1/4 p-4 rounded-lg ${colorClasses || 'bg-muted/60'}`}>
      <h3 className="text-lg font-semibold mb-4 px-1 flex justify-between items-center">
        <span>{title}</span>
        <span className="text-sm font-normal bg-primary/10 text-primary rounded-full px-2 py-1">
          {hallazgos.length}
        </span>
      </h3>
      <div ref={setNodeRef} className="flex-grow min-h-[200px]">
        <SortableContext items={hallazgos.map(h => h.id)}>
          {hallazgos.map((hallazgo) => (
            <HallazgoKanbanCard key={hallazgo.id} hallazgo={hallazgo} onCardClick={onCardClick} onViewDetailsClick={onViewDetailsClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default HallazgoKanbanColumn;
