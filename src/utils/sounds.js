// SoundEngine — procedural audio via Web Audio API. Zero files, zero downloads.
// All sounds generated mathematically. Can be fully disabled.

let ctx = null;
let enabled = true;
let volume = 0.4;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, duration, type = 'sine', gain = 1, delay = 0) {
  if (!enabled) return;
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.connect(gainNode);
    gainNode.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, ac.currentTime + delay + duration);
    gainNode.gain.setValueAtTime(0, ac.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(volume * gain * 0.3, ac.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + delay + duration);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + duration + 0.05);
  } catch (e) {}
}

function chord(notes, duration, type = 'sine', gain = 0.7) {
  notes.forEach((f, i) => tone(f, duration, type, gain / notes.length, i * 0.02));
}

// ── SOUND LIBRARY ─────────────────────────────────────────────────────

export const Sounds = {

  // App startup — gentle ascending chime like macOS boot (very subtle)
  startup() {
    tone(523, 0.18, 'sine', 0.6);          // C5
    tone(659, 0.18, 'sine', 0.5, 0.1);     // E5
    tone(784, 0.22, 'sine', 0.45, 0.2);    // G5
    tone(1047, 0.3,  'sine', 0.35, 0.33);  // C6
  },

  // Click / button press — soft tick
  click() {
    tone(1200, 0.04, 'sine', 0.4);
    tone(800,  0.03, 'sine', 0.2, 0.02);
  },

  // Navigation / tab switch
  nav() {
    tone(880, 0.06, 'sine', 0.3);
    tone(1100, 0.05, 'sine', 0.2, 0.04);
  },

  // Success — two-note up
  success() {
    tone(660, 0.12, 'sine', 0.5);
    tone(880, 0.18, 'sine', 0.45, 0.1);
  },

  // Warning — soft descending
  warning() {
    tone(660, 0.12, 'sine', 0.45);
    tone(550, 0.15, 'sine', 0.4, 0.1);
  },

  // Error — two-note down, slight buzz
  error() {
    tone(440, 0.1, 'sawtooth', 0.25);
    tone(330, 0.18, 'sawtooth', 0.2, 0.1);
  },

  // Notification ping — single clear bell
  notification() {
    chord([1047, 1319], 0.25, 'sine', 0.5);
  },

  // Video complete — ascending fanfare
  complete() {
    tone(523, 0.1, 'sine', 0.5);
    tone(659, 0.1, 'sine', 0.45, 0.1);
    tone(784, 0.1, 'sine', 0.4,  0.2);
    tone(1047, 0.3,'sine', 0.5,  0.3);
  },

  // Upload success
  upload() {
    tone(880,  0.08, 'sine', 0.4);
    tone(1047, 0.08, 'sine', 0.4, 0.08);
    tone(1319, 0.2,  'sine', 0.4, 0.16);
  },

  // Soft pop — UI feedback
  pop() {
    tone(900, 0.04, 'sine', 0.35);
  },

  // Budget limit warning
  budget() {
    tone(550, 0.15, 'triangle', 0.4);
    tone(440, 0.2,  'triangle', 0.35, 0.15);
    tone(330, 0.25, 'triangle', 0.3,  0.3);
  },

  // New idea found
  idea() {
    tone(1047, 0.08, 'sine', 0.35);
    tone(1319, 0.12, 'sine', 0.3, 0.08);
  },
};

// ── SETTINGS ──────────────────────────────────────────────────────────

export function setSoundEnabled(val) {
  enabled = val;
  localStorage.setItem('mm_sound_enabled', val ? '1' : '0');
}

export function setSoundVolume(val) {
  volume = Math.max(0, Math.min(1, val));
  localStorage.setItem('mm_sound_volume', String(volume));
}

export function isSoundEnabled() { return enabled; }
export function getSoundVolume() { return volume; }

// Load persisted prefs
try {
  const e = localStorage.getItem('mm_sound_enabled');
  if (e !== null) enabled = e === '1';
  const v = localStorage.getItem('mm_sound_volume');
  if (v !== null) volume = parseFloat(v) || 0.4;
} catch (e) {}
