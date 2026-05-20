'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, Vector3, Quaternion, Euler } from 'three';
import { latLngToVector3 } from '@/lib/geo/coordinates';
import { GeoEvent } from '@/lib/types';

interface Ring {
  event: GeoEvent;
  age: number; // 0..1
  maxAge: number;
}

interface RingLayerProps {
  events: GeoEvent[];
  color: string;
  visible?: boolean;
}

export function RingLayer({ events, color, visible = true }: RingLayerProps) {
  const [rings, setRings] = useState<Ring[]>([]);
  const prevEventIds = useRef(new Set<string>());
  const RING_LIFETIME = 3.0; // seconds

  useEffect(() => {
    const newRings: Ring[] = [];
    events.forEach((event) => {
      if (!prevEventIds.current.has(event.id)) {
        prevEventIds.current.add(event.id);
        newRings.push({ event, age: 0, maxAge: RING_LIFETIME });
      }
    });
    if (newRings.length > 0) {
      setRings((prev) => [...prev.slice(-20), ...newRings]);
    }
  }, [events]);

  useFrame((_, delta) => {
    setRings((prev) =>
      prev
        .map((r) => ({ ...r, age: r.age + delta }))
        .filter((r) => r.age < r.maxAge)
    );
  });

  if (!visible) return null;

  return (
    <group>
      {rings.map((ring) => {
        const t = ring.age / ring.maxAge;
        const scale = 0.005 + t * 0.08;
        const opacity = (1 - t) * 0.8;
        const pos = latLngToVector3(ring.event.lat, ring.event.lng, 1.002);
        // Align ring to face away from globe center
        const normal = pos.clone().normalize();
        const up = new Vector3(0, 1, 0);
        const q = new Quaternion().setFromUnitVectors(up, normal);

        return (
          <mesh
            key={`${ring.event.id}-${ring.age}`}
            position={pos}
            quaternion={q}
            scale={[scale, scale, 1]}
          >
            <ringGeometry args={[0.8, 1, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={opacity}
              blending={AdditiveBlending}
              depthWrite={false}
              side={2}
            />
          </mesh>
        );
      })}
    </group>
  );
}
