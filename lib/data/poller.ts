'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useLayersStore } from '@/store/useLayersStore';
import { useDataStore } from '@/store/useDataStore';
import { LayerType } from '@/lib/types';
import { fetchEarthquakes } from './sources/earthquakes';
import { fetchISS } from './sources/iss';
import { fetchFlights } from './sources/flights';
import { fetchFires } from './sources/fires';
import { fetchAurora } from './sources/aurora';
import { fetchCables } from './sources/cables';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PollerState {
  lastUpdate: Record<LayerType, number | null>;
  errors: Record<LayerType, string | null>;
}

interface RetryState {
  count: number;
  nextRetryAt: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 2000;
const MAX_BACKOFF_MS = 5 * 60 * 1000; // 5 minutes

function calcBackoff(attempt: number): number {
  const ms = BASE_BACKOFF_MS * Math.pow(2, attempt);
  return Math.min(ms, MAX_BACKOFF_MS);
}

// ─── Per-layer fetch dispatch ─────────────────────────────────────────────────

async function fetchLayer(layer: LayerType): Promise<void> {
  const { replaceEvents, setAuroraData } = useDataStore.getState();

  switch (layer) {
    case 'earthquake': {
      const events = await fetchEarthquakes();
      replaceEvents('earthquake', events);
      break;
    }
    case 'iss': {
      const event = await fetchISS();
      replaceEvents('iss', [event]);
      break;
    }
    case 'flight': {
      const events = await fetchFlights();
      replaceEvents('flight', events);
      break;
    }
    case 'fire': {
      const events = await fetchFires();
      replaceEvents('fire', events);
      break;
    }
    case 'aurora': {
      const { grid, events } = await fetchAurora();
      setAuroraData(grid);
      replaceEvents('aurora', events);
      break;
    }
    case 'cable': {
      const events = await fetchCables();
      replaceEvents('cable', events);
      break;
    }
    case 'ship':
    case 'volcano':
    case 'custom':
      // Ships: handled by client-side WebSocket hook
      // Volcano/custom: no dedicated poller
      break;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDataPoller(): PollerState {
  const enabledLayers = useLayersStore((s) => s.enabledLayers());
  const layers = useLayersStore((s) => s.layers);

  const [lastUpdate, setLastUpdate] = useState<Record<LayerType, number | null>>({
    earthquake: null,
    iss: null,
    flight: null,
    fire: null,
    aurora: null,
    ship: null,
    cable: null,
    volcano: null,
    custom: null,
  });

  const [errors, setErrors] = useState<Record<LayerType, string | null>>({
    earthquake: null,
    iss: null,
    flight: null,
    fire: null,
    aurora: null,
    ship: null,
    cable: null,
    volcano: null,
    custom: null,
  });

  // Mutable refs to avoid stale closures in interval callbacks
  const intervalsRef = useRef<Map<LayerType, ReturnType<typeof setInterval>>>(new Map());
  const retryRef = useRef<Map<LayerType, RetryState>>(new Map());
  const hiddenRef = useRef<boolean>(false);
  const activeRef = useRef<Set<LayerType>>(new Set());

  const updateLastUpdate = useCallback((layer: LayerType, ts: number) => {
    setLastUpdate((prev) => ({ ...prev, [layer]: ts }));
  }, []);

  const updateError = useCallback((layer: LayerType, msg: string | null) => {
    setErrors((prev) => ({ ...prev, [layer]: msg }));
  }, []);

  const runFetch = useCallback(
    async (layer: LayerType) => {
      if (hiddenRef.current) return;

      const retry = retryRef.current.get(layer) ?? { count: 0, nextRetryAt: 0 };

      // If we've exhausted retries, skip until re-enabled
      if (retry.count >= MAX_RETRIES) return;

      // If we're in backoff, check if it's time yet
      if (retry.nextRetryAt > Date.now()) return;

      try {
        await fetchLayer(layer);
        // Success — clear error and retry state
        retryRef.current.set(layer, { count: 0, nextRetryAt: 0 });
        updateError(layer, null);
        updateLastUpdate(layer, Date.now());
      } catch (error) {
        const newCount = retry.count + 1;
        const backoffMs = calcBackoff(newCount);
        const nextRetryAt = Date.now() + backoffMs;
        retryRef.current.set(layer, { count: newCount, nextRetryAt });

        const msg =
          error instanceof Error
            ? error.message
            : 'Unknown error';

        if (newCount >= MAX_RETRIES) {
          updateError(layer, `Layer disabled after ${MAX_RETRIES} failures: ${msg}`);
          console.error(`[poller:${layer}] Giving up after ${MAX_RETRIES} retries`);
        } else {
          updateError(layer, `Retry ${newCount}/${MAX_RETRIES}: ${msg}`);
          console.warn(`[poller:${layer}] Error (retry ${newCount}/${MAX_RETRIES}): ${msg}`);
        }
      }
    },
    [updateError, updateLastUpdate]
  );

  const startLayer = useCallback(
    (layer: LayerType) => {
      if (activeRef.current.has(layer)) return;

      const config = layers.find((l) => l.type === layer);
      const pollInterval = config?.pollInterval;

      // Cables are static — fetch once, no polling
      if (layer === 'cable') {
        activeRef.current.add(layer);
        retryRef.current.set(layer, { count: 0, nextRetryAt: 0 });
        void runFetch(layer);
        return;
      }

      if (!pollInterval) return;

      activeRef.current.add(layer);
      retryRef.current.set(layer, { count: 0, nextRetryAt: 0 });

      // Fetch immediately on start
      void runFetch(layer);

      const id = setInterval(() => {
        void runFetch(layer);
      }, pollInterval);

      intervalsRef.current.set(layer, id);
    },
    [layers, runFetch]
  );

  const stopLayer = useCallback((layer: LayerType) => {
    const id = intervalsRef.current.get(layer);
    if (id !== undefined) {
      clearInterval(id);
      intervalsRef.current.delete(layer);
    }
    activeRef.current.delete(layer);
    // Reset retry state so re-enabling works fresh
    retryRef.current.delete(layer);
  }, []);

  // Sync enabled/disabled layers
  useEffect(() => {
    const enabledSet = new Set(enabledLayers);

    // Start newly enabled layers
    for (const layer of enabledSet) {
      if (!activeRef.current.has(layer)) {
        startLayer(layer);
      }
    }

    // Stop disabled layers
    for (const layer of activeRef.current) {
      if (!enabledSet.has(layer)) {
        stopLayer(layer);
      }
    }
  }, [enabledLayers, startLayer, stopLayer]);

  // Page Visibility API — pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      hiddenRef.current = document.hidden;

      if (!document.hidden) {
        // Tab became visible — immediately re-fetch all active layers
        for (const layer of activeRef.current) {
          void runFetch(layer);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [runFetch]);

  // Cleanup all intervals on unmount
  useEffect(() => {
    return () => {
      for (const id of intervalsRef.current.values()) {
        clearInterval(id);
      }
      intervalsRef.current.clear();
      activeRef.current.clear();
    };
  }, []);

  return { lastUpdate, errors };
}
