import { NextResponse } from 'next/server';
import { normalizeFires } from '@/lib/data/normalize';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET(): Promise<NextResponse> {
  const cacheHeaders = {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
  };

  const apiKey = process.env['NASA_FIRMS_API_KEY'];

  if (!apiKey) {
    console.warn('[fires] NASA_FIRMS_API_KEY not set — returning empty array');
    return NextResponse.json([], { headers: cacheHeaders });
  }

  try {
    // Area request: -180,-90,180,90 = global, last 1 day
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/MODIS_SP/-180,-90,180,90/1`;

    const response = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { 'Accept': 'text/csv, text/plain' },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(`[fires] NASA FIRMS returned ${response.status}: ${body.slice(0, 200)}`);
      return NextResponse.json([], { headers: cacheHeaders });
    }

    const csvText = await response.text();
    const events = normalizeFires(csvText);

    return NextResponse.json(events, { headers: cacheHeaders });
  } catch (error) {
    console.error('[fires] fetch error:', error);
    return NextResponse.json([], { headers: cacheHeaders });
  }
}
