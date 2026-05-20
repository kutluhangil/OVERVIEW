import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

interface AuroraResponse {
  grid: number[][];
  forecastTime: string | null;
  observationTime: string | null;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function extractGrid(data: unknown): number[][] {
  if (!isObject(data)) return [];
  const coords = data['coordinates'];
  if (!isArray(coords)) return [];

  const grid: number[][] = [];
  for (const item of coords) {
    if (!isArray(item) || item.length < 3) continue;
    const lon = item[0];
    const lat = item[1];
    const val = item[2];
    if (
      typeof lon === 'number' &&
      typeof lat === 'number' &&
      typeof val === 'number' &&
      isFinite(lon) &&
      isFinite(lat) &&
      isFinite(val)
    ) {
      grid.push([lon, lat, val]);
    }
  }
  return grid;
}

export async function GET(): Promise<NextResponse> {
  const cacheHeaders = {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  };

  try {
    const response = await fetch(
      'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json',
      {
        next: { revalidate: 300 },
        headers: { 'Accept': 'application/json' },
      }
    );

    if (!response.ok) {
      console.error(`[aurora] NOAA returned ${response.status}`);
      const empty: AuroraResponse = { grid: [], forecastTime: null, observationTime: null };
      return NextResponse.json(empty, { headers: cacheHeaders });
    }

    const data: unknown = await response.json();

    const grid = extractGrid(data);
    const forecastTime = isObject(data) && isString(data['Forecast Time'])
      ? data['Forecast Time']
      : null;
    const observationTime = isObject(data) && isString(data['Observation Time'])
      ? data['Observation Time']
      : null;

    const result: AuroraResponse = { grid, forecastTime, observationTime };

    return NextResponse.json(result, { headers: cacheHeaders });
  } catch (error) {
    console.error('[aurora] fetch error:', error);
    const empty: AuroraResponse = { grid: [], forecastTime: null, observationTime: null };
    return NextResponse.json(empty, { headers: cacheHeaders });
  }
}
