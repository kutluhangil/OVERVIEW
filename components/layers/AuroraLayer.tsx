'use client';

import { useMemo } from 'react';
import {
  InstancedMesh, Object3D, Color, AdditiveBlending,
  SphereGeometry, MeshBasicMaterial
} from 'three';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { latLngToVector3 } from '@/lib/geo/coordinates';
import { useDataStore } from '@/store/useDataStore';

const dummy = new Object3D();

export function AuroraLayer({ visible = true }: { visible?: boolean }) {
  const meshRef = useRef<InstancedMesh>(null);
  const auroraData = useDataStore((s) => s.auroraData);
  const pulseRef = useRef(0);

  const points = useMemo(() => {
    if (!auroraData) return [];
    return auroraData
      .filter(([, , value]) => value > 5)
      .slice(0, 800)
      .map(([lng, lat, value]) => ({ lng, lat, value }));
  }, [auroraData]);

  const geometry = useMemo(() => new SphereGeometry(0.01, 4, 4), []);
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: new Color('#a78bfa'),
        transparent: true,
        opacity: 0.6,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!meshRef.current || points.length === 0) return;
    pulseRef.current += delta * 0.5;
    const pulse = 0.7 + Math.sin(pulseRef.current) * 0.3;

    points.forEach((p, i) => {
      const pos = latLngToVector3(p.lat, p.lng, 1.01);
      dummy.position.copy(pos);
      const scale = (p.value / 100) * 2 * pulse;
      dummy.scale.setScalar(Math.max(0.1, scale));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      const t = Math.min(1, p.value / 80);
      const c = new Color().lerpColors(
        new Color('#a78bfa'),
        new Color('#34d399'),
        t
      );
      meshRef.current!.setColorAt(i, c);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  if (!visible || points.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, points.length]}
    />
  );
}
