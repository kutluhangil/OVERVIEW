export type LayerType =
  | 'earthquake'
  | 'iss'
  | 'flight'
  | 'fire'
  | 'aurora'
  | 'ship'
  | 'cable'
  | 'volcano'
  | 'custom';

export interface GeoEvent {
  id: string;
  layer: LayerType;
  lat: number;
  lng: number;
  alt?: number;
  magnitude?: number;
  timestamp: number;
  label: string;
  meta: Record<string, unknown>;
}

export interface LayerConfig {
  type: LayerType;
  name: string;
  color: string;
  enabled: boolean;
  opacity: number;
  pointSize: number;
  filter?: { field: string; min?: number; max?: number };
  renderType: 'point' | 'arc' | 'ring' | 'satellite' | 'overlay';
  pollInterval?: number;
}

export const LAYER_CONFIGS: LayerConfig[] = [
  {
    type: 'earthquake',
    name: 'Earthquakes',
    color: '#ff5a5f',
    enabled: true,
    opacity: 1,
    pointSize: 1,
    filter: { field: 'magnitude', min: 2.5 },
    renderType: 'point',
    pollInterval: 60000,
  },
  {
    type: 'iss',
    name: 'ISS',
    color: '#ffd93d',
    enabled: true,
    opacity: 1,
    pointSize: 1.5,
    renderType: 'satellite',
    pollInterval: 5000,
  },
  {
    type: 'flight',
    name: 'Flights',
    color: '#5eead4',
    enabled: false,
    opacity: 0.8,
    pointSize: 0.5,
    renderType: 'point',
    pollInterval: 15000,
  },
  {
    type: 'fire',
    name: 'Wildfires',
    color: '#ff7847',
    enabled: false,
    opacity: 1,
    pointSize: 1,
    renderType: 'point',
    pollInterval: 3600000,
  },
  {
    type: 'aurora',
    name: 'Aurora',
    color: '#a78bfa',
    enabled: false,
    opacity: 0.7,
    pointSize: 1,
    renderType: 'overlay',
    pollInterval: 300000,
  },
  {
    type: 'ship',
    name: 'Ships',
    color: '#60a5fa',
    enabled: false,
    opacity: 0.8,
    pointSize: 0.5,
    renderType: 'point',
    pollInterval: 10000,
  },
  {
    type: 'cable',
    name: 'Submarine Cables',
    color: '#34d399',
    enabled: false,
    opacity: 0.6,
    pointSize: 1,
    renderType: 'arc',
  },
  {
    type: 'volcano',
    name: 'Volcanoes',
    color: '#f472b6',
    enabled: false,
    opacity: 1,
    pointSize: 1,
    renderType: 'point',
  },
];
