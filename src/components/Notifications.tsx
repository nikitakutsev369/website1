import React from 'react';
import { Notification } from '../types';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface NotificationsProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
}

export default function Notifications({ notifications, onMarkRead, onMarkAllRead, onDeleteNotification }: NotificationsProps) {
  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'overdue':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'completed':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'reminder': return 'Напоминание';
      case 'overdue': return 'Просрочено';
      case 'completed': return 'Завершено';
      default: return 'Информация';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Уведомления</h1>
          {unread.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unread.length} непрочитанных</p>
          )}
        </div>
        {unread.length > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
          >
            Прочитать все
          </button>
        )}
      </div>

      {/* Unread */}
      {unread.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Новые</h2>
          {unread.map(notification => (
            <div key={notification.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500 hover:shadow-md transition">
              <div className="flex items-start gap-3">
                {getIcon(notification.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {getTypeLabel(notification.type)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true, locale: ru })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    📋 {notification.projectName} → {notification.taskName}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onMarkRead(notification.id)}
                    className="p-1.5 text-gray-400 hover:text-green-600 transition"
                    title="Отметить прочитанным"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteNotification(notification.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition"
                    title="Удалить"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Read */}
      {read.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Прочитанные</h2>
          {read.map(notification => (
            <div key={notification.id} className="bg-white rounded-xl shadow-sm p-4 opacity-70 hover:opacity-100 transition">
              <div className="flex items-start gap-3">
                {getIcon(notification.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                      {getTypeLabel(notification.type)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(parseISO(notification.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    📋 {notification.projectName} → {notification.taskName}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteNotification(notification.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition"
                  title="Удалить"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {notifications.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-500 text-lg mb-2">Нет уведомлений</p>
          <p className="text-gray-400 text-sm">Уведомления будут появляться здесь при приближении сроков задач</p>
        </div>
      )}
    </div>
  );
}
