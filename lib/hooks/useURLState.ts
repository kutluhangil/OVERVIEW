'use client';

import { useEffect, useRef } from 'react';
import { useLayersStore } from '@/store/useLayersStore';
import { LayerType } from '@/lib/types';

const ALL_LAYER_TYPES: LayerType[] = [
  'earthquake', 'iss', 'flight', 'fire', 'aurora', 'ship', 'cable', 'volcano',
];

/**
 * Syncs enabled layers to/from the URL query param `?layers=earthquake,iss,...`
 * - On mount: reads URL and enables matching layers
 * - On layer change: updates URL without pushing a new history entry
 */
export function useURLState() {
  const layers = useLayersStore((s) => s.layers);
  const toggleLayer = useLayersStore((s) => s.toggleLayer);
  const mountedRef = useRef(false);

  // Apply URL → store on first mount
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get('layers');
      if (!raw) return;

      const urlLayers = new Set(raw.split(',') as LayerType[]);
      const currentEnabledSet = new Set(
        layers.filter((l) => l.enabled).map((l) => l.type)
      );

      for (const type of ALL_LAYER_TYPES) {
        const shouldEnable = urlLayers.has(type);
        const isEnabled = currentEnabledSet.has(type);
        if (shouldEnable !== isEnabled) {
          toggleLayer(type);
        }
      }
    } catch {
      // ignore URL parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Store → URL on every layer change (after mount)
  useEffect(() => {
    if (!mountedRef.current) return;

    const enabled = layers
      .filter((l) => l.enabled)
      .map((l) => l.type)
      .join(',');

    try {
      const url = new URL(window.location.href);
      if (enabled) {
        url.searchParams.set('layers', enabled);
      } else {
        url.searchParams.delete('layers');
      }
      window.history.replaceState(null, '', url.toString());
    } catch {
      // ignore
    }
  }, [layers]);
}
