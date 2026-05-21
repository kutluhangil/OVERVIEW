import { GeoEvent } from '@/lib/types';
import { useDataStore } from '@/store/useDataStore';
import { useUIStore } from '@/store/useUIStore';

let lastNarrateTime = 0;
const NARRATE_INTERVAL = 30000;

function buildContext() {
  const store = useDataStore.getState();
  const now = Date.now();
  const allEvents = store.getAllEvents();
  const recentEvents = allEvents
    .filter((e) => e.timestamp > 0 && now - e.timestamp < 3600000)
    .map((e) => ({
      layer: e.layer,
      label: e.label,
      magnitude: e.magnitude,
      timestamp: e.timestamp,
    }));
  const issEvents = store.getLayerEvents('iss');
  const issPosition = issEvents[0]
    ? { lat: issEvents[0].lat, lng: issEvents[0].lng, alt: issEvents[0].alt }
    : undefined;
  return { recentEvents, issPosition };
}

export async function triggerNarration() {
  const now = Date.now();
  if (now - lastNarrateTime < NARRATE_INTERVAL) return;
  lastNarrateTime = now;

  try {
    const { recentEvents, issPosition } = buildContext();
    const res = await fetch('/api/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: recentEvents, issPosition }),
    });
    const data = (await res.json()) as { text: string };
    if (data.text) useUIStore.getState().setNarration(data.text);
  } catch {
    // Silent fail
  }
}

export async function askGlobe(question: string): Promise<string> {
  try {
    const { recentEvents, issPosition } = buildContext();
    const res = await fetch('/api/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: recentEvents, issPosition, question }),
    });
    const data = (await res.json()) as { text: string };
    return data.text || 'The planet has no answer right now.';
  } catch {
    return 'Unable to reach the planet at this moment.';
  }
}
