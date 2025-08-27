// Empty State Component
// Componente para mostrar estados vacíos de manera consistente

import React from 'react';
import { EmptyStateProps } from '../../types/view-types';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  inbox: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  search: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  folder: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  users: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  calendar: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  document: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  chart: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  settings: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  warning: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  error: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

export function EmptyState({
  title,
  description,
  icon = 'inbox',
  action,
  className
}: EmptyStateProps) {
  const IconComponent = iconMap[icon];

  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      {/* Icon */}
      {IconComponent && (
        <div className="mb-4">
          <IconComponent className="w-16 h-16 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="max-w-sm">
        {title && (
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {title}
          </h3>
        )}
        
        {description && (
          <p className="text-sm text-gray-600 mb-6">
            {description}
          </p>
        )}

        {/* Action Button */}
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'primary'}
            size="sm"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// Empty State with Illustration
export interface EmptyStateWithIllustrationProps extends EmptyStateProps {
  illustration?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export function EmptyStateWithIllustration({
  title,
  description,
  icon,
  action,
  illustration,
  size = 'medium',
  className
}: EmptyStateWithIllustrationProps) {
  const sizeClasses = {
    small: 'py-8',
    medium: 'py-12',
    large: 'py-16'
  };

  const iconSizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20'
  };

  const IconComponent = iconMap[icon];

  return (
    <div className={cn('flex flex-col items-center justify-center text-center px-4', sizeClasses[size], className)}>
      {/* Illustration or Icon */}
      {illustration ? (
        <div className="mb-6">
          {illustration}
        </div>
      ) : IconComponent ? (
        <div className={cn('mb-6 text-gray-400', iconSizeClasses[size])}>
          <IconComponent className="w-full h-full" />
        </div>
      ) : null}

      {/* Content */}
      <div className="max-w-md">
        {title && (
          <h3 className={cn(
            'font-medium text-gray-900 mb-2',
            size === 'small' ? 'text-base' : size === 'medium' ? 'text-lg' : 'text-xl'
          )}>
            {title}
          </h3>
        )}
        
        {description && (
          <p className={cn(
            'text-gray-600 mb-6',
            size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'
          )}>
            {description}
          </p>
        )}

        {/* Action Button */}
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'primary'}
            size={size === 'small' ? 'sm' : 'md'}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// Specific Empty State Components
export function NoDataEmptyState({ 
  title = 'No hay datos disponibles',
  description = 'No se encontraron elementos para mostrar',
  action,
  className 
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon="inbox"
      action={action}
      className={className}
    />
  );
}

export function NoSearchResultsEmptyState({ 
  query,
  action,
  className 
}: { query?: string; action?: EmptyStateProps['action']; className?: string }) {
  return (
    <EmptyState
      title={query ? `No se encontraron resultados para "${query}"` : 'No se encontraron resultados'}
      description="Intenta con términos de búsqueda diferentes o ajusta los filtros"
      icon="search"
      action={action}
      className={className}
    />
  );
}

export function NoPermissionsEmptyState({ 
  title = 'Sin permisos',
  description = 'No tienes permisos para acceder a este contenido',
  action,
  className 
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon="warning"
      action={action}
      className={className}
    />
  );
}

export function ErrorEmptyState({ 
  title = 'Ocurrió un error',
  description = 'No se pudo cargar el contenido. Intenta de nuevo.',
  action,
  className 
}: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon="error"
      action={action}
      className={className}
    />
  );
}

// Export all components
export default EmptyState;