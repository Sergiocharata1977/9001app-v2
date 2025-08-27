// Card View Component
// Componente de vista de tarjetas reutilizable y estandarizado

import React, { useState, useMemo } from 'react';
import { CardViewProps, CardViewConfig, ActionButton, HighlightField } from '../../types/view-types';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { cn } from '../../utils/cn';

interface CardViewState {
  selectedItems: Set<string>;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

export function CardView<T extends { _id: string }>({
  data,
  loading,
  error,
  onRefresh,
  onItemClick,
  onItemEdit,
  onItemDelete,
  renderCard,
  columns = 3,
  gap = 4,
  cardClassName,
  emptyState,
  className
}: CardViewProps<T>) {
  const [state, setState] = useState<CardViewState>({
    selectedItems: new Set(),
    sortField: '',
    sortDirection: 'asc'
  });

  // Responsive columns based on screen size
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');

  const responsiveColumns = useMemo(() => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return columns;
  }, [isMobile, isTablet, columns]);

  const gridTemplateColumns = useMemo(() => {
    return `repeat(${responsiveColumns}, minmax(0, 1fr))`;
  }, [responsiveColumns]);

  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    const newSelected = new Set(state.selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setState(prev => ({ ...prev, selectedItems: newSelected }));
  };

  // Handle item actions
  const handleItemAction = (item: T, action: string) => {
    switch (action) {
      case 'view':
        onItemClick?.(item);
        break;
      case 'edit':
        onItemEdit?.(item);
        break;
      case 'delete':
        if (confirm('¿Está seguro de que desea eliminar este elemento?')) {
          onItemDelete?.(item);
        }
        break;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className={cn('grid gap-4', className)} style={{ gridTemplateColumns }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <Card className="h-48">
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar datos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="primary">
              Reintentar
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Render empty state
  if (!data || data.length === 0) {
    if (emptyState) {
      return <div className={className}>{emptyState}</div>;
    }
    
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <EmptyState
          title="No hay datos disponibles"
          description="No se encontraron elementos para mostrar"
          icon="inbox"
          action={onRefresh ? {
            label: "Recargar",
            onClick: onRefresh,
            variant: "primary"
          } : undefined}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Cards Grid */}
      <div 
        className="grid gap-4"
        style={{ 
          gridTemplateColumns,
          gap: `${gap * 0.25}rem`
        }}
      >
        {data.map((item) => (
          <Card
            key={item._id}
            className={cn(
              'transition-all duration-200 hover:shadow-lg cursor-pointer group',
              state.selectedItems.has(item._id) && 'ring-2 ring-blue-500',
              cardClassName
            )}
            onClick={() => onItemClick?.(item)}
          >
            {/* Custom card content */}
            {renderCard(item)}
          </Card>
        ))}
      </div>

      {/* Selection summary */}
      {state.selectedItems.size > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg px-4 py-2 border">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {state.selectedItems.size} elemento(s) seleccionado(s)
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setState(prev => ({ ...prev, selectedItems: new Set() }))}
            >
              Deseleccionar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Default Card Renderer Component
interface DefaultCardProps<T> {
  item: T;
  config: CardViewConfig;
  onAction: (item: T, action: string) => void;
  onSelect?: (itemId: string) => void;
  isSelected?: boolean;
}

export function DefaultCardRenderer<T extends { _id: string }>({
  item,
  config,
  onAction,
  onSelect,
  isSelected = false
}: DefaultCardProps<T>) {
  const getFieldValue = (field: string) => {
    return field.split('.').reduce((obj: any, key) => obj?.[key], item);
  };

  const renderHighlightField = (highlight: HighlightField) => {
    const value = getFieldValue(highlight.field);
    
    switch (highlight.type) {
      case 'badge':
        return (
          <Badge 
            key={highlight.field}
            variant={value === 'active' ? 'success' : 'secondary'}
            className={highlight.className}
          >
            {value}
          </Badge>
        );
      case 'status':
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          pending: 'bg-yellow-100 text-yellow-800',
          error: 'bg-red-100 text-red-800'
        };
        return (
          <span 
            key={highlight.field}
            className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              statusColors[value as keyof typeof statusColors] || statusColors.inactive
            )}
          >
            {value}
          </span>
        );
      case 'number':
        return (
          <span key={highlight.field} className={cn('font-semibold', highlight.className)}>
            {new Intl.NumberFormat().format(value)}
          </span>
        );
      case 'date':
        return (
          <span key={highlight.field} className={cn('text-sm text-gray-500', highlight.className)}>
            {new Date(value).toLocaleDateString()}
          </span>
        );
      default:
        return (
          <span key={highlight.field} className={cn('text-sm', highlight.className)}>
            {value}
          </span>
        );
    }
  };

  return (
    <div className="p-4 space-y-3">
      {/* Image */}
      {config.showImage && config.imageField && (
        <div className="flex justify-center">
          <Avatar
            src={getFieldValue(config.imageField)}
            alt={getFieldValue(config.titleField)}
            className="w-16 h-16"
          />
        </div>
      )}

      {/* Title */}
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-900 line-clamp-2">
          {getFieldValue(config.titleField)}
        </h3>
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(item._id);
            }}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        )}
      </div>

      {/* Subtitle fields */}
      <div className="space-y-1">
        {config.subtitleFields.map((field) => (
          <p key={field} className="text-sm text-gray-600 line-clamp-1">
            {getFieldValue(field)}
          </p>
        ))}
      </div>

      {/* Highlight fields */}
      {config.highlightFields.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {config.highlightFields.map(renderHighlightField)}
        </div>
      )}

      {/* Action buttons */}
      {config.actionButtons.length > 0 && (
        <div className="flex justify-between pt-2 space-x-2">
          {config.actionButtons.slice(0, 2).map((button) => (
            <Button
              key={button.action}
              size="sm"
              variant={button.variant || 'secondary'}
              onClick={(e) => {
                e.stopPropagation();
                if (button.onClick) {
                  button.onClick(item);
                } else {
                  onAction(item, button.action);
                }
              }}
              className="flex-1"
            >
              {button.icon && <span className="mr-1">{button.icon}</span>}
              {button.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// Export default card renderer
export default CardView;