import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Cloud } from '@react-three/drei';
import * as THREE from 'three';

// Drifting nebula cloud
function Nebula({ position, color, scale, speed }) {
  const ref = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    ref.current.position.x = position[0] + Math.sin(t * 0.3) * 2;
    ref.current.position.y = position[1] + Math.cos(t * 0.2) * 1.5;
    ref.current.position.z = position[2] + Math.sin(t * 0.15) * 1;
    ref.current.rotation.y = t * 0.05;
    ref.current.rotation.x = t * 0.03;
  });
  return (
    <mesh ref={ref} scale={scale}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.03} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

// Floating dust particles
function DustField() {
  const ref = useRef();
  const count = 300;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 20 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.005;
    ref.current.rotation.x = clock.getElapsedTime() * 0.002;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#9B85FF" transparent opacity={0.4} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function Universe() {
  return (
    <>
      {/* Deep star field — multiple layers for depth */}
      <Stars radius={120} depth={60} count={4000} factor={3} saturation={0.3} fade speed={0.3} />
      <Stars radius={60} depth={30} count={1500} factor={1.5} saturation={0.8} fade speed={0.1} />

      {/* Nebula volumes — alive, drifting color in the dark */}
      <Nebula position={[-30, 15, -40]} color="#4422AA" scale={[35, 25, 30]} speed={0.08} />
      <Nebula position={[40, -20, -50]} color="#002244" scale={[30, 40, 25]} speed={0.06} />
      <Nebula position={[-10, 30, -35]} color="#220044" scale={[40, 20, 35]} speed={0.05} />
      <Nebula position={[20, -10, -45]} color="#001133" scale={[25, 35, 30]} speed={0.07} />

      {/* Floating dust */}
      <DustField />

      {/* Ambient deep space light — barely anything, just enough */}
      <ambientLight intensity={0.05} color="#1a1040" />
    </>
  );
}
