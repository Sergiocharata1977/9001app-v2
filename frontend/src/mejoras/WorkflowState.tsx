import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowStateProps {
  label: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
}

const WorkflowState: React.FC<WorkflowStateProps> = ({ 
  label, 
  description, 
  isActive, 
  isCompleted 
}) => {
  return (
    <div className="flex items-start space-x-4 py-2">
      <div className="flex flex-col items-center mt-1">
        {
          isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <div className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
              isActive ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white',
            )}>
              {isActive && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          )
        }
      </div>
      <div>
        <p className={cn(
          'font-semibold',
          isActive ? 'text-blue-600' : 'text-gray-800',
          isCompleted && 'text-gray-500 line-through'
        )}>
          {label}
        </p>
        <p className="text-sm text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
};

export default WorkflowState;