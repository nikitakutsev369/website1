export interface Brigade {
  id: string;
  name: string;
  foreman: string;
  phone: string;
  specialization: string;
}

export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  brigadeId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  notes: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  address: string;
  description: string;
  tasks: Task[];
  createdAt: string;
  status: 'active' | 'paused' | 'completed';
}

export interface Notification {
  id: string;
  projectId: string;
  projectName: string;
  taskId: string;
  taskName: string;
  message: string;
  type: 'reminder' | 'overdue' | 'completed' | 'info';
  read: boolean;
  createdAt: string;
}

export type ViewMode = 'dashboard' | 'gantt' | 'projects' | 'brigades' | 'notifications';
