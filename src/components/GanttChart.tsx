import React, { useMemo, useState } from 'react';
import { Project, Task } from '../types';
import { format, differenceInDays, parseISO, addDays, startOfDay, isBefore, isAfter } from 'date-fns';
import { ru } from 'date-fns/locale';

interface GanttChartProps {
  projects: Project[];
  onToggleTask: (projectId: string, taskId: string) => void;
  onUpdateTaskStatus: (projectId: string, taskId: string, status: Task['status']) => void;
}

export default function GanttChart({ projects, onToggleTask, onUpdateTaskStatus }: GanttChartProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [zoom, setZoom] = useState<'day' | 'week' | 'month'>('week');

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const { minDate, maxDate, days, totalDays } = useMemo(() => {
    if (!selectedProject || selectedProject.tasks.length === 0) {
      const today = new Date();
      return {
        minDate: today,
        maxDate: addDays(today, 30),
        days: Array.from({ length: 30 }, (_, i) => addDays(today, i)),
        totalDays: 30
      };
    }

    const allDates = selectedProject.tasks.flatMap(t => [parseISO(t.startDate), parseISO(t.endDate)]);
    const min = startOfDay(new Date(Math.min(...allDates.map(d => d.getTime()))));
    const max = startOfDay(new Date(Math.max(...allDates.map(d => d.getTime()))));
    
    const start = addDays(min, -3);
    const end = addDays(max, 3);
    const total = differenceInDays(end, start) + 1;
    const daysArr = Array.from({ length: total }, (_, i) => addDays(start, i));

    return { minDate: start, maxDate: end, days: daysArr, totalDays: total };
  }, [selectedProject]);

  const getTaskPosition = (task: Task) => {
    const start = differenceInDays(parseISO(task.startDate), minDate);
    const duration = differenceInDays(parseISO(task.endDate), parseISO(task.startDate)) + 1;
    const left = (start / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  const getTaskColor = (task: Task) => {
    const status = task.status as string;
    if (status === 'completed') return 'bg-green-500';
    if (status === 'overdue' || (status !== 'completed' && isBefore(parseISO(task.endDate), new Date()))) return 'bg-red-500';
    if (status === 'in_progress') return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  const cellWidth = useMemo(() => {
    if (zoom === 'day') return 40;
    if (zoom === 'week') return 24;
    return 10;
  }, [zoom]);

  const headerDateFormat = useMemo(() => {
    if (zoom === 'day') return 'd MMM';
    if (zoom === 'week') return 'd MMM';
    return 'MMM';
  }, [zoom]);

  const today = new Date();
  const todayPosition = useMemo(() => {
    const diff = differenceInDays(today, minDate);
    return (diff / totalDays) * 100;
  }, [minDate, totalDays]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Диаграмма Ганта</h1>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setZoom('day')}
              className={`px-3 py-1 text-xs rounded-md transition ${zoom === 'day' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
            >
              Дни
            </button>
            <button
              onClick={() => setZoom('week')}
              className={`px-3 py-1 text-xs rounded-md transition ${zoom === 'week' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
            >
              Недели
            </button>
            <button
              onClick={() => setZoom('month')}
              className={`px-3 py-1 text-xs rounded-md transition ${zoom === 'month' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
            >
              Месяцы
            </button>
          </div>
        </div>
      </div>

      {selectedProject && selectedProject.tasks.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Legend */}
          <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-500"></div>
              <span>Ожидает</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span>В работе</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span>Завершено</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span>Просрочено</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-3 bg-red-400"></div>
              <span>Сегодня</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div style={{ minWidth: `${Math.max(800, totalDays * cellWidth)}px` }}>
              {/* Header - dates */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                <div className="w-64 min-w-[256px] px-4 py-2 font-medium text-sm text-gray-600 border-r border-gray-200 sticky left-0 bg-gray-50 z-10">
                  Задача
                </div>
                <div className="flex-1 relative">
                  <div className="flex">
                    {days.map((day, i) => {
                      const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      return (
                        <div
                          key={i}
                          className={`text-center text-xs py-2 border-r border-gray-100 ${
                            isToday ? 'bg-blue-50 font-bold text-blue-600' : 
                            isWeekend ? 'bg-gray-100 text-gray-400' : 'text-gray-500'
                          }`}
                          style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                        >
                          {(zoom === 'day' || (zoom === 'week' && i % 7 === 0) || (zoom === 'month' && day.getDate() === 1)) && 
                            format(day, headerDateFormat, { locale: ru })
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tasks */}
              {selectedProject.tasks
                .sort((a, b) => a.order - b.order)
                .map((task, idx) => {
                  const pos = getTaskPosition(task);
                  const isOverdue = task.status !== 'completed' && isBefore(parseISO(task.endDate), today);
                  
                  return (
                    <div key={task.id} className={`flex border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition`}>
                      <div className="w-64 min-w-[256px] px-4 py-3 border-r border-gray-200 sticky left-0 bg-inherit z-10">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onToggleTask(selectedProject.id, task.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                              task.status === 'completed' 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300 hover:border-blue-400'
                            }`}
                          >
                            {task.status === 'completed' && (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <div>
                            <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {task.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {format(parseISO(task.startDate), 'd MMM', { locale: ru })} — {format(parseISO(task.endDate), 'd MMM', { locale: ru })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 relative h-12">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex">
                          {days.map((_, i) => (
                            <div
                              key={i}
                              className={`border-r ${i % 7 === 0 ? 'border-gray-200' : 'border-gray-100'}`}
                              style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                            ></div>
                          ))}
                        </div>
                        
                        {/* Today marker */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10 opacity-60"
                          style={{ left: `${todayPosition}%` }}
                        ></div>
                        
                        {/* Task bar */}
                        <div
                          className={`absolute top-2 h-8 rounded-md ${getTaskColor(task)} opacity-90 hover:opacity-100 transition cursor-pointer shadow-sm flex items-center px-2`}
                          style={{ left: pos.left, width: pos.width }}
                          title={`${task.name}: ${format(parseISO(task.startDate), 'd MMM', { locale: ru })} — ${format(parseISO(task.endDate), 'd MMM', { locale: ru })}`}
                        >
                          <span className="text-white text-xs font-medium truncate">{task.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-500 text-lg">
            {projects.length === 0 ? 'Добавьте проект, чтобы увидеть диаграмму Ганта' : 'В этом проекте пока нет задач'}
          </p>
        </div>
      )}
    </div>
  );
}
