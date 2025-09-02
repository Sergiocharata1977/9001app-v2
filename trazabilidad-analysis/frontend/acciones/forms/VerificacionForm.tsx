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
import { Accion } from '@/types/acciones';

interface VerificacionFormProps {
  accion: Accion;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const VerificacionForm: React.FC<VerificacionFormProps> = ({
  accion,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    descripcion_verificacion: accion.descripcion_verificacion || '',
    responsable_verificacion: accion.responsable_verificacion || '',
    fecha_plan_verificacion: accion.fecha_plan_verificacion || new Date().toISOString().split('T')[0],
    comentarios_verificacion: accion.comentarios_verificacion || '',
    fecha_verificacion_finalizada: new Date().toISOString().split('T')[0],
    resultado_verificacion: 'satisfactorio',
    eficacia: 'Efectiva'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descripcion_verificacion.trim()) {
      toast.error('La descripción de la verificación es obligatoria');
      return;
    }

    if (!formData.responsable_verificacion.trim()) {
      toast.error('El responsable de verificación es obligatorio');
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
        <Label htmlFor="descripcion_verificacion">Descripción de la Verificación *</Label>
        <Textarea
          id="descripcion_verificacion"
          value={formData.descripcion_verificacion}
          onChange={(e) => handleChange('descripcion_verificacion', e.target.value)}
          placeholder="Describe el proceso de verificación realizado"
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="responsable_verificacion">Responsable de Verificación *</Label>
        <Input
          id="responsable_verificacion"
          value={formData.responsable_verificacion}
          onChange={(e) => handleChange('responsable_verificacion', e.target.value)}
          placeholder="Nombre del responsable de verificación"
          required
        />
      </div>

      <div>
        <Label htmlFor="fecha_plan_verificacion">Fecha Planificada de Verificación</Label>
        <Input
          id="fecha_plan_verificacion"
          type="date"
          value={formData.fecha_plan_verificacion}
          onChange={(e) => handleChange('fecha_plan_verificacion', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="fecha_verificacion_finalizada">Fecha de Verificación Finalizada</Label>
        <Input
          id="fecha_verificacion_finalizada"
          type="date"
          value={formData.fecha_verificacion_finalizada}
          onChange={(e) => handleChange('fecha_verificacion_finalizada', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="resultado_verificacion">Resultado de la Verificación</Label>
        <Select
          value={formData.resultado_verificacion}
          onValueChange={(value) => handleChange('resultado_verificacion', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar resultado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="satisfactorio">Satisfactorio</SelectItem>
            <SelectItem value="insatisfactorio">Insatisfactorio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="eficacia">Eficacia de la Acción</Label>
        <Select
          value={formData.eficacia}
          onValueChange={(value) => handleChange('eficacia', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar eficacia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Efectiva">Efectiva</SelectItem>
            <SelectItem value="Parcialmente Efectiva">Parcialmente Efectiva</SelectItem>
            <SelectItem value="No Efectiva">No Efectiva</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="comentarios_verificacion">Comentarios de Verificación</Label>
        <Textarea
          id="comentarios_verificacion"
          value={formData.comentarios_verificacion}
          onChange={(e) => handleChange('comentarios_verificacion', e.target.value)}
          placeholder="Comentarios adicionales sobre la verificación"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Verificación'}
        </Button>
      </div>
    </form>
  );
};

export default VerificacionForm;
