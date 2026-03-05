import { useState } from 'react';
import { useApp } from '../context/AppContext';

const STEPS = [
  {
    id: 'welcome',
    title: 'This is your universe.',
    body: 'At its center — your AI. The sun. The energy that powers everything.\n\nLet\'s build your solar system.',
    cta: 'Begin',
    skip: false,
  },
  {
    id: 'ai',
    title: 'Connect your AI brain.',
    body: 'This powers every video — writing scripts, researching topics, building your channel automatically.\n\nPaste your API key below.',
    cta: 'Connect & ignite the sun',
    skip: 'I\'ll do this later',
    input: true,
  },
  {
    id: 'channel',
    title: 'Create your first channel.',
    body: 'A channel becomes a planet in your orbit.\n\nGive it a name and a topic — your AI handles the rest.',
    cta: 'Add to orbit',
    skip: 'Set up manually later',
    input: true,
  },
  {
    id: 'mode',
    title: 'How much control do you want?',
    body: 'You can let the AI run everything autonomously, or step in wherever you want.',
    cta: 'Start',
    skip: false,
    choices: true,
  },
];

function StepIndicator({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6,
          height: 6, borderRadius: 99,
          background: i === current ? '#7C6EFA' : i < current ? 'rgba(124,110,250,0.4)' : 'rgba(255,255,255,0.1)',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: i === current ? '0 0 10px rgba(124,110,250,0.6)' : 'none',
        }} />
      ))}
    </div>
  );
}

export default function Onboarding({ onComplete }) {
  const { settings, setSettings } = useApp();
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('claude');
  const [channelName, setChannelName] = useState('');
  const [channelTopic, setChannelTopic] = useState('');
  const [mode, setMode] = useState(null);
  const [saving, setSaving] = useState(false);

  const current = STEPS[step];

  async function advance() {
    if (step === 1 && apiKey) {
      setSaving(true);
      try {
        const s = await window.forge.getSettings();
        await window.forge.saveSettings({
          ...s,
          apiKeys: { ...s.apiKeys, [provider]: apiKey },
        });
      } catch(e) {}
      setSaving(false);
    }
    if (step >= STEPS.length - 1) {
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  }

  const PROVIDERS = [
    { id: 'claude', label: 'Claude', company: 'Anthropic', color: '#7C6EFA', ph: 'sk-ant-...' },
    { id: 'gemini', label: 'Gemini', company: 'Google',    color: '#00C8FF', ph: 'AIza...'   },
    { id: 'openai', label: 'GPT-4',  company: 'OpenAI',    color: '#10A37F', ph: 'sk-...'    },
  ];

  const MODES = [
    { id: 'auto',   label: 'Full Auto',     desc: 'AI runs everything. You review before publish.' },
    { id: 'guided', label: 'Guided',         desc: 'AI drafts everything. You approve each step.' },
    { id: 'manual', label: 'Full Control',   desc: 'You control every stage. AI assists on demand.' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      {/* Card */}
      <div style={{
        pointerEvents: 'all',
        background: 'rgba(10, 8, 20, 0.88)',
        border: '1px solid rgba(124,110,250,0.2)',
        borderRadius: 20,
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        padding: '36px 40px',
        maxWidth: 460, width: '90%',
        boxShadow: '0 0 0 1px rgba(124,110,250,0.08), 0 32px 80px rgba(0,0,0,0.8), 0 0 80px rgba(124,110,250,0.06)',
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 80px)',
        animation: 'panelIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <StepIndicator current={step} total={STEPS.length} />

        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 22, fontWeight: 700,
          color: '#EEEEFF', marginBottom: 12,
          lineHeight: 1.3,
        }}>
          {current.title}
        </h1>

        <p style={{
          fontSize: 14, color: 'rgba(238,238,255,0.55)',
          lineHeight: 1.7, marginBottom: 24,
          whiteSpace: 'pre-line',
        }}>
          {current.body}
        </p>

        {/* AI connection step */}
        {current.input && step === 1 && (
          <div style={{ marginBottom: 20 }}>
            {/* Provider picker */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {PROVIDERS.map(p => (
                <div key={p.id}
                  onClick={() => setProvider(p.id)}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 10,
                    border: `1px solid ${provider === p.id ? p.color + '55' : 'rgba(255,255,255,0.07)'}`,
                    background: provider === p.id ? p.color + '12' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all 0.2s',
                    boxShadow: provider === p.id ? `0 0 16px ${p.color}22` : 'none',
                  }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: provider === p.id ? p.color : 'rgba(238,238,255,0.5)' }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(238,238,255,0.25)', marginTop: 2 }}>{p.company}</div>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={PROVIDERS.find(p => p.id === provider)?.ph}
              style={{
                width: '100%', background: 'rgba(4,3,10,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: '#EEEEFF',
                padding: '12px 14px', fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                outline: 'none', display: 'block',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(124,110,250,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(238,238,255,0.2)', textAlign: 'right' }}>
              <a href="#" style={{ color: 'rgba(124,110,250,0.6)', textDecoration: 'none' }}
                onClick={e => e.preventDefault()}>
                Where do I get this? ↗
              </a>
            </div>
          </div>
        )}

        {/* Channel creation step */}
        {current.input && step === 2 && (
          <div style={{ marginBottom: 20 }}>
            <input
              type="text" value={channelName}
              onChange={e => setChannelName(e.target.value)}
              placeholder="Channel name"
              style={{
                width: '100%', background: 'rgba(4,3,10,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: '#EEEEFF',
                padding: '12px 14px', fontSize: 13,
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none', display: 'block', marginBottom: 10,
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(124,110,250,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <input
              type="text" value={channelTopic}
              onChange={e => setChannelTopic(e.target.value)}
              placeholder="What's it about? (e.g. Canadian business news)"
              style={{
                width: '100%', background: 'rgba(4,3,10,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: '#EEEEFF',
                padding: '12px 14px', fontSize: 13,
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none', display: 'block',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(124,110,250,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
        )}

        {/* Mode picker */}
        {current.choices && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {MODES.map(m => (
              <div key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                  border: `1px solid ${mode === m.id ? 'rgba(124,110,250,0.45)' : 'rgba(255,255,255,0.07)'}`,
                  background: mode === m.id ? 'rgba(124,110,250,0.1)' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.18s',
                  boxShadow: mode === m.id ? '0 0 20px rgba(124,110,250,0.12)' : 'none',
                }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: mode === m.id ? '#EEEEFF' : 'rgba(238,238,255,0.5)', marginBottom: 3 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(238,238,255,0.3)' }}>{m.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={advance}
          disabled={saving}
          style={{
            width: '100%', padding: '14px',
            background: '#7C6EFA', color: '#fff',
            border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            boxShadow: '0 0 24px rgba(124,110,250,0.4)',
            transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            marginBottom: current.skip ? 12 : 0,
            opacity: saving ? 0.7 : 1,
          }}
          onMouseOver={e => { e.target.style.background = '#9B85FF'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 0 36px rgba(124,110,250,0.6)'; }}
          onMouseOut={e => { e.target.style.background = '#7C6EFA'; e.target.style.transform = 'none'; e.target.style.boxShadow = '0 0 24px rgba(124,110,250,0.4)'; }}
          onMouseDown={e => e.target.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.target.style.transform = 'translateY(-2px)'}
        >
          {saving ? 'Connecting…' : current.cta}
        </button>

        {current.skip && (
          <div
            onClick={advance}
            style={{
              textAlign: 'center', fontSize: 12,
              color: 'rgba(238,238,255,0.2)', cursor: 'pointer',
              transition: 'color 0.15s', paddingTop: 4,
            }}
            onMouseOver={e => e.target.style.color = 'rgba(238,238,255,0.5)'}
            onMouseOut={e => e.target.style.color = 'rgba(238,238,255,0.2)'}
          >
            {current.skip}
          </div>
        )}
      </div>
    </div>
  );
}
