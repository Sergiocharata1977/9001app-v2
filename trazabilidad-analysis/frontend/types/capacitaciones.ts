export interface Capacitacion {
  id: number;
  nombre: string;
  titulo?: string;
  descripcion?: string;
  instructor?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  duracion_horas?: number;
  modalidad?: string;
  estado?: string;
  ubicacion?: string;
  costo?: number;
  cupo_maximo?: number;
  cupo_actual?: number;
  requisitos?: string;
  objetivos?: string;
  contenido?: string;
  metodologia?: string;
  evaluacion?: string;
  certificacion?: boolean;
  created_at?: string;
  updated_at?: string;
  tipo?: string;
  hora_inicio?: string;
  hora_fin?: string;
  participantes?: any[];
  temas?: Array<{ id?: number; titulo: string; descripcion: string }>;
}

export interface CapacitacionFormData {
  nombre: string;
  descripcion: string;
  instructor: string;
  fecha_inicio: string;
  fecha_fin: string;
  duracion_horas: number;
  modalidad: string;
  estado: string;
  ubicacion: string;
  costo: number;
  cupo_maximo: number;
  requisitos: string;
  objetivos: string;
  contenido: string;
  metodologia: string;
  evaluacion: string;
  certificacion: boolean;
}

export interface CreateCapacitacionData {
  nombre: string;
  descripcion: string;
  instructor: string;
  fecha_inicio: string;
  fecha_fin: string;
  duracion_horas: number;
  modalidad: string;
  estado: string;
  ubicacion: string;
  costo: number;
  cupo_maximo: number;
  requisitos: string;
  objetivos: string;
  contenido: string;
  metodologia: string;
  evaluacion: string;
  certificacion: boolean;
  tipo?: string;
  hora_inicio?: string;
  hora_fin?: string;
}

export interface UpdateCapacitacionData {
  nombre?: string;
  descripcion?: string;
  instructor?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  duracion_horas?: number;
  modalidad?: string;
  estado?: string;
  ubicacion?: string;
  costo?: number;
  cupo_maximo?: number;
  requisitos?: string;
  objetivos?: string;
  contenido?: string;
  metodologia?: string;
  evaluacion?: string;
  certificacion?: boolean;
  tipo?: string;
  hora_inicio?: string;
  hora_fin?: string;
}

export interface CapacitacionStats {
  total: number;
  planificadas: number;
  enPreparacion: number;
  completadas: number;
}

export interface CapacitacionFilters {
  search?: string;
  estado?: string;
  tipo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  instructor?: string;
  departamento?: string;
  modalidad?: string;
  proceso_sgc?: number;
  norma?: number;
  activo?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type ViewMode = 'grid' | 'list';

export interface CapacitacionField {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

export interface CapacitacionService {
  getAll: () => Promise<Capacitacion[]>;
  getById: (id: number) => Promise<Capacitacion>;
  create: (data: CapacitacionFormData) => Promise<Capacitacion>;
  update: (id: number, data: Partial<CapacitacionFormData>) => Promise<Capacitacion>;
  delete: (id: number) => Promise<void>;
  getAsistentes: (id: number) => Promise<any[]>;
  getTemas: (id: number) => Promise<any[]>;
  getEvaluaciones: (id: number) => Promise<any[]>;
  addAsistente: (id: number, empleadoId: number) => Promise<any>;
  removeAsistente: (id: number, asistenteId: string) => Promise<void>;
  addEvaluacion: (id: number, data: any) => Promise<any>;
  updateEvaluacion: (id: number, evalId: string, data: any) => Promise<any>;
  deleteEvaluacion: (id: number, evalId: string) => Promise<void>;
}

// Tipos para asistentes
export interface Asistente {
  id: string;
  empleado_id: number;
  nombres: string;
  apellidos: string;
  email: string;
  capacitacion_id: number;
  organization_id: number;
  asistencia: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos para temas
export interface Tema {
  id: string;
  capacitacion_id: number;
  organization_id: number;
  titulo: string;
  descripcion: string;
  orden: number;
  created_at: string;
  updated_at: string;
}

// Tipos para evaluaciones
export interface Evaluacion {
  id: string;
  capacitacion_id: number;
  empleado_id: number;
  tema_id: string;
  calificacion: number;
  comentarios: string;
  fecha_evaluacion: string;
  organization_id: number;
  created_at: string;
  updated_at: string;
}
