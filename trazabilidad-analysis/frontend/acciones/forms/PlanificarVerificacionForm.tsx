import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Este formulario se usaría al mover una tarjeta a "Planificación Verificación"
export default function PlanificarVerificacionForm({ accionId, onUpdate }) {
  const [formData, setFormData] = useState({
    responsableVerificacion: '',
    fechaProgramadaVerificacion: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.info('Guardando planificación de la verificación...');
    // Lógica para llamar a accionesService.updateAccion(accionId, { ...formData, estado: 'c3_planificacion_de_la_verificacion' })
    console.log('Guardando datos de planificación de verificación:', { accionId, ...formData });
    setTimeout(() => {
      toast.success('Verificación planificada con éxito.');
      onUpdate();
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <Label htmlFor="responsableVerificacion">Responsable de la Verificación</Label>
        <Input id="responsableVerificacion" value={formData.responsableVerificacion} onChange={handleChange} placeholder="Nombre del responsable..." required />
      </div>
      <div>
        <Label htmlFor="fechaProgramadaVerificacion">Fecha Programada de Verificación</Label>
        <Input id="fechaProgramadaVerificacion" type="date" value={formData.fechaProgramadaVerificacion} onChange={handleChange} required />
      </div>
      <Button type="submit">Planificar Verificación</Button>
    </form>
  );
}
