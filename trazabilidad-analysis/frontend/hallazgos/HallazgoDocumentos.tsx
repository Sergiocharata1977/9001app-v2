import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, FileText, Download, Trash2, Upload, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ===============================================
// COMPONENTE DE DOCUMENTOS PARA HALLAZGOS SGC
// ===============================================

const HallazgoDocumentos = ({ hallazgoId, organizationId = 1 }) => {
  const [documentos, setDocumentos] = useState([]);
  const [documentosDisponibles, setDocumentosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState(null);
  const [formData, setFormData] = useState({
    documento_id: '',
    tipo_relacion: '',
    descripcion: '',
    es_obligatorio: 0
  });

  // Tipos de relación específicos para hallazgos
  const tiposRelacion = [
    { value: 'evidencia', label: 'Evidencia', color: 'bg-red-100 text-red-800', icon: FileText },
    { value: 'plan_accion', label: 'Plan de Acción', color: 'bg-blue-100 text-blue-800', icon: FileText },
    { value: 'seguimiento', label: 'Seguimiento', color: 'bg-yellow-100 text-yellow-800', icon: FileText },
    { value: 'cierre', label: 'Cierre/Verificación', color: 'bg-green-100 text-green-800', icon: FileText },
    { value: 'norma_referencia', label: 'Norma de Referencia', color: 'bg-purple-100 text-purple-800', icon: FileText },
    { value: 'procedimiento', label: 'Procedimiento', color: 'bg-indigo-100 text-indigo-800', icon: FileText },
    { value: 'formato', label: 'Formato/Plantilla', color: 'bg-gray-100 text-gray-800', icon: FileText },
    { value: 'adjunto', label: 'Documento Adjunto', color: 'bg-orange-100 text-orange-800', icon: FileText }
  ];

  // Cargar datos
  useEffect(() => {
    fetchDocumentos();
    fetchDocumentosDisponibles();
  }, [hallazgoId]);

  const fetchDocumentos = async () => {
    try {
      const response = await fetch(`/api/hallazgos/${hallazgoId}/documentos`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setDocumentos(data.data || []);
      } else {
        toast.error('Error al cargar documentos');
      }
    } catch (error) {
      console.error('Error fetching documentos:', error);
      toast.error('Error al cargar documentos');
    }
  };

  const fetchDocumentosDisponibles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documentos?organization_id=${organizationId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setDocumentosDisponibles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching documentos disponibles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (documento = null) => {
    setSelectedDocumento(documento);
    if (documento) {
      setFormData({
        documento_id: documento.documento_id || '',
        tipo_relacion: documento.tipo_relacion || '',
        descripcion: documento.descripcion || '',
        es_obligatorio: documento.es_obligatorio || 0
      });
    } else {
      setFormData({
        documento_id: '',
        tipo_relacion: '',
        descripcion: '',
        es_obligatorio: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.documento_id || !formData.tipo_relacion) {
      toast.error('Documento y tipo de relación son requeridos');
      return;
    }

    try {
      const url = selectedDocumento 
        ? `/api/hallazgos/${hallazgoId}/documentos/${selectedDocumento.id}`
        : `/api/hallazgos/${hallazgoId}/documentos`;
      
      const method = selectedDocumento ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success(selectedDocumento ? 'Documento actualizado' : 'Documento agregado');
        setIsModalOpen(false);
        fetchDocumentos();
      } else {
        toast.error(data.message || 'Error al guardar documento');
      }
    } catch (error) {
      console.error('Error saving documento:', error);
      toast.error('Error al guardar documento');
    }
  };

  const handleDelete = async (documentoId) => {
    if (!window.confirm('¿Está seguro de eliminar este documento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/hallazgos/${hallazgoId}/documentos/${documentoId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('Documento eliminado');
        fetchDocumentos();
      } else {
        toast.error(data.message || 'Error al eliminar documento');
      }
    } catch (error) {
      console.error('Error deleting documento:', error);
      toast.error('Error al eliminar documento');
    }
  };

  const handleDownload = async (documento) => {
    try {
      const response = await fetch(`/api/documentos/${documento.documento_id}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = documento.nombre || 'documento';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Descarga iniciada');
      } else {
        toast.error('Error al descargar documento');
      }
    } catch (error) {
      console.error('Error downloading documento:', error);
      toast.error('Error al descargar documento');
    }
  };

  const getTipoInfo = (tipo) => {
    return tiposRelacion.find(t => t.value === tipo) || { 
      label: tipo, 
      color: 'bg-gray-100 text-gray-800',
      icon: FileText
    };
  };

  const getDocumentoNombre = (documentoId) => {
    const doc = documentosDisponibles.find(d => d.id === documentoId);
    return doc ? doc.nombre : 'Documento desconocido';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Tamaño desconocido';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Estadísticas de documentos
  const stats = {
    total: documentos.length,
    evidencias: documentos.filter(d => d.tipo_relacion === 'evidencia').length,
    planes_accion: documentos.filter(d => d.tipo_relacion === 'plan_accion').length,
    seguimientos: documentos.filter(d => d.tipo_relacion === 'seguimiento').length,
    obligatorios: documentos.filter(d => d.es_obligatorio === 1).length
  };

  if (loading) {
    return <div className="text-center py-8">Cargando documentos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Documentos del Hallazgo</h3>
          <p className="text-sm text-gray-600">
            {stats.total} documentos • {stats.evidencias} evidencias • {stats.planes_accion} planes de acción
          </p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedDocumento ? 'Editar Documento' : 'Agregar Documento'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="documento_id">Documento</Label>
                <Select 
                  value={formData.documento_id} 
                  onValueChange={(value) => setFormData({...formData, documento_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentosDisponibles.map(doc => (
                      <SelectItem key={doc.id} value={doc.id}>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>{doc.nombre}</span>
                          {doc.tipo && <span className="text-gray-500 ml-2">({doc.tipo})</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tipo_relacion">Tipo de Relación</Label>
                <Select 
                  value={formData.tipo_relacion} 
                  onValueChange={(value) => setFormData({...formData, tipo_relacion: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposRelacion.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        <div className="flex items-center">
                          <tipo.icon className="h-4 w-4 mr-2" />
                          {tipo.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Descripción de la relación del documento con el hallazgo..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="es_obligatorio"
                  checked={formData.es_obligatorio === 1}
                  onChange={(e) => setFormData({...formData, es_obligatorio: e.target.checked ? 1 : 0})}
                />
                <Label htmlFor="es_obligatorio">Documento obligatorio</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {selectedDocumento ? 'Actualizar' : 'Agregar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de documentos */}
      {documentos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No hay documentos relacionados</p>
            <p className="text-sm text-gray-400">Agregue documentos como evidencias, planes de acción, etc.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documentos.map((documento) => {
            const tipoInfo = getTipoInfo(documento.tipo_relacion);
            const IconComponent = tipoInfo.icon;
            
            return (
              <Card key={documento.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                        <h4 className="font-semibold text-sm line-clamp-1">
                          {getDocumentoNombre(documento.documento_id)}
                        </h4>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={`${tipoInfo.color} text-xs`}>
                          {tipoInfo.label}
                        </Badge>
                        {documento.es_obligatorio === 1 && (
                          <Badge variant="outline" className="text-xs">
                            Obligatorio
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(documento)}
                        className="h-8 w-8 p-0"
                        title="Descargar"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`/api/documentos/${documento.documento_id}/view`, '_blank')}
                        className="h-8 w-8 p-0"
                        title="Ver"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(documento.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {documento.descripcion && (
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {documento.descripcion}
                    </p>
                  </CardContent>
                )}
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {documento.tipo && `${documento.tipo.toUpperCase()}`}
                      {documento.tamano && ` • ${formatFileSize(documento.tamano)}`}
                    </span>
                    <span>
                      {new Date(documento.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Resumen por tipos */}
      {documentos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumen por Tipos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-red-600">{stats.evidencias}</div>
                <div className="text-gray-600">Evidencias</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">{stats.planes_accion}</div>
                <div className="text-gray-600">Planes de Acción</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-yellow-600">{stats.seguimientos}</div>
                <div className="text-gray-600">Seguimientos</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{stats.obligatorios}</div>
                <div className="text-gray-600">Obligatorios</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Subir Evidencia
            </Button>
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Crear Plan de Acción
            </Button>
            <Button size="sm" variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Biblioteca de Documentos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HallazgoDocumentos;
