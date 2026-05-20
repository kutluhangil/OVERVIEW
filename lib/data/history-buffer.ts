'use client';

import { useEffect, useRef, useCallback } from 'react';
import { GeoEvent } from '@/lib/types';
import { normalizeEarthquakes } from '@/lib/data/normalize';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_AGE_MS = 25 * 60 * 60 * 1000; // 25h (prune events older than this)
const PRUNE_INTERVAL_MS = 10 * 60 * 1000; // prune every 10 minutes
const USGS_ALL_DAY_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

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
  // Map<id, GeoEvent> for O(1) dedup
  const bufferRef = useRef<Map<string, GeoEvent>>(new Map());
  const pruneTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    const cutoff = Date.now() - MAX_AGE_MS;
    const buf = bufferRef.current;
    for (const [id, event] of buf.entries()) {
      if (event.timestamp < cutoff) {
        buf.delete(id);
      }
    }
  }, []);

  // ── Load initial 24h earthquake history from USGS ──────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadInitialHistory() {
      try {
        const response = await fetch(USGS_ALL_DAY_URL, {
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
          console.warn(
            `[history-buffer] USGS all_day.geojson returned ${response.status}`
          );
          return;
        }

        const geojson: unknown = await response.json();
        const events = normalizeEarthquakes(geojson);

        if (!cancelled) {
          addEvents(events);
          console.info(
            `[history-buffer] Loaded ${events.length} earthquake events into 24h history`
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error('[history-buffer] Failed to load initial history:', error);
        }
      }
    }

    void loadInitialHistory();

    return () => {
      cancelled = true;
    };
  }, [addEvents]);

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
