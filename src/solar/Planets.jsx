import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, Trail } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

const PLANET_PALETTES = [
  { surface: '#1a3a5c', emissive: '#0d2040', atmosphere: '#2255AA', ring: false },
  { surface: '#3d1a5c', emissive: '#25104a', atmosphere: '#7744CC', ring: true  },
  { surface: '#1a4a2a', emissive: '#0d2a18', atmosphere: '#33AA66', ring: false },
  { surface: '#5c2a1a', emissive: '#3a180d', atmosphere: '#CC6633', ring: true  },
  { surface: '#1a4a4a', emissive: '#0d2828', atmosphere: '#33AAAA', ring: false },
];

function AtmosphereGlow({ color }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    ref.current.material.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 0.7) * 0.02;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.85, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

function PlanetRing({ color }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    ref.current.rotation.x = 1.3 + Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1.1, 0.08, 4, 60]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
    </mesh>
  );
}

// Moon — a pipeline stage orbiting the planet
function Moon({ stage, orbitRadius, orbitSpeed, orbitOffset, status }) {
  const ref = useRef();
  const STATUS_COLORS = {
    done:    '#00DDB3',
    active:  '#7C6EFA',
    pending: '#333355',
    warn:    '#FFB020',
  };
  const color = STATUS_COLORS[status] || STATUS_COLORS.pending;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * orbitSpeed + orbitOffset;
    ref.current.position.x = Math.cos(t) * orbitRadius;
    ref.current.position.z = Math.sin(t) * orbitRadius;
    ref.current.position.y = Math.sin(t * 0.5) * 0.15;
    // Moon rotates on its own axis
    ref.current.rotation.y = clock.getElapsedTime() * 0.5;
  });

  const size = status === 'active' ? 0.14 : 0.1;

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[size, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={status === 'active' ? 1.5 : 0.3}
          roughness={0.6}
        />
      </mesh>
      {status === 'active' && (
        <pointLight color={color} intensity={0.5} distance={3} decay={2} />
      )}
      <Billboard>
        <Text fontSize={0.08} color={color} anchorX="center" position={[0, 0.22, 0]}>
          {stage}
        </Text>
      </Billboard>
    </group>
  );
}

const PIPELINE_STAGES = [
  { id: 'ideas',   label: 'Ideas'   },
  { id: 'scripts', label: 'Scripts' },
  { id: 'voice',   label: 'Voice'   },
  { id: 'assets',  label: 'Assets'  },
  { id: 'compose', label: 'Compose' },
  { id: 'review',  label: 'Review'  },
  { id: 'publish', label: 'Publish' },
];

function PlanetBody({ channel, paletteIndex, orbitAngle, orbitRadius, orbitSpeed, onClick, isZoomed }) {
  const groupRef = useRef();
  const planetRef = useRef();
  const palette = PLANET_PALETTES[paletteIndex % PLANET_PALETTES.length];

  // Orbit around the sun system
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * orbitSpeed + orbitAngle;
    // Orbit is NOT on a flat plane — tilted, 3D
    const tilt = 0.3 + paletteIndex * 0.15;
    groupRef.current.position.x = Math.cos(t) * orbitRadius;
    groupRef.current.position.y = Math.sin(t * 0.6) * orbitRadius * Math.sin(tilt);
    groupRef.current.position.z = Math.sin(t) * orbitRadius;
    // Planet self-rotation
    planetRef.current.rotation.y = clock.getElapsedTime() * 0.2;
  });

  const { scale } = useSpring({
    scale: isZoomed ? 2.5 : 1,
    config: { tension: 80, friction: 14 },
  });

  const stageStatuses = useMemo(() => {
    const s = {};
    PIPELINE_STAGES.forEach((stage, i) => {
      s[stage.id] = i < (channel.progress || 0) ? 'done' : i === (channel.progress || 0) ? 'active' : 'pending';
    });
    return s;
  }, [channel.progress]);

  return (
    <animated.group ref={groupRef} scale={scale} onClick={(e) => {
          e.stopPropagation();
          const wp = new THREE.Vector3();
          groupRef.current.getWorldPosition(wp);
          onClick(channel.id, [wp.x, wp.y, wp.z]);
        }}>
      {/* Atmosphere */}
      <AtmosphereGlow color={palette.atmosphere} />

      {/* Ring if planet has one */}
      {palette.ring && <PlanetRing color={palette.atmosphere} />}

      {/* Planet surface */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[0.65, 48, 48]} />
        <meshStandardMaterial
          color={palette.surface}
          emissive={palette.emissive}
          emissiveIntensity={0.4}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Moons = pipeline stages — only visible when zoomed or nearby */}
      {isZoomed && PIPELINE_STAGES.map((stage, i) => (
        <Moon
          key={stage.id}
          stage={stage.label}
          orbitRadius={1.4 + i * 0.18}
          orbitSpeed={0.4 - i * 0.03}
          orbitOffset={(i / PIPELINE_STAGES.length) * Math.PI * 2}
          status={stageStatuses[stage.id]}
        />
      ))}

      {/* Label */}
      <Billboard>
        <Text
          position={[0, -1.1, 0]}
          fontSize={0.16}
          color="#EEEEFF"
          anchorX="center"
          anchorY="middle"
        >
          {channel.name}
        </Text>
        <Text
          position={[0, -1.35, 0]}
          fontSize={0.1}
          color={palette.atmosphere}
          anchorX="center"
          anchorY="middle"
        >
          {channel.preset?.toUpperCase() || 'CHANNEL'}
        </Text>
      </Billboard>
    </animated.group>
  );
}

// Orbit path — faint trail showing where the planet will go
function OrbitPath({ radius, tilt, paletteIndex }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const t = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(t) * radius,
        Math.sin(t * 0.6) * radius * Math.sin(tilt),
        Math.sin(t) * radius
      ));
    }
    return pts;
  }, [radius, tilt]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#7C6EFA" transparent opacity={0.06} depthWrite={false} />
    </line>
  );
}

export default function Planets({ channels, zoomedId, onZoom }) {
  if (!channels || channels.length === 0) return null;

  return (
    <>
      {channels.map((channel, i) => {
        const orbitRadius = 6 + i * 3.5;
        const tilt = 0.3 + i * 0.15;
        return (
          <group key={channel.id}>
            <OrbitPath radius={orbitRadius} tilt={tilt} paletteIndex={i} />
            <PlanetBody
              channel={channel}
              paletteIndex={i}
              orbitAngle={(i / channels.length) * Math.PI * 2}
              orbitRadius={orbitRadius}
              orbitSpeed={0.05 - i * 0.006}
              onClick={onZoom}
              isZoomed={zoomedId === channel.id}
            />
          </group>
        );
      })}
    </>
  );
}
