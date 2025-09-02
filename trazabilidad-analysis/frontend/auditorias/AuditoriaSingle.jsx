
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Calendar, 
  User, 
  Target,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  Link
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { auditoriasService } from '../../services/auditoriasService.js';
import { Button } from '../ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import AuditoriaRelaciones from './AuditoriaRelaciones.jsx';

// ===============================================
// COMPONENTE DE VISTA DETALLADA DE AUDITORÍA - SGC PRO
// ===============================================

const AuditoriaSingle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auditoria, setAuditoria] = useState(null);
  const [aspectos, setAspectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('planificacion');

  useEffect(() => {
    loadAuditoria();
  }, [id]);

  const loadAuditoria = async () => {
    try {
      setLoading(true);
      const response = await auditoriasService.getById(id);
      setAuditoria(response.data);
      
      // Cargar aspectos si existen
      try {
        const aspectosResponse = await auditoriasService.getAspectos(id);
        setAspectos(aspectosResponse.data || []);
      } catch (err) {
        console.log('No se pudieron cargar los aspectos:', err);
        setAspectos([]);
      }
    } catch (err) {
      console.error('Error cargando auditoría:', err);
      setError('Error al cargar la auditoría');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta auditoría?')) {
      try {
        await auditoriasService.delete(id);
        navigate('/auditorias');
      } catch (err) {
        console.error('Error eliminando auditoría:', err);
        alert('Error al eliminar la auditoría');
      }
    }
  };

  const getEstadoConfig = (estado) => {
    const estados = auditoriasService.getEstados();
    return estados.find(e => e.value === estado) || estados[0];
  };

  const getConformidadConfig = (conformidad) => {
    const conformidades = auditoriasService.getConformidades();
    return conformidades.find(c => c.value === conformidad) || conformidades[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const handleDownloadPDF = () => {
    // Implementar descarga de PDF
    alert('Función de descarga de PDF en desarrollo');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-sgc-600">Cargando auditoría...</div>
      </div>
    );
  }

  if (error || !auditoria) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-600">{error || 'Auditoría no encontrada'}</div>
      </div>
    );
  }

  const estadoConfig = getEstadoConfig(auditoria.estado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/auditorias')}
            className="text-sgc-600 hover:text-sgc-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {auditoria.codigo}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Detalle de Auditoría</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="border-sgc-300 text-sgc-700 hover:bg-sgc-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar PDF
          </Button>
          
          <Button
            onClick={() => navigate(`/auditorias/${id}/editar`)}
            className="bg-sgc-600 hover:bg-sgc-700 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Información de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-sgc-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-sgc-500" />
              <div>
                <p className="text-sm text-sgc-600">Fecha Programada</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(auditoria.fecha_programada)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-sgc-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8 text-sgc-500" />
              <div>
                <p className="text-sm text-sgc-600">Responsable</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {auditoria.responsable_nombre || 'No asignado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-sgc-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-sgc-500" />
              <div>
                <p className="text-sm text-sgc-600">Estado</p>
                <Badge 
                  className={`mt-1 ${
                    estadoConfig.value === 'planificada' ? 'bg-blue-100 text-blue-700' :
                    estadoConfig.value === 'en_proceso' ? 'bg-yellow-100 text-yellow-700' :
                    estadoConfig.value === 'completada' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}
                >
                  {estadoConfig.label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas de contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-sgc-200">
          <TabsTrigger 
            value="planificacion"
            className="data-[state=active]:bg-sgc-600 data-[state=active]:text-white"
          >
            Planificación
          </TabsTrigger>
          <TabsTrigger 
            value="procesos"
            className="data-[state=active]:bg-sgc-600 data-[state=active]:text-white"
          >
            Procesos Auditados
          </TabsTrigger>
          <TabsTrigger 
            value="relaciones"
            className="data-[state=active]:bg-sgc-600 data-[state=active]:text-white"
          >
            Relaciones
          </TabsTrigger>
          <TabsTrigger 
            value="historial"
            className="data-[state=active]:bg-sgc-600 data-[state=active]:text-white"
          >
            Historial
          </TabsTrigger>
        </TabsList>

        {/* Pestaña Planificación */}
        <TabsContent value="planificacion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información General */}
            <Card className="bg-white border border-sgc-200">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <FileText className="w-5 h-5 mr-2" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-sgc-700">Área</label>
                  <p className="text-gray-900 dark:text-white">{auditoria.area}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-sgc-700">Objetivos</label>
                  <p className="text-gray-900 dark:text-white">{auditoria.objetivos || 'No definidos'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-sgc-700">Fecha de Creación</label>
                  <p className="text-gray-900 dark:text-white">{formatDate(auditoria.created_at)}</p>
                </div>
                
                {auditoria.alcance && (
                  <div>
                    <label className="text-sm font-medium text-sgc-700">Alcance</label>
                    <p className="text-gray-900 dark:text-white">{auditoria.alcance}</p>
                  </div>
                )}
                
                {auditoria.criterios && (
                  <div>
                    <label className="text-sm font-medium text-sgc-700">Criterios</label>
                    <p className="text-gray-900 dark:text-white">{auditoria.criterios}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Aspectos a Auditar */}
            <Card className="bg-white border border-sgc-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Target className="w-5 h-5 mr-2" />
                    Aspectos Procesos que se van a Auditar
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/auditorias/${id}/aspectos/nuevo`)}
                    className="bg-sgc-600 hover:bg-sgc-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {aspectos.length > 0 ? (
                  <div className="space-y-3">
                    {aspectos.map((aspecto) => {
                      const conformidadConfig = getConformidadConfig(aspecto.conformidad);
                      return (
                        <div key={aspecto.id} className="p-3 border border-sgc-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sgc-800">{aspecto.proceso_nombre}</h4>
                              <p className="text-sm text-sgc-600 mt-1">
                                {aspecto.documentacion_referenciada}
                              </p>
                              {aspecto.auditor_nombre && (
                                <p className="text-sm text-sgc-600 mt-1">
                                  Auditor: {aspecto.auditor_nombre}
                                </p>
                              )}
                            </div>
                            <Badge 
                              className={`ml-2 ${
                                conformidadConfig.value === 'conforme' ? 'bg-green-100 text-green-700' :
                                conformidadConfig.value === 'no_conforme' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {conformidadConfig.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sgc-500">
                    <Target className="w-12 h-12 mx-auto mb-3 text-sgc-300" />
                    <p>No hay aspectos definidos</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/auditorias/${id}/aspectos/nuevo`)}
                      className="mt-3"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar primer aspecto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña Procesos Auditados */}
        <TabsContent value="procesos" className="space-y-6">
          <Card className="bg-white border border-sgc-200">
            <CardHeader>
              <CardTitle className="text-sgc-800">Ejecución de Auditoría</CardTitle>
            </CardHeader>
            <CardContent>
              {auditoria.estado === 'planificada' ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-sgc-300" />
                  <p className="text-sgc-600">La auditoría aún no ha comenzado</p>
                  <Button
                    onClick={() => navigate(`/auditorias/${id}/ejecutar`)}
                    className="mt-3 bg-sgc-600 hover:bg-sgc-700 text-white"
                  >
                    Iniciar Ejecución
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Aquí iría el contenido de ejecución */}
                  <p className="text-sgc-600">Contenido de ejecución en desarrollo...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Relaciones */}
        <TabsContent value="relaciones" className="space-y-6">
          <Card className="bg-white border border-sgc-200">
            <CardHeader>
              <CardTitle className="flex items-center text-sgc-800">
                <Link className="w-5 h-5 mr-2" />
                Relaciones del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AuditoriaRelaciones auditoriaId={id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña Historial */}
        <TabsContent value="historial" className="space-y-6">
          <Card className="bg-white border border-sgc-200">
            <CardHeader>
              <CardTitle className="text-sgc-800">Historial de Cambios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border border-sgc-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-sgc-800">Auditoría creada</p>
                    <p className="text-sm text-sgc-600">{formatDate(auditoria.created_at)}</p>
                  </div>
                </div>
                
                {auditoria.updated_at && auditoria.updated_at !== auditoria.created_at && (
                  <div className="flex items-center space-x-3 p-3 border border-sgc-200 rounded-lg">
                    <Edit className="w-5 h-5 text-sgc-500" />
                    <div>
                      <p className="font-medium text-sgc-800">Auditoría actualizada</p>
                      <p className="text-sm text-sgc-600">{formatDate(auditoria.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditoriaSingle;
