import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

// Este formulario se usaría al mover una tarjeta a "Verificación Ejecutada"
export default function EjecutarVerificacionForm({ accionId, onUpdate }) {
  const [formData, setFormData] = useState({
    resultado: 'eficaz', // 'eficaz' o 'ineficaz'
    observaciones: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.info('Guardando resultado de la verificación...');
    // Lógica para llamar a accionesService.updateAccion con el estado correspondiente
    // Si es ineficaz, se podría devolver a 'i3_programada'
    const nuevoEstado = formData.resultado === 'eficaz' ? 'c5_cerrado' : 'i3_programada';
    console.log('Guardando datos de ejecución de verificación:', { accionId, ...formData, nuevoEstado });
    setTimeout(() => {
      toast.success('Verificación guardada con éxito.');
      onUpdate();
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <Label>Resultado de la Verificación</Label>
        <RadioGroup
          defaultValue="eficaz"
          onValueChange={(value) => setFormData(prev => ({ ...prev, resultado: value }))}
          className="flex items-center space-x-4 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="eficaz" id="eficaz" />
            <Label htmlFor="eficaz">Eficaz</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ineficaz" id="ineficaz" />
            <Label htmlFor="ineficaz">Ineficaz</Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="observaciones">Observaciones de la Verificación</Label>
        <Textarea id="observaciones" value={formData.observaciones} onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))} placeholder="Añada comentarios..." required />
      </div>
      <Button type="submit">Finalizar Verificación</Button>
    </form>
  );
}
