import { create } from 'zustand';
import { GeoEvent, LayerType } from '@/lib/types';

interface DataState {
  events: Record<LayerType, GeoEvent[]>;
  addEvents: (layer: LayerType, events: GeoEvent[]) => void;
  replaceEvents: (layer: LayerType, events: GeoEvent[]) => void;
  clearLayer: (layer: LayerType) => void;
  getLayerEvents: (layer: LayerType) => GeoEvent[];
  getEventById: (id: string) => GeoEvent | undefined;
  getAllEvents: () => GeoEvent[];
  auroraData: number[][] | null;
  setAuroraData: (data: number[][]) => void;
}

const emptyEvents = (): Record<LayerType, GeoEvent[]> => ({
  earthquake: [],
  iss: [],
  flight: [],
  fire: [],
  aurora: [],
  ship: [],
  cable: [],
  volcano: [],
  custom: [],
});

export const useDataStore = create<DataState>((set, get) => ({
  events: emptyEvents(),
  auroraData: null,
  addEvents: (layer, newEvents) =>
    set((state) => {
      const existing = state.events[layer];
      const ids = new Set(existing.map((e) => e.id));
      const merged = [
        ...existing,
        ...newEvents.filter((e) => !ids.has(e.id)),
      ];
      return { events: { ...state.events, [layer]: merged } };
    }),
  replaceEvents: (layer, events) =>
    set((state) => ({ events: { ...state.events, [layer]: events } })),
  clearLayer: (layer) =>
    set((state) => ({ events: { ...state.events, [layer]: [] } })),
  getLayerEvents: (layer) => get().events[layer] || [],
  getEventById: (id) => {
    const all = get().getAllEvents();
    return all.find((e) => e.id === id);
  },
  getAllEvents: () => {
    const all = get().events;
    return Object.values(all).flat();
  },
  setAuroraData: (data) => set({ auroraData: data }),
}));
