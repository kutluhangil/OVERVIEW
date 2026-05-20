'use client';

import { useEffect } from 'react';
import { useGlobeStore } from '@/store/useGlobeStore';
import { useUIStore } from '@/store/useUIStore';
import { useLayersStore } from '@/store/useLayersStore';
import { toggleAutoTour } from '@/lib/tour/auto-tour';
import { LAYER_CONFIGS } from '@/lib/types';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const globe = useGlobeStore.getState();
      const ui = useUIStore.getState();
      const layers = useLayersStore.getState();

      switch (e.key) {
        case ' ':
          e.preventDefault();
          globe.setRotating(!globe.isRotating);
          break;
        case 'l':
        case 'L':
          ui.setLayersPanelOpen(!ui.isLayersPanelOpen);
          break;
        case 't':
        case 'T':
          ui.setTimelineOpen(!ui.isTimelineOpen);
          break;
        case 'm':
        case 'M':
          ui.setSoundEnabled(!ui.isSoundEnabled);
          break;
        case 'r':
        case 'R':
          globe.setCameraTarget(null);
          break;
        case 'f':
        case 'F':
          document.documentElement.requestFullscreen?.().catch(() => {});
          break;
        case 'a':
        case 'A':
          toggleAutoTour();
          break;
        case 'Escape':
          ui.setSelectedEvent(null);
          ui.setSettingsOpen(false);
          ui.setShareOpen(false);
          ui.setUploadOpen(false);
          break;
        default:
          // Number keys 1-8 toggle layers
          const num = parseInt(e.key);
          if (num >= 1 && num <= 8) {
            const layer = LAYER_CONFIGS[num - 1];
            if (layer) layers.toggleLayer(layer.type);
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
