import { Vector3 } from 'three';
import { latLngToVector3 } from './coordinates';

export function greatCirclePoints(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  numPoints = 60,
  radius = 1
): Vector3[] {
  const start = latLngToVector3(lat1, lng1, radius);
  const end = latLngToVector3(lat2, lng2, radius);

  const angle = start.angleTo(end);
  const arcHeight = radius * 0.3 * (angle / Math.PI) + 0.02;

  const points: Vector3[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const p = new Vector3().lerpVectors(start, end, t).normalize();
    // parabolic lift
    const lift = Math.sin(t * Math.PI) * arcHeight;
    p.multiplyScalar(radius + lift);
    points.push(p);
  }
  return points;
}
