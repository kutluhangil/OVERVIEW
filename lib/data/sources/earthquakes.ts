import { GeoEvent } from '@/lib/types';

export async function fetchEarthquakes(): Promise<GeoEvent[]> {
  try {
    const response = await fetch('/api/earthquakes', {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error(`[fetchEarthquakes] API returned ${response.status}`);
      return [];
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      console.error('[fetchEarthquakes] Unexpected response shape');
      return [];
    }

    return data as GeoEvent[];
  } catch (error) {
    console.error('[fetchEarthquakes] error:', error);
    return [];
  }
}
