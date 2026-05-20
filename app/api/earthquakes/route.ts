import { NextResponse } from 'next/server';
import { normalizeEarthquakes } from '@/lib/data/normalize';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(): Promise<NextResponse> {
  try {
    const starttime = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('.')[0];

    const url = new URL('https://earthquake.usgs.gov/fdsnws/event/1/query');
    url.searchParams.set('format', 'geojson');
    url.searchParams.set('minmagnitude', '2.0');
    url.searchParams.set('orderby', 'time');
    url.searchParams.set('limit', '500');
    url.searchParams.set('starttime', starttime);

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 },
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error(`[earthquakes] USGS returned ${response.status}`);
      return NextResponse.json([], {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      });
    }

    const geojson: unknown = await response.json();
    const events = normalizeEarthquakes(geojson);

    return NextResponse.json(events, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('[earthquakes] fetch error:', error);
    return NextResponse.json([], {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  }
}
