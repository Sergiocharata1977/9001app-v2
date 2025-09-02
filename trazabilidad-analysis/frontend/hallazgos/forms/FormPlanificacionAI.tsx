import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const FormPlanificacionAI = ({ hallazgo, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    descripcion_plan_accion: hallazgo?.descripcion_plan_accion || '',
    fecha_compromiso_plan_accion: hallazgo?.fecha_compromiso_plan_accion || '',
    responsable_plan_accion: hallazgo?.responsable_plan_accion || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planificación de Acción Inmediata</CardTitle>
        <CardDescription>Defina la corrección inicial para este hallazgo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="descripcion_plan_accion">Acción Inmediata (Corrección)</Label>
            <Textarea id="descripcion_plan_accion" name="descripcion_plan_accion" value={formData.descripcion_plan_accion} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="fecha_compromiso_plan_accion">Fecha de Compromiso</Label>
            <Input type="date" id="fecha_compromiso_plan_accion" name="fecha_compromiso_plan_accion" value={formData.fecha_compromiso_plan_accion} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="responsable_plan_accion">Responsable del Tratamiento</Label>
            <Input id="responsable_plan_accion" name="responsable_plan_accion" value={formData.responsable_plan_accion} onChange={handleChange} required />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Guardar Planificación</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormPlanificacionAI;
