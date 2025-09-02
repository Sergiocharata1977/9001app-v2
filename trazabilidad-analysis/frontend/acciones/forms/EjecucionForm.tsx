import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { Accion } from '@/types/acciones';

interface EjecucionFormProps {
  accion: Accion;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const EjecucionForm: React.FC<EjecucionFormProps> = ({
  accion,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    comentarios_ejecucion: accion.comentarios_ejecucion || '',
    fecha_ejecucion: accion.fecha_ejecucion || new Date().toISOString().split('T')[0],
    evidencia_accion: '',
    observaciones: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.comentarios_ejecucion.trim()) {
      toast.error('Los comentarios de ejecución son obligatorios');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="comentarios_ejecucion">Comentarios de Ejecución *</Label>
        <Textarea
          id="comentarios_ejecucion"
          value={formData.comentarios_ejecucion}
          onChange={(e) => handleChange('comentarios_ejecucion', e.target.value)}
          placeholder="Describe cómo se ejecutó la acción y los resultados obtenidos"
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="fecha_ejecucion">Fecha de Ejecución</Label>
        <Input
          id="fecha_ejecucion"
          type="date"
          value={formData.fecha_ejecucion}
          onChange={(e) => handleChange('fecha_ejecucion', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="evidencia_accion">Evidencias de Ejecución</Label>
        <Textarea
          id="evidencia_accion"
          value={formData.evidencia_accion}
          onChange={(e) => handleChange('evidencia_accion', e.target.value)}
          placeholder="Describe las evidencias que respaldan la ejecución de la acción"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="observaciones">Observaciones Adicionales</Label>
        <Textarea
          id="observaciones"
          value={formData.observaciones}
          onChange={(e) => handleChange('observaciones', e.target.value)}
          placeholder="Observaciones adicionales sobre la ejecución"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Ejecución'}
        </Button>
      </div>
    </form>
  );
};

export default EjecucionForm;
