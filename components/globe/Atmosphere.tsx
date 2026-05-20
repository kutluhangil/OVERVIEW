'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Mesh,
  ShaderMaterial,
  BackSide,
  AdditiveBlending,
  Vector3,
} from 'three';
import { getSunPosition } from '@/lib/geo/sun-position';

import vertShader from './shaders/atmosphere.vert.glsl';
import fragShader from './shaders/atmosphere.frag.glsl';

const ATM_RADIUS = 1.15;

export function Atmosphere() {
  const meshRef = useRef<Mesh>(null);
  const matRef  = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uSunDirection: { value: new Vector3(1, 0, 0) },
    }),
    []
  );

  useFrame(() => {
    const mat = matRef.current;
    if (!mat) return;

    const { direction } = getSunPosition(Date.now());
    mat.uniforms.uSunDirection.value.copy(direction);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[ATM_RADIUS, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertShader}
        fragmentShader={fragShader}
        uniforms={uniforms}
        side={BackSide}
        blending={AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
