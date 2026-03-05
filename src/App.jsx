import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import ToastContainer from './components/shared/ToastContainer';
import SolarSystem from './solar/SolarSystem';
import Onboarding from './solar/Onboarding';

// Minimal top chrome — barely there
function TopChrome() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 40,
      display: 'flex', alignItems: 'center', padding: '0 14px',
      WebkitAppRegion: 'drag', zIndex: 500,
      background: 'transparent',
    }}>
      <div style={{
        fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 800,
        letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'rgba(238,238,255,0.3)', WebkitAppRegion: 'no-drag',
      }}>
        Media<span style={{ color: '#7C6EFA' }}>Mill</span>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, WebkitAppRegion: 'no-drag' }}>
        {['—', '□', '✕'].map((c, i) => (
          <button key={i} style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'transparent', border: 'none',
            color: 'rgba(238,238,255,0.2)', fontSize: 11,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.12s',
          }}
            onMouseOver={e => e.currentTarget.style.background = i === 2 ? '#FF4757' : 'rgba(255,255,255,0.08)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >{c}</button>
        ))}
      </div>
    </div>
  );
}

function Inner() {
  const { channels, settings, setSettings } = useApp();
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [zoomedChannel, setZoomedChannel] = useState(null);

  const hasKeys = settings?.apiKeys && Object.values(settings.apiKeys).some(v => v);
  const loading = channels === null;

  // Build sun objects from connected AI providers
  const suns = Object.entries(settings?.apiKeys || {})
    .filter(([, v]) => v)
    .map(([provider]) => ({ id: provider, provider }));

  const showOnboarding = !onboardingDone && (!hasKeys || !channels?.length);

  if (loading) return (
    <div style={{
      position: 'fixed', inset: 0, background: '#03020A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(238,238,255,0.3)', fontSize: 13,
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ animation: 'spin 1.2s linear infinite', display: 'inline-block', marginRight: 10 }}>◌</div>
      Waking up…
    </div>
  );

  return (
    <>
      {/* 3D Solar System — always full screen */}
      <SolarSystem
        suns={suns.length ? suns : [{ id: 'placeholder', provider: 'claude' }]}
        channels={channels || []}
        onSelectChannel={setZoomedChannel}
      />

      {/* Minimal chrome on top */}
      <TopChrome />

      {/* Onboarding floats over the solar system */}
      {showOnboarding && (
        <Onboarding onComplete={() => setOnboardingDone(true)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
      <ToastContainer />
    </AppProvider>
  );
}
