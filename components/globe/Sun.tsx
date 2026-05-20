'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DirectionalLight, PointLight, AmbientLight, Vector3 } from 'three';
import { getSunPosition } from '@/lib/geo/sun-position';

const SUN_DISTANCE = 20; // Visual distance for light placement

export function Sun() {
  const dirLightRef  = useRef<DirectionalLight>(null);
  const pointLightRef = useRef<PointLight>(null);

  const sunPos = new Vector3();

  useFrame(() => {
    const { direction } = getSunPosition(Date.now());

    // Position the directional light so its direction vector points toward origin
    // A DirectionalLight's direction = target.position - light.position
    // We set light at sun direction * distance, target at origin (default)
    sunPos.copy(direction).multiplyScalar(SUN_DISTANCE);

    if (dirLightRef.current) {
      dirLightRef.current.position.copy(sunPos);
      dirLightRef.current.target.position.set(0, 0, 0);
      dirLightRef.current.target.updateMatrixWorld();
    }

    if (pointLightRef.current) {
      pointLightRef.current.position.copy(sunPos);
    }
  });

  return (
    <>
      {/* Ambient – fills in the very dark side so it's not absolute black */}
      <ambientLight intensity={0.06} color={0x1a2540} />

      {/* Directional – primary diffuse lighting (used by cloud MeshStandardMaterial) */}
      <directionalLight
        ref={dirLightRef}
        color={0xfff5e0}
        intensity={3.5}
        castShadow={false}
      />

      {/* Point light from sun position for additional depth */}
      <pointLight
        ref={pointLightRef}
        color={0xfff5e0}
        intensity={1.5}
        distance={60}
        decay={1}
      />
    </>
  );
}
