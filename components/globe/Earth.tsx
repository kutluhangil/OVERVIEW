'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import {
  Mesh,
  ShaderMaterial,
  TextureLoader,
  Vector3,
  SRGBColorSpace,
  LinearFilter,
  LinearMipmapLinearFilter,
} from 'three';
import { useGlobeStore } from '@/store/useGlobeStore';
import { getSunPosition } from '@/lib/geo/sun-position';

// Import GLSL source — handled by webpack asset/source loader in next.config.js
import vertShader from './shaders/earth.vert.glsl';
import fragShader from './shaders/earth.frag.glsl';

export function Earth() {
  const meshRef = useRef<Mesh>(null);
  const matRef  = useRef<ShaderMaterial>(null);

  const { isRotating, rotationSpeed } = useGlobeStore();
  const { camera } = useThree();

  // ── Textures ──────────────────────────────────────────────────────────────
  const [dayTex, nightTex, specTex, normTex] = useLoader(TextureLoader, [
    '/textures/earth-day-4k.jpg',
    '/textures/earth-night-4k.jpg',
    '/textures/earth-specular-2k.jpg',
    '/textures/earth-normal-2k.jpg',
  ]);

  // Apply color-space & filtering once textures are loaded
  useMemo(() => {
    const srgbTextures = [dayTex, nightTex, specTex];
    srgbTextures.forEach((t) => {
      t.colorSpace     = SRGBColorSpace;
      t.minFilter      = LinearMipmapLinearFilter;
      t.magFilter      = LinearFilter;
      t.generateMipmaps = true;
      t.needsUpdate    = true;
    });
    // Normal map stays in linear space
    normTex.minFilter      = LinearMipmapLinearFilter;
    normTex.magFilter      = LinearFilter;
    normTex.generateMipmaps = true;
    normTex.needsUpdate    = true;
  }, [dayTex, nightTex, specTex, normTex]);

  // ── Shader uniforms ───────────────────────────────────────────────────────
  const uniforms = useMemo(
    () => ({
      dayTexture:      { value: dayTex   },
      nightTexture:    { value: nightTex },
      specularMap:     { value: specTex  },
      normalMap:       { value: normTex  },
      uSunDirection:   { value: new Vector3(1, 0, 0) },
      uCameraPosition: { value: new Vector3() },
      uTime:           { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dayTex, nightTex, specTex, normTex]
  );

  // ── Per-frame updates ─────────────────────────────────────────────────────
  useFrame(({ clock }) => {
    const mat  = matRef.current;
    const mesh = meshRef.current;
    if (!mat || !mesh) return;

    // Update time
    mat.uniforms.uTime.value = clock.getElapsedTime();

    // Real-time sun direction
    const { direction } = getSunPosition(Date.now());

    // Our globe mesh may have been rotated; we need the sun direction
    // in the globe's local frame so the GLSL dot product aligns correctly.
    // The vertex shader uses normalMatrix (which accounts for mesh rotation),
    // so we pass the sun in world space and let the GPU handle it.
    mat.uniforms.uSunDirection.value.copy(direction);

    // Camera position for specular highlight
    mat.uniforms.uCameraPosition.value.copy(camera.position);

    // Auto-rotation
    if (isRotating) {
      mesh.rotation.y += rotationSpeed * 0.001;
    }
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertShader}
        fragmentShader={fragShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
