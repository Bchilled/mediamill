import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const HOME = new THREE.Vector3(0, 6, 28);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);

export default function SolarCamera({ zoomedPlanetPos }) {
  const { camera } = useThree();
  const targetPos = useRef(HOME.clone());
  const targetLook = useRef(HOME_TARGET.clone());
  const currentPos = useRef(HOME.clone());
  const currentLook = useRef(HOME_TARGET.clone());

  useEffect(() => {
    if (zoomedPlanetPos) {
      const p = new THREE.Vector3(...zoomedPlanetPos);
      const back = p.clone().normalize().multiplyScalar(p.length() + 6);
      back.y += 3;
      targetPos.current.copy(back);
      targetLook.current.copy(p);
    } else {
      targetPos.current.copy(HOME);
      targetLook.current.copy(HOME_TARGET);
    }
  }, [zoomedPlanetPos]);

  useFrame((_, delta) => {
    const s = 1 - Math.pow(0.04, delta);
    currentPos.current.lerp(targetPos.current, s);
    currentLook.current.lerp(targetLook.current, s);

    // Ambient drift when at home
    if (!zoomedPlanetPos) {
      const t = Date.now() * 0.0003;
      camera.position.set(
        currentPos.current.x + Math.sin(t) * 0.8,
        currentPos.current.y + Math.cos(t * 0.7) * 0.4,
        currentPos.current.z
      );
    } else {
      camera.position.copy(currentPos.current);
    }
    camera.lookAt(currentLook.current);
  });

  return null;
}
