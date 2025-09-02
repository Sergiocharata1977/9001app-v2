import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import accionesService from '@/services/accionesService';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccionWorkflowManager from './AccionWorkflowManager';

const AccionSingle = () => {
  const { id } = useParams();
  const [accion, setAccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchAccion = useCallback(async () => {
    if (!loading) setLoading(true);
    try {
      const data = await accionesService.getAccionById(id);
      setAccion(data);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'No se pudo cargar la acción.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAccion();
  }, [fetchAccion]);

  const handleUpdate = async (formData) => {
    setIsUpdating(true);
    try {
      await accionesService.updateAccion(id, formData);
      toast.success('Acción actualizada con éxito!');
      fetchAccion(); // Recargar los datos para reflejar el cambio de estado
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar la acción.';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && !accion) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  if (!accion) {
    return <div className="text-center p-4">No se encontró la acción.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Link to="/acciones" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Acciones
      </Link>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{accion.titulo}</h1>
            <p className="text-sm text-gray-500 mt-1">ID: {accion.numeroAccion}</p>
          </div>
          <Badge>{accion.estado}</Badge>
        </div>
        <p className="text-gray-600 mt-4">{accion.descripcion}</p>
      </div>

      <Tabs defaultValue="detalles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="detalles">Detalles</TabsTrigger>
          <TabsTrigger value="workflow">Flujo de Trabajo</TabsTrigger>
        </TabsList>
        <TabsContent value="detalles">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 mt-4">
            <h3 className="text-lg font-semibold mb-4">Detalles de la Acción</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p><span className="font-semibold">Responsable:</span> {accion.responsable_ejecucion || 'N/A'}</p>
                <p><span className="font-semibold">Fecha Límite:</span> {accion.fecha_limite ? new Date(accion.fecha_limite).toLocaleDateString() : 'N/A'}</p>
                <p><span className="font-semibold">Eficacia:</span> {accion.eficacia || 'Pendiente'}</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="workflow">
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 mt-4">
                <AccionWorkflowManager 
                    accion={accion} 
                    onUpdate={handleUpdate} 
                    isLoading={isUpdating}
                />
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccionSingle; 