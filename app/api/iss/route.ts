import { NextResponse } from 'next/server';
import { normalizeISS } from '@/lib/data/normalize';

export const dynamic = 'force-dynamic';
export const revalidate = 5;

export async function GET(): Promise<NextResponse> {
  try {
    const response = await fetch(
      'https://api.wheretheiss.at/v1/satellites/25544',
      {
        next: { revalidate: 5 },
        headers: { 'Accept': 'application/json' },
      }
    );

    if (!response.ok) {
      console.error(`[iss] wheretheiss.at returned ${response.status}`);
      const fallback = normalizeISS(null);
      return NextResponse.json(fallback, {
        headers: { 'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10' },
      });
    }

    const data: unknown = await response.json();
    const event = normalizeISS(data);

    return NextResponse.json(event, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    console.error('[iss] fetch error:', error);
    const fallback = normalizeISS(null);
    return NextResponse.json(fallback, {
      headers: { 'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10' },
    });
  }
}
