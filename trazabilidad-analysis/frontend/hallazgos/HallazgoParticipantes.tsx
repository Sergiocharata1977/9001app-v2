import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, UserX, Users, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ===============================================
// COMPONENTE DE PARTICIPANTES PARA HALLAZGOS SGC
// ===============================================

const HallazgoParticipantes = ({ hallazgoId, organizationId = 1 }) => {
  const [participantes, setParticipantes] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParticipante, setSelectedParticipante] = useState(null);
  const [formData, setFormData] = useState({
    personal_id: '',
    rol: '',
    observaciones: '',
    asistio: 0
  });

  // Roles específicos para hallazgos
  const rolesHallazgos = [
    { value: 'responsable', label: 'Responsable Principal', color: 'bg-blue-100 text-blue-800' },
    { value: 'auditor', label: 'Auditor', color: 'bg-purple-100 text-purple-800' },
    { value: 'implementador', label: 'Implementador', color: 'bg-green-100 text-green-800' },
    { value: 'verificador', label: 'Verificador', color: 'bg-orange-100 text-orange-800' },
    { value: 'coordinador', label: 'Coordinador', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'apoyo', label: 'Personal de Apoyo', color: 'bg-gray-100 text-gray-800' }
  ];

  // Cargar datos
  useEffect(() => {
    fetchParticipantes();
    fetchPersonal();
  }, [hallazgoId]);

  const fetchParticipantes = async () => {
    try {
      const response = await fetch(`/api/hallazgos/${hallazgoId}/participantes`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setParticipantes(data.data || []);
      } else {
        toast.error('Error al cargar participantes');
      }
    } catch (error) {
      console.error('Error fetching participantes:', error);
      toast.error('Error al cargar participantes');
    }
  };

  const fetchPersonal = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/personal?organization_id=${organizationId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setPersonal(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching personal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (participante = null) => {
    setSelectedParticipante(participante);
    if (participante) {
      setFormData({
        personal_id: participante.personal_id || '',
        rol: participante.rol || '',
        observaciones: participante.observaciones || '',
        asistio: participante.asistio || 0
      });
    } else {
      setFormData({
        personal_id: '',
        rol: '',
        observaciones: '',
        asistio: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.personal_id || !formData.rol) {
      toast.error('Personal y rol son requeridos');
      return;
    }

    try {
      const url = selectedParticipante 
        ? `/api/hallazgos/${hallazgoId}/participantes/${selectedParticipante.id}`
        : `/api/hallazgos/${hallazgoId}/participantes`;
      
      const method = selectedParticipante ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success(selectedParticipante ? 'Participante actualizado' : 'Participante agregado');
        setIsModalOpen(false);
        fetchParticipantes();
      } else {
        toast.error(data.message || 'Error al guardar participante');
      }
    } catch (error) {
      console.error('Error saving participante:', error);
      toast.error('Error al guardar participante');
    }
  };

  const handleDelete = async (participanteId) => {
    if (!window.confirm('¿Está seguro de eliminar este participante?')) {
      return;
    }

    try {
      const response = await fetch(`/api/hallazgos/${hallazgoId}/participantes/${participanteId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success('Participante eliminado');
        fetchParticipantes();
      } else {
        toast.error(data.message || 'Error al eliminar participante');
      }
    } catch (error) {
      console.error('Error deleting participante:', error);
      toast.error('Error al eliminar participante');
    }
  };

  const toggleAsistencia = async (participante) => {
    try {
      const nuevoEstado = participante.asistio === 1 ? 0 : 1;
      
      const response = await fetch(`/api/hallazgos/${hallazgoId}/participantes/${participante.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...participante,
          asistio: nuevoEstado
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        toast.success(`Asistencia ${nuevoEstado ? 'confirmada' : 'removida'}`);
        fetchParticipantes();
      } else {
        toast.error('Error al actualizar asistencia');
      }
    } catch (error) {
      console.error('Error toggling asistencia:', error);
      toast.error('Error al actualizar asistencia');
    }
  };

  const getRolInfo = (rol) => {
    return rolesHallazgos.find(r => r.value === rol) || { 
      label: rol, 
      color: 'bg-gray-100 text-gray-800' 
    };
  };

  const getPersonalNombre = (personalId) => {
    const persona = personal.find(p => p.id === personalId);
    return persona ? persona.nombre_completo : 'Desconocido';
  };

  // Estadísticas de participantes
  const stats = {
    total: participantes.length,
    responsables: participantes.filter(p => p.rol === 'responsable').length,
    auditores: participantes.filter(p => p.rol === 'auditor').length,
    implementadores: participantes.filter(p => p.rol === 'implementador').length,
    asistieron: participantes.filter(p => p.asistio === 1).length
  };

  if (loading) {
    return <div className="text-center py-8">Cargando participantes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Participantes del Hallazgo</h3>
          <p className="text-sm text-gray-600">
            {stats.total} participantes • {stats.responsables} responsables • {stats.auditores} auditores
          </p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Participante
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedParticipante ? 'Editar Participante' : 'Agregar Participante'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="personal_id">Personal</Label>
                <Select 
                  value={formData.personal_id} 
                  onValueChange={(value) => setFormData({...formData, personal_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar personal" />
                  </SelectTrigger>
                  <SelectContent>
                    {personal.map(persona => (
                      <SelectItem key={persona.id} value={persona.id}>
                        {persona.nombre_completo} - {persona.cargo || 'Sin cargo'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rol">Rol</Label>
                <Select 
                  value={formData.rol} 
                  onValueChange={(value) => setFormData({...formData, rol: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesHallazgos.map(rol => (
                      <SelectItem key={rol.value} value={rol.value}>
                        {rol.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Observaciones sobre la participación..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="asistio"
                  checked={formData.asistio === 1}
                  onChange={(e) => setFormData({...formData, asistio: e.target.checked ? 1 : 0})}
                />
                <Label htmlFor="asistio">Participó/Asistió</Label>
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
                  {selectedParticipante ? 'Actualizar' : 'Agregar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de participantes */}
      {participantes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No hay participantes asignados</p>
            <p className="text-sm text-gray-400">Agregue participantes para este hallazgo</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {participantes.map((participante) => {
            const rolInfo = getRolInfo(participante.rol);
            
            return (
              <Card key={participante.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">
                        {getPersonalNombre(participante.personal_id)}
                      </h4>
                      <Badge className={`${rolInfo.color} text-xs mt-1`}>
                        {rolInfo.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleAsistencia(participante)}
                        className="h-8 w-8 p-0"
                        title={participante.asistio ? 'Marcar como no participó' : 'Marcar como participó'}
                      >
                        {participante.asistio === 1 ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenModal(participante)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(participante.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {participante.observaciones && (
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {participante.observaciones}
                    </p>
                  </CardContent>
                )}
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {participante.asistio === 1 ? 'Participó' : 'No participó'}
                    </span>
                    <span>
                      {new Date(participante.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Resumen por roles */}
      {participantes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumen por Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-600">{stats.responsables}</div>
                <div className="text-gray-600">Responsables</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{stats.auditores}</div>
                <div className="text-gray-600">Auditores</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{stats.implementadores}</div>
                <div className="text-gray-600">Implementadores</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">{stats.asistieron}</div>
                <div className="text-gray-600">Participaron</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HallazgoParticipantes;
