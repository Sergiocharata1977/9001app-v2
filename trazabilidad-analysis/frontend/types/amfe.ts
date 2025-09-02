export interface AMFERecord {
  id: string;
  year: number;
  process: string;
  function: string;
  failureMode: string;
  effects: string;
  causes: string;
  currentControls: string;
  severity: number;
  occurrence: number;
  detection: number;
  npr: number;
  recommendedActions: string;
  responsible: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
}