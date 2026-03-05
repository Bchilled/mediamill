import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SolarCamera({ isZoomed }) {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(0, 6, 28));
  const tgt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.05;
    if (!isZoomed) {
      const tx = Math.sin(t * 0.7) * 2;
      const ty = 6 + Math.cos(t * 0.5) * 1;
      const tz = 28 + Math.sin(t * 0.3) * 1.5;
      pos.current.lerp(new THREE.Vector3(tx, ty, tz), 0.006);
      tgt.current.lerp(new THREE.Vector3(0, 0, 0), 0.02);
    }
    camera.position.copy(pos.current);
    camera.lookAt(tgt.current);
  });
  return null;
}
