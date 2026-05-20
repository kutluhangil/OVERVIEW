'use client';

import { useMemo } from 'react';
import {
  BufferGeometry,
  LineBasicMaterial,
  Float32BufferAttribute,
  AdditiveBlending,
  Color,
  Line,
} from 'three';
import { greatCirclePoints } from '@/lib/geo/arc';
import { latLngToVector3 } from '@/lib/geo/coordinates';
import { GeoEvent } from '@/lib/types';

interface ArcLayerProps {
  events: GeoEvent[];
  color: string;
  opacity?: number;
  visible?: boolean;
}

export function ArcLayer({ events, color, opacity = 0.6, visible = true }: ArcLayerProps) {
  const lines = useMemo(() => {
    return events.slice(0, 200).map((event) => {
      // cables.ts stores the full coordinate array as meta.coordinates ([lng, lat] GeoJSON order)
      const coords = event.meta?.coordinates as number[][] | undefined;
      const hasFullPath = coords && coords.length >= 2;

      const points = hasFullPath
        ? coords.map((c) => latLngToVector3(
            typeof c[1] === 'number' ? c[1] : 0,
            typeof c[0] === 'number' ? c[0] : 0,
            1.001
          ))
        : (() => {
            const startLat = typeof event.meta?.startLat === 'number' ? event.meta.startLat : event.lat;
            const startLng = typeof event.meta?.startLng === 'number' ? event.meta.startLng : event.lng;
            const endLat   = typeof event.meta?.endLat   === 'number' ? event.meta.endLat   : event.lat;
            const endLng   = typeof event.meta?.endLng   === 'number' ? event.meta.endLng   : event.lng;
            return greatCirclePoints(startLat, startLng, endLat, endLng, 60, 1.001);
          })();

      if (points.length < 2) return null;

      const positions = new Float32Array(points.length * 3);
      points.forEach((p, i) => {
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
      });

      const geo = new BufferGeometry();
      geo.setAttribute('position', new Float32BufferAttribute(positions, 3));

      const mat = new LineBasicMaterial({
        color: new Color(color),
        transparent: true,
        opacity,
        blending: AdditiveBlending,
        depthWrite: false,
      });

      const line = new Line(geo, mat);
      return { line, id: event.id };
    }).filter(Boolean) as { line: Line; id: string }[];
  }, [events, color, opacity]);

  if (!visible) return null;

  return (
    <group>
      {lines.map((item) => (
        <primitive key={item.id} object={item.line} />
      ))}
    </group>
  );
}
