// FixRouter — maps every problem to the exact UI action that resolves it.
// Any component can call fix(action) to navigate directly to the solution.
// No more "go to Settings and figure it out yourself."

let handler = null;

export function registerFixHandler(fn) {
  handler = fn;
}

export function fix(action, payload = {}) {
  if (!handler) { console.warn('[FixRouter] No handler registered'); return; }
  handler(action, payload);
}

// ── ACTION CATALOGUE ──────────────────────────────────────────────────
// Every action string maps to a specific UI destination.
// Add new ones here as features grow.

export const FIX = {
  // API Keys
  ADD_CLAUDE:        'settings:ai:claude',
  ADD_GEMINI:        'settings:ai:gemini',
  ADD_OPENAI:        'settings:ai:openai',
  ADD_GROK:          'settings:ai:grok',
  ADD_MISTRAL:       'settings:ai:mistral',
  ADD_ANY_AI:        'settings:ai',

  // Media sources
  ADD_PEXELS:        'settings:media:pexels',
  ADD_PIXABAY:       'settings:media:pixabay',
  ADD_ELEVENLABS:    'settings:media:elevenlabs',

  // YouTube
  CONNECT_YOUTUBE:   'settings:youtube',
  FIX_YOUTUBE_403:   'settings:youtube:403',

  // Channels
  NEW_CHANNEL:       'channel:new',
  EDIT_CHANNEL:      'channel:edit',       // payload: { channelId }
  CHANNEL_BRANDING:  'channel:branding',

  // Pipeline
  RETRY_VIDEO:       'pipeline:retry',     // payload: { videoId }
  VIEW_VIDEO:        'pipeline:view',      // payload: { videoId }
  REVIEW_VIDEO:      'pipeline:review',    // payload: { videoId }

  // System
  OPEN_DOCTOR:       'system:doctor',
  OPEN_ERROR_LOG:    'settings:errors',
  OPEN_SETTINGS:     'settings',
  CHECK_FFMPEG:      'system:doctor:ffmpeg',
  CHECK_DB:          'system:doctor:db',

  // Budget
  EDIT_BUDGET:       'settings:budget',
};

// ── SMART PROBLEM RESOLVER ────────────────────────────────────────────
// Given an error message or source, returns the best fix action.

export function suggestFix(source, message) {
  const m = (message || '').toLowerCase();
  const s = (source || '').toLowerCase();

  if (m.includes('claude') || m.includes('anthropic') || m.includes('sk-ant'))
    return { action: FIX.ADD_CLAUDE, label: 'Fix Claude key →' };

  if (m.includes('gemini') || m.includes('aistudio') || m.includes('aizasy'))
    return { action: FIX.ADD_GEMINI, label: 'Fix Gemini key →' };

  if (m.includes('openai') || m.includes('gpt'))
    return { action: FIX.ADD_OPENAI, label: 'Fix OpenAI key →' };

  if (m.includes('youtube') && (m.includes('403') || m.includes('access')))
    return { action: FIX.FIX_YOUTUBE_403, label: 'Fix YouTube 403 →' };

  if (m.includes('youtube') || m.includes('upload'))
    return { action: FIX.CONNECT_YOUTUBE, label: 'Connect YouTube →' };

  if (m.includes('ffmpeg') || m.includes('video compose') || m.includes('render'))
    return { action: FIX.CHECK_FFMPEG, label: 'Check FFmpeg →' };

  if (m.includes('pexels'))
    return { action: FIX.ADD_PEXELS, label: 'Add Pexels key →' };

  if (m.includes('elevenlabs') || m.includes('voice'))
    return { action: FIX.ADD_ELEVENLABS, label: 'Fix ElevenLabs →' };

  if (m.includes('no handler') || m.includes('ipc') || s.includes('ipc'))
    return { action: FIX.OPEN_DOCTOR, label: 'Run System Doctor →' };

  if (m.includes('database') || m.includes('sqlite') || s.includes('db'))
    return { action: FIX.CHECK_DB, label: 'Check Database →' };

  if (m.includes('budget') || m.includes('limit') || m.includes('quota'))
    return { action: FIX.EDIT_BUDGET, label: 'Edit Budget →' };

  if (m.includes('channel'))
    return { action: FIX.NEW_CHANNEL, label: 'Set up Channel →' };

  if (m.includes('api') || m.includes('key') || m.includes('token'))
    return { action: FIX.ADD_ANY_AI, label: 'Check API Keys →' };

  return { action: FIX.OPEN_DOCTOR, label: 'Run System Doctor →' };
}
