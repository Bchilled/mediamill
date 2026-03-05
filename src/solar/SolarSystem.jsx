import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import Universe from './Universe';
import Suns from './Suns';
import Planets from './Planets';
import SolarCamera from './SolarCamera';

export default function SolarSystem({ suns, channels, onSelectChannel, zoomedChannel }) {
  const [zoomedPos, setZoomedPos] = useState(null);

  function handleZoom(id, pos) {
    if (zoomedChannel === id) {
      setZoomedPos(null);
      onSelectChannel(null);
    } else {
      setZoomedPos(pos);
      onSelectChannel(id);
    }
  }

  return (
    <Canvas
      camera={{ position: [0, 6, 28], fov: 60, near: 0.1, far: 500 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
      style={{ position: 'absolute', inset: 0, background: '#03020A' }}
      onPointerMissed={() => { setZoomedPos(null); onSelectChannel(null); }}
    >
      <Suspense fallback={null}>
        <Universe />
        <Suns suns={suns} />
        <Planets channels={channels} zoomedId={zoomedChannel} onZoom={handleZoom} />
        <SolarCamera zoomedPlanetPos={zoomedPos} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={1.6} blendFunction={BlendFunction.ADD} />
          <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0004, 0.0004]} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
