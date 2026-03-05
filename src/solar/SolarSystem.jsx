import { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import Universe from './Universe';
import Suns from './Suns';
import Planets from './Planets';
import SolarCamera from './SolarCamera';

export default function SolarSystem({ suns, channels, onSelectSun, onSelectChannel }) {
  const [zoomedId, setZoomedId] = useState(null);
  const zoomedRef = useRef();

  function handleZoom(id) {
    setZoomedId(prev => prev === id ? null : id);
    if (onSelectChannel) onSelectChannel(id);
  }

  function handleBackground() {
    // Click empty space — zoom back out
    setZoomedId(null);
  }

  return (
    <Canvas
      camera={{ position: [0, 4, 22], fov: 60, near: 0.1, far: 500 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
      style={{ position: 'absolute', inset: 0, background: '#03020A' }}
      onCreated={() => console.log('[Solar] canvas ready')}
      onPointerMissed={handleBackground}
    >
      <Suspense fallback={null}>
        {/* The living universe */}
        <Universe />

        {/* AI suns — energy sources */}
        <Suns suns={suns} onSelect={onSelectSun} />

        {/* Channel planets — orbit the suns */}
        <Planets channels={channels} zoomedId={zoomedId} onZoom={handleZoom} />

        {/* Camera — drifts, zooms */}
        <SolarCamera isZoomed={!!zoomedId} zoomedPlanetRef={zoomedRef} />

        {/* Post-processing — makes light feel like light */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={1.4}
            blendFunction={BlendFunction.ADD}
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.0005, 0.0005]}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
