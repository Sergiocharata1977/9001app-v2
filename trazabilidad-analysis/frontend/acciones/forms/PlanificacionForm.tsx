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
import { Accion, ACCION_PRIORIDADES } from '@/types/acciones';

interface PlanificacionFormProps {
  accion: Accion;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const PlanificacionForm: React.FC<PlanificacionFormProps> = ({
  accion,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    descripcion_accion: accion.descripcion || '',
    responsable_accion: accion.responsable || '',
    fecha_plan_accion: accion.fechaVencimiento || '',
    prioridad: accion.prioridad || ACCION_PRIORIDADES.MEDIA,
    comentarios_ejecucion: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descripcion_accion.trim()) {
      toast.error('La descripción de la acción es obligatoria');
      return;
    }

    if (!formData.responsable_accion.trim()) {
      toast.error('El responsable es obligatorio');
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
        <Label htmlFor="descripcion_accion">Descripción de la Acción *</Label>
        <Textarea
          id="descripcion_accion"
          value={formData.descripcion_accion}
          onChange={(e) => handleChange('descripcion_accion', e.target.value)}
          placeholder="Describe detalladamente la acción a realizar"
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="responsable_accion">Responsable *</Label>
        <Input
          id="responsable_accion"
          value={formData.responsable_accion}
          onChange={(e) => handleChange('responsable_accion', e.target.value)}
          placeholder="Nombre del responsable"
          required
        />
      </div>

      <div>
        <Label htmlFor="fecha_plan_accion">Fecha de Vencimiento</Label>
        <Input
          id="fecha_plan_accion"
          type="date"
          value={formData.fecha_plan_accion}
          onChange={(e) => handleChange('fecha_plan_accion', e.target.value)}
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
            <SelectItem value={ACCION_PRIORIDADES.BAJA}>Baja</SelectItem>
            <SelectItem value={ACCION_PRIORIDADES.MEDIA}>Media</SelectItem>
            <SelectItem value={ACCION_PRIORIDADES.ALTA}>Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="comentarios_ejecucion">Comentarios Adicionales</Label>
        <Textarea
          id="comentarios_ejecucion"
          value={formData.comentarios_ejecucion}
          onChange={(e) => handleChange('comentarios_ejecucion', e.target.value)}
          placeholder="Comentarios adicionales sobre la planificación"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Planificación'}
        </Button>
      </div>
    </form>
  );
};

export default PlanificacionForm;
