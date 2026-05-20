'use client';

import { useRef, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  InstancedMesh, Object3D, Color, Vector3, Raycaster,
  AdditiveBlending, MeshBasicMaterial, SphereGeometry
} from 'three';
import { GeoEvent } from '@/lib/types';
import { latLngToVector3 } from '@/lib/geo/coordinates';
import { useUIStore } from '@/store/useUIStore';
import { useGlobeStore } from '@/store/useGlobeStore';

interface PointLayerProps {
  events: GeoEvent[];
  color: string;
  opacity?: number;
  pointSize?: number;
  visible?: boolean;
}

const dummy = new Object3D();

export function PointLayer({
  events,
  color,
  opacity = 1,
  pointSize = 1,
  visible = true,
}: PointLayerProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const { raycaster, camera } = useThree();
  const setSelectedEvent = useUIStore((s) => s.setSelectedEvent);
  const setSelectedEventId = useGlobeStore((s) => s.setSelectedEventId);

  const baseColor = useMemo(() => new Color(color), [color]);

  const filteredEvents = useMemo(() => events.slice(0, 2000), [events]);

  const geometry = useMemo(() => new SphereGeometry(0.008 * pointSize, 6, 6), [pointSize]);
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    [baseColor, opacity]
  );

  useFrame(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;

    filteredEvents.forEach((event, i) => {
      const pos = latLngToVector3(event.lat, event.lng, 1.005);
      dummy.position.copy(pos);
      // Scale by magnitude
      const scale = event.magnitude ? Math.max(0.5, Math.min(3, event.magnitude * 0.4)) : 1;
      dummy.scale.setScalar(scale * pointSize);
      dummy.lookAt(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Color intensity by magnitude
      const intensity = event.magnitude ? Math.min(1, event.magnitude / 8) : 0.6;
      const c = baseColor.clone().multiplyScalar(0.4 + intensity * 0.6);
      mesh.setColorAt(i, c);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  const handleClick = useCallback(() => {
    if (!meshRef.current) return;
    const hits = raycaster.intersectObject(meshRef.current);
    if (hits.length > 0) {
      const idx = hits[0].instanceId;
      if (idx !== undefined && filteredEvents[idx]) {
        const event = filteredEvents[idx];
        setSelectedEvent(event);
        setSelectedEventId(event.id);
        // Fly to event
        const pos = latLngToVector3(event.lat, event.lng, 1);
        const flyPos = pos.clone().normalize().multiplyScalar(2.2);
        useGlobeStore.getState().setCameraTarget(flyPos);
      }
    }
  }, [raycaster, filteredEvents, setSelectedEvent, setSelectedEventId]);

  if (!visible || filteredEvents.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, filteredEvents.length]}
      onClick={handleClick}
    />
  );
}
