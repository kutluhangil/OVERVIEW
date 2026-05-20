import { NextResponse } from 'next/server';
import { normalizeFlights } from '@/lib/data/normalize';

export const dynamic = 'force-dynamic';
export const revalidate = 15;

export async function GET(): Promise<NextResponse> {
  try {
    const username = process.env['OPENSKY_USERNAME'];
    const password = process.env['OPENSKY_PASSWORD'];

    const url = 'https://opensky-network.org/api/states/all';

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (username && password) {
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const response = await fetch(url, {
      next: { revalidate: 15 },
      headers,
    });

    if (!response.ok) {
      console.error(`[flights] OpenSky returned ${response.status}`);
      return NextResponse.json([], {
        headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' },
      });
    }

    const data: unknown = await response.json();

    // Limit to 500 flights after filtering
    const all = normalizeFlights(data);
    const limited = all.slice(0, 500);

    return NextResponse.json(limited, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('[flights] fetch error:', error);
    return NextResponse.json([], {
      headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' },
    });
  }
}
