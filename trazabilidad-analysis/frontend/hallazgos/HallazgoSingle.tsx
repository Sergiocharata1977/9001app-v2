import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import hallazgosService from '@/services/hallazgosService';
import accionesService from '@/services/accionesService';
import { ArrowLeft, Users, FileText, BookOpen, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccionKanbanBoard } from '@/components/acciones/AccionKanbanBoard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import HallazgoWorkflowManager from './HallazgoWorkflowManager';
import HallazgoParticipantes from './HallazgoParticipantes';
import HallazgoDocumentos from './HallazgoDocumentos';
import HallazgoNormas from './HallazgoNormas';
import { hallazgoWorkflow } from '@/config/hallazgoWorkflow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const HallazgoSingle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hallazgo, setHallazgo] = useState(null);
  const [acciones, setAcciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('proceso');
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isNewActionModalOpen, setIsNewActionModalOpen] = useState(false);
  const [newAction, setNewAction] = useState({ titulo: '', descripcion: '' });

  const fetchHallazgoData = useCallback(async () => {
    setLoading(true);
    try {
      const [hallazgoData, accionesData] = await Promise.all([
        hallazgosService.getHallazgoById(id),
        accionesService.getAllAcciones(id),
      ]);
      setHallazgo(hallazgoData);
      setAcciones(accionesData);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'No se pudo cargar el detalle del hallazgo.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHallazgoData();
  }, [fetchHallazgoData]);

  const handleUpdateHallazgo = async (formData, nextState) => {
    try {
      const dataToUpdate = { ...formData, estado: nextState };
      await hallazgosService.updateHallazgo(id, dataToUpdate);
      toast.success('Hallazgo actualizado correctamente.');
      setIsWorkflowModalOpen(false);
      fetchHallazgoData(); // Recargar datos para reflejar el nuevo estado
    } catch (error) {
      toast.error('No se pudo actualizar el hallazgo.');
      console.error('Error updating hallazgo:', error);
    }
  };

  const handleCreateAccion = async (e) => {
    e.preventDefault();
    try {
      await accionesService.createAccion({ ...newAction, hallazgo_id: id });
      toast.success('Acción creada correctamente.');
      setIsNewActionModalOpen(false);
      setNewAction({ titulo: '', descripcion: '' });
      fetchHallazgoData(); // Recargar datos para mostrar la nueva acción
    } catch (error) {
      toast.error('No se pudo crear la acción.');
      console.error('Error creating accion:', error);
    }
  };

  const handleCancel = () => {
    console.log('Operación cancelada.');
    // Podrías navegar a otra pestaña si es necesario
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  if (!hallazgo) {
    return <div className="text-center p-4">No se encontró el hallazgo.</div>;
  }

  const currentStateConfig = hallazgo && hallazgoWorkflow[hallazgo.estado];

  const handleActionClick = () => {
    setIsWorkflowModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Link to="/hallazgos" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Hallazgos
      </Link>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{hallazgo.titulo}</h1>
            <p className="text-sm text-gray-500 mt-1">ID: {hallazgo.numeroHallazgo}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge>{hallazgo.estado}</Badge>
          </div>
        </div>
        <p className="text-gray-600 mt-4">{hallazgo.descripcion}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="proceso" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="proceso" className="flex items-center">
            <Activity className="h-4 w-4 mr-1" />
            Proceso
          </TabsTrigger>
          <TabsTrigger value="detalles" className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            Detalles
          </TabsTrigger>
          <TabsTrigger value="participantes" className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Participantes
          </TabsTrigger>
          <TabsTrigger value="documentos" className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="normas" className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            Normas
          </TabsTrigger>
          <TabsTrigger value="acciones" className="flex items-center">
            <Activity className="h-4 w-4 mr-1" />
            Acciones
          </TabsTrigger>
        </TabsList>

        {hallazgo && (
          <Dialog open={isWorkflowModalOpen} onOpenChange={setIsWorkflowModalOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Flujo de Trabajo: {hallazgo.numeroHallazgo}</DialogTitle>
                <p className="text-sm text-muted-foreground">{hallazgo.titulo}</p>
              </DialogHeader>
              <HallazgoWorkflowManager
                hallazgo={hallazgo}
                onUpdate={handleUpdateHallazgo}
                onCancel={() => setIsWorkflowModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        <TabsContent value="proceso" className="mt-4">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 text-center">
            <h3 className="text-lg font-semibold mb-2">Siguiente Paso: {currentStateConfig?.label || 'Revisar'}</h3>
            <p className="text-sm text-muted-foreground mb-4">El hallazgo se encuentra en estado '{hallazgo.estado}'.</p>
            {currentStateConfig?.Component ? (
              <Button onClick={handleActionClick}>Realizar Acción: {currentStateConfig.label}</Button>
            ) : (
              <p className="text-green-600 font-semibold">Este proceso ha finalizado. No hay más acciones requeridas.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="detalles" className="mt-4">
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Detalles del Hallazgo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <p><span className="font-semibold">Origen:</span> {hallazgo.origen}</p>
                    <p><span className="font-semibold">Proceso:</span> {hallazgo.proceso?.nombre || 'N/A'}</p>
                    <p><span className="font-semibold">Categoría:</span> {hallazgo.categoria}</p>
                    <p><span className="font-semibold">Requisito Incumplido:</span> {hallazgo.requisitoIncumplido || 'N/A'}</p>
                    <p><span className="font-semibold">Fecha de Detección:</span> {new Date(hallazgo.fecha_deteccion).toLocaleDateString()}</p>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="participantes" className="mt-4">
          <HallazgoParticipantes 
            hallazgoId={id} 
            organizationId={hallazgo?.organization_id || 1}
          />
        </TabsContent>

        <TabsContent value="documentos" className="mt-4">
          <HallazgoDocumentos 
            hallazgoId={id} 
            organizationId={hallazgo?.organization_id || 1}
          />
        </TabsContent>

        <TabsContent value="normas" className="mt-4">
          <HallazgoNormas 
            hallazgoId={id} 
            organizationId={hallazgo?.organization_id || 1}
          />
        </TabsContent>

        <TabsContent value="acciones" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Plan de Acciones Correctivas</h3>
            <Button onClick={() => setIsNewActionModalOpen(true)}>Nueva Acción</Button>
          </div>
          <AccionKanbanBoard
            acciones={acciones}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isNewActionModalOpen} onOpenChange={setIsNewActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Acción Correctiva</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAccion} className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título de la Acción</Label>
              <Input
                id="titulo"
                value={newAction.titulo}
                onChange={(e) => setNewAction({ ...newAction, titulo: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={newAction.descripcion}
                onChange={(e) => setNewAction({ ...newAction, descripcion: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsNewActionModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear Acción</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HallazgoSingle; 