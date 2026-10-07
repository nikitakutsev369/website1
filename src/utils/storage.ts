import { Project, Brigade, Notification } from '../types';

const PROJECTS_KEY = 'construction_projects';
const BRIGADES_KEY = 'construction_brigades';
const NOTIFICATIONS_KEY = 'construction_notifications';

export function getProjects(): Project[] {
  const data = localStorage.getItem(PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getBrigades(): Brigade[] {
  const data = localStorage.getItem(BRIGADES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveBrigades(brigades: Brigade[]): void {
  localStorage.setItem(BRIGADES_KEY, JSON.stringify(brigades));
}

export function getNotifications(): Notification[] {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveNotifications(notifications: Notification[]): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}
