import { GeoEvent, LayerType } from '@/lib/types';

export interface CSVRow {
  lat: number;
  lng: number;
  label: string;
  value?: number;
  [key: string]: string | number | undefined;
}

export function parseCSV(text: string): CSVRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const latIdx = headers.findIndex((h) => h === 'lat' || h === 'latitude');
  const lngIdx = headers.findIndex((h) => h === 'lng' || h === 'lon' || h === 'longitude');
  const labelIdx = headers.findIndex((h) => h === 'label' || h === 'name' || h === 'title');
  const valueIdx = headers.findIndex((h) => h === 'value' || h === 'magnitude' || h === 'intensity');

  if (latIdx === -1 || lngIdx === -1) {
    throw new Error('CSV must have lat and lng (or latitude/longitude) columns');
  }

  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const lat = parseFloat(cols[latIdx]);
    const lng = parseFloat(cols[lngIdx]);
    if (isNaN(lat) || isNaN(lng)) continue;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;

    rows.push({
      lat,
      lng,
      label: labelIdx >= 0 ? cols[labelIdx]?.trim() || `Point ${i}` : `Point ${i}`,
      value: valueIdx >= 0 ? parseFloat(cols[valueIdx]) || undefined : undefined,
    });
  }

  return rows;
}

export function csvRowsToGeoEvents(rows: CSVRow[]): GeoEvent[] {
  return rows.map((row, i) => ({
    id: `custom-${i}-${row.lat}-${row.lng}`,
    layer: 'custom' as LayerType,
    lat: row.lat,
    lng: row.lng,
    magnitude: row.value,
    timestamp: Date.now(),
    label: row.label,
    meta: {},
  }));
}
