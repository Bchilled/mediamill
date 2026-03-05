import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Billboard } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

const AI_COLORS = {
  claude:  { core: '#7C6EFA', corona: '#5544DD', label: 'Claude',  company: 'Anthropic' },
  gemini:  { core: '#00C8FF', corona: '#0088BB', label: 'Gemini',  company: 'Google'    },
  openai:  { core: '#10A37F', corona: '#0D7A5F', label: 'GPT-4',   company: 'OpenAI'    },
  grok:    { core: '#FF6B35', corona: '#CC4A1A', label: 'Grok',    company: 'xAI'       },
};

// Corona / atmosphere rings around the sun
function CoronaRing({ radius, color, speed, tilt }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    ref.current.rotation.z = clock.getElapsedTime() * speed;
    ref.current.rotation.x = tilt;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.015, 8, 80]} />
      <meshBasicMaterial color={color} transparent opacity={0.25} depthWrite={false} />
    </mesh>
  );
}

// Solar flare — bright arc that erupts occasionally
function SolarFlare({ color }) {
  const ref = useRef();
  const startTime = useMemo(() => Math.random() * 10, []);
  const angle = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    const t = ((clock.getElapsedTime() - startTime) % 8) / 8;
    if (t > 0 && t < 0.3) {
      const progress = t / 0.3;
      const arch = Math.sin(progress * Math.PI);
      ref.current.position.x = Math.cos(angle) * (1.2 + arch * 0.8);
      ref.current.position.y = Math.sin(angle) * (1.2 + arch * 0.8);
      ref.current.scale.setScalar(arch * 0.3 + 0.05);
      ref.current.material.opacity = arch * 0.8;
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

function SunBody({ aiKey, position, onClick, isSelected, pulseOffset = 0 }) {
  const ref = useRef();
  const glowRef = useRef();
  const colors = AI_COLORS[aiKey] || AI_COLORS.claude;

  // Breathing pulse
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + pulseOffset;
    const pulse = 0.97 + Math.sin(t * 1.2) * 0.03;
    ref.current.scale.setScalar(pulse);
    // Glow breathes larger
    glowRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.08);
    glowRef.current.material.opacity = 0.06 + Math.sin(t * 1.0) * 0.02;
  });

  const { scale } = useSpring({
    scale: isSelected ? 1.15 : 1,
    config: { tension: 120, friction: 14 },
  });

  return (
    <animated.group position={position} scale={scale} onClick={onClick}>
      {/* Outer glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color={colors.core} transparent opacity={0.06} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* Corona rings */}
      <CoronaRing radius={1.6} color={colors.corona} speed={0.3} tilt={0.4} />
      <CoronaRing radius={1.9} color={colors.core} speed={-0.2} tilt={1.1} />
      <CoronaRing radius={2.1} color={colors.corona} speed={0.15} tilt={0.8} />

      {/* Solar flares */}
      <SolarFlare color={colors.core} />
      <SolarFlare color={colors.corona} />
      <SolarFlare color={colors.core} />

      {/* The sun itself */}
      <mesh ref={ref}>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshStandardMaterial
          color={colors.core}
          emissive={colors.core}
          emissiveIntensity={1.2}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Point light — this sun actually illuminates planets */}
      <pointLight color={colors.core} intensity={4} distance={50} decay={2} />

      {/* Label */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, -1.8, 0]}
          fontSize={0.22}
          color="#EEEEFF"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/dmsans/v11/rP2Hp2ywxg089UriCZa4ET-D.woff"
        >
          {colors.label}
        </Text>
        <Text
          position={[0, -2.1, 0]}
          fontSize={0.14}
          color="#7C6EFA"
          anchorX="center"
          anchorY="middle"
        >
          {colors.company}
        </Text>
      </Billboard>
    </animated.group>
  );
}

// Binary orbit — two suns orbit their common center of gravity
function BinaryOrbit({ suns, onSelect, selectedId }) {
  const groupRef = useRef();
  useFrame(({ clock }) => {
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.08;
  });
  return (
    <group ref={groupRef}>
      {suns.map((sun, i) => {
        const angle = (i / suns.length) * Math.PI * 2;
        const r = suns.length === 1 ? 0 : 2.5;
        return (
          <SunBody
            key={sun.id}
            aiKey={sun.provider}
            position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
            onClick={(e) => { e.stopPropagation(); onSelect(sun.id); }}
            isSelected={selectedId === sun.id}
            pulseOffset={i * 2.1}
          />
        );
      })}
    </group>
  );
}

export default function Suns({ suns, onSelect, selectedId }) {
  if (!suns || suns.length === 0) return null;
  return <BinaryOrbit suns={suns} onSelect={onSelect} selectedId={selectedId} />;
}
