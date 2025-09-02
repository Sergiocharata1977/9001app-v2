import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Calendar,
  User,
  Target,
  FileText
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { auditoriasService } from '../../services/auditoriasService.js';
import { Button } from '../ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Textarea } from '../ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';

// ===============================================
// FORMULARIO DE AUDITORÍA - SGC PRO
// ===============================================

const AuditoriaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [personal, setPersonal] = useState([]);
  
  const [formData, setFormData] = useState({
    codigo: '',
    titulo: '',
    area: '',
    responsable_id: '',
    fecha_programada: '',
    objetivos: '',
    alcance: '',
    criterios: '',
    estado: 'planificada'
  });

  const [aspectos, setAspectos] = useState([
    {
      id: 'temp-1',
      proceso_nombre: '',
      documentacion_referenciada: '',
      auditor_nombre: ''
    }
  ]);

  const isEditing = !!id;

  useEffect(() => {
    loadPersonal();
    if (isEditing) {
      loadAuditoria();
    } else {
      // Generar código automático para nueva auditoría
      setFormData(prev => ({
        ...prev,
        codigo: auditoriasService.generateAuditCode()
      }));
    }
  }, [id]);

  const loadPersonal = async () => {
    try {
      // Aquí deberías cargar el personal desde el servicio correspondiente
      // Por ahora usamos datos de ejemplo
      setPersonal([
        { id: '1', nombres: 'Juan', apellidos: 'Pérez', puesto: 'Auditor Interno' },
        { id: '2', nombres: 'María', apellidos: 'García', puesto: 'Responsable de Calidad' },
        { id: '3', nombres: 'Carlos', apellidos: 'López', puesto: 'Supervisor' }
      ]);
    } catch (error) {
      console.error('Error cargando personal:', error);
    }
  };

  const loadAuditoria = async () => {
    try {
      setLoading(true);
      const response = await auditoriasService.getById(id);
      const auditoria = response.data;
      
      setFormData({
        codigo: auditoria.codigo,
        titulo: auditoria.titulo,
        area: auditoria.area,
        responsable_id: auditoria.responsable_id || '',
        fecha_programada: auditoria.fecha_programada ? auditoria.fecha_programada.split('T')[0] : '',
        objetivos: auditoria.objetivos || '',
        alcance: auditoria.alcance || '',
        criterios: auditoria.criterios || '',
        estado: auditoria.estado
      });

      // Cargar aspectos si existen
      try {
        const aspectosResponse = await auditoriasService.getAspectos(id);
        setAspectos(aspectosResponse.data || []);
      } catch (err) {
        console.log('No se pudieron cargar los aspectos:', err);
      }
    } catch (error) {
      console.error('Error cargando auditoría:', error);
      alert('Error al cargar la auditoría');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAspectoChange = (index, field, value) => {
    setAspectos(prev => prev.map((aspecto, i) => 
      i === index ? { ...aspecto, [field]: value } : aspecto
    ));
  };

  const addAspecto = () => {
    setAspectos(prev => [...prev, {
      id: `temp-${Date.now()}`,
      proceso_nombre: '',
      documentacion_referenciada: '',
      auditor_nombre: ''
    }]);
  };

  const removeAspecto = (index) => {
    setAspectos(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.titulo.trim()) {
      alert('El título es obligatorio');
      return false;
    }
    if (!formData.area.trim()) {
      alert('El área es obligatoria');
      return false;
    }
    if (!formData.fecha_programada) {
      alert('La fecha programada es obligatoria');
      return false;
    }
    if (!formData.objetivos.trim()) {
      alert('Los objetivos son obligatorios');
      return false;
    }
    
    // Validar aspectos
    for (let i = 0; i < aspectos.length; i++) {
      if (!aspectos[i].proceso_nombre.trim()) {
        alert(`El nombre del proceso es obligatorio en el aspecto ${i + 1}`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      if (isEditing) {
        await auditoriasService.update(id, formData);
      } else {
        const response = await auditoriasService.create(formData);
        const newAuditoriaId = response.data.id;
        
        // Crear aspectos
        for (const aspecto of aspectos) {
          if (aspecto.proceso_nombre.trim()) {
            await auditoriasService.addAspecto(newAuditoriaId, {
              proceso_nombre: aspecto.proceso_nombre,
              documentacion_referenciada: aspecto.documentacion_referenciada,
              auditor_nombre: aspecto.auditor_nombre
            });
          }
        }
      }
      
      navigate('/auditorias');
    } catch (error) {
      console.error('Error guardando auditoría:', error);
      alert('Error al guardar la auditoría');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-sgc-600">Cargando auditoría...</div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-sgc-800">
              {isEditing ? 'Editar Auditoría' : 'Programación de Auditoría'}
            </h1>
            <p className="text-sgc-600">
              {isEditing ? 'Modifica los datos de la auditoría' : 'Crea una nueva auditoría'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/auditorias')}
            className="border-sgc-300 text-sgc-700 hover:bg-sgc-50"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-sgc-600 hover:bg-sgc-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Auditoría')}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <Card className="bg-white border border-sgc-200">
          <CardHeader>
            <CardTitle className="flex items-center text-sgc-800">
              <FileText className="w-5 h-5 mr-2" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="codigo" className="text-sgc-700">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  className="border-sgc-300 focus:border-sgc-500"
                  disabled={isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="titulo" className="text-sgc-700">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  className="border-sgc-300 focus:border-sgc-500"
                  placeholder="Ej: Auditoría de Procesos de Producción"
                />
              </div>
              
              <div>
                <Label htmlFor="area" className="text-sgc-700">Área *</Label>
                <Select value={formData.area} onValueChange={(value) => handleInputChange('area', value)}>
                  <SelectTrigger className="border-sgc-300 focus:border-sgc-500">
                    <SelectValue placeholder="Seleccionar área" />
                  </SelectTrigger>
                  <SelectContent>
                    {auditoriasService.getAreas().map((area) => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="responsable" className="text-sgc-700">Responsable</Label>
                <Select value={formData.responsable_id} onValueChange={(value) => handleInputChange('responsable_id', value)}>
                  <SelectTrigger className="border-sgc-300 focus:border-sgc-500">
                    <SelectValue placeholder="Seleccionar responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {personal.map((persona) => (
                      <SelectItem key={persona.id} value={persona.id}>
                        {persona.nombres} {persona.apellidos} - {persona.puesto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fecha_programada" className="text-sgc-700">Fecha Programada *</Label>
                <Input
                  id="fecha_programada"
                  type="date"
                  value={formData.fecha_programada}
                  onChange={(e) => handleInputChange('fecha_programada', e.target.value)}
                  className="border-sgc-300 focus:border-sgc-500"
                />
              </div>
              
              <div>
                <Label htmlFor="estado" className="text-sgc-700">Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
                  <SelectTrigger className="border-sgc-300 focus:border-sgc-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {auditoriasService.getEstados().map((estado) => (
                      <SelectItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="objetivos" className="text-sgc-700">Objetivos *</Label>
                <Textarea
                  id="objetivos"
                  value={formData.objetivos}
                  onChange={(e) => handleInputChange('objetivos', e.target.value)}
                  className="border-sgc-300 focus:border-sgc-500"
                  placeholder="Describir los objetivos de la auditoría"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="alcance" className="text-sgc-700">Alcance</Label>
                <Textarea
                  id="alcance"
                  value={formData.alcance}
                  onChange={(e) => handleInputChange('alcance', e.target.value)}
                  className="border-sgc-300 focus:border-sgc-500"
                  placeholder="Definir el alcance de la auditoría"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="criterios" className="text-sgc-700">Criterios</Label>
                <Textarea
                  id="criterios"
                  value={formData.criterios}
                  onChange={(e) => handleInputChange('criterios', e.target.value)}
                  className="border-sgc-300 focus:border-sgc-500"
                  placeholder="Criterios de auditoría"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aspectos a Auditar */}
        <Card className="bg-white border border-sgc-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-sgc-800">
                <Target className="w-5 h-5 mr-2" />
                Aspectos Procesos que se van a Auditar
              </CardTitle>
              <Button
                type="button"
                onClick={addAspecto}
                className="bg-sgc-600 hover:bg-sgc-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Aspecto
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {aspectos.map((aspecto, index) => (
              <div key={aspecto.id} className="p-4 border border-sgc-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sgc-800">Aspecto {index + 1}</h4>
                  {aspectos.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAspecto(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sgc-700">Proceso *</Label>
                    <Input
                      value={aspecto.proceso_nombre}
                      onChange={(e) => handleAspectoChange(index, 'proceso_nombre', e.target.value)}
                      className="border-sgc-300 focus:border-sgc-500"
                      placeholder="Nombre del proceso"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sgc-700">Documentación Referenciada</Label>
                    <Input
                      value={aspecto.documentacion_referenciada}
                      onChange={(e) => handleAspectoChange(index, 'documentacion_referenciada', e.target.value)}
                      className="border-sgc-300 focus:border-sgc-500"
                      placeholder="Ej: PO-001, Manual de Calidad"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sgc-700">Auditor</Label>
                    <Input
                      value={aspecto.auditor_nombre}
                      onChange={(e) => handleAspectoChange(index, 'auditor_nombre', e.target.value)}
                      className="border-sgc-300 focus:border-sgc-500"
                      placeholder="Nombre del auditor"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {aspectos.length === 0 && (
              <div className="text-center py-8 text-sgc-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-sgc-300" />
                <p>No hay aspectos definidos</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAspecto}
                  className="mt-3"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar primer aspecto
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AuditoriaForm; 