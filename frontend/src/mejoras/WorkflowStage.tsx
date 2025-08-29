import React from 'react';
import WorkflowState from './WorkflowState';

interface WorkflowConfig {
  emoji: string;
  title: string;
  subtitle: string;
  bgColor: string;
  borderColor: string;
  titleColor: string;
}

interface WorkflowStateItem {
  id: string;
  label: string;
  description: string;
}

interface WorkflowStageProps {
  config: WorkflowConfig | null;
  states: WorkflowStateItem[];
  currentState: string;
}

const WorkflowStage: React.FC<WorkflowStageProps> = ({ 
  config, 
  states, 
  currentState 
}) => {
  if (!config) {
    return null; // No renderizar nada si no hay configuración para esta etapa
  }
  
  const { emoji, title, subtitle, bgColor, borderColor, titleColor } = config;

  return (
    <div className={`p-5 rounded-lg ${bgColor} border-l-4 ${borderColor} mb-6`}>
      <div className="mb-4">
        <h3 className={`text-xl font-bold ${titleColor} flex items-center`}>
          <span className="mr-2">{emoji}</span>
          {title}
        </h3>
        <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
      </div>
      
      <div>
        {states.map((state) => (
          <WorkflowState
            key={state.id}
            label={state.label}
            description={state.description}
            isActive={state.id === currentState}
            isCompleted={states.findIndex(s => s.id === currentState) > states.findIndex(s => s.id === state.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkflowStage;