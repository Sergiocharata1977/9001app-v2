import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Target,
  List,
  Grid3X3,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auditoriasService } from '../../services/auditoriasService';
import { departamentosService } from '../../services/departamentos';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Auditoria, 
  AuditoriaEstado, 
  AuditoriaEstadoConfig,
  AuditoriaFormData 
} from '../../types/auditorias';
import AuditoriaModal from './AuditoriaModal';

// ===============================================
// COMPONENTE DE LISTADO DE AUDITORÍAS - SGC PRO
// ===============================================

const AuditoriasListing: React.FC = () => {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'grid' | 'list'>('kanban');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingAuditoria, setEditingAuditoria] = useState<Auditoria | null>(null);
  const navigate = useNavigate();

  // Configuración de estados de auditoría
  const estadosConfig: AuditoriaEstadoConfig[] = [
    { value: 'programacion', label: 'Programación', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    { value: 'planificacion', label: 'Planificación', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    { value: 'ejecucion', label: 'En Ejecución', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    { value: 'informe', label: 'Informe', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    { value: 'seguimiento', label: 'Seguimiento', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
    { value: 'completada', label: 'Completada', color: 'text-green-700', bgColor: 'bg-green-100' },
    { value: 'cancelada', label: 'Cancelada', color: 'text-red-700', bgColor: 'bg-red-100' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Cargar auditorías y departamentos en paralelo
      const [auditoriasRes, departamentosRes] = await Promise.all([
        auditoriasService.getAll(),
        departamentosService.getAll()
      ]);

      setAuditorias(auditoriasRes.data || []);
      
      // Procesar departamentos
      let departamentosData: any[] = [];
      if (departamentosRes?.data) {
        departamentosData = departamentosRes.data;
      } else if (Array.isArray(departamentosRes)) {
        departamentosData = departamentosRes;
      } else if (departamentosRes?.success && departamentosRes?.data) {
        departamentosData = departamentosRes.data;
      }
      
      setDepartamentos(departamentosData);
      
      console.log('📊 Datos cargados:', {
        auditorias: auditoriasRes.data?.length || 0,
        departamentos: departamentosData.length
      });
      
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener nombres de departamentos desde áreas
  const getAreaNames = (areas: string[] | string): string => {
    if (!areas) return 'Sin área';
    
    try {
      // Si es string, intentar parsear como JSON
      const areasArray = typeof areas === 'string' ? JSON.parse(areas) : areas;
      
      if (areasArray.includes('todos')) {
        return 'Todos los departamentos';
      }
      
      const areaNames = areasArray
        .map((areaId: string) => {
          const depto = departamentos.find(d => d.id?.toString() === areaId?.toString());
          return depto?.nombre || `Departamento ${areaId}`;
        })
        .filter((name: string) => name);
      
      return areaNames.length > 0 ? areaNames.join(', ') : 'Sin área';
    } catch (error) {
      console.error('Error parseando áreas:', error);
      return areas as string; // Devolver el valor original si no se puede parsear
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta auditoría?')) {
      try {
        await auditoriasService.delete(id);
        await loadData(); // Reload data after deletion
      } catch (err) {
        console.error('Error eliminando auditoría:', err);
        alert('Error al eliminar la auditoría');
      }
    }
  };

  const handleOpenModal = (auditoria: Auditoria | null = null): void => {
    setEditingAuditoria(auditoria);
    setModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setModalOpen(false);
    setEditingAuditoria(null);
  };

  const handleSaveAuditoria = async (formData: AuditoriaFormData): Promise<void> => {
    try {
      if (editingAuditoria) {
        await auditoriasService.update(editingAuditoria.id, formData);
      } else {
        await auditoriasService.create(formData);
      }
      await loadData(); // Reload data after saving
      handleCloseModal();
    } catch (error) {
      console.error('Error guardando auditoría:', error);
      throw error;
    }
  };

  const getAuditoriasByEstado = (estado: AuditoriaEstado): Auditoria[] => {
    return auditorias.filter(audit => audit.estado === estado);
  };

  const getEstadoConfig = (estado: AuditoriaEstado): AuditoriaEstadoConfig => {
    return estadosConfig.find(e => e.value === estado) || estadosConfig[0];
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'No definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const getEstadoIcon = (estado: AuditoriaEstado) => {
    switch (estado) {
      case 'programacion':
        return <Clock className="w-4 h-4" />;
      case 'planificacion':
        return <Calendar className="w-4 h-4" />;
      case 'ejecucion':
        return <AlertCircle className="w-4 h-4" />;
      case 'informe':
        return <Edit className="w-4 h-4" />;
      case 'seguimiento':
        return <Eye className="w-4 h-4" />;
      case 'completada':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelada':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Componente de tarjeta de auditoría
  const AuditoriaCard: React.FC<{ auditoria: Auditoria }> = ({ auditoria }) => {
    const estadoConfig = getEstadoConfig(auditoria.estado);
    
    return (
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-800 mb-1">
                {auditoria.codigo}
              </CardTitle>
              <Badge 
                className={`text-xs font-medium px-2 py-1 ${estadoConfig.bgColor} ${estadoConfig.color}`}
              >
                {estadoConfig.label}
              </Badge>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/app/auditorias/${auditoria.id}`)}
                className="text-gray-600 hover:text-gray-800"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenModal(auditoria)}
                className="text-gray-600 hover:text-gray-800"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(auditoria.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-700">
              <Target className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">Área:</span>
              <span className="ml-1">{getAreaNames(auditoria.areas)}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-700">
              <User className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">Responsable:</span>
              <span className="ml-1">{auditoria.auditor_lider}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-700">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">Programada:</span>
              <span className="ml-1">{formatDate(auditoria.fecha_programada)}</span>
            </div>
            
            <div className="text-sm text-gray-600 mt-2">
              {auditoria.titulo}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Vista Kanban
  const KanbanView: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {estadosConfig.map((estado) => {
        const auditoriasEstado = getAuditoriasByEstado(estado.value);
        return (
          <div key={estado.value} className="space-y-4">
            <div className={`p-3 rounded-lg ${estado.bgColor} ${estado.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{estado.label}</h3>
                <span className="text-sm font-medium">{auditoriasEstado.length}</span>
              </div>
            </div>
            <div className="space-y-3">
              {auditoriasEstado.map((auditoria) => (
                <AuditoriaCard key={auditoria.id} auditoria={auditoria} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Vista Grid
  const GridView: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {auditorias.map((auditoria) => (
        <AuditoriaCard key={auditoria.id} auditoria={auditoria} />
      ))}
    </div>
  );

  // Vista Lista
  const ListView: React.FC = () => (
    <div className="space-y-4">
      {auditorias.map((auditoria) => {
        const estadoConfig = getEstadoConfig(auditoria.estado);
        return (
          <Card key={auditoria.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${estadoConfig.bgColor}`}>
                      {getEstadoIcon(auditoria.estado)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{auditoria.codigo}</h3>
                      <p className="text-sm text-gray-600">{auditoria.titulo}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{getAreaNames(auditoria.areas)}</span>
                  <span>•</span>
                  <span>{auditoria.auditor_lider}</span>
                  <span>•</span>
                  <span>{formatDate(auditoria.fecha_programada)}</span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/app/auditorias/${auditoria.id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal(auditoria)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(auditoria.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Cargando auditorías...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Sistema de Administración de Auditorías ISO 9001
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona y controla todas las auditorías del sistema de calidad
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Controles de vista */}
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600'}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-600'}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Botón Nueva Auditoría */}
          <Button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Auditoría</span>
          </Button>
        </div>
      </div>

      {/* Contenido según vista */}
      <div className="flex flex-col flex-grow">
        {viewMode === 'kanban' && <KanbanView />}
        {viewMode === 'grid' && <GridView />}
        {viewMode === 'list' && <ListView />}
      </div>

      <AuditoriaModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAuditoria}
        auditoria={editingAuditoria}
      />
    </div>
  );
};

export default AuditoriasListing;
