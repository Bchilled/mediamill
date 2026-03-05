// NotificationCenter — app-wide notification system
// Any component: notify.success('Video uploaded!', {action:'View →', onClick:...})
// Persists to log. Controls: sound, visual, badge count.

import{Sounds}from './sounds';
import{fix,suggestFix}from './fixRouter';

let notifications = [];
let listeners = [];
let toastListeners = [];
let enabled = true;
let soundEnabled = true;

function save() {
  try { localStorage.setItem('mm_notifications', JSON.stringify(notifications.slice(0, 200))); } catch (e) {}
}

function notifyListeners() {
  listeners.forEach(fn => fn([...notifications]));
}

function notifyToast(n) {
  toastListeners.forEach(fn => fn(n));
}

// Load persisted
try {
  const saved = localStorage.getItem('mm_notifications');
  if (saved) notifications = JSON.parse(saved);
  enabled = localStorage.getItem('mm_notif_enabled') !== '0';
  soundEnabled = localStorage.getItem('mm_notif_sound') !== '0';
} catch (e) {}

export function subscribeNotifications(fn) {
  listeners.push(fn);
  fn([...notifications]);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

export function subscribeToasts(fn) {
  toastListeners.push(fn);
  return () => { toastListeners = toastListeners.filter(l => l !== fn); };
}

export function setNotificationsEnabled(val) {
  enabled = val;
  localStorage.setItem('mm_notif_enabled', val ? '1' : '0');
}

export function setNotificationSoundEnabled(val) {
  soundEnabled = val;
  localStorage.setItem('mm_notif_sound', val ? '1' : '0');
}

export function isNotificationsEnabled() { return enabled; }
export function isNotificationSoundEnabled() { return soundEnabled; }

// ── CORE EMIT ─────────────────────────────────────────────────────────

function emit(type, title, message, opts = {}) {
  const n = {
    id: Date.now() + Math.random(),
    type,           // 'success' | 'warning' | 'error' | 'info' | 'system'
    title,
    message: message || '',
    timestamp: new Date().toISOString(),
    read: false,
    fixAction: opts.fixAction || null,
    fixLabel: opts.fixLabel || null,
    action: opts.action || null,      // custom label
    onClick: opts.onClick || null,    // custom handler
    source: opts.source || 'app',
    persistent: opts.persistent || false,
  };

  // Auto-attach fix suggestion for errors/warnings if not provided
  if ((type === 'error' || type === 'warning') && !n.fixAction) {
    const suggestion = suggestFix(n.source, n.title + ' ' + n.message);
    n.fixAction = suggestion.action;
    n.fixLabel = suggestion.label;
  }

  notifications = [n, ...notifications].slice(0, 200);
  notifyListeners();
  save();

  if (enabled) notifyToast(n);

  // Sound
  if (soundEnabled) {
    try {
      if (type === 'success') Sounds.success();
      else if (type === 'error') Sounds.error();
      else if (type === 'warning') Sounds.warning();
      else if (type === 'system') Sounds.notification();
      else Sounds.notification();
    } catch (e) {}
  }

  return n;
}

// ── PUBLIC API ────────────────────────────────────────────────────────

export const notify = {
  success:  (title, opts) => emit('success',  title, opts?.message, opts),
  error:    (title, opts) => emit('error',    title, opts?.message, opts),
  warning:  (title, opts) => emit('warning',  title, opts?.message, opts),
  info:     (title, opts) => emit('info',     title, opts?.message, opts),
  system:   (title, opts) => emit('system',   title, opts?.message, opts),
};

export function markRead(id) {
  notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  notifyListeners();
  save();
}

export function markAllRead() {
  notifications = notifications.map(n => ({ ...n, read: true }));
  notifyListeners();
  save();
}

export function clearNotifications() {
  notifications = [];
  notifyListeners();
  save();
}

export function getUnreadCount() {
  return notifications.filter(n => !n.read).length;
}
