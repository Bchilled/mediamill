import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

const AI_COLORS = {
  claude:  { core: '#7C6EFA', corona: '#4433CC', glow: '#5544FF', label: 'Claude',  company: 'Anthropic' },
  gemini:  { core: '#00C8FF', corona: '#0088BB', glow: '#00AADD', label: 'Gemini',  company: 'Google'    },
  openai:  { core: '#10A37F', corona: '#0D7A5F', glow: '#0D9970', label: 'GPT-4',   company: 'OpenAI'    },
};

function CoronaRing({ radius, color, speed, tiltX, tiltZ }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * speed;
    ref.current.rotation.x = tiltX;
    ref.current.rotation.z = tiltZ || 0;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.012, 8, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false} />
    </mesh>
  );
}

function SolarFlare({ color, angle }) {
  const ref = useRef();
  const delay = useMemo(() => Math.random() * 8, []);
  useFrame(({ clock }) => {
    const t = ((clock.getElapsedTime() + delay) % 9) / 9;
    if (t < 0.25) {
      const p = t / 0.25;
      const arch = Math.sin(p * Math.PI);
      ref.current.position.x = Math.cos(angle) * (1.15 + arch * 0.9);
      ref.current.position.y = Math.sin(angle) * (1.15 + arch * 0.9);
      ref.current.scale.setScalar(arch * 0.25 + 0.02);
      ref.current.material.opacity = arch * 0.9;
    } else {
      ref.current.material.opacity = 0;
      ref.current.scale.setScalar(0.01);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function SunBody({ aiKey, position, onClick, pulseOffset = 0 }) {
  const bodyRef = useRef();
  const glowRef = useRef();
  const colors = AI_COLORS[aiKey] || AI_COLORS.claude;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + pulseOffset;
    const p = 0.97 + Math.sin(t * 1.1) * 0.03;
    bodyRef.current.scale.setScalar(p);
    glowRef.current.scale.setScalar(1 + Math.sin(t * 0.7) * 0.1);
    glowRef.current.material.opacity = 0.07 + Math.sin(t * 0.9) * 0.025;
  });

  return (
    <group position={position} onClick={onClick}>
      {/* Outer breathing glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.4, 32, 32]} />
        <meshBasicMaterial color={colors.glow} transparent opacity={0.07} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* Corona rings */}
      <CoronaRing radius={1.55} color={colors.corona} speed={0.35}  tiltX={0.5} />
      <CoronaRing radius={1.85} color={colors.core}   speed={-0.22} tiltX={1.2} />
      <CoronaRing radius={2.1}  color={colors.corona} speed={0.18}  tiltX={0.9} tiltZ={0.4} />

      {/* Solar flares */}
      {[0, 1.1, 2.3, 3.5, 4.7, 5.9].map((angle, i) => (
        <SolarFlare key={i} color={colors.core} angle={angle} />
      ))}

      {/* Sun sphere */}
      <mesh ref={bodyRef}>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshStandardMaterial
          color={colors.core}
          emissive={colors.core}
          emissiveIntensity={1.4}
          roughness={0.2}
          metalness={0}
        />
      </mesh>

      {/* Light it emits */}
      <pointLight color={colors.core} intensity={6} distance={60} decay={2} />

      <Billboard>
        <Text position={[0, -1.9, 0]} fontSize={0.2} color="#EEEEFF" anchorX="center" anchorY="middle">
          {colors.label}
        </Text>
        <Text position={[0, -2.18, 0]} fontSize={0.13} color={colors.core} anchorX="center" anchorY="middle">
          {colors.company}
        </Text>
      </Billboard>
    </group>
  );
}

function BinaryOrbit({ suns, onSelect }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.07;
  });
  return (
    <group ref={ref}>
      {suns.map((sun, i) => {
        const angle = (i / suns.length) * Math.PI * 2;
        const r = suns.length === 1 ? 0 : 2.8;
        return (
          <SunBody
            key={sun.id}
            aiKey={sun.provider}
            position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
            onClick={(e) => { e.stopPropagation(); onSelect && onSelect(sun.id); }}
            pulseOffset={i * 2.1}
          />
        );
      })}
    </group>
  );
}

export default function Suns({ suns, onSelect }) {
  if (!suns || !suns.length) return null;
  return <BinaryOrbit suns={suns} onSelect={onSelect} />;
}
