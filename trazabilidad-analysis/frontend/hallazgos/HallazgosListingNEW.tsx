import React, { useState, useEffect, useCallback } from 'react';
import { hallazgosService } from '@/services/hallazgosService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertTriangle, List, Trello, BarChart, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import HallazgoForm from './HallazgoForm';
import HallazgoWorkflowManager from './HallazgoWorkflowManager';
import HallazgoStatCard from './HallazgoStatCard';
import DashboardView from '@/components/mejoras/DashboardView';
import DataTable from '../shared/DataTable/DataTable';
import { HallazgosListSkeleton } from '@/components/ui/skeleton';

// ===============================================
// COMPONENTE DE LISTADO DE HALLAZGOS - REFACTORIZADO CON DATATABLE
// ===============================================

const HallazgosListingNEW = () => {
  const [hallazgos, setHallazgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHallazgo, setSelectedHallazgo] = useState(null);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchHallazgos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await hallazgosService.getAllHallazgos();
      setHallazgos(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'No se pudieron cargar los hallazgos.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHallazgos();
  }, [fetchHallazgos]);

  const handleCardClick = (hallazgo) => {
    setSelectedHallazgo(hallazgo);
    setIsWorkflowModalOpen(true);
  };

  const handleWorkflowSubmit = async (formData, nextState) => {
    if (!selectedHallazgo) return;

    try {
      const dataToUpdate = { ...formData, estado: nextState };
      await hallazgosService.updateHallazgo(selectedHallazgo.id, dataToUpdate);
      toast.success('Hallazgo actualizado con éxito');
      setIsWorkflowModalOpen(false);
      setSelectedHallazgo(null);
      fetchHallazgos();
    } catch (error) {
      console.error('Error al actualizar el hallazgo:', error);
      toast.error(error.response?.data?.message || 'No se pudo actualizar el hallazgo.');
    }
  };

  const handleViewSingle = (hallazgo) => {
    navigate(`/hallazgos/${hallazgo.id}`);
  };

  const handleEdit = (hallazgo) => {
    setSelectedHallazgo(hallazgo);
    setIsModalOpen(true);
  };

  const handleDelete = async (hallazgo) => {
    if (window.confirm('¿Está seguro de que desea eliminar este hallazgo?')) {
      try {
        await hallazgosService.deleteHallazgo(hallazgo.id);
        toast.success('Hallazgo eliminado con éxito');
        fetchHallazgos();
      } catch (error) {
        console.error('Error al eliminar el hallazgo:', error);
        toast.error('No se pudo eliminar el hallazgo.');
      }
    }
  };

  const handleCreate = () => {
    setSelectedHallazgo(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const newHallazgoData = { 
        ...formData, 
        estado: 'deteccion', // Estado inicial según el nuevo flujo
        fecha_deteccion: new Date().toISOString() 
      };
      await hallazgosService.createHallazgo(newHallazgoData);
      toast.success('Hallazgo registrado con éxito');
      setIsModalOpen(false);
      fetchHallazgos();
    } catch (error) {
      console.error('Error al crear el hallazgo:', error);
      toast.error(error.response?.data?.message || 'No se pudo registrar el hallazgo.');
    }
  };

  const handleHallazgoStateChange = async (hallazgoId, newEstado) => {
    const originalHallazgos = [...hallazgos];
    const updatedHallazgos = hallazgos.map(h => 
      h.id === hallazgoId ? { ...h, estado: newEstado } : h
    );
    setHallazgos(updatedHallazgos);

    try {
      await hallazgosService.updateHallazgo(hallazgoId, { estado: newEstado });
      toast.success('Estado del hallazgo actualizado.');
    } catch (error) {
      console.error('Error al actualizar el estado del hallazgo:', error);
      toast.error('No se pudo actualizar el estado.');
      setHallazgos(originalHallazgos);
    }
  };

  const getEstadoBadgeColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'deteccion':
      case 'd1_iniciado':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'planificacion_ai':
      case 'd1_accion_inmediata_programada':
      case 'd2_accion_inmediata_programada':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ejecucion_ai':
      case 'd2_analisis_causa_raiz_programado':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'analisis_plan_accion':
      case 'd3_plan_accion_definido':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'verificacion_cierre':
      case 'd4_verificacion_programada':
      case 'd5_verificacion_eficacia_realizada':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'deteccion':
      case 'd1_iniciado':
        return AlertTriangle;
      case 'planificacion_ai':
      case 'd1_accion_inmediata_programada':
      case 'd2_accion_inmediata_programada':
        return Clock;
      case 'ejecucion_ai':
      case 'd2_analisis_causa_raiz_programado':
        return FileText;
      case 'analisis_plan_accion':
      case 'd3_plan_accion_definido':
        return BarChart;
      case 'verificacion_cierre':
      case 'd4_verificacion_programada':
      case 'd5_verificacion_eficacia_realizada':
        return CheckCircle;
      default:
        return FileText;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Fecha no válida';
    }
  };

  const getStats = () => {
    return {
      total: Array.isArray(hallazgos) ? hallazgos.length : 0,
      deteccion: Array.isArray(hallazgos) ? hallazgos.filter(h => h.estado === 'deteccion').length : 0,
      tratamiento: Array.isArray(hallazgos) ? hallazgos.filter(h => ['planificacion_ai', 'ejecucion_ai', 'analisis_plan_accion'].includes(h.estado)).length : 0,
      verificacion: Array.isArray(hallazgos) ? hallazgos.filter(h => h.estado === 'verificacion_cierre').length : 0,
    };
  };

  // Definición de columnas para el DataTable
  const columns = [
    {
      key: 'numeroHallazgo',
      label: 'Número',
      sortable: true,
      filterable: true,
      width: '120px',
      render: (value, row) => (
        <div className="font-bold text-lg text-blue-600">
          {value || 'N/A'}
        </div>
      )
    },
    {
      key: 'titulo',
      label: 'Título',
      sortable: true,
      filterable: true,
      width: '300px',
      render: (value, row) => (
        <div>
          <div className="font-semibold text-lg">{value || 'Sin título'}</div>
          <div className="text-sm text-gray-500 mt-1">
            {row.descripcion}
          </div>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      filterable: true,
      width: '150px',
      render: (value, row) => {
        const StatusIcon = getEstadoIcon(value);
        return (
          <div className="flex items-center">
            <StatusIcon className="w-4 h-4 mr-2 text-gray-500" />
            <Badge className={getEstadoBadgeColor(value)}>
              {value}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'fecha_deteccion',
      label: 'Fecha Detección',
      sortable: true,
      filterable: true,
      width: '150px',
      render: (value, row) => (
        <div className="text-sm">
          {formatDate(value)}
        </div>
      )
    },
    {
      key: 'responsable',
      label: 'Responsable',
      sortable: true,
      filterable: true,
      width: '150px',
      render: (value, row) => (
        <div className="text-sm">
          {value || 'No asignado'}
        </div>
      )
    },
    {
      key: 'prioridad',
      label: 'Prioridad',
      sortable: true,
      filterable: true,
      width: '120px',
      render: (value, row) => {
        const getPrioridadColor = (prioridad) => {
          switch (prioridad?.toLowerCase()) {
            case 'alta':
              return 'bg-red-100 text-red-800 border-red-200';
            case 'media':
              return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'baja':
              return 'bg-green-100 text-green-800 border-green-200';
            default:
              return 'bg-gray-100 text-gray-800 border-gray-200';
          }
        };
        return (
          <Badge className={getPrioridadColor(value)}>
            {value || 'No definida'}
          </Badge>
        );
      }
    }
  ];

  // Definición de acciones
  const actions = [
    {
      icon: Eye,
      label: 'Ver',
      onClick: handleViewSingle,
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
    },
    {
      icon: Edit,
      label: 'Editar',
      onClick: handleEdit,
      variant: 'ghost',
      className: 'text-green-600 hover:text-green-700 hover:bg-green-50'
    },
    {
      icon: Trash2,
      label: 'Eliminar',
      onClick: handleDelete,
      variant: 'ghost',
      className: 'text-red-600 hover:text-red-700 hover:bg-red-50'
    }
  ];

  // Definición de columnas Kanban
  const kanbanColumns = [
    {
      key: 'deteccion',
      label: 'Detección',
      color: 'bg-orange-500',
      filter: (hallazgo) => ['deteccion', 'd1_iniciado'].includes(hallazgo.estado)
    },
    {
      key: 'planificacion',
      label: 'Planificación A.I.',
      color: 'bg-blue-500',
      filter: (hallazgo) => ['planificacion_ai', 'd1_accion_inmediata_programada', 'd2_accion_inmediata_programada'].includes(hallazgo.estado)
    },
    {
      key: 'ejecucion',
      label: 'Ejecución A.I.',
      color: 'bg-indigo-500',
      filter: (hallazgo) => ['ejecucion_ai', 'd2_analisis_causa_raiz_programado'].includes(hallazgo.estado)
    },
    {
      key: 'analisis',
      label: 'Análisis y Plan de Acción',
      color: 'bg-purple-500',
      filter: (hallazgo) => ['analisis_plan_accion', 'd3_plan_accion_definido'].includes(hallazgo.estado)
    },
    {
      key: 'verificacion_cierre',
      label: 'Verificación y Cierre',
      color: 'bg-green-500',
      filter: (hallazgo) => ['verificacion_cierre', 'd4_verificacion_programada', 'd5_verificacion_eficacia_realizada'].includes(hallazgo.estado)
    }
  ];

  // Renderizado personalizado para tarjetas
  const renderCard = (hallazgo, actions) => {
    const StatusIcon = getEstadoIcon(hallazgo.estado);
    
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 h-20 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-white" />
            <div className="ml-3">
              <h3 className="text-white font-semibold text-sm line-clamp-1">
                {hallazgo.numeroHallazgo || 'Sin número'}
              </h3>
              <div className="flex items-center mt-1">
                <StatusIcon className="h-4 w-4 text-white/80" />
                <Badge className={`ml-2 text-xs ${getEstadoBadgeColor(hallazgo.estado)}`}>
                  {hallazgo.estado}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 line-clamp-2">
              {hallazgo.titulo || 'Sin título'}
            </h4>
            {hallazgo.descripcion && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {hallazgo.descripcion}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            {hallazgo.fecha_deteccion && (
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium">Detección:</span>
                <span className="ml-1">{formatDate(hallazgo.fecha_deteccion)}</span>
              </div>
            )}
            
            {hallazgo.responsable && (
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium">Responsable:</span>
                <span className="ml-1">{hallazgo.responsable}</span>
              </div>
            )}
            
            {hallazgo.prioridad && (
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <AlertTriangle className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium">Prioridad:</span>
                <span className="ml-1">{hallazgo.prioridad}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 pt-0">
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            {actions.map((action, actionIndex) => {
              const Icon = action.icon;
              return (
                <Button
                  key={actionIndex}
                  variant={action.variant || 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(hallazgo);
                  }}
                  className={action.className}
                  title={action.label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="sr-only">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Renderizado personalizado para tarjetas Kanban
  const renderKanbanCard = (hallazgo, actions) => {
    const StatusIcon = getEstadoIcon(hallazgo.estado);
    
    return (
      <div className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-lg mb-3">
        <div className="p-3">
          <div className="space-y-2">
            <div>
              <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">
                {hallazgo.numeroHallazgo || 'Sin número'}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-1">
                {hallazgo.titulo || 'Sin título'}
              </p>
              <div className="flex items-center mt-1">
                <StatusIcon className="h-3 w-3 text-gray-500" />
                <Badge className={`ml-1 text-xs ${getEstadoBadgeColor(hallazgo.estado)}`}>
                  {hallazgo.estado}
                </Badge>
              </div>
            </div>
            
            {hallazgo.fecha_deteccion && (
              <div className="flex items-center text-xs text-gray-700">
                <Clock className="w-3 h-3 mr-1 text-gray-500" />
                <span>{formatDate(hallazgo.fecha_deteccion)}</span>
              </div>
            )}
            
            {hallazgo.responsable && (
              <div className="flex items-center text-xs text-gray-700">
                <FileText className="w-3 h-3 mr-1 text-gray-500" />
                <span className="truncate">
                  {hallazgo.responsable}
                </span>
              </div>
            )}
          </div>
          
          {actions.length > 0 && (
            <div className="flex gap-1 mt-3 pt-2 border-t">
              {actions.map((action, actionIndex) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={actionIndex}
                    variant={action.variant || 'ghost'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(hallazgo);
                    }}
                    className={`${action.className} h-6 w-6 p-0`}
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
      </div>
    );
  };

  const stats = getStats();

  if (loading) return <HallazgosListSkeleton />;
  if (error) return (
    <div className="p-8 text-center">
      <div className="text-red-600 mb-4">{error}</div>
      <Button 
        onClick={() => navigate('/login')} 
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Ir al Login
      </Button>
    </div>
  );

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Sistema de Mejoras ISO 9001</h1>
            <p className="text-muted-foreground">Gestión de hallazgos y acciones correctivas</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Hallazgo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedHallazgo ? 'Editar Hallazgo' : 'Registrar Nuevo Hallazgo'}
                </DialogTitle>
              </DialogHeader>
              <HallazgoForm 
                onSubmit={handleFormSubmit} 
                onCancel={() => setIsModalOpen(false)}
                hallazgo={selectedHallazgo}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <HallazgoStatCard title="Total Hallazgos" value={stats.total} icon={<FileText className="h-4 w-4 text-white/80" />} colorClass="bg-blue-500" />
          <HallazgoStatCard title="En Detección" value={stats.deteccion} icon={<AlertTriangle className="h-4 w-4 text-white/80" />} colorClass="bg-orange-500" />
          <HallazgoStatCard title="En Tratamiento" value={stats.tratamiento} icon={<Clock className="h-4 w-4 text-white/80" />} colorClass="bg-purple-500" />
          <HallazgoStatCard title="En Verificación" value={stats.verificacion} icon={<CheckCircle className="h-4 w-4 text-white/80" />} colorClass="bg-green-500" />
        </div>

        {/* DataTable */}
        <DataTable
          data={hallazgos}
          columns={columns}
          actions={actions}
          loading={loading}
          error={error}
          onRefresh={fetchHallazgos}
          onCreate={handleCreate}
          searchable={true}
          searchPlaceholder="Buscar hallazgos..."
          searchFields={['numeroHallazgo', 'titulo', 'descripcion', 'responsable']}
          paginated={true}
          pageSize={12}
          exportable={true}
          title="Hallazgos"
          description="Lista completa de hallazgos del sistema"
          emptyMessage="No hay hallazgos registrados"
          className="w-full"
          striped={true}
          bordered={false}
          compact={false}
          rowKey="id"
          viewModes={['list', 'grid', 'kanban']}
          defaultView="kanban"
          kanbanColumns={kanbanColumns}
          gridColumns={4}
          renderCard={renderCard}
          renderKanbanCard={renderKanbanCard}
          onCardClick={handleCardClick}
          onKanbanCardMove={handleHallazgoStateChange}
        />

        {/* Workflow Modal */}
        {selectedHallazgo && (
          <Dialog open={isWorkflowModalOpen} onOpenChange={setIsWorkflowModalOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Flujo de Trabajo: {selectedHallazgo.numeroHallazgo}</DialogTitle>
                <p className="text-sm text-muted-foreground">{selectedHallazgo.titulo}</p>
              </DialogHeader>
              <HallazgoWorkflowManager
                hallazgo={selectedHallazgo}
                onUpdate={handleWorkflowSubmit}
                onCancel={() => {
                  setIsWorkflowModalOpen(false);
                  setSelectedHallazgo(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default HallazgosListingNEW;
