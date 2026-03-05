import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function Nebula({ position, color, scale, speed }) {
  const ref = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    ref.current.position.x = position[0] + Math.sin(t * 0.3) * 3;
    ref.current.position.y = position[1] + Math.cos(t * 0.2) * 2;
    ref.current.position.z = position[2] + Math.sin(t * 0.15) * 2;
  });
  return (
    <mesh ref={ref} scale={scale}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.018} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

function DustField() {
  const ref = useRef();
  const count = 400;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 25 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      arr[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      arr[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i*3+2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.004;
    ref.current.rotation.x = clock.getElapsedTime() * 0.002;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#7C6EFA" transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function Universe() {
  return (
    <>
      <Stars radius={150} depth={80} count={5000} factor={3} saturation={0.3} fade speed={0.2} />
      <Stars radius={60}  depth={30} count={1500} factor={1.5} saturation={0.8} fade speed={0.08} />
      {/* Nebulas far in the background, small opacity */}
      <Nebula position={[-50, 20, -80]} color="#3322AA" scale={[50,35,45]} speed={0.06} />
      <Nebula position={[60, -30, -90]} color="#002244" scale={[45,55,40]} speed={0.05} />
      <Nebula position={[-15, 40, -70]} color="#220033" scale={[55,30,50]} speed={0.04} />
      <DustField />
      <ambientLight intensity={0.04} color="#100830" />
    </>
  );
}
