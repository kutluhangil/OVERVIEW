'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ACESFilmicToneMapping, Color } from 'three';

import { Earth }           from './Earth';
import { Clouds }          from './Clouds';
import { Atmosphere }      from './Atmosphere';
import { StarField }       from './StarField';
import { Sun }             from './Sun';
import { CameraRig }       from './CameraRig';
import { DataLayersGroup } from './DataLayersGroup';

// ── Loading fallback ──────────────────────────────────────────────────────────

function GlobeLoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color={0x0d1b2e} wireframe={false} />
    </mesh>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface GlobeCanvasProps {
  minimal?: boolean;
}

export function GlobeCanvas({ minimal: _minimal }: GlobeCanvasProps = {}) {
  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        alpha: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
      }}
      dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
      camera={{
        fov: 45,
        near: 0.01,
        far: 1000,
        position: [0, 0, 2.5],
      }}
      onCreated={({ gl, scene }) => {
        // Deep space background
        scene.background = new Color(0x000308);
        gl.setClearColor(0x000308, 1);
      }}
      shadows={false}
      style={{ width: '100%', height: '100%' }}
    >
      {/* ── Lighting (Sun drives both globe shader and clouds) ── */}
      <Sun />

      {/* ── Scene objects ── */}
      <Suspense fallback={<GlobeLoadingFallback />}>
        <StarField />
        <Earth />
        <Clouds />
        <Atmosphere />
        {!_minimal && <DataLayersGroup />}
      </Suspense>

      {/* ── Camera rig (includes OrbitControls + fly-to + keyboard) ── */}
      <CameraRig />

      {/* ── Post-processing ── */}
      <EffectComposer>
        {/*
          Bloom: subtle — only city lights and atmosphere peaks should glow.
          luminanceThreshold ~0.8 catches only the bright spots (city lights,
          specular glints) without blooming the overall planet surface.
        */}
        <Bloom
          luminanceThreshold={0.75}
          luminanceSmoothing={0.3}
          intensity={0.55}
          mipmapBlur
          radius={0.6}
        />
      </EffectComposer>
    </Canvas>
  );
}
