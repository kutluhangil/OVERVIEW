'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Color, AdditiveBlending } from 'three';
import { latLngToVector3 } from '@/lib/geo/coordinates';
import { GeoEvent } from '@/lib/types';
import { generateOrbitPath } from '@/lib/geo/satellite';

interface SatelliteLayerProps {
  events: GeoEvent[];
  color: string;
  visible?: boolean;
}

export function SatelliteLayer({ events, color, visible = true }: SatelliteLayerProps) {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const pulseRef = useRef(0);

  const issEvent = events.find((e) => e.layer === 'iss' || e.meta?.name === 'ISS');

  useFrame((_, delta) => {
    pulseRef.current += delta * 2;
    if (glowRef.current) {
      const s = 1 + Math.sin(pulseRef.current) * 0.15;
      glowRef.current.scale.setScalar(s);
    }
  });

  if (!visible || !issEvent) return null;

  const pos = latLngToVector3(issEvent.lat, issEvent.lng, 1, issEvent.alt || 408);
  const orbitPath = generateOrbitPath(issEvent.lat, issEvent.lng, issEvent.alt || 408, 80);

  return (
    <group>
      {/* ISS marker */}
      <mesh ref={meshRef} position={pos}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Glow */}
      <mesh ref={glowRef} position={pos}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Orbit path */}
      <line>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                orbitPath.flatMap((p) => {
                  const v = latLngToVector3(p.lat, p.lng, 1, p.altKm);
                  return [v.x, v.y, v.z];
                })
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </line>
    </group>
  );
}
