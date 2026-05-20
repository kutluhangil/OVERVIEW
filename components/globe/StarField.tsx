'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Points,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  AdditiveBlending,
  Color,
} from 'three';

const STAR_COUNT  = 5000;
const STAR_RADIUS = 50;

// Seeded pseudo-random for deterministic star field (avoids SSR hydration mismatch)
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function StarField() {
  const pointsRef = useRef<Points>(null);

  const { geometry, material } = useMemo(() => {
    const rand = seededRandom(42_424_242);

    const positions  = new Float32Array(STAR_COUNT * 3);
    const colors     = new Float32Array(STAR_COUNT * 3);
    const sizes      = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      // Uniform distribution on sphere surface using Marsaglia method
      let x: number, y: number, z: number, mag: number;
      do {
        x = rand() * 2 - 1;
        y = rand() * 2 - 1;
        z = rand() * 2 - 1;
        mag = Math.sqrt(x * x + y * y + z * z);
      } while (mag > 1 || mag < 0.0001);

      const inv = STAR_RADIUS / mag;
      positions[i * 3]     = x * inv;
      positions[i * 3 + 1] = y * inv;
      positions[i * 3 + 2] = z * inv;

      // Star color: mostly white/blue-white, occasional warm tint
      const colorRoll = rand();
      let c: Color;
      if (colorRoll < 0.70) {
        c = new Color(0.9 + rand() * 0.1, 0.92 + rand() * 0.08, 1.0);      // blue-white
      } else if (colorRoll < 0.85) {
        c = new Color(1.0, 1.0, 0.85 + rand() * 0.15);                      // warm white
      } else if (colorRoll < 0.95) {
        c = new Color(1.0, 0.80 + rand() * 0.15, 0.5 + rand() * 0.2);      // orange
      } else {
        c = new Color(0.8 + rand() * 0.2, 0.85 + rand() * 0.15, 1.0);      // cool blue
      }
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      // Size varies: most stars are small, a few are larger (bright stars)
      const sizeSample = rand();
      sizes[i] = sizeSample < 0.92 ? 0.5 + rand() * 0.8 : 1.5 + rand() * 2.5;
    }

    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('color',    new Float32BufferAttribute(colors,    3));
    geo.setAttribute('size',     new Float32BufferAttribute(sizes,     1));

    const mat = new PointsMaterial({
      vertexColors:  true,
      size:          0.12,
      sizeAttenuation: true,
      transparent:   true,
      opacity:       0.9,
      blending:      AdditiveBlending,
      depthWrite:    false,
    });

    return { geometry: geo, material: mat };
  }, []);

  // Subtle twinkle — modulate overall opacity using a slow sine wave
  useFrame(({ clock }) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const t = clock.getElapsedTime();
    // Very subtle: 0.82 ± 0.08
    (pts.material as PointsMaterial).opacity = 0.82 + Math.sin(t * 0.4) * 0.08;
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}
