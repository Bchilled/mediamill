import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Show visible error if React crashes before mounting
function showFallback(err) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="color:#EE2244;padding:40px;font-family:monospace;background:#0D0D1A;height:100vh;overflow:auto;">
      <h2 style="color:#C8FF00;margin-bottom:16px">⚠ MediaMill failed to start</h2>
      <pre style="white-space:pre-wrap;font-size:12px;color:#ff6b6b">${err?.stack||err?.message||String(err)}</pre>
      <p style="margin-top:16px;color:#888;font-size:11px">Check the Console tab in DevTools for details.</p>
    </div>`;
  }
}

async function main() {
  try {
    const { installGlobalErrorHandlers } = await import('./utils/errorTracker');
    installGlobalErrorHandlers();
  } catch(e) {}

  try {
    const { Sounds } = await import('./utils/sounds');
    setTimeout(() => { try { Sounds.startup(); } catch(e) {} }, 400);
  } catch(e) {}

  try {
    const App = (await import('./App')).default;
    const { I18nProvider } = await import('./i18n');

    ReactDOM.createRoot(document.getElementById('root')).render(
      <I18nProvider><App /></I18nProvider>
    );
  } catch(e) {
    console.error('React mount failed:', e);
    showFallback(e);
  }
}

main();
