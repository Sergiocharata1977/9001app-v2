import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/shared/DataTable/DataTable';
import accionesService from '@/services/accionesService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  RefreshCw,
  FileText,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AccionWorkflowManager from '@/components/acciones/AccionWorkflowManager';
import CrearAccionForm from '@/components/acciones/forms/CrearAccionForm';
import { ACCION_ESTADOS, accionWorkflow, ACCION_PRIORIDADES } from '@/config/accionWorkflow';
import { 
  Accion, 
  AccionStats, 
  AccionTableColumn, 
  AccionTableAction, 
  AccionKanbanColumn,
  AccionesListingProps 
} from '@/types/acciones';

const AccionesListingNEW: React.FC<AccionesListingProps> = ({
  initialData,
  onAccionSelect,
  onAccionUpdate,
  onAccionDelete
}) => {
  const [acciones, setAcciones] = useState<Accion[]>(initialData || []);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccion, setSelectedAccion] = useState<Accion | null>(null);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  // Función para cargar acciones
  const fetchAcciones = useCallback(async () => {
    try {
      setLoading(true);
      const data = await accionesService.getAllAcciones();
      setAcciones(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'No se pudieron cargar las acciones.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAcciones();
  }, [fetchAcciones]);

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string): string => {
    const workflow = accionWorkflow[estado];
    if (!workflow) return 'bg-gray-500';
    
    // Extraer el color base del colorClasses
    const colorMatch = workflow.colorClasses.match(/bg-(\w+)-\d+/);
    return colorMatch ? `bg-${colorMatch[1]}-500` : 'bg-gray-500';
  };

  // Función para obtener el nombre legible del estado
  const getEstadoLabel = (estado: string): string => {
    const workflow = accionWorkflow[estado];
    return workflow ? workflow.title : estado;
  };

  // Función para obtener el icono del estado
  const getEstadoIcon = (estado: string): React.ReactNode => {
    switch (estado) {
      case ACCION_ESTADOS.PLANIFICACION:
        return <Clock className="h-4 w-4" />;
      case ACCION_ESTADOS.EJECUCION:
        return <AlertCircle className="h-4 w-4" />;
      case ACCION_ESTADOS.PLANIFICACION_VERIFICACION:
      case ACCION_ESTADOS.EJECUCION_VERIFICACION:
        return <CheckCircle className="h-4 w-4" />;
      case ACCION_ESTADOS.CERRADA:
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Renderizado del estado
  const renderEstado = (estado: string): React.ReactNode => {
    const color = getEstadoColor(estado);
    const label = getEstadoLabel(estado);
    const icon = getEstadoIcon(estado);
    
    return (
      <Badge className={`${color} text-white flex items-center gap-1`}>
        {icon}
        {label}
      </Badge>
    );
  };

  // Renderizado de fecha
  const renderFecha = (fecha: string | undefined): string => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  // Renderizado de responsable
  const renderResponsable = (responsable: string | undefined): React.ReactNode => {
    if (!responsable) return '-';
    return (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>{responsable}</span>
      </div>
    );
  };

  // Renderizado de prioridad
  const renderPrioridad = (prioridad: string | undefined): React.ReactNode => {
    const colors: Record<string, string> = {
      [ACCION_PRIORIDADES.ALTA]: 'bg-red-500',
      [ACCION_PRIORIDADES.MEDIA]: 'bg-yellow-500',
      [ACCION_PRIORIDADES.BAJA]: 'bg-green-500'
    };
    
    return (
      <Badge className={`${colors[prioridad || ''] || 'bg-gray-500'} text-white`}>
        {prioridad?.toUpperCase() || 'N/A'}
      </Badge>
    );
  };

  // Configuración de columnas
  const columns: AccionTableColumn[] = [
    {
      key: 'numeroAccion',
      label: 'Número',
      sortable: true,
      width: '120px',
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'titulo',
      label: 'Título',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      width: '200px',
      render: (value: string) => renderEstado(value)
    },
    {
      key: 'responsable',
      label: 'Responsable',
      sortable: true,
      width: '150px',
      render: (value: string) => renderResponsable(value)
    },
    {
      key: 'prioridad',
      label: 'Prioridad',
      sortable: true,
      width: '100px',
      render: (value: string) => renderPrioridad(value)
    },
    {
      key: 'fechaCreacion',
      label: 'Fecha Creación',
      sortable: true,
      width: '130px',
      render: (value: string) => renderFecha(value)
    },
    {
      key: 'fechaVencimiento',
      label: 'Vencimiento',
      sortable: true,
      width: '130px',
      render: (value: string) => renderFecha(value)
    }
  ];

  // Configuración de acciones
  const actions: AccionTableAction[] = [
    {
      icon: Eye,
      label: 'Ver Detalle',
      onClick: (accion: Accion) => navigate(`/acciones/${accion.id}`),
      variant: 'ghost'
    },
    {
      icon: Edit,
      label: 'Editar',
      onClick: (accion: Accion) => {
        setSelectedAccion(accion);
        setIsWorkflowModalOpen(true);
      },
      variant: 'ghost'
    },
    {
      icon: Trash2,
      label: 'Eliminar',
      onClick: async (accion: Accion) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta acción?')) {
          try {
            await accionesService.deleteAccion(accion.id);
            toast.success('Acción eliminada con éxito');
            fetchAcciones();
            onAccionDelete?.(accion);
          } catch (error) {
            toast.error('Error al eliminar la acción');
          }
        }
      },
      variant: 'destructive',
      show: (accion: Accion) => accion.estado !== ACCION_ESTADOS.CERRADA
    }
  ];

  // Configuración de columnas Kanban
  const kanbanColumns: AccionKanbanColumn[] = [
    {
      key: 'planificacion',
      label: 'Planificación',
      color: 'bg-blue-500',
      filter: (accion: Accion) => accion.estado === ACCION_ESTADOS.PLANIFICACION
    },
    {
      key: 'ejecucion',
      label: 'Ejecución',
      color: 'bg-orange-500',
      filter: (accion: Accion) => accion.estado === ACCION_ESTADOS.EJECUCION
    },
    {
      key: 'verificacion',
      label: 'Verificación',
      color: 'bg-purple-500',
      filter: (accion: Accion) => 
        accion.estado === ACCION_ESTADOS.PLANIFICACION_VERIFICACION || 
        accion.estado === ACCION_ESTADOS.EJECUCION_VERIFICACION
    },
    {
      key: 'cerrada',
      label: 'Cerrada',
      color: 'bg-gray-500',
      filter: (accion: Accion) => accion.estado === ACCION_ESTADOS.CERRADA
    }
  ];

  // Renderizado personalizado de tarjeta para Kanban
  const renderKanbanCard = (accion: Accion, actions: AccionTableAction[]): React.ReactNode => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-3 mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <span className="text-xs font-mono text-muted-foreground">
            {accion.numeroAccion}
          </span>
          {renderPrioridad(accion.prioridad)}
        </div>
        
        <h4 className="font-medium text-sm line-clamp-2">
          {accion.titulo}
        </h4>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{accion.responsable || 'Sin asignar'}</span>
        </div>
        
        {accion.fechaVencimiento && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{renderFecha(accion.fechaVencimiento)}</span>
          </div>
        )}
      </div>
      
      {actions.length > 0 && (
        <div className="flex gap-1 mt-3 pt-2 border-t">
          {actions.map((action, actionIndex) => {
            if (action.show && !action.show(accion)) {
              return null;
            }

            const Icon = action.icon;
            return (
              <Button
                key={actionIndex}
                variant={action.variant || 'ghost'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(accion);
                }}
                className="h-6 w-6 p-0"
                title={action.label}
              >
                <Icon className="h-3 w-3" />
                <span className="sr-only">{action.label}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );

  // Renderizado personalizado de tarjeta para Grid
  const renderCard = (accion: Accion, actions: AccionTableAction[]): React.ReactNode => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <span className="text-sm font-mono text-muted-foreground">
            {accion.numeroAccion}
          </span>
          {renderPrioridad(accion.prioridad)}
        </div>
        
        <h4 className="font-medium line-clamp-2">
          {accion.titulo}
        </h4>
        
        <div className="space-y-2">
          {renderEstado(accion.estado)}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{accion.responsable || 'Sin asignar'}</span>
          </div>
          
          {accion.fechaVencimiento && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Vence: {renderFecha(accion.fechaVencimiento)}</span>
            </div>
          )}
        </div>
      </div>
      
      {actions.length > 0 && (
        <div className="flex gap-1 mt-4 pt-3 border-t">
          {actions.map((action, actionIndex) => {
            if (action.show && !action.show(accion)) {
              return null;
            }

            const Icon = action.icon;
            return (
              <Button
                key={actionIndex}
                variant={action.variant || 'ghost'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(accion);
                }}
                className={action.className}
                title={action.label}
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only">{action.label}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );

  // Manejo de actualización de workflow
  const handleWorkflowUpdate = async (formData: any) => {
    if (!selectedAccion) return;

    try {
      await accionesService.updateAccion(selectedAccion.id, formData);
      toast.success('Acción actualizada con éxito');
      setIsWorkflowModalOpen(false);
      setSelectedAccion(null);
      fetchAcciones();
      onAccionUpdate?.(selectedAccion);
    } catch (error: any) {
      console.error('Error al actualizar la acción:', error);
      toast.error(error.response?.data?.message || 'No se pudo actualizar la acción.');
    }
  };

  // Manejo de click en tarjeta
  const handleCardClick = (accion: Accion) => {
    setSelectedAccion(accion);
    setIsWorkflowModalOpen(true);
    onAccionSelect?.(accion);
  };

  // Manejo de creación
  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  // Cálculo de estadísticas
  const stats: AccionStats = {
    total: acciones.length,
    planificacion: acciones.filter(a => a.estado === ACCION_ESTADOS.PLANIFICACION).length,
    ejecucion: acciones.filter(a => a.estado === ACCION_ESTADOS.EJECUCION).length,
    verificacion: acciones.filter(a => 
      a.estado === ACCION_ESTADOS.PLANIFICACION_VERIFICACION || 
      a.estado === ACCION_ESTADOS.EJECUCION_VERIFICACION
    ).length,
    cerrada: acciones.filter(a => a.estado === ACCION_ESTADOS.CERRADA).length,
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Gestión de Acciones</h1>
          <p className="text-muted-foreground">Supervisa y gestiona todas las acciones de mejora.</p>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="bg-blue-500 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 opacity-80" />
            </div>
          </div>
          <div className="bg-orange-500 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Planificación</p>
                <p className="text-2xl font-bold">{stats.planificacion}</p>
              </div>
              <Clock className="h-8 w-8 opacity-80" />
            </div>
          </div>
          <div className="bg-purple-500 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Ejecución</p>
                <p className="text-2xl font-bold">{stats.ejecucion}</p>
              </div>
              <AlertCircle className="h-8 w-8 opacity-80" />
            </div>
          </div>
          <div className="bg-green-500 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Verificación</p>
                <p className="text-2xl font-bold">{stats.verificacion}</p>
              </div>
              <CheckCircle className="h-8 w-8 opacity-80" />
            </div>
          </div>
          <div className="bg-gray-500 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Cerradas</p>
                <p className="text-2xl font-bold">{stats.cerrada}</p>
              </div>
              <XCircle className="h-8 w-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          data={acciones}
          columns={columns}
          loading={loading}
          error={error}
          actions={actions}
          onRefresh={fetchAcciones}
          onCreate={handleCreate}
          searchable={true}
          searchPlaceholder="Buscar acciones..."
          searchFields={['numeroAccion', 'titulo', 'responsable', 'descripcion']}
          paginated={true}
          pageSize={10}
          pageSizeOptions={[5, 10, 20, 50]}
          exportable={true}
          title="Acciones de Mejora"
          description="Lista de todas las acciones de mejora del sistema"
          emptyMessage="No hay acciones disponibles"
          viewModes={['list', 'grid', 'kanban']}
          defaultView="kanban"
          kanbanColumns={kanbanColumns}
          gridColumns={3}
          renderCard={renderCard}
          renderKanbanCard={renderKanbanCard}
          onCardClick={handleCardClick}
          striped={true}
          bordered={false}
          compact={false}
        />

        {/* Modal de Workflow */}
        {selectedAccion && (
          <Dialog open={isWorkflowModalOpen} onOpenChange={setIsWorkflowModalOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Flujo de Trabajo: {selectedAccion.numeroAccion}</DialogTitle>
                <p className="text-sm text-muted-foreground">{selectedAccion.titulo}</p>
              </DialogHeader>
              <AccionWorkflowManager
                accion={selectedAccion}
                onUpdate={handleWorkflowUpdate}
                isLoading={loading}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de Creación */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Acción</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Completa los datos para crear una nueva acción de mejora
              </p>
            </DialogHeader>
            <CrearAccionForm
              onSubmit={() => {
                setIsCreateModalOpen(false);
                fetchAcciones();
              }}
              onCancel={() => setIsCreateModalOpen(false)}
              isLoading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AccionesListingNEW;
