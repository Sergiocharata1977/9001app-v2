import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-toastify';
import accionesService from '@/services/accionesService';

const CrearAccionForm = ({ onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    responsable: '',
    prioridad: 'media',
    fechaVencimiento: '',
    hallazgo_id: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    try {
      const nuevaAccion = {
        ...formData,
        estado: 'p1_planificacion_accion',
        fechaCreacion: new Date().toISOString()
      };

      await accionesService.createAccion(nuevaAccion);
      toast.success('Acción creada con éxito');
      onSubmit && onSubmit();
    } catch (error) {
      console.error('Error al crear la acción:', error);
      toast.error(error.response?.data?.message || 'Error al crear la acción');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          value={formData.titulo}
          onChange={(e) => handleChange('titulo', e.target.value)}
          placeholder="Título de la acción"
          required
        />
      </div>

      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => handleChange('descripcion', e.target.value)}
          placeholder="Descripción detallada de la acción"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="responsable">Responsable</Label>
        <Input
          id="responsable"
          value={formData.responsable}
          onChange={(e) => handleChange('responsable', e.target.value)}
          placeholder="Nombre del responsable"
        />
      </div>

      <div>
        <Label htmlFor="prioridad">Prioridad</Label>
        <Select
          value={formData.prioridad}
          onValueChange={(value) => handleChange('prioridad', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="baja">Baja</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
        <Input
          id="fechaVencimiento"
          type="date"
          value={formData.fechaVencimiento}
          onChange={(e) => handleChange('fechaVencimiento', e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear Acción'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default CrearAccionForm;
