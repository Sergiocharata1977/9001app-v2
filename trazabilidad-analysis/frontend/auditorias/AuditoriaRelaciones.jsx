import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Link,
  Trash2,
  FileText,
  Target,
  AlertTriangle,
  Settings,
  Users,
  Building
} from 'lucide-react';
import { auditoriasService } from '../../services/auditoriasService.js';

const AuditoriaRelaciones = ({ auditoriaId }) => {
  const [relaciones, setRelaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [registrosDisponibles, setRegistrosDisponibles] = useState([]);
  const [formData, setFormData] = useState({
    destino_tipo: '',
    destino_id: '',
    descripcion: ''
  });

  const tiposRelacionables = [
    { value: 'procesos', label: 'Procesos', icon: Target },
    { value: 'documentos', label: 'Documentos', icon: FileText },
    { value: 'hallazgos', label: 'Hallazgos', icon: AlertTriangle },
    { value: 'acciones', label: 'Acciones', icon: Settings },
    { value: 'personal', label: 'Personal', icon: Users },
    { value: 'departamentos', label: 'Departamentos', icon: Building }
  ];

  useEffect(() => {
    if (auditoriaId) {
      loadRelaciones();
    }
  }, [auditoriaId]);

  const loadRelaciones = async () => {
    try {
      setLoading(true);
      const response = await auditoriasService.getRelaciones(auditoriaId);
      setRelaciones(response.data || []);
    } catch (error) {
      console.error('Error cargando relaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTipoChange = async (tipo) => {
    setFormData(prev => ({ ...prev, destino_tipo: tipo, destino_id: '' }));
    
    if (tipo) {
      try {
        const response = await auditoriasService.getRegistrosRelacionables(tipo);
        setRegistrosDisponibles(response.data || []);
      } catch (error) {
        console.error('Error cargando registros:', error);
        setRegistrosDisponibles([]);
      }
    } else {
      setRegistrosDisponibles([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.destino_tipo || !formData.destino_id) {
      alert('Por favor selecciona el tipo y el registro a relacionar');
      return;
    }

    try {
      await auditoriasService.addRelacion(auditoriaId, formData);
      await loadRelaciones();
      setModalOpen(false);
      setFormData({ destino_tipo: '', destino_id: '', descripcion: '' });
    } catch (error) {
      console.error('Error agregando relación:', error);
      alert('Error al agregar la relación');
    }
  };

  const handleDeleteRelacion = async (relacionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta relación?')) {
      try {
        await auditoriasService.deleteRelacion(relacionId);
        await loadRelaciones();
      } catch (error) {
        console.error('Error eliminando relación:', error);
        alert('Error al eliminar la relación');
      }
    }
  };

  const getTipoIcon = (tipo) => {
    const tipoConfig = tiposRelacionables.find(t => t.value === tipo);
    return tipoConfig ? tipoConfig.icon : Link;
  };

  const getTipoLabel = (tipo) => {
    const tipoConfig = tiposRelacionables.find(t => t.value === tipo);
    return tipoConfig ? tipoConfig.label : tipo;
  };

  const getTipoColor = (tipo) => {
    const colors = {
      procesos: 'bg-blue-100 text-blue-700',
      documentos: 'bg-green-100 text-green-700',
      hallazgos: 'bg-red-100 text-red-700',
      acciones: 'bg-purple-100 text-purple-700',
      personal: 'bg-orange-100 text-orange-700',
      departamentos: 'bg-gray-100 text-gray-700'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link className="w-5 h-5 text-sgc-600" />
          <h3 className="text-lg font-semibold text-sgc-800">Relaciones del Sistema</h3>
          <Badge variant="secondary">{relaciones.length}</Badge>
        </div>
        
        <Button
          onClick={() => setModalOpen(true)}
          size="sm"
          className="bg-sgc-600 hover:bg-sgc-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Agregar Relación
        </Button>
      </div>

      {/* Lista de Relaciones */}
      <div className="space-y-3">
        {relaciones.length === 0 ? (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="p-6 text-center">
              <Link className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 mb-2">No hay relaciones configuradas</p>
              <p className="text-sm text-gray-500">
                Agrega relaciones con procesos, documentos, hallazgos y otros registros del sistema
              </p>
            </CardContent>
          </Card>
        ) : (
          relaciones.map((relacion) => {
            const IconComponent = getTipoIcon(relacion.destino_tipo);
            return (
              <Card key={relacion.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getTipoColor(relacion.destino_tipo)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getTipoColor(relacion.destino_tipo)}>
                            {getTipoLabel(relacion.destino_tipo)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(relacion.fecha_creacion).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-sgc-800 mt-1">
                          {relacion.destino_nombre || 'Registro no encontrado'}
                        </h4>
                        
                        {relacion.descripcion && (
                          <p className="text-sm text-sgc-600 mt-1">
                            {relacion.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRelacion(relacion.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal para agregar relación */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Link className="w-5 h-5 mr-2" />
              Agregar Relación
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="destino_tipo">Tipo de Registro *</Label>
              <Select value={formData.destino_tipo} onValueChange={handleTipoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposRelacionables.map((tipo) => {
                    const IconComponent = tipo.icon;
                    return (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4" />
                          <span>{tipo.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="destino_id">Registro *</Label>
              <Select 
                value={formData.destino_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, destino_id: value }))}
                disabled={!formData.destino_tipo || registrosDisponibles.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar registro" />
                </SelectTrigger>
                <SelectContent>
                  {registrosDisponibles.map((registro) => (
                    <SelectItem key={registro.id} value={registro.id}>
                      {registro.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Describe la relación o su propósito..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-sgc-600 hover:bg-sgc-700">
                Agregar Relación
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditoriaRelaciones; 