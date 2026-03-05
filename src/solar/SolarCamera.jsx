import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useSpring } from '@react-spring/three';
import * as THREE from 'three';

const HOME = { x: 0, y: 4, z: 22 };

export default function SolarCamera({ zoomedPlanetRef, isZoomed }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const pos = useRef(new THREE.Vector3(HOME.x, HOME.y, HOME.z));

  // Slow ambient drift when not zoomed — the universe breathes
  useFrame(({ clock }) => {
    if (!isZoomed) {
      const t = clock.getElapsedTime() * 0.06;
      const drift = {
        x: Math.sin(t * 0.7) * 1.5,
        y: HOME.y + Math.cos(t * 0.5) * 0.8,
        z: HOME.z + Math.sin(t * 0.3) * 1.2,
      };
      pos.current.lerp(new THREE.Vector3(drift.x, drift.y, drift.z), 0.008);
      target.current.lerp(new THREE.Vector3(0, 0, 0), 0.02);
    } else if (zoomedPlanetRef?.current) {
      // Zoom into the planet — come in from an angle, not head-on
      const planetPos = new THREE.Vector3();
      zoomedPlanetRef.current.getWorldPosition(planetPos);
      const camTarget = planetPos.clone().add(new THREE.Vector3(3, 2, 5));
      pos.current.lerp(camTarget, 0.04);
      target.current.lerp(planetPos, 0.06);
    }

    camera.position.copy(pos.current);
    camera.lookAt(target.current);
  });

  return null;
}
