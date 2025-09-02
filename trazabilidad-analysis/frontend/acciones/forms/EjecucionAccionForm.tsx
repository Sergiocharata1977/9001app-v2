import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import accionesService from '@/services/accionesService';

// Este formulario se usaría al mover una tarjeta a "Implementación Finalizada"
export default function EjecucionAccionForm({ accionId, onUpdate }) {
  const [formData, setFormData] = useState({
    resultados: '',
    evidencia: '', // Podría ser un campo de texto o un uploader de archivos en el futuro
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      toast.info('Guardando ejecución...');
      
      // Actualizar la acción con los datos de ejecución y cambiar estado
      await accionesService.updateAccion(accionId, {
        evidencia_accion: formData.evidencia,
        fecha_ejecucion_accion: new Date().toISOString().split('T')[0], // Fecha actual
        estado: 'e1_ejecucion_finalizada', // Cambiar al siguiente estado
        observaciones: `Ejecución completada: ${formData.resultados}`
      });
      
      toast.success('Ejecución guardada con éxito.');
      onUpdate(); // Actualizar la vista del Kanban
      
    } catch (error) {
      console.error('Error al guardar ejecución:', error);
      toast.error('Error al guardar la ejecución. Inténtalo de nuevo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <Label htmlFor="resultados">Resultados de la Acción</Label>
        <Textarea id="resultados" value={formData.resultados} onChange={handleChange} placeholder="Describa los resultados obtenidos..." required />
      </div>
      <div>
        <Label htmlFor="evidencia">Evidencia de Implementación</Label>
        <Input id="evidencia" value={formData.evidencia} onChange={handleChange} placeholder="Link o descripción de la evidencia..." required />
      </div>
      <Button type="submit">Finalizar Implementación</Button>
    </form>
  );
}
