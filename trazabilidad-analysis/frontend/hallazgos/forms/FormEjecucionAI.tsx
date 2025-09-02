import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const FormEjecucionAI = ({ hallazgo, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    fecha_ejecucion: hallazgo?.fecha_ejecucion || new Date().toISOString().split('T')[0],
    responsable_ejecucion: hallazgo?.responsable_ejecucion || '',
    comentarios_ejecucion: hallazgo?.comentarios_ejecucion || '',
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
        <CardTitle>Ejecución de Acción Inmediata</CardTitle>
        <CardDescription>Registre los detalles de la corrección realizada.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fecha_ejecucion">Fecha de Ejecución</Label>
            <Input type="date" id="fecha_ejecucion" name="fecha_ejecucion" value={formData.fecha_ejecucion} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="responsable_ejecucion">Realizado por (Usuario)</Label>
            <Input id="responsable_ejecucion" name="responsable_ejecucion" value={formData.responsable_ejecucion} onChange={handleChange} required placeholder="Nombre del responsable de la ejecución" />
          </div>
          <div>
            <Label htmlFor="comentarios_ejecucion">Comentarios de las acciones</Label>
            <Textarea id="comentarios_ejecucion" name="comentarios_ejecucion" value={formData.comentarios_ejecucion} onChange={handleChange} required />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Registrar Ejecución</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormEjecucionAI;
