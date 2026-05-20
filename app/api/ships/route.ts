import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

/**
 * Ships endpoint — polling fallback.
 *
 * AIS (Automatic Identification System) data requires either:
 * 1. A commercial provider subscription (MarineTraffic, AISHub, VesselFinder)
 * 2. A WebSocket connection to an AIS aggregator (aisstream.io) — handled client-side
 *
 * This REST endpoint returns an empty array with metadata so the client
 * can detect availability and fall back to client-side WebSocket.
 * When a provider key is configured via AIS_API_KEY env var, this
 * endpoint can be wired to a REST provider.
 */

interface ShipsResponse {
  events: [];
  note: string;
  websocketAvailable: boolean;
  source: string | null;
}

export async function GET(): Promise<NextResponse> {
  const cacheHeaders = {
    'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20',
  };

  // Check for future REST provider key
  const apiKey = process.env['AIS_API_KEY'];

  if (apiKey) {
    // Placeholder: wire to provider here when a key is supplied
    console.info('[ships] AIS_API_KEY found but REST provider not yet configured');
  }

  const result: ShipsResponse = {
    events: [],
    note: 'AIS ship tracking uses client-side WebSocket (aisstream.io). This REST endpoint is a polling fallback — ships data is populated via useAISStream hook.',
    websocketAvailable: true,
    source: apiKey ? 'configured' : null,
  };

  return NextResponse.json(result, { headers: cacheHeaders });
}
