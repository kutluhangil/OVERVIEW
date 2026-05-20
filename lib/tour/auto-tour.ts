import { useGlobeStore } from '@/store/useGlobeStore';
import { useDataStore } from '@/store/useDataStore';
import { useUIStore } from '@/store/useUIStore';
import { latLngToVector3 } from '@/lib/geo/coordinates';
import { triggerNarration } from '@/lib/ai/narrate';

let tourTimeout: ReturnType<typeof setTimeout> | null = null;
let tourActive = false;

function getInterestingEvents() {
  const store = useDataStore.getState();
  const quakes = store.getLayerEvents('earthquake')
    .sort((a, b) => (b.magnitude ?? 0) - (a.magnitude ?? 0))
    .slice(0, 3);
  const iss = store.getLayerEvents('iss').slice(0, 1);
  const fires = store.getLayerEvents('fire').slice(0, 2);
  return [...quakes, ...iss, ...fires];
}

function tourStep(events: ReturnType<typeof getInterestingEvents>, index: number) {
  if (!tourActive || events.length === 0) return;

  const event = events[index % events.length];
  const pos = latLngToVector3(event.lat, event.lng, 1);
  const camPos = pos.clone().normalize().multiplyScalar(2.2);

  useGlobeStore.getState().setCameraTarget(camPos);
  useUIStore.getState().setSelectedEvent(event);
  triggerNarration();

  tourTimeout = setTimeout(() => {
    if (tourActive) tourStep(events, index + 1);
  }, 5000);
}

export function startAutoTour() {
  tourActive = true;
  useGlobeStore.getState().setAutoTour(true);
  const events = getInterestingEvents();
  tourStep(events, 0);
}

export function stopAutoTour() {
  tourActive = false;
  if (tourTimeout) clearTimeout(tourTimeout);
  useGlobeStore.getState().setAutoTour(false);
  useUIStore.getState().setSelectedEvent(null);
}

export function toggleAutoTour() {
  if (tourActive) stopAutoTour();
  else startAutoTour();
}
