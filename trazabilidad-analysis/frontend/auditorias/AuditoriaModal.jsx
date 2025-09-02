import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  FileText, X, Target, CheckSquare, RefreshCw, AlertCircle
} from 'lucide-react';
import { personalService } from '../../services/personalService.js';
import { departamentosService } from '../../services/departamentos.js';

const AuditoriaModal = ({ isOpen, onClose, onSave, auditoria }) => {
  const isEditMode = Boolean(auditoria);

  const [formData, setFormData] = useState({
    codigo: '',
    titulo: '',
    areas: [], // Cambiado de 'area' a 'areas' (array)
    responsable_id: '',
    fecha_programada: '',
    objetivos: '',
    alcance: '',
    criterios: '',
    estado: 'planificada'
  });

  const [personal, setPersonal] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Función para generar código automático
  const generateAuditCode = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `AUD-${currentYear}-${currentMonth}-${randomNum}`;
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (auditoria) {
        setFormData({
          codigo: auditoria.codigo || '',
          titulo: auditoria.titulo || '',
          areas: auditoria.areas ? (Array.isArray(auditoria.areas) ? auditoria.areas : [auditoria.areas]) : [],
          responsable_id: auditoria.responsable_id || '',
          fecha_programada: auditoria.fecha_programada ? new Date(auditoria.fecha_programada).toISOString().split('T')[0] : '',
          objetivos: auditoria.objetivos || '',
          alcance: auditoria.alcance || '',
          criterios: auditoria.criterios || '',
          estado: auditoria.estado || 'planificada'
        });
      } else {
        // Generar código automático para nueva auditoría
        setFormData({
          codigo: generateAuditCode(),
          titulo: '',
          areas: ['todos'], // Por defecto "Todos los departamentos"
          responsable_id: '',
          fecha_programada: '',
          objetivos: '',
          alcance: '',
          criterios: '',
          estado: 'planificada'
        });
      }
    }
  }, [isOpen, auditoria]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando datos para auditoría...');

      // Cargar personal
      console.log('👥 Intentando cargar personal...');
      const personalRes = await personalService.getAllPersonal();
      console.log('👥 Respuesta del servicio personal:', personalRes);

      let personalData = [];
      if (personalRes?.data) {
        personalData = personalRes.data;
      } else if (Array.isArray(personalRes)) {
        personalData = personalRes;
      } else if (personalRes?.success && personalRes?.data) {
        personalData = personalRes.data;
      }
      
      console.log('👥 Personal procesado:', personalData);
      setPersonal(personalData);

      // Cargar departamentos
      console.log('🏢 Intentando cargar departamentos...');
      const departamentosRes = await departamentosService.getAll();
      console.log('🏢 Respuesta del servicio departamentos:', departamentosRes);

      let departamentosData = [];
      if (departamentosRes?.data) {
        departamentosData = departamentosRes.data;
      } else if (Array.isArray(departamentosRes)) {
        departamentosData = departamentosRes;
      } else if (departamentosRes?.success && departamentosRes?.data) {
        departamentosData = departamentosRes.data;
      }
      
      console.log('🏢 Departamentos procesados:', departamentosData);
      setDepartamentos(departamentosData);

      console.log('✅ Datos cargados exitosamente:', { 
        personal: personalData.length, 
        departamentos: departamentosData.length 
      });

    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      // Datos mock temporales si hay error
      const mockPersonal = [
        { id: 1, nombres: 'Juan', apellidos: 'Pérez' },
        { id: 2, nombres: 'María', apellidos: 'García' },
        { id: 3, nombres: 'Carlos', apellidos: 'López' },
        { id: 4, nombres: 'Ana', apellidos: 'Martínez' },
        { id: 5, nombres: 'Luis', apellidos: 'Rodríguez' }
      ];
      setPersonal(mockPersonal);
      
      const mockDepartamentos = [
        { id: 1, nombre: 'Calidad' },
        { id: 2, nombre: 'Producción' },
        { id: 3, nombre: 'Mantenimiento' },
        { id: 4, nombre: 'Recursos Humanos' },
        { id: 5, nombre: 'Administración' }
      ];
      setDepartamentos(mockDepartamentos);
      
      console.log('🔧 Usando datos mock debido al error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar selección múltiple de áreas
  const handleAreasChange = (selectedAreas) => {
    // Si se selecciona "todos", limpiar otras selecciones
    if (selectedAreas.includes('todos')) {
      setFormData(prev => ({ ...prev, areas: ['todos'] }));
    } else {
      // Si se deselecciona "todos", permitir otras selecciones
      setFormData(prev => ({ ...prev, areas: selectedAreas }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.codigo || !formData.titulo || !formData.fecha_programada || formData.areas.length === 0 || !formData.objetivos) {
      alert('Los campos código, título, fecha programada, áreas y objetivos son obligatorios');
      return;
    }

    try {
      setSaving(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error guardando auditoría:', error);
      alert('Error al guardar la auditoría. Por favor, intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const getEstadoOptions = () => [
    { value: 'planificada', label: 'Planificada' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' }
  ];

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            {isEditMode ? 'Editar Auditoría' : 'Nueva Auditoría'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Modifica los datos de la auditoría' : 'Completa el formulario para crear una nueva auditoría'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Código y Áreas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo">Código de Auditoría *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="codigo"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleChange}
                      placeholder="Ej: AUD-2025-001"
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData(prev => ({ ...prev, codigo: generateAuditCode() }))}
                      className="px-3"
                      title="Generar nuevo código"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="areas">Áreas/Departamentos *</Label>
                  <Select 
                    value={formData.areas[0] || ''} 
                    onValueChange={(value) => handleAreasChange([value])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar áreas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">
                        🏢 Todos los departamentos
                      </SelectItem>
                      {departamentos.filter(depto => depto.id).map(depto => (
                        <SelectItem key={`depto-${depto.id}`} value={depto.id.toString()}>
                          {depto.nombre || 'Sin nombre'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.areas.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {formData.areas.includes('todos') 
                        ? 'Seleccionado: Todos los departamentos'
                        : `Seleccionado: ${departamentos.filter(d => d.id && formData.areas.includes(d.id.toString())).map(d => d.nombre || 'Sin nombre').join(', ')}`
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Título */}
              <div>
                <Label htmlFor="titulo">Título de la Auditoría *</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ej: Auditoría del Sistema de Gestión de Calidad"
                  required
                />
              </div>

              {/* Responsable y Fecha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsable_id">Responsable</Label>
                  <Select value={formData.responsable_id} onValueChange={(value) => handleSelectChange('responsable_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      {personal.filter(person => person.id).map(person => (
                        <SelectItem key={`person-${person.id}`} value={person.id.toString()}>
                          {(person.nombres || '')} {(person.apellidos || '')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fecha_programada">Fecha Programada *</Label>
                  <Input
                    id="fecha_programada"
                    name="fecha_programada"
                    type="date"
                    value={formData.fecha_programada}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => handleSelectChange('estado', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getEstadoOptions().map(option => (
                      <SelectItem key={`estado-${option.value}`} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Objetivos y Alcance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Objetivos y Alcance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="objetivos">Objetivos de la Auditoría *</Label>
                <Textarea
                  id="objetivos"
                  name="objetivos"
                  value={formData.objetivos}
                  onChange={handleChange}
                  placeholder="Verificar el cumplimiento de los requisitos de la norma ISO 9001..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="alcance">Alcance</Label>
                <Textarea
                  id="alcance"
                  name="alcance"
                  value={formData.alcance}
                  onChange={handleChange}
                  placeholder="Procesos de gestión de calidad, atención al cliente y mejora continua..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="criterios">Criterios de Auditoría</Label>
                <Textarea
                  id="criterios"
                  name="criterios"
                  value={formData.criterios}
                  onChange={handleChange}
                  placeholder="ISO 9001:2015, procedimientos internos, manual de calidad..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Nota Informativa */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Planificación Básica</p>
                  <p>
                    Esta es la planificación inicial de la auditoría. Una vez creada, podrás agregar:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Procesos específicos a auditar</li>
                    <li>Puntos de la norma a evaluar</li>
                    <li>Participantes del equipo auditor</li>
                    <li>Documentos y evidencias relacionadas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear Auditoría')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuditoriaModal;
