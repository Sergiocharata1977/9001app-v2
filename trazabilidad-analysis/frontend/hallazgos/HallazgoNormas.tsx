import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, BookOpen, CheckCircle, XCircle, AlertTriangle, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ===============================================
// COMPONENTE DE NORMAS PARA HALLAZGOS SGC
// ===============================================

const HallazgoNormas = ({ hallazgoId, organizationId = 1 }) => {
  const [normas, setNormas] = useState([]);
  const [normasDisponibles, setNormasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNorma, setSelectedNorma] = useState(null);
  const [formData, setFormData] = useState({
    norma_id: '',
    punto_norma: '',
    clausula_descripcion: '',
    tipo_relacion: '',
    nivel_cumplimiento: '',
    observaciones: '',
    evidencias: '',
    acciones_requeridas: ''
  });

  // Tipos de relación específicos para hallazgos con normas
  const tiposRelacion = [
    { value: 'no_conformidad', label: 'No Conformidad', color: 'bg-red-100 text-red-800', icon: XCircle },
    { value: 'oportunidad_mejora', label: 'Oportunidad de Mejora', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
    { value: 'observacion', label: 'Observación', color: 'bg-blue-100 text-blue-800', icon: BookOpen },
    { value: 'cumplimiento', label: 'Cumplimiento', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'referencia', label: 'Referencia', color: 'bg-gray-100 text-gray-800', icon: BookOpen },
    { value: 'aplica', label: 'Aplica', color: 'bg-purple-100 text-purple-800', icon: BookOpen }
  ];

  // Niveles de cumplimiento
  const nivelesCumplimiento = [
    { value: 'cumple', label: 'Cumple', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'no_cumple', label: 'No Cumple', color: 'bg-red-100 text-red-800', icon: XCircle },
    { value: 'en_proceso', label: 'En Proceso', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
    { value: 'pendiente', label: 'Pendiente', color: 'bg-gray-100 text-gray-800', icon: BookOpen },
    { value: 'no_aplica', label: 'No Aplica', color: 'bg-gray-100 text-gray-600', icon: BookOpen }
  ];

  // Puntos comunes de ISO 9001
  const puntosISO9001 = [
    { value: '4.1', label: '4.1 - Comprensión de la organización y de su contexto' },
    { value: '4.2', label: '4.2 - Comprensión de las necesidades y expectativas de las partes interesadas' },
    { value: '4.3', label: '4.3 - Determinación del alcance del sistema de gestión de la calidad' },
    { value: '4.4', label: '4.4 - Sistema de gestión de la calidad y sus procesos' },
    { value: '5.1', label: '5.1 - Liderazgo y compromiso' },
    { value: '5.2', label: '5.2 - Política' },
    { value: '5.3', label: '5.3 - Roles, responsabilidades y autoridades en la organización' },
    { value: '6.1', label: '6.1 - Acciones para abordar riesgos y oportunidades' },
    { value: '6.2', label: '6.2 - Objetivos de la calidad y planificación para lograrlos' },
    { value: '6.3', label: '6.3 - Planificación de los cambios' },
    { value: '7.1', label: '7.1 - Recursos' },
    { value: '7.2', label: '7.2 - Competencia' },
    { value: '7.3', label: '7.3 - Toma de conciencia' },
    { value: '7.4', label: '7.4 - Comunicación' },
    { value: '7.5', label: '7.5 - Información documentada' },
    { value: '8.1', label: '8.1 - Planificación y control operacional' },
    { value: '8.2', label: '8.2 - Requisitos para los productos y servicios' },
    { value: '8.3', label: '8.3 - Diseño y desarrollo de los productos y servicios' },
    { value: '8.4', label: '8.4 - Control de los procesos, productos y servicios suministrados externamente' },
    { value: '8.5', label: '8.5 - Producción y provisión del servicio' },
    { value: '8.6', label: '8.6 - Liberación de los productos y servicios' },
    { value: '8.7', label: '8.7 - Control de las salidas no conformes' },
    { value: '9.1', label: '9.1 - Seguimiento, medición, análisis y evaluación' },
    { value: '9.2', label: '9.2 - Auditoría interna' },
    { value: '9.3', label: '9.3 - Revisión por la dirección' },
    { value: '10.1', label: '10.1 - Generalidades de mejora' },
    { value: '10.2', label: '10.2 - No conformidad y acción correctiva' },
    { value: '10.3', label: '10.3 - Mejora continua' }
  ];

  // Cargar datos
  useEffect(() => {
    fetchNormas();
    fetchNormasDisponibles();
  }, [hallazgoId]);

  const fetchNormas = async () => {
    try {
      const response = await fetch(`/api/hallazgos/${hallazgoId}/normas`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setNormas(data.data || []);
      } else {
        toast.error('Error al cargar normas');
      }
    } catch (error) {
      console.error('Error fetching normas:', error);
      toast.error('Error al cargar normas');
    }
  };

  const fetchNormasDisponibles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/normas?organization_id=${organizationId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setNormasDisponibles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching normas disponibles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (norma = null) => {
    setSelectedNorma(norma);
    if (norma) {
      setFormData({
        norma_id: norma.norma_id || '',
        punto_norma: norma.punto_norma || '',
        clausula_descripcion: norma.clausula_descripcion || '',
        tipo_relacion: norma.tipo_relacion || '',
        nivel_cumplimiento: norma.nivel_cumplimiento || '',
        observaciones: norma.observaciones || '',
        evidencias: norma.evidencias || '',
        acciones_requeridas: norma.acciones_requeridas || ''
      });
    } else {
      setFormData({
        norma_id: '1', // ISO 9001 por defecto
        punto_norma: '',
        clausula_descripcion: '',
        tipo_relacion: 'no_conformidad',
        nivel_cumplimiento: 'no_cumple',
        observaciones: '',
        evidencias: '',
        acciones_requeridas: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.norma_id || !formData.punto_norma || !formData.tipo_relacion) {
      toast.error('Norma, punto de norma y tipo de relación son requeridos');
      return;
    }

    try {
      const url = selectedNorma 
        ? `/api/hallazgos/${hallazgoId}/normas/${selectedNorma.id}`
        : `/api/hallazgos/${hallazgoId}/normas`;
      
      const method = selectedNorma ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success(selectedNorma ? 'Norma actualizada' : 'Norma agregada');
        setIsModalOpen(false);
        fetchNormas();
      } else {
        toast.error(data.message || 'Error al guardar norma');
      }
    } catch (error) {
      console.error('Error saving norma:', error);
      toast.error('Error al guardar norma');
    }
  };

  const handleDelete = async (normaId) => {
    if (!window.confirm('¿Está seguro de eliminar esta norma?')) {
      return;
    }

    try {
      const response = await fetch(`/api/hallazgos/${hallazgoId}/normas/${normaId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('Norma eliminada');
        fetchNormas();
      } else {
        toast.error(data.message || 'Error al eliminar norma');
      }
    } catch (error) {
      console.error('Error deleting norma:', error);
      toast.error('Error al eliminar norma');
    }
  };

  const updateCumplimiento = async (norma, nuevoCumplimiento) => {
    try {
      const response = await fetch(`/api/hallazgos/${hallazgoId}/normas/${norma.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...norma,
          nivel_cumplimiento: nuevoCumplimiento
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('Nivel de cumplimiento actualizado');
        fetchNormas();
      } else {
        toast.error('Error al actualizar cumplimiento');
      }
    } catch (error) {
      console.error('Error updating cumplimiento:', error);
      toast.error('Error al actualizar cumplimiento');
    }
  };

  const getTipoInfo = (tipo) => {
    return tiposRelacion.find(t => t.value === tipo) || { 
      label: tipo, 
      color: 'bg-gray-100 text-gray-800',
      icon: BookOpen
    };
  };

  const getCumplimientoInfo = (nivel) => {
    return nivelesCumplimiento.find(n => n.value === nivel) || { 
      label: nivel, 
      color: 'bg-gray-100 text-gray-800',
      icon: BookOpen
    };
  };

  const getNormaNombre = (normaId) => {
    const norma = normasDisponibles.find(n => n.id === normaId);
    return norma ? `${norma.nombre} ${norma.version || ''}` : 'Norma desconocida';
  };

  // Estadísticas de normas
  const stats = {
    total: normas.length,
    no_conformidades: normas.filter(n => n.tipo_relacion === 'no_conformidad').length,
    oportunidades: normas.filter(n => n.tipo_relacion === 'oportunidad_mejora').length,
    observaciones: normas.filter(n => n.tipo_relacion === 'observacion').length,
    cumple: normas.filter(n => n.nivel_cumplimiento === 'cumple').length,
    no_cumple: normas.filter(n => n.nivel_cumplimiento === 'no_cumple').length
  };

  if (loading) {
    return <div className="text-center py-8">Cargando normas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Normas Relacionadas</h3>
          <p className="text-sm text-gray-600">
            {stats.total} puntos de norma • {stats.no_conformidades} no conformidades • {stats.oportunidades} oportunidades
          </p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Norma
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {selectedNorma ? 'Editar Norma' : 'Agregar Norma'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="norma_id">Norma</Label>
                  <Select 
                    value={formData.norma_id} 
                    onValueChange={(value) => setFormData({...formData, norma_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar norma" />
                    </SelectTrigger>
                    <SelectContent>
                      {normasDisponibles.map(norma => (
                        <SelectItem key={norma.id} value={norma.id}>
                          {norma.nombre} {norma.version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="punto_norma">Punto de Norma</Label>
                  <Select 
                    value={formData.punto_norma} 
                    onValueChange={(value) => setFormData({...formData, punto_norma: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ej: 8.7, 9.2.2, etc." />
                    </SelectTrigger>
                    <SelectContent>
                      {puntosISO9001.map(punto => (
                        <SelectItem key={punto.value} value={punto.value}>
                          {punto.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="clausula_descripcion">Descripción de la Cláusula</Label>
                <Input
                  id="clausula_descripcion"
                  placeholder="Descripción del requisito de la norma"
                  value={formData.clausula_descripcion}
                  onChange={(e) => setFormData({...formData, clausula_descripcion: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="nivel_cumplimiento">Nivel de Cumplimiento</Label>
                  <Select 
                    value={formData.nivel_cumplimiento} 
                    onValueChange={(value) => setFormData({...formData, nivel_cumplimiento: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {nivelesCumplimiento.map(nivel => (
                        <SelectItem key={nivel.value} value={nivel.value}>
                          <div className="flex items-center">
                            <nivel.icon className="h-4 w-4 mr-2" />
                            {nivel.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Observaciones sobre el cumplimiento de esta norma..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="evidencias">Evidencias</Label>
                <Textarea
                  id="evidencias"
                  placeholder="Evidencias del cumplimiento o incumplimiento..."
                  value={formData.evidencias}
                  onChange={(e) => setFormData({...formData, evidencias: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="acciones_requeridas">Acciones Requeridas</Label>
                <Textarea
                  id="acciones_requeridas"
                  placeholder="Acciones necesarias para el cumplimiento..."
                  value={formData.acciones_requeridas}
                  onChange={(e) => setFormData({...formData, acciones_requeridas: e.target.value})}
                />
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
                  {selectedNorma ? 'Actualizar' : 'Agregar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de normas */}
      {normas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No hay normas relacionadas</p>
            <p className="text-sm text-gray-400">Agregue puntos de norma relacionados con este hallazgo</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {normas.map((norma) => {
            const tipoInfo = getTipoInfo(norma.tipo_relacion);
            const cumplimientoInfo = getCumplimientoInfo(norma.nivel_cumplimiento);
            const TipoIcon = tipoInfo.icon;
            const CumplimientoIcon = cumplimientoInfo.icon;
            
            return (
              <Card key={norma.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold">
                          {getNormaNombre(norma.norma_id)} - Punto {norma.punto_norma}
                        </h4>
                      </div>
                      
                      {norma.clausula_descripcion && (
                        <p className="text-sm text-gray-600 mb-3">
                          {norma.clausula_descripcion}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={`${tipoInfo.color} text-xs`}>
                          <TipoIcon className="h-3 w-3 mr-1" />
                          {tipoInfo.label}
                        </Badge>
                        
                        <Select
                          value={norma.nivel_cumplimiento}
                          onValueChange={(value) => updateCumplimiento(norma, value)}
                        >
                          <SelectTrigger className="w-auto h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {nivelesCumplimiento.map(nivel => (
                              <SelectItem key={nivel.value} value={nivel.value}>
                                <div className="flex items-center">
                                  <nivel.icon className="h-4 w-4 mr-2" />
                                  {nivel.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenModal(norma)}
                        className="h-8 w-8 p-0"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(norma.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-3">
                  {norma.observaciones && (
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 mb-1">Observaciones:</h5>
                      <p className="text-xs text-gray-600">{norma.observaciones}</p>
                    </div>
                  )}
                  
                  {norma.evidencias && (
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 mb-1">Evidencias:</h5>
                      <p className="text-xs text-gray-600">{norma.evidencias}</p>
                    </div>
                  )}
                  
                  {norma.acciones_requeridas && (
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 mb-1">Acciones Requeridas:</h5>
                      <p className="text-xs text-gray-600">{norma.acciones_requeridas}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>
                      Agregado: {new Date(norma.created_at).toLocaleDateString()}
                    </span>
                    {norma.updated_at !== norma.created_at && (
                      <span>
                        Actualizado: {new Date(norma.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Resumen de cumplimiento */}
      {normas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumen de Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-red-600">{stats.no_conformidades}</div>
                <div className="text-gray-600">No Conformidades</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-yellow-600">{stats.oportunidades}</div>
                <div className="text-gray-600">Oportunidades</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">{stats.observaciones}</div>
                <div className="text-gray-600">Observaciones</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{stats.cumple}</div>
                <div className="text-gray-600">Cumple</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600">{stats.no_cumple}</div>
                <div className="text-gray-600">No Cumple</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HallazgoNormas;
