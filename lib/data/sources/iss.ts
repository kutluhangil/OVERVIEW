import { GeoEvent } from '@/lib/types';

const ISS_FALLBACK: GeoEvent = {
  id: 'iss-25544',
  layer: 'iss',
  lat: 0,
  lng: 0,
  alt: 408,
  timestamp: Date.now(),
  label: 'ISS (position unknown)',
  meta: {},
};

export async function fetchISS(): Promise<GeoEvent> {
  try {
    const response = await fetch('/api/iss', {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error(`[fetchISS] API returned ${response.status}`);
      return { ...ISS_FALLBACK, timestamp: Date.now() };
    }

    const data: unknown = await response.json();

    if (
      typeof data !== 'object' ||
      data === null ||
      Array.isArray(data) ||
      !('id' in data) ||
      !('lat' in data) ||
      !('lng' in data)
    ) {
      console.error('[fetchISS] Unexpected response shape');
      return { ...ISS_FALLBACK, timestamp: Date.now() };
    }

    return data as GeoEvent;
  } catch (error) {
    console.error('[fetchISS] error:', error);
    return { ...ISS_FALLBACK, timestamp: Date.now() };
  }
}
