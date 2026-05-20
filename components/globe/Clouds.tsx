'use client';

import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import {
  Mesh,
  MeshStandardMaterial,
  TextureLoader,
  AdditiveBlending,
  SRGBColorSpace,
  LinearMipmapLinearFilter,
  LinearFilter,
} from 'three';
import { useGlobeStore } from '@/store/useGlobeStore';

const CLOUD_RADIUS      = 1.005;
const CLOUD_SPEED_RATIO = 0.7; // 70% of earth rotation speed

export function Clouds() {
  const meshRef = useRef<Mesh>(null);
  const matRef  = useRef<MeshStandardMaterial>(null);

  const { isRotating, rotationSpeed } = useGlobeStore();

  const [cloudTex] = useLoader(TextureLoader, ['/textures/clouds-2k.png']);

  // Configure texture once
  if (cloudTex) {
    cloudTex.colorSpace      = SRGBColorSpace;
    cloudTex.minFilter       = LinearMipmapLinearFilter;
    cloudTex.magFilter       = LinearFilter;
    cloudTex.generateMipmaps = true;
  }

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (isRotating) {
      mesh.rotation.y += rotationSpeed * 0.001 * CLOUD_SPEED_RATIO;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[CLOUD_RADIUS, 96, 96]} />
      <meshStandardMaterial
        ref={matRef}
        map={cloudTex}
        alphaMap={cloudTex}
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={AdditiveBlending}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}
