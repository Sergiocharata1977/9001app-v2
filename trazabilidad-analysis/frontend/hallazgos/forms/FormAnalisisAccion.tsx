import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const FormAnalisisAccion = ({ hallazgo, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    fecha_analisis: new Date().toISOString().split('T')[0],
    comentarios_analisis: '',
    decision: '',
    grupo_trabajo: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDecision = (requiereAccion) => {
    const dataToSubmit = { 
      ...formData, 
      decision: requiereAccion ? 'requiere_accion' : 'no_requiere_accion' 
    };
    onSubmit(dataToSubmit);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de la Acción</CardTitle>
        <CardDescription>Evalúe la efectividad de la corrección y decida los próximos pasos.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="fecha_analisis">Fecha de Análisis</Label>
            <Input type="date" id="fecha_analisis" name="fecha_analisis" value={formData.fecha_analisis} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="grupo_trabajo">Grupo de Trabajo</Label>
            <Input id="grupo_trabajo" name="grupo_trabajo" value={formData.grupo_trabajo} onChange={handleChange} placeholder="Personas involucradas en el análisis" />
          </div>
          <div>
            <Label htmlFor="comentarios_analisis">Comentarios del Análisis</Label>
            <Textarea id="comentarios_analisis" name="comentarios_analisis" value={formData.comentarios_analisis} onChange={handleChange} required />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="button" variant="destructive" onClick={() => handleDecision(false)}>No Requiere Acción</Button>
            <Button type="button" onClick={() => handleDecision(true)}>Requiere Acción</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormAnalisisAccion;
