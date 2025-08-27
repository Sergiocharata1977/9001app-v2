// Departamentos Page with Standardized Views
// Página de departamentos que implementa las vistas estandarizadas con MongoDB

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Department, ColumnConfig } from '../types/mongodb-types';
import { ViewMode } from '../types/view-types';
import { departmentsService } from '../services/api/departmentsService';
import { useViewMode } from '../hooks/useViewMode';
import { CardView, DefaultCardRenderer } from '../components/views/CardView';
import { ListView } from '../components/views/ListView';
import { ViewSelector, ViewSettings } from '../components/views/ViewSelector';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { DepartmentForm } from '../components/departamentos/DepartmentForm';
import { formatDate, formatCurrency } from '../utils/formatters';
import { PlusIcon, CogIcon, DownloadIcon, UploadIcon } from 'lucide-react';

export default function DepartamentosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // View mode management
  const {
    currentView,
    settings,
    availableViews,
    setCurrentView,
    updateSettings
  } = useViewMode({
    moduleName: 'departments',
    defaultView: 'card',
    availableViews: ['card', 'list', 'kanban']
  });

  // React Query
  const queryClient = useQueryClient();

  // Fetch departments
  const {
    data: departmentsResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['departments', currentView, settings],
    queryFn: () => departmentsService.getDepartments({
      page: 1,
      limit: settings.pageSize || 50,
      sort: settings.defaultSort || 'name',
      order: settings.defaultSortDirection || 'asc'
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const departments = departmentsResponse?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (department: Partial<Department>) => 
      departmentsService.createDepartment(department),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento creado exitosamente');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error('Error al crear el departamento');
      console.error('Error creating department:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Department> }) =>
      departmentsService.updateDepartment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento actualizado exitosamente');
      setIsModalOpen(false);
      setSelectedDepartment(null);
    },
    onError: (error) => {
      toast.error('Error al actualizar el departamento');
      console.error('Error updating department:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentsService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento eliminado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar el departamento');
      console.error('Error deleting department:', error);
    }
  });

  // Handlers
  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  const handleDeleteDepartment = async (department: Department) => {
    if (confirm(`¿Está seguro de que desea eliminar el departamento "${department.name}"?`)) {
      await deleteMutation.mutateAsync(department._id);
    }
  };

  const handleViewDepartment = (department: Department) => {
    // Navigate to department detail page or open detail modal
    console.log('View department:', department);
  };

  // List view columns configuration
  const listColumns: ColumnConfig[] = [
    {
      key: 'name',
      title: 'Nombre',
      type: 'text',
      sortable: true,
      filterable: true,
      width: '25%'
    },
    {
      key: 'code',
      title: 'Código',
      type: 'text',
      sortable: true,
      filterable: true,
      width: '15%'
    },
    {
      key: 'description',
      title: 'Descripción',
      type: 'text',
      filterable: true,
      width: '25%'
    },
    {
      key: 'managerId',
      title: 'Manager',
      type: 'text',
      width: '15%',
      render: (value, item) => (
        <span className="text-sm text-gray-600">
          {value ? 'Asignado' : 'Sin asignar'}
        </span>
      )
    },
    {
      key: 'isActive',
      title: 'Estado',
      type: 'status',
      sortable: true,
      filterable: true,
      width: '10%'
    },
    {
      key: 'createdAt',
      title: 'Creado',
      type: 'date',
      sortable: true,
      width: '10%',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      title: 'Acciones',
      type: 'actions',
      width: 'auto'
    }
  ];

  // Card view configuration
  const cardConfig = {
    showImage: false,
    titleField: 'name',
    subtitleFields: ['code', 'description'],
    actionButtons: [
      {
        label: 'Ver',
        action: 'view' as const,
        variant: 'primary' as const,
        icon: 'eye'
      },
      {
        label: 'Editar',
        action: 'edit' as const,
        variant: 'secondary' as const,
        icon: 'edit'
      }
    ],
    highlightFields: [
      {
        field: 'isActive',
        type: 'status' as const,
        label: 'Estado'
      },
      {
        field: 'createdAt',
        type: 'date' as const,
        label: 'Creado'
      }
    ]
  };

  // Render card content
  const renderDepartmentCard = (department: Department) => (
    <DefaultCardRenderer
      item={department}
      config={cardConfig}
      onAction={(item, action) => {
        switch (action) {
          case 'view':
            handleViewDepartment(item);
            break;
          case 'edit':
            handleEditDepartment(item);
            break;
          case 'delete':
            handleDeleteDepartment(item);
            break;
        }
      }}
      isSelected={false}
    />
  );

  // Export functionality
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const blob = await departmentsService.exportDepartments(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `departments.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exportación completada en formato ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Error al exportar departamentos');
      console.error('Export error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departamentos</h1>
          <p className="text-gray-600">
            Gestiona los departamentos de la organización
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Selector */}
          <ViewSelector
            currentView={currentView}
            availableViews={availableViews}
            onViewChange={setCurrentView}
          />
          
          {/* Settings Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Configuración de vista"
          >
            <CogIcon className="w-4 h-4" />
          </Button>
          
          {/* Export Button */}
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Exportar</span>
            </Button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Exportar CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Exportar Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Exportar PDF
                </button>
              </div>
            </div>
          </div>
          
          {/* Create Button */}
          <Button
            onClick={handleCreateDepartment}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nuevo Departamento</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {departmentsResponse?.pagination?.total || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {departments.filter(d => d.isActive).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sin Manager</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {departments.filter(d => !d.managerId).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Presupuesto Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(departments.reduce((sum, d) => sum + (d.metadata?.budget || 0), 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* View Content */}
        {currentView === 'card' && (
          <CardView
            data={departments}
            loading={isLoading}
            error={error?.message}
            onRefresh={refetch}
            onItemClick={handleViewDepartment}
            onItemEdit={handleEditDepartment}
            onItemDelete={handleDeleteDepartment}
            renderCard={renderDepartmentCard}
            columns={settings.columns || 3}
            gap={settings.gap || 4}
            className="mt-6"
          />
        )}

        {currentView === 'list' && (
          <ListView
            data={departments}
            loading={isLoading}
            error={error?.message}
            onRefresh={refetch}
            onItemClick={handleViewDepartment}
            onItemEdit={handleEditDepartment}
            onItemDelete={handleDeleteDepartment}
            columns={listColumns}
            sortable={true}
            filterable={true}
            selectable={true}
            className="mt-6"
          />
        )}

        {currentView === 'kanban' && (
          <div className="mt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-yellow-800">
                  Vista Kanban en desarrollo. Por favor, use la vista de tarjetas o lista.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Department Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDepartment(null);
        }}
        title={selectedDepartment ? 'Editar Departamento' : 'Nuevo Departamento'}
        size="lg"
      >
        <DepartmentForm
          department={selectedDepartment}
          onSubmit={(data) => {
            if (selectedDepartment) {
              updateMutation.mutate({ id: selectedDepartment._id, updates: data });
            } else {
              createMutation.mutate(data);
            }
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedDepartment(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Configuración de Vista"
        size="md"
      >
        <ViewSettings
          currentView={currentView}
          settings={settings}
          onSettingsChange={updateSettings}
        />
      </Modal>
    </div>
  );
} 