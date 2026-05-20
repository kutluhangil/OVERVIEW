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
      const route = event.meta?.route as [number, number][] | undefined;
      if (!route || route.length < 2) return null;

      const points = greatCirclePoints(
        route[0][1], route[0][0],
        route[route.length - 1][1], route[route.length - 1][0],
        60, 1.001
      );

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
