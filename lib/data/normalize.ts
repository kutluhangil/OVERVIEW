import { GeoEvent } from '@/lib/types';

// ─── Type guards ─────────────────────────────────────────────────────────────

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v);
}

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

// ─── Earthquakes ─────────────────────────────────────────────────────────────

interface USGSFeature {
  type: string;
  id: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: Record<string, unknown>;
}

interface USGSGeoJSON {
  type: string;
  features: USGSFeature[];
}

function isUSGSGeoJSON(data: unknown): data is USGSGeoJSON {
  return (
    isObject(data) &&
    data['type'] === 'FeatureCollection' &&
    isArray(data['features'])
  );
}

export function normalizeEarthquakes(geojson: unknown): GeoEvent[] {
  if (!isUSGSGeoJSON(geojson)) return [];

  const events: GeoEvent[] = [];

  for (const feature of geojson.features) {
    try {
      if (!isObject(feature)) continue;
      if (!isObject(feature.geometry)) continue;
      if (!isArray(feature.geometry.coordinates)) continue;

      const coords = feature.geometry.coordinates;
      const lng = coords[0];
      const lat = coords[1];
      const alt = coords[2];

      if (!isNumber(lat) || !isNumber(lng)) continue;

      const props = isObject(feature.properties) ? feature.properties : {};
      const mag = props['mag'];
      const time = props['time'];
      const place = props['place'];
      const id = isString(feature.id) && feature.id
        ? feature.id
        : `eq-${lat}-${lng}-${time}`;

      events.push({
        id,
        layer: 'earthquake',
        lat,
        lng,
        alt: isNumber(alt) ? alt : undefined,
        magnitude: isNumber(mag) ? mag : undefined,
        timestamp: isNumber(time) ? time : Date.now(),
        label: isString(place) ? place : `M${mag} earthquake`,
        meta: {
          depth: isNumber(alt) ? Math.abs(alt) : undefined,
          status: props['status'],
          type: props['type'],
          url: props['url'],
          felt: props['felt'],
          cdi: props['cdi'],
          mmi: props['mmi'],
          alert: props['alert'],
          tsunami: props['tsunami'],
        },
      });
    } catch {
      // skip malformed feature
    }
  }

  return events;
}

// ─── ISS ─────────────────────────────────────────────────────────────────────

interface ISSResponse {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  timestamp: number;
  name?: string;
}

function isISSResponse(data: unknown): data is ISSResponse {
  if (!isObject(data)) return false;
  return isNumber(data['latitude']) && isNumber(data['longitude']);
}

export function normalizeISS(data: unknown): GeoEvent {
  if (!isISSResponse(data)) {
    return {
      id: 'iss-25544',
      layer: 'iss',
      lat: 0,
      lng: 0,
      alt: 408,
      timestamp: Date.now(),
      label: 'ISS (position unknown)',
      meta: {},
    };
  }

  return {
    id: 'iss-25544',
    layer: 'iss',
    lat: data.latitude,
    lng: data.longitude,
    alt: isNumber(data.altitude) ? data.altitude : 408,
    magnitude: undefined,
    timestamp: isNumber(data.timestamp) ? data.timestamp * 1000 : Date.now(),
    label: 'International Space Station',
    meta: {
      velocity: isNumber(data.velocity) ? data.velocity : undefined,
      visibility: isString(data.visibility) ? data.visibility : undefined,
      altitude_km: isNumber(data.altitude) ? data.altitude : undefined,
    },
  };
}

// ─── Flights ─────────────────────────────────────────────────────────────────

// OpenSky states/all response
// Each state vector: [icao24, callsign, origin_country, time_position, last_contact,
//   longitude, latitude, baro_altitude, on_ground, velocity, true_track,
//   vertical_rate, sensors, geo_altitude, squawk, spi, position_source]

interface OpenSkyResponse {
  time: number;
  states: unknown[][] | null;
}

function isOpenSkyResponse(data: unknown): data is OpenSkyResponse {
  return (
    isObject(data) &&
    (data['states'] === null || isArray(data['states']))
  );
}

export function normalizeFlights(data: unknown): GeoEvent[] {
  if (!isOpenSkyResponse(data)) return [];
  if (!data.states) return [];

  const events: GeoEvent[] = [];
  const serverTime = isNumber(data.time) ? data.time * 1000 : Date.now();

  for (const state of data.states) {
    try {
      if (!isArray(state) || state.length < 17) continue;

      const icao24 = state[0];
      const callsign = state[1];
      const originCountry = state[2];
      const lng = state[5];
      const lat = state[6];
      const baroAlt = state[7];
      const onGround = state[8];
      const velocity = state[9];
      const trueTrack = state[10];
      const vertRate = state[11];
      const geoAlt = state[13];
      const squawk = state[14];

      // filter ground planes
      if (onGround === true) continue;

      // must have valid position
      if (!isNumber(lat) || !isNumber(lng)) continue;

      const id = isString(icao24) ? `flight-${icao24}` : `flight-${lat}-${lng}`;
      const label = isString(callsign) && callsign.trim()
        ? callsign.trim()
        : isString(icao24) ? icao24 : 'Unknown Flight';

      // altitude as 0-1 percentage of max commercial altitude (~13000m)
      const altMeters = isNumber(geoAlt) ? geoAlt : isNumber(baroAlt) ? baroAlt : 0;
      const altPercent = Math.min(1, Math.max(0, altMeters / 13000));

      events.push({
        id,
        layer: 'flight',
        lat,
        lng,
        alt: isNumber(altMeters) ? altMeters : undefined,
        magnitude: altPercent,
        timestamp: serverTime,
        label,
        meta: {
          icao24: isString(icao24) ? icao24 : undefined,
          callsign: isString(callsign) ? callsign.trim() : undefined,
          origin_country: isString(originCountry) ? originCountry : undefined,
          velocity_ms: isNumber(velocity) ? velocity : undefined,
          heading: isNumber(trueTrack) ? trueTrack : undefined,
          vertical_rate: isNumber(vertRate) ? vertRate : undefined,
          baro_altitude: isNumber(baroAlt) ? baroAlt : undefined,
          geo_altitude: isNumber(geoAlt) ? geoAlt : undefined,
          squawk: isString(squawk) ? squawk : undefined,
        },
      });
    } catch {
      // skip malformed state
    }
  }

  return events;
}

// ─── Fires ───────────────────────────────────────────────────────────────────

// FIRMS CSV columns (MODIS_SP):
// latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,
// confidence,version,bright_t31,frp,daynight

export function normalizeFires(csvText: string): GeoEvent[] {
  if (!csvText || typeof csvText !== 'string') return [];

  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header to find column indices dynamically
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const latIdx = idx('latitude');
  const lngIdx = idx('longitude');
  const brightnessIdx = idx('brightness');
  const frpIdx = idx('frp');
  const acqDateIdx = idx('acq_date');
  const acqTimeIdx = idx('acq_time');
  const satelliteIdx = idx('satellite');
  const confidenceIdx = idx('confidence');
  const daynightIdx = idx('daynight');

  if (latIdx === -1 || lngIdx === -1) return [];

  const events: GeoEvent[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',');

      const lat = parseFloat(cols[latIdx]);
      const lng = parseFloat(cols[lngIdx]);

      if (!isFinite(lat) || !isFinite(lng)) continue;

      const brightness = brightnessIdx !== -1 ? parseFloat(cols[brightnessIdx]) : NaN;
      const frp = frpIdx !== -1 ? parseFloat(cols[frpIdx]) : NaN;
      const acqDate = acqDateIdx !== -1 ? cols[acqDateIdx]?.trim() : '';
      const acqTime = acqTimeIdx !== -1 ? cols[acqTimeIdx]?.trim() : '';
      const satellite = satelliteIdx !== -1 ? cols[satelliteIdx]?.trim() : '';
      const confidence = confidenceIdx !== -1 ? cols[confidenceIdx]?.trim() : '';
      const daynight = daynightIdx !== -1 ? cols[daynightIdx]?.trim() : '';

      // Build timestamp from acq_date + acq_time
      let timestamp = Date.now();
      if (acqDate && acqTime) {
        const hhmm = acqTime.padStart(4, '0');
        const dateStr = `${acqDate}T${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}:00Z`;
        const parsed = Date.parse(dateStr);
        if (isFinite(parsed)) timestamp = parsed;
      }

      // Stable id from coordinates + date
      const id = `fire-${lat.toFixed(4)}-${lng.toFixed(4)}-${acqDate ?? i}`;

      // magnitude: FRP (fire radiative power) normalized 0-1 (max ~2000 MW)
      const magnitude = isFinite(frp) ? Math.min(1, frp / 2000) : 0.1;

      events.push({
        id,
        layer: 'fire',
        lat,
        lng,
        magnitude,
        timestamp,
        label: `Fire (${confidence ?? 'unknown'} confidence)`,
        meta: {
          brightness: isFinite(brightness) ? brightness : undefined,
          frp: isFinite(frp) ? frp : undefined,
          satellite,
          confidence,
          daynight,
          acq_date: acqDate,
          acq_time: acqTime,
        },
      });
    } catch {
      // skip malformed line
    }
  }

  return events;
}

// ─── Aurora ──────────────────────────────────────────────────────────────────

// NOAA Ovation Aurora JSON: array of [lon, lat, aurora_value (0-100)]

interface OvationAurora {
  'Forecast Time'?: string;
  'Observation Time'?: string;
  coordinates: unknown[][];
}

function isOvationAurora(data: unknown): data is OvationAurora {
  return (
    isObject(data) &&
    isArray(data['coordinates'])
  );
}

export function normalizeAurora(data: unknown): GeoEvent[] {
  if (!isOvationAurora(data)) return [];

  const forecastTime = isString(data['Forecast Time'])
    ? data['Forecast Time']
    : undefined;
  const baseTimestamp = forecastTime
    ? Date.parse(forecastTime)
    : Date.now();
  const timestamp = isFinite(baseTimestamp) ? baseTimestamp : Date.now();

  const events: GeoEvent[] = [];
  const AURORA_THRESHOLD = 5; // only include cells with aurora probability >= 5%

  for (const coord of data.coordinates) {
    try {
      if (!isArray(coord) || coord.length < 3) continue;

      const lon = coord[0];
      const lat = coord[1];
      const value = coord[2];

      if (!isNumber(lon) || !isNumber(lat) || !isNumber(value)) continue;
      if (value < AURORA_THRESHOLD) continue;

      // Normalize: convert -180..180 lon to lng
      const id = `aurora-${lon.toFixed(2)}-${lat.toFixed(2)}`;

      events.push({
        id,
        layer: 'aurora',
        lat,
        lng: lon,
        magnitude: value / 100, // 0-1
        timestamp,
        label: `Aurora (${value.toFixed(0)}%)`,
        meta: {
          probability: value,
          forecast_time: forecastTime,
        },
      });
    } catch {
      // skip
    }
  }

  return events;
}
