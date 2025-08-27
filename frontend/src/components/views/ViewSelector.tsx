// View Selector Component
// Componente selector de vistas para cambiar entre diferentes modos de visualización

import React, { useState } from 'react';
import { ViewSelectorProps, ViewModeOption } from '../../types/view-types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Tooltip } from '../ui/Tooltip';
import { cn } from '../../utils/cn';

const viewModeOptions: ViewModeOption[] = [
  {
    value: 'card',
    label: 'Tarjetas',
    icon: 'grid-3x3-gap',
    description: 'Vista en tarjetas para visualización rápida'
  },
  {
    value: 'list',
    label: 'Lista',
    icon: 'list',
    description: 'Vista en tabla con detalles completos'
  },
  {
    value: 'calendar',
    label: 'Calendario',
    icon: 'calendar',
    description: 'Vista temporal de eventos y actividades'
  },
  {
    value: 'kanban',
    label: 'Kanban',
    icon: 'columns',
    description: 'Vista de flujo de trabajo con columnas'
  }
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'grid-3x3-gap': ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  'list': ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  'calendar': ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  'columns': ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
};

export function ViewSelector({
  currentView,
  availableViews,
  onViewChange,
  className
}: ViewSelectorProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Filter available view options based on props
  const filteredOptions = viewModeOptions.filter(option => 
    availableViews.includes(option.value)
  );

  // Handle view change
  const handleViewChange = (view: ViewMode) => {
    onViewChange(view);
  };

  // Render button group for view modes
  const renderButtonGroup = () => (
    <div className="flex items-center bg-gray-100 rounded-lg p-1 space-x-1">
      {filteredOptions.map((option) => {
        const IconComponent = iconMap[option.icon];
        const isActive = currentView === option.value;
        
        return (
          <Tooltip
            key={option.value}
            content={option.description}
            position="bottom"
            show={showTooltip === option.value}
            onShow={() => setShowTooltip(option.value)}
            onHide={() => setShowTooltip(null)}
          >
            <Button
              variant={isActive ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange(option.value)}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-md transition-colors',
                isActive && 'bg-white shadow-sm'
              )}
              aria-label={`Cambiar a vista ${option.label}`}
            >
              {IconComponent && (
                <IconComponent className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{option.label}</span>
            </Button>
          </Tooltip>
        );
      })}
    </div>
  );

  // Render select dropdown for mobile
  const renderSelect = () => (
    <Select
      value={currentView}
      onValueChange={handleViewChange}
      className="w-full sm:hidden"
    >
      {filteredOptions.map((option) => {
        const IconComponent = iconMap[option.icon];
        
        return (
          <Select.Option key={option.value} value={option.value}>
            <div className="flex items-center space-x-2">
              {IconComponent && (
                <IconComponent className="w-4 h-4" />
              )}
              <span>{option.label}</span>
            </div>
          </Select.Option>
        );
      })}
    </Select>
  );

  return (
    <div className={cn('flex items-center space-x-4', className)}>
      {/* View Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          Vista:
        </span>
        <div className="flex items-center">
          {renderButtonGroup()}
          {renderSelect()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-500">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Disponible</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
          <span>Pendiente</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          <span>Crítico</span>
        </span>
      </div>
    </div>
  );
}

// View Settings Component
interface ViewSettingsProps {
  currentView: ViewMode;
  settings: Record<string, any>;
  onSettingsChange: (settings: Record<string, any>) => void;
  className?: string;
}

export function ViewSettings({
  currentView,
  settings,
  onSettingsChange,
  className
}: ViewSettingsProps) {
  const handleSettingChange = (key: string, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const renderCardSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Columnas por fila
        </label>
        <Select
          value={settings.columns?.toString() || '3'}
          onValueChange={(value) => handleSettingChange('columns', parseInt(value))}
        >
          <Select.Option value="1">1 columna</Select.Option>
          <Select.Option value="2">2 columnas</Select.Option>
          <Select.Option value="3">3 columnas</Select.Option>
          <Select.Option value="4">4 columnas</Select.Option>
          <Select.Option value="6">6 columnas</Select.Option>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tamaño de tarjeta
        </label>
        <Select
          value={settings.cardSize || 'medium'}
          onValueChange={(value) => handleSettingChange('cardSize', value)}
        >
          <Select.Option value="small">Pequeño</Select.Option>
          <Select.Option value="medium">Mediano</Select.Option>
          <Select.Option value="large">Grande</Select.Option>
        </Select>
      </div>
    </div>
  );

  const renderListSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Elementos por página
        </label>
        <Select
          value={settings.pageSize?.toString() || '10'}
          onValueChange={(value) => handleSettingChange('pageSize', parseInt(value))}
        >
          <Select.Option value="5">5 elementos</Select.Option>
          <Select.Option value="10">10 elementos</Select.Option>
          <Select.Option value="25">25 elementos</Select.Option>
          <Select.Option value="50">50 elementos</Select.Option>
          <Select.Option value="100">100 elementos</Select.Option>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Orden por defecto
        </label>
        <Select
          value={settings.defaultSort || 'createdAt'}
          onValueChange={(value) => handleSettingChange('defaultSort', value)}
        >
          <Select.Option value="createdAt">Fecha de creación</Select.Option>
          <Select.Option value="updatedAt">Fecha de actualización</Select.Option>
          <Select.Option value="name">Nombre</Select.Option>
          <Select.Option value="status">Estado</Select.Option>
        </Select>
      </div>
    </div>
  );

  const renderCalendarSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vista por defecto
        </label>
        <Select
          value={settings.defaultCalendarView || 'month'}
          onValueChange={(value) => handleSettingChange('defaultCalendarView', value)}
        >
          <Select.Option value="day">Día</Select.Option>
          <Select.Option value="week">Semana</Select.Option>
          <Select.Option value="month">Mes</Select.Option>
          <Select.Option value="year">Año</Select.Option>
        </Select>
      </div>
      
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.showWeekends ?? true}
            onChange={(e) => handleSettingChange('showWeekends', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Mostrar fines de semana
          </span>
        </label>
      </div>
    </div>
  );

  const renderKanbanSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Agrupación por defecto
        </label>
        <Select
          value={settings.defaultGrouping || 'status'}
          onValueChange={(value) => handleSettingChange('defaultGrouping', value)}
        >
          <Select.Option value="status">Estado</Select.Option>
          <Select.Option value="priority">Prioridad</Select.Option>
          <Select.Option value="assignee">Asignado a</Select.Option>
          <Select.Option value="department">Departamento</Select.Option>
        </Select>
      </div>
      
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.showCardCount ?? true}
            onChange={(e) => handleSettingChange('showCardCount', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Mostrar contador de tarjetas
          </span>
        </label>
      </div>
    </div>
  );

  const renderSettings = () => {
    switch (currentView) {
      case 'card':
        return renderCardSettings();
      case 'list':
        return renderListSettings();
      case 'calendar':
        return renderCalendarSettings();
      case 'kanban':
        return renderKanbanSettings();
      default:
        return null;
    }
  };

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4', className)}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Configuración de vista
      </h3>
      {renderSettings()}
    </div>
  );
}

// Export components
export default ViewSelector;