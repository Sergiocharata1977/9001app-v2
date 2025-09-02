import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const AccionFormModal = ({ isOpen, onClose, onSave, accion }) => {
  const [formData, setFormData] = useState({});
  const isEditing = !!accion;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        descripcion_accion: accion.descripcion_accion || '',
        responsable_accion: accion.responsable_accion || '',
        fecha_plan_accion: accion.fecha_plan_accion ? new Date(accion.fecha_plan_accion).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        descripcion_accion: '',
        responsable_accion: '',
        fecha_plan_accion: '',
      });
    }
  }, [accion, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, accion?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Acción' : 'Crear Nueva Acción'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifique los detalles de la acción.' : 'Complete el formulario para registrar una nueva acción de mejora.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="descripcion_accion">Descripción de la Acción</Label>
            <Textarea id="descripcion_accion" name="descripcion_accion" value={formData.descripcion_accion || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="responsable_accion">Responsable</Label>
            <Input id="responsable_accion" name="responsable_accion" value={formData.responsable_accion || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="fecha_plan_accion">Fecha Planificada</Label>
            <Input id="fecha_plan_accion" name="fecha_plan_accion" type="date" value={formData.fecha_plan_accion || ''} onChange={handleChange} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccionFormModal;
