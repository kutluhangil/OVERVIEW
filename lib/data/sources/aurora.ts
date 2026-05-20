import { GeoEvent } from '@/lib/types';
import { normalizeAurora } from '@/lib/data/normalize';

interface AuroraAPIResponse {
  grid: number[][];
  forecastTime: string | null;
  observationTime: string | null;
}

function isAuroraAPIResponse(data: unknown): data is AuroraAPIResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    'grid' in data &&
    Array.isArray((data as AuroraAPIResponse).grid)
  );
}

export async function fetchAurora(): Promise<{ grid: number[][]; events: GeoEvent[] }> {
  const empty = { grid: [], events: [] };

  try {
    const response = await fetch('/api/aurora', {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error(`[fetchAurora] API returned ${response.status}`);
      return empty;
    }

    const data: unknown = await response.json();

    if (!isAuroraAPIResponse(data)) {
      console.error('[fetchAurora] Unexpected response shape');
      return empty;
    }

    // Re-shape into the format normalizeAurora expects (raw NOAA shape)
    const forecastTime = data.forecastTime;
    const rawShape = {
      'Forecast Time': forecastTime ?? '',
      'Observation Time': data.observationTime ?? '',
      coordinates: data.grid,
    };

    const events = normalizeAurora(rawShape);

    return { grid: data.grid, events };
  } catch (error) {
    console.error('[fetchAurora] error:', error);
    return empty;
  }
}
