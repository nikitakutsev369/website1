import React, { useState, useEffect, useCallback } from 'react';
import { Project, Brigade, Notification, Task, ViewMode } from './types';
import { getProjects, saveProjects, getBrigades, saveBrigades, getNotifications, saveNotifications } from './utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { parseISO, differenceInDays, isBefore, addDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Dashboard from './components/Dashboard';
import GanttChart from './components/GanttChart';
import ProjectManager from './components/ProjectManager';
import BrigadeManager from './components/BrigadeManager';
import Notifications from './components/Notifications';

function App() {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    setProjects(getProjects());
    setBrigades(getBrigades());
    setNotifications(getNotifications());
  }, []);

  // Save data to localStorage
  useEffect(() => { saveProjects(projects); }, [projects]);
  useEffect(() => { saveBrigades(brigades); }, [brigades]);
  useEffect(() => { saveNotifications(notifications); }, [notifications]);

  // Check for overdue tasks and generate notifications
  useEffect(() => {
    const checkDeadlines = () => {
      const newNotifications: Notification[] = [];
      
      projects.forEach(project => {
        project.tasks.forEach(task => {
          if (task.status === 'completed') return;
          
          const endDate = parseISO(task.endDate);
          const startDate = parseISO(task.startDate);
          const today = new Date();
          const daysUntilEnd = differenceInDays(endDate, today);
          const daysUntilStart = differenceInDays(startDate, today);
          
          // Check if task is overdue
          if (isBefore(endDate, today) && task.status !== 'overdue') {
            const existingOverdue = notifications.find(n => 
              n.taskId === task.id && n.type === 'overdue' && !n.read
            );
            if (!existingOverdue) {
              newNotifications.push({
                id: uuidv4(),
                projectId: project.id,
                projectName: project.name,
                taskId: task.id,
                taskName: task.name,
                message: `⚠️ Этап «${task.name}» просрочен! Срок был ${format(endDate, 'd MMMM', { locale: ru })}`,
                type: 'overdue',
                read: false,
                createdAt: new Date().toISOString()
              });
            }
          }
          
          // Reminder 3 days before start
          if (daysUntilStart === 3 && daysUntilStart > 0) {
            const existingReminder = notifications.find(n => 
              n.taskId === task.id && n.type === 'reminder' && n.message.includes('начнётся через 3 дня')
            );
            if (!existingReminder) {
              newNotifications.push({
                id: uuidv4(),
                projectId: project.id,
                projectName: project.name,
                taskId: task.id,
                taskName: task.name,
                message: `📅 Этап «${task.name}» начнётся через 3 дня (${format(startDate, 'd MMMM', { locale: ru })})`,
                type: 'reminder',
                read: false,
                createdAt: new Date().toISOString()
              });
            }
          }
          
          // Reminder 1 day before end
          if (daysUntilEnd === 1 && daysUntilEnd > 0) {
            const existingReminder = notifications.find(n => 
              n.taskId === task.id && n.type === 'reminder' && n.message.includes('заканчивается завтра')
            );
            if (!existingReminder) {
              newNotifications.push({
                id: uuidv4(),
                projectId: project.id,
                projectName: project.name,
                taskId: task.id,
                taskName: task.name,
                message: `⏰ Этап «${task.name}» заканчивается завтра (${format(endDate, 'd MMMM', { locale: ru })})`,
                type: 'reminder',
                read: false,
                createdAt: new Date().toISOString()
              });
            }
          }
        });
      });
      
      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
      }
    };
    
    checkDeadlines();
  }, [projects]);

  // Project handlers
  const handleSaveProject = useCallback((project: Project) => {
    setProjects(prev => {
      const existing = prev.find(p => p.id === project.id);
      if (existing) {
        return prev.map(p => p.id === project.id ? project : p);
      }
      return [...prev, project];
    });
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот объект?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  }, []);

  const handleAddTask = useCallback((projectId: string, task: Task) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, tasks: [...p.tasks, task] } : p
    ));
  }, []);

  const handleDeleteTask = useCallback((projectId: string, taskId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p
    ));
  }, []);

  const handleUpdateTask = useCallback((projectId: string, updatedTask: Task) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, tasks: p.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) } : p
    ));
  }, []);

  const handleToggleTask = useCallback((projectId: string, taskId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        tasks: p.tasks.map(t => {
          if (t.id !== taskId) return t;
          const newStatus = t.status === 'completed' ? 'pending' : 'completed';
          
          // Add completion notification
          if (newStatus === 'completed') {
            const notif: Notification = {
              id: uuidv4(),
              projectId: p.id,
              projectName: p.name,
              taskId: t.id,
              taskName: t.name,
              message: `✅ Этап «${t.name}» отмечен как выполненный`,
              type: 'completed',
              read: false,
              createdAt: new Date().toISOString()
            };
            setNotifications(prev => [notif, ...prev]);
          }
          
          return { ...t, status: newStatus };
        })
      };
    }));
  }, []);

  const handleUpdateTaskStatus = useCallback((projectId: string, taskId: string, status: Task['status']) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, status } : t) } : p
    ));
  }, []);

  // Brigade handlers
  const handleSaveBrigade = useCallback((brigade: Brigade) => {
    setBrigades(prev => {
      const existing = prev.find(b => b.id === brigade.id);
      if (existing) {
        return prev.map(b => b.id === brigade.id ? brigade : b);
      }
      return [...prev, brigade];
    });
  }, []);

  const handleDeleteBrigade = useCallback((id: string) => {
    if (confirm('Удалить бригаду?')) {
      setBrigades(prev => prev.filter(b => b.id !== id));
    }
  }, []);

  // Notification handlers
  const handleMarkRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleDeleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Панель', icon: '📊' },
    { id: 'gantt' as ViewMode, label: 'Диаграмма Ганта', icon: '📅' },
    { id: 'projects' as ViewMode, label: 'Объекты', icon: '🏗️' },
    { id: 'brigades' as ViewMode, label: 'Бригады', icon: '👷' },
    { id: 'notifications' as ViewMode, label: 'Уведомления', icon: '🔔', badge: unreadCount },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:shadow-none lg:border-r lg:border-gray-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🏗️</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">СтройКонтроль</h1>
              <p className="text-xs text-gray-400">Управление проектами</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                view === item.id 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <p className="text-xs font-medium text-blue-800">💡 Совет</p>
            <p className="text-xs text-blue-600 mt-1">Отмечайте выполненные этапы — система автоматически создаст уведомления</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('notifications')}
              className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{unreadCount}</span>
              )}
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">А</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Администратор</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          {view === 'dashboard' && (
            <Dashboard projects={projects} brigades={brigades} notifications={notifications} />
          )}
          {view === 'gantt' && (
            <GanttChart 
              projects={projects} 
              onToggleTask={handleToggleTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          )}
          {view === 'projects' && (
            <ProjectManager
              projects={projects}
              brigades={brigades}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />
          )}
          {view === 'brigades' && (
            <BrigadeManager
              brigades={brigades}
              onSaveBrigade={handleSaveBrigade}
              onDeleteBrigade={handleDeleteBrigade}
            />
          )}
          {view === 'notifications' && (
            <Notifications
              notifications={notifications}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
              onDeleteNotification={handleDeleteNotification}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
