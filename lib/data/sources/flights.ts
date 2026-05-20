import { GeoEvent } from '@/lib/types';

export async function fetchFlights(): Promise<GeoEvent[]> {
  try {
    const response = await fetch('/api/flights', {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error(`[fetchFlights] API returned ${response.status}`);
      return [];
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      console.error('[fetchFlights] Unexpected response shape');
      return [];
    }

    return data as GeoEvent[];
  } catch (error) {
    console.error('[fetchFlights] error:', error);
    return [];
  }
}
