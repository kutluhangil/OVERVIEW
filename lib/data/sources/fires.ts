import { GeoEvent } from '@/lib/types';

export async function fetchFires(): Promise<GeoEvent[]> {
  try {
    const response = await fetch('/api/fires', {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error(`[fetchFires] API returned ${response.status}`);
      return [];
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      console.error('[fetchFires] Unexpected response shape');
      return [];
    }

    return data as GeoEvent[];
  } catch (error) {
    console.error('[fetchFires] error:', error);
    return [];
  }
}
