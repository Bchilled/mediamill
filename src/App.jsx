import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import ToastContainer from './components/shared/ToastContainer';
import SolarSystem from './solar/SolarSystem';
import Onboarding from './solar/Onboarding';
import GestureLayer from './solar/GestureLayer';

function TopChrome() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 40,
      display: 'flex', alignItems: 'center', padding: '0 14px',
      WebkitAppRegion: 'drag', zIndex: 500,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 800, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: 'rgba(238,238,255,0.3)',
        WebkitAppRegion: 'no-drag',
      }}>
        Media<span style={{ color: '#7C6EFA' }}>Mill</span>
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

  const suns = Object.entries(settings?.apiKeys || {})
    .filter(([, v]) => v)
    .map(([provider]) => ({ id: provider, provider }));

  const showOnboarding = !onboardingDone && (!hasKeys || !channels?.length);

  if (loading) return (
    <div style={{
      position: 'fixed', inset: 0, background: '#03020A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(238,238,255,0.3)', fontSize: 13,
    }}>loading…</div>
  );

  return (
    <>
      <SolarSystem
        suns={suns.length ? suns : [{ id: 'placeholder', provider: 'claude' }]}
        channels={channels || []}
        onSelectChannel={setZoomedChannel}
        zoomedChannel={zoomedChannel}
      />
      <TopChrome />
      {/* Gesture cards — shown when a channel is selected OR no onboarding */}
      {onboardingDone && (
        <GestureLayer channel={zoomedChannel} channels={channels || []} />
      )}
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
