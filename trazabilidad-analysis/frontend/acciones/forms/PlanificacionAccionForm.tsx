import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import accionesService from '@/services/accionesService';

// Este formulario se usaría al mover una tarjeta a "Programada"
export default function PlanificacionAccionForm({ accionId, onUpdate }) {
  const [formData, setFormData] = useState({
    causaRaiz: '',
    descripcionDetallada: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      toast.info('Guardando planificación...');
      
      // Actualizar la acción con los datos de planificación y cambiar estado
      await accionesService.updateAccion(accionId, {
        ...formData,
        estado: 'p2_programada', // Cambiar al siguiente estado
        observaciones: `Planificación completada: ${formData.causaRaiz} | ${formData.descripcionDetallada}`
      });
      
      toast.success('Planificación guardada con éxito.');
      onUpdate(); // Actualizar la vista del Kanban
      
    } catch (error) {
      console.error('Error al guardar planificación:', error);
      toast.error('Error al guardar la planificación. Inténtalo de nuevo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <Label htmlFor="causaRaiz">Análisis de Causa Raíz</Label>
        <Textarea id="causaRaiz" value={formData.causaRaiz} onChange={handleChange} placeholder="Describa el análisis de causa raíz..." required />
      </div>
      <div>
        <Label htmlFor="descripcionDetallada">Descripción Detallada de la Acción</Label>
        <Textarea id="descripcionDetallada" value={formData.descripcionDetallada} onChange={handleChange} placeholder="Detalle las tareas a realizar..." required />
      </div>
      <Button type="submit">Guardar Planificación</Button>
    </form>
  );
}
