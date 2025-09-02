import React from 'react';
import { accionWorkflow, ACCION_ESTADOS } from '@/config/accionWorkflow';

const AccionWorkflowManager = ({ accion, onUpdate, isLoading }) => {
  const currentState = accion?.estado;

  if (!currentState || currentState === ACCION_ESTADOS.CERRADA) {
    return (
      <div className="p-4 text-center bg-gray-100 rounded-lg">
        <h3 className="font-semibold text-lg">Acción Cerrada</h3>
        <p className="text-gray-600">Esta acción ha sido completada y cerrada. No hay más pasos a seguir.</p>
      </div>
    );
  }

  const workflowStep = accionWorkflow[currentState];

  if (!workflowStep || !workflowStep.component) {
    return <div className="p-4 text-center">Estado de la acción no válido o sin componente asociado.</div>;
  }

  const FormComponent = workflowStep.component;

  const handleSubmit = async (formData) => {
    const dataToUpdate = {
      ...formData,
      estado: workflowStep.nextState,
    };
    onUpdate(dataToUpdate);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{workflowStep.title}</h2>
      <FormComponent
        accion={accion}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AccionWorkflowManager;
