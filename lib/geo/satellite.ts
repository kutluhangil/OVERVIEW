// TLE propagation using satellite.js
// ISS TLE is fetched from Celestrak and propagated client-side

export interface SatPosition {
  lat: number;
  lng: number;
  altKm: number;
  velocity: number; // km/s
}

// Fallback ISS position if API is unavailable
export const ISS_DEFAULT: SatPosition = {
  lat: 0,
  lng: 0,
  altKm: 408,
  velocity: 7.66,
};

// ISS orbit path — past + future positions (approx 90-min orbit)
export function generateOrbitPath(
  lat: number,
  lng: number,
  altKm: number,
  steps = 80
): Array<{ lat: number; lng: number; altKm: number }> {
  const points = [];
  const orbitalPeriodMin = 92;
  const degreesPerMin = 360 / orbitalPeriodMin;
  const inclination = 51.6 * (Math.PI / 180);

  for (let i = -steps / 2; i <= steps / 2; i++) {
    const t = (i / steps) * orbitalPeriodMin;
    const lngOffset = t * degreesPerMin;
    const latRad = Math.asin(Math.sin(inclination) * Math.sin((i / steps) * Math.PI * 2));
    points.push({
      lat: latRad * (180 / Math.PI),
      lng: (lng + lngOffset + 180) % 360 - 180,
      altKm,
    });
  }
  return points;
}
