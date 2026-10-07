import React, { useState } from 'react';
import { Project, Task, Brigade } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ProjectManagerProps {
  projects: Project[];
  brigades: Brigade[];
  onSaveProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onAddTask: (projectId: string, task: Task) => void;
  onDeleteTask: (projectId: string, taskId: string) => void;
  onUpdateTask: (projectId: string, task: Task) => void;
}

export default function ProjectManager({
  projects, brigades, onSaveProject, onDeleteProject, onAddTask, onDeleteTask, onUpdateTask
}: ProjectManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('active');
  
  // Task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskProjectId, setTaskProjectId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskStartDate, setTaskStartDate] = useState('');
  const [taskEndDate, setTaskEndDate] = useState('');
  const [taskBrigadeId, setTaskBrigadeId] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const resetForm = () => {
    setName('');
    setAddress('');
    setDescription('');
    setStatus('active');
    setEditingProject(null);
    setShowForm(false);
  };

  const resetTaskForm = () => {
    setTaskName('');
    setTaskStartDate('');
    setTaskEndDate('');
    setTaskBrigadeId('');
    setTaskNotes('');
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const handleSaveProject = () => {
    if (!name.trim()) return;
    
    if (editingProject) {
      onSaveProject({ ...editingProject, name, address, description, status });
    } else {
      const newProject: Project = {
        id: uuidv4(),
        name,
        address,
        description,
        tasks: [],
        createdAt: new Date().toISOString(),
        status
      };
      onSaveProject(newProject);
    }
    resetForm();
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setAddress(project.address);
    setDescription(project.description);
    setStatus(project.status);
    setShowForm(true);
  };

  const handleAddTask = (projectId: string) => {
    setTaskProjectId(projectId);
    setShowTaskForm(true);
  };

  const handleSaveTask = () => {
    if (!taskName.trim() || !taskStartDate || !taskEndDate) return;
    
    if (editingTask) {
      onUpdateTask(taskProjectId, { ...editingTask, name: taskName, startDate: taskStartDate, endDate: taskEndDate, brigadeId: taskBrigadeId, notes: taskNotes });
    } else {
      const project = projects.find(p => p.id === taskProjectId);
      const newTask: Task = {
        id: uuidv4(),
        name: taskName,
        startDate: taskStartDate,
        endDate: taskEndDate,
        brigadeId: taskBrigadeId,
        status: 'pending',
        notes: taskNotes,
        order: project ? project.tasks.length : 0
      };
      onAddTask(taskProjectId, newTask);
    }
    resetTaskForm();
  };

  const handleEditTask = (projectId: string, task: Task) => {
    setTaskProjectId(projectId);
    setEditingTask(task);
    setTaskName(task.name);
    setTaskStartDate(task.startDate);
    setTaskEndDate(task.endDate);
    setTaskBrigadeId(task.brigadeId);
    setTaskNotes(task.notes);
    setShowTaskForm(true);
  };

  const getBrigadeName = (brigadeId: string) => {
    const brigade = brigades.find(b => b.id === brigadeId);
    return brigade ? brigade.name : 'Не назначена';
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'active': return { text: 'Активный', class: 'bg-green-100 text-green-700' };
      case 'paused': return { text: 'Приостановлен', class: 'bg-yellow-100 text-yellow-700' };
      case 'completed': return { text: 'Завершён', class: 'bg-blue-100 text-blue-700' };
      default: return { text: s, class: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Объекты строительства</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Новый объект
        </button>
      </div>

      {/* Project Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">{editingProject ? 'Редактировать объект' : 'Новый объект строительства'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название объекта *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ЖК «Солнечный»"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="г. Москва, ул. Строителей, д. 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Описание объекта..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Project['status'])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Активный</option>
                  <option value="paused">Приостановлен</option>
                  <option value="completed">Завершён</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition">Отмена</button>
              <button onClick={handleSaveProject} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                {editingProject ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">{editingTask ? 'Редактировать этап' : 'Новый этап работ'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название этапа *</label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Устройство фундамента"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала *</label>
                  <input
                    type="date"
                    value={taskStartDate}
                    onChange={(e) => setTaskStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания *</label>
                  <input
                    type="date"
                    value={taskEndDate}
                    onChange={(e) => setTaskEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Бригада</label>
                <select
                  value={taskBrigadeId}
                  onChange={(e) => setTaskBrigadeId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Не назначена</option>
                  {brigades.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.foreman})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Заметки</label>
                <textarea
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Дополнительная информация..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={resetTaskForm} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition">Отмена</button>
              <button onClick={handleSaveTask} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                {editingTask ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map(project => {
          const isExpanded = expandedProject === project.id;
          const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
          const totalTasks = project.tasks.length;
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          const statusInfo = getStatusLabel(project.status);
          
          return (
            <div key={project.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div 
                className="p-5 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpandedProject(isExpanded ? null : project.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.class}`}>{statusInfo.text}</span>
                    </div>
                    {project.address && <p className="text-sm text-gray-500 mt-1">📍 {project.address}</p>}
                    {project.description && <p className="text-sm text-gray-400 mt-1">{project.description}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-600">{completedTasks}/{totalTasks} этапов</div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="border-t border-gray-100 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-700">Этапы работ</h4>
                    <button
                      onClick={() => handleAddTask(project.id)}
                      className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Добавить этап
                    </button>
                  </div>
                  
                  {project.tasks.length > 0 ? (
                    <div className="space-y-2">
                      {project.tasks.sort((a, b) => a.order - b.order).map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-2 h-2 rounded-full ${
                              task.status === 'completed' ? 'bg-green-500' :
                              task.status === 'in_progress' ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}></div>
                            <div>
                              <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                {task.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {format(parseISO(task.startDate), 'd MMM', { locale: ru })} — {format(parseISO(task.endDate), 'd MMM', { locale: ru })}
                                {task.brigadeId && ` • ${getBrigadeName(task.brigadeId)}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditTask(project.id, task)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 transition"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDeleteTask(project.id, task.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">Нет этапов. Добавьте первый этап работ.</p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => onDeleteProject(project.id)}
                      className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                    >
                      Удалить объект
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {projects.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <p className="text-gray-500 text-lg mb-2">Пока нет объектов строительства</p>
            <p className="text-gray-400 text-sm">Нажмите «Новый объект» чтобы добавить первый</p>
          </div>
        )}
      </div>
    </div>
  );
}
