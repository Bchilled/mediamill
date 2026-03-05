// ErrorTracker — captures all runtime errors, IPC errors, and React errors
// Stores to disk via IPC, accessible in Settings → Error Log

let errors = [];
let listeners = [];

function notify() {
  listeners.forEach(fn => fn([...errors]));
}

export function subscribeErrors(fn) {
  listeners.push(fn);
  fn([...errors]);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

export function logError(source, message, detail = '', stack = '') {
  const entry = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    source,
    message: String(message),
    detail: String(detail || ''),
    stack: String(stack || ''),
    resolved: false,
  };
  errors = [entry, ...errors].slice(0, 200); // keep last 200
  notify();
  // Persist to main process
  try { window.forge.logError(entry); } catch (e) {}
  return entry.id;
}

export function resolveError(id) {
  errors = errors.map(e => e.id === id ? { ...e, resolved: true } : e);
  notify();
}

export function clearErrors() {
  errors = [];
  notify();
}

export function getErrors() { return [...errors]; }

// ── Global error hooks ────────────────────────────────────────────────

export function installGlobalErrorHandlers() {
  // Unhandled JS errors
  window.onerror = (msg, src, line, col, err) => {
    logError('window', msg, `${src}:${line}:${col}`, err?.stack || '');
  };

  // Unhandled promise rejections
  window.onunhandledrejection = (e) => {
    const err = e.reason;
    logError('promise', err?.message || String(err), '', err?.stack || '');
  };

  // Patch console.error to capture errors
  const origError = console.error.bind(console);
  console.error = (...args) => {
    origError(...args);
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    if (!msg.includes('[ErrorTracker]')) { // avoid recursion
      logError('console', msg.slice(0, 200));
    }
  };
}
