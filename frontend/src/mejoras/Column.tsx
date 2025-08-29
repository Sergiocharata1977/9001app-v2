import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Card } from './Card';
import type { Hallazgo } from '../types/mejoras';

interface ColumnProps {
  id: string;
  title: string;
  items: Hallazgo[];
  onCardClick: (item: Hallazgo) => void;
}

export function Column({ id, title, items, onCardClick }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  const itemIds = React.useMemo(() => 
    items.filter(item => item && item._id).map(item => item._id!), 
    [items]
  );

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/6 flex flex-col flex-shrink-0">
      <div className="bg-gray-200 dark:bg-gray-900/50 p-3 rounded-t-lg border-b border-gray-300 dark:border-gray-700 sticky top-0 z-10">
        <h2 className="text-md font-bold text-gray-800 dark:text-gray-200 tracking-wide capitalize">
          {title.replace(/_/g, ' ')} ({items.length})
        </h2>
      </div>
      <div
        ref={setNodeRef}
        className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-b-lg flex-grow min-h-[200px] transition-colors duration-300 overflow-y-auto"
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.filter(item => item && item._id).map(item => (
            <Card key={item._id} item={item} onClick={() => onCardClick(item)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}