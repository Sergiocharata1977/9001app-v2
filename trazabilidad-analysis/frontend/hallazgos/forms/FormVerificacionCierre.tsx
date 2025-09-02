import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FormVerificacionCierre = ({ hallazgo, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    comentarios_verificacion: '',
    eficacia_verificacion: '', // 'eficaz' o 'no_eficaz'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, eficacia_verificacion: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.eficacia_verificacion) {
      // Idealmente, manejar esto con un toast o una validación más elegante
      alert('Por favor, seleccione la eficacia de la verificación.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificación y Cierre del Hallazgo</CardTitle>
        <CardDescription>Confirme la eficacia de las acciones implementadas y cierre el hallazgo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="eficacia_verificacion">Eficacia de la Verificación</Label>
            <Select onValueChange={handleSelectChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el resultado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eficaz">Eficaz</SelectItem>
                <SelectItem value="no_eficaz">No Eficaz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="comentarios_verificacion">Comentarios de la Verificación</Label>
            <Textarea id="comentarios_verificacion" name="comentarios_verificacion" value={formData.comentarios_verificacion} onChange={handleChange} required />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={!formData.eficacia_verificacion}>Cerrar Hallazgo</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormVerificacionCierre;
