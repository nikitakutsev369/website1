import React from 'react';
import { Project, Brigade, Notification } from '../types';
import { format, differenceInDays, isAfter, isBefore, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DashboardProps {
  projects: Project[];
  brigades: Brigade[];
  notifications: Notification[];
}

export default function Dashboard({ projects, brigades, notifications }: DashboardProps) {
  const activeProjects = projects.filter(p => p.status === 'active');
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = projects.reduce((acc, p) => acc + p.tasks.filter(t => t.status === 'completed').length, 0);
  const overdueTasks = projects.reduce((acc, p) => acc + p.tasks.filter(t => {
    if (t.status === 'completed') return false;
    return isBefore(parseISO(t.endDate), new Date());
  }).length, 0);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const upcomingTasks = projects
    .flatMap(p => p.tasks.map(t => ({ ...t, projectName: p.name, projectId: p.id })))
    .filter(t => t.status !== 'completed')
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Панель управления</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-500">Активные проекты</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">{activeProjects.length}</div>
          <div className="text-xs text-gray-400 mt-1">из {projects.length} всего</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-500">Выполнено задач</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{completedTasks}</div>
          <div className="text-xs text-gray-400 mt-1">из {totalTasks} всего</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div className="text-sm text-gray-500">Просрочено</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{overdueTasks}</div>
          <div className="text-xs text-gray-400 mt-1">требуют внимания</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-500">Уведомления</div>
          <div className="text-3xl font-bold text-yellow-600 mt-1">{unreadNotifications}</div>
          <div className="text-xs text-gray-400 mt-1">непрочитанных</div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Общий прогресс</h2>
        <div className="space-y-4">
          {activeProjects.map(project => {
            const completed = project.tasks.filter(t => t.status === 'completed').length;
            const total = project.tasks.length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            return (
              <div key={project.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{project.name}</span>
                  <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
          {activeProjects.length === 0 && (
            <p className="text-gray-500 text-center py-4">Нет активных проектов</p>
          )}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ближайшие задачи</h2>
          <div className="space-y-3">
            {upcomingTasks.map(task => {
              const daysUntil = differenceInDays(parseISO(task.startDate), new Date());
              const isOverdue = isBefore(parseISO(task.endDate), new Date()) && task.status !== 'completed';
              
              return (
                <div key={task.id} className={`p-3 rounded-lg border ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{task.name}</p>
                      <p className="text-sm text-gray-500">{task.projectName}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isOverdue ? 'bg-red-100 text-red-700' :
                      daysUntil <= 3 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {isOverdue ? 'Просрочено' : daysUntil <= 0 ? 'Сегодня' : `${daysUntil} дн.`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(parseISO(task.startDate), 'd MMM', { locale: ru })} — {format(parseISO(task.endDate), 'd MMM', { locale: ru })}
                  </p>
                </div>
              );
            })}
            {upcomingTasks.length === 0 && (
              <p className="text-gray-500 text-center py-4">Нет предстоящих задач</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Бригады</h2>
          <div className="space-y-3">
            {brigades.map(brigade => (
              <div key={brigade.id} className="p-3 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-800">{brigade.name}</p>
                <p className="text-sm text-gray-500">Прораб: {brigade.foreman}</p>
                <p className="text-xs text-gray-400">{brigade.specialization}</p>
              </div>
            ))}
            {brigades.length === 0 && (
              <p className="text-gray-500 text-center py-4">Нет добавленных бригад</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
