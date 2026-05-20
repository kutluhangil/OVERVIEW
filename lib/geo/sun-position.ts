import { Vector3 } from 'three';

export interface SunPosition {
  /** Subsolar latitude in degrees (-23.45 to 23.45) */
  lat: number;
  /** Subsolar longitude in degrees (-180 to 180) */
  lng: number;
  /** Unit vector pointing FROM Earth center TOWARD the Sun in world space.
   *  In our scene +Y is North Pole, the globe sits at origin. */
  direction: Vector3;
}

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

/**
 * Calculate the subsolar point and sun direction vector for a given UTC timestamp.
 *
 * Algorithm:
 *  1. Julian Day Number → fractional Julian century T
 *  2. Geometric mean longitude + anomaly → ecliptic longitude
 *  3. Obliquity of ecliptic → declination (subsolar latitude)
 *  4. Greenwich Hour Angle → subsolar longitude
 *
 * Accuracy: ±0.01° (more than sufficient for real-time rendering).
 */
export function getSunPosition(timestampMs: number = Date.now()): SunPosition {
  // Julian Day Number (JDN) from Unix timestamp
  const JD = timestampMs / 86_400_000 + 2_440_587.5;

  // Julian century since J2000.0
  const T = (JD - 2_451_545.0) / 36_525.0;

  // Geometric mean longitude of the sun (degrees, mod 360)
  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;

  // Geometric mean anomaly of the sun (degrees)
  const M = 357.52911 + T * (35999.05029 - T * 0.0001537);

  // Equation of the center
  const C =
    Math.sin(M * DEG) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(2 * M * DEG) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * M * DEG) * 0.000289;

  // Sun's true longitude (degrees)
  const sunLon = L0 + C;

  // Sun's apparent longitude – correct for aberration and nutation
  const omega = 125.04 - 1934.136 * T;
  const lambda = sunLon - 0.00569 - 0.00478 * Math.sin(omega * DEG);

  // Obliquity of the ecliptic
  const epsilon0 = 23.439291111 - T * (0.013004167 + T * (0.0000001639 - T * 0.0000005036));
  const epsilon = epsilon0 + 0.00256 * Math.cos(omega * DEG);

  // Declination (subsolar latitude)
  const sinDec = Math.sin(epsilon * DEG) * Math.sin(lambda * DEG);
  const decRad = Math.asin(sinDec);
  const lat = decRad * RAD;

  // Right ascension
  const raRad = Math.atan2(
    Math.cos(epsilon * DEG) * Math.sin(lambda * DEG),
    Math.cos(lambda * DEG)
  );

  // Greenwich Mean Sidereal Time (degrees)
  // JD at 0h UTC today
  const JD0 = Math.floor(JD - 0.5) + 0.5;
  const T0 = (JD0 - 2_451_545.0) / 36_525.0;
  const GMST0 =
    100.4606184 + 36000.77004 * T0 + 0.000387933 * T0 * T0 - T0 * T0 * T0 / 38710000;

  // Hours since 0h UTC
  const UT = ((timestampMs % 86_400_000) / 3_600_000);
  const GMST = ((GMST0 + 360.98564724 * (UT / 24)) % 360 + 360) % 360;

  // Greenwich Hour Angle of the Sun (degrees)
  const GHA = ((GMST - raRad * RAD) % 360 + 360) % 360;

  // Subsolar longitude: west is positive in GHA, convert to –180..180
  let lng = -GHA;
  if (lng < -180) lng += 360;
  if (lng > 180) lng -= 360;

  // Convert subsolar point to a unit direction vector.
  // In Three.js scene: X = right, Y = up (North Pole), Z = toward viewer.
  // Latitude 0°, Longitude 0° maps to (0, 0, 1) after globe identity rotation.
  // The globe mesh itself may rotate; we keep this in unrotated "geographic" frame.
  const cosLat = Math.cos(lat * DEG);
  const direction = new Vector3(
    cosLat * Math.sin(lng * DEG),
    Math.sin(lat * DEG),
    cosLat * Math.cos(lng * DEG)
  ).normalize();

  return { lat, lng, direction };
}
