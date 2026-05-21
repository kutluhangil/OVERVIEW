'use client';

import { useEffect, useRef, useCallback } from 'react';
import { GeoEvent } from '@/lib/types';
import { normalizeEarthquakes } from '@/lib/data/normalize';
import { useTimeStore } from '@/store/useTimeStore';
import { useDataStore } from '@/store/useDataStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRUNE_INTERVAL_MS = 10 * 60 * 1000; // prune every 10 minutes
const USGS_ALL_DAY_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
const USGS_ALL_WEEK_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HistoryBuffer {
  /** Add one or more events to the ring buffer */
  addEvents: (events: GeoEvent[]) => void;
  /** Query events whose timestamp falls within [start, end] (ms epoch) */
  getEventsInRange: (start: number, end: number) => GeoEvent[];
  /** Total number of events currently in the buffer */
  size: () => number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useHistoryBuffer
 *
 * Maintains a 24h+ ring buffer of GeoEvents keyed by id.
 * On mount, loads the previous 24h of earthquake data from USGS.
 * Auto-prunes events older than 25h.
 */
export function useHistoryBuffer(): HistoryBuffer {
  const bufferRef = useRef<Map<string, GeoEvent>>(new Map());
  const pruneTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadedWindowRef = useRef<number>(0); // tracks which windowHours dataset is loaded
  const windowHours = useTimeStore((s) => s.windowHours);

  // ── Add events (deduplicates by id) ────────────────────────────────────────
  const addEvents = useCallback((events: GeoEvent[]) => {
    const buf = bufferRef.current;
    for (const event of events) {
      buf.set(event.id, event);
    }
  }, []);

  // ── Get events in time range ────────────────────────────────────────────────
  const getEventsInRange = useCallback(
    (start: number, end: number): GeoEvent[] => {
      const result: GeoEvent[] = [];
      for (const event of bufferRef.current.values()) {
        if (event.timestamp >= start && event.timestamp <= end) {
          result.push(event);
        }
      }
      return result;
    },
    []
  );

  // ── Size query ──────────────────────────────────────────────────────────────
  const size = useCallback(() => bufferRef.current.size, []);

  // ── Prune old events ────────────────────────────────────────────────────────
  const pruneOldEvents = useCallback(() => {
    const maxAgeMs = (loadedWindowRef.current + 1) * 60 * 60 * 1000;
    const cutoff = Date.now() - maxAgeMs;
    const buf = bufferRef.current;
    for (const [id, event] of buf.entries()) {
      if (event.timestamp > 0 && event.timestamp < cutoff) {
        buf.delete(id);
      }
    }
  }, []);

  // ── Load earthquake history — re-runs when windowHours changes ─────────────
  useEffect(() => {
    // Don't reload if same window is already loaded
    if (loadedWindowRef.current === windowHours) return;

    let cancelled = false;
    const url = windowHours >= 168 ? USGS_ALL_WEEK_URL : USGS_ALL_DAY_URL;

    async function loadHistory() {
      try {
        const response = await fetch(url, {
          headers: { 'Accept': 'application/json' },
        });
        if (!response.ok) return;

        const geojson: unknown = await response.json();
        const events = normalizeEarthquakes(geojson);

        if (!cancelled) {
          addEvents(events);
          // Also push into the data store so existing layers update immediately
          useDataStore.getState().addEvents('earthquake', events);
          loadedWindowRef.current = windowHours;
        }
      } catch {
        // silently fail — live data still flows via poller
      }
    }

    void loadHistory();
    return () => { cancelled = true; };
  }, [windowHours, addEvents]);

  // ── Start auto-prune interval ───────────────────────────────────────────────
  useEffect(() => {
    pruneTimerRef.current = setInterval(pruneOldEvents, PRUNE_INTERVAL_MS);

    return () => {
      if (pruneTimerRef.current !== null) {
        clearInterval(pruneTimerRef.current);
        pruneTimerRef.current = null;
      }
    };
  }, [pruneOldEvents]);

  return { addEvents, getEventsInRange, size };
}
