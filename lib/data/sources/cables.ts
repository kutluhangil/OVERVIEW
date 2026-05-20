import { GeoEvent } from '@/lib/types';

// GeoJSON types for cables
interface GeoJSONLineString {
  type: 'LineString';
  coordinates: number[][];
}

interface GeoJSONFeature {
  type: 'Feature';
  id?: string | number;
  geometry: GeoJSONLineString | { type: string; coordinates: unknown };
  properties: Record<string, unknown> | null;
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isFeatureCollection(data: unknown): data is GeoJSONFeatureCollection {
  return (
    isObject(data) &&
    data['type'] === 'FeatureCollection' &&
    Array.isArray(data['features'])
  );
}

function isLineString(geom: unknown): geom is GeoJSONLineString {
  return (
    isObject(geom) &&
    geom['type'] === 'LineString' &&
    Array.isArray(geom['coordinates'])
  );
}

/**
 * Convert a LineString feature into a series of arc GeoEvents.
 * Each arc event uses the midpoint of the LineString as its position,
 * and embeds the full coordinate array in meta for the arc renderer.
 */
function featureToArcEvents(
  feature: GeoJSONFeature,
  index: number
): GeoEvent[] {
  if (!isLineString(feature.geometry)) return [];

  const coords = feature.geometry.coordinates;
  if (coords.length < 2) return [];

  const props = feature.properties ?? {};
  const name = typeof props['name'] === 'string'
    ? props['name']
    : typeof props['cable_name'] === 'string'
      ? props['cable_name']
      : `Cable ${index + 1}`;

  const featureId = feature.id != null
    ? String(feature.id)
    : `cable-${index}`;

  // Midpoint of the line for the primary event position
  const midIdx = Math.floor(coords.length / 2);
  const midCoord = coords[midIdx];
  const lat = typeof midCoord[1] === 'number' ? midCoord[1] : 0;
  const lng = typeof midCoord[0] === 'number' ? midCoord[0] : 0;

  // For arc rendering: start and end coordinates
  const start = coords[0];
  const end = coords[coords.length - 1];

  return [
    {
      id: `cable-${featureId}`,
      layer: 'cable',
      lat,
      lng,
      timestamp: 0, // static data
      label: name,
      meta: {
        name,
        coordinates: coords,
        startLat: typeof start[1] === 'number' ? start[1] : 0,
        startLng: typeof start[0] === 'number' ? start[0] : 0,
        endLat: typeof end[1] === 'number' ? end[1] : 0,
        endLng: typeof end[0] === 'number' ? end[0] : 0,
        segmentCount: coords.length,
        length_km: props['length_km'],
        owners: props['owners'],
        rfs: props['rfs'],
      },
    },
  ];
}

export async function fetchCables(): Promise<GeoEvent[]> {
  try {
    const response = await fetch('/content/cables.geojson', {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error(`[fetchCables] Failed to load cables.geojson: ${response.status}`);
      return [];
    }

    const data: unknown = await response.json();

    if (!isFeatureCollection(data)) {
      console.error('[fetchCables] cables.geojson is not a valid FeatureCollection');
      return [];
    }

    const events: GeoEvent[] = [];
    for (let i = 0; i < data.features.length; i++) {
      const feature = data.features[i];
      if (!isObject(feature)) continue;
      const arcEvents = featureToArcEvents(feature as GeoJSONFeature, i);
      events.push(...arcEvents);
    }

    return events;
  } catch (error) {
    console.error('[fetchCables] error:', error);
    return [];
  }
}
