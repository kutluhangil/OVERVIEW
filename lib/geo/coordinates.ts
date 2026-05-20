import { Vector3 } from 'three';

export function latLngToVector3(
  lat: number,
  lng: number,
  radius = 1,
  altKm = 0
): Vector3 {
  const r = radius + altKm / 6371;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

export function vector3ToLatLng(v: Vector3, radius = 1): { lat: number; lng: number } {
  const normalized = v.clone().normalize();
  const lat = 90 - Math.acos(normalized.y) * (180 / Math.PI);
  const lng = (Math.atan2(normalized.z, -normalized.x) * (180 / Math.PI)) - 180;
  return { lat, lng };
}

export function latLngDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
