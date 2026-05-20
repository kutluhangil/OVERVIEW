import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LayerType, LayerConfig, LAYER_CONFIGS } from '@/lib/types';

interface LayersState {
  layers: LayerConfig[];
  toggleLayer: (type: LayerType) => void;
  setLayerOpacity: (type: LayerType, opacity: number) => void;
  setLayerPointSize: (type: LayerType, size: number) => void;
  setLayerFilter: (type: LayerType, filter: LayerConfig['filter']) => void;
  getLayer: (type: LayerType) => LayerConfig | undefined;
  enabledLayers: () => LayerType[];
}

export const useLayersStore = create<LayersState>()(
  persist(
    (set, get) => ({
      layers: LAYER_CONFIGS,
      toggleLayer: (type) =>
        set((state) => ({
          layers: state.layers.map((l) =>
            l.type === type ? { ...l, enabled: !l.enabled } : l
          ),
        })),
      setLayerOpacity: (type, opacity) =>
        set((state) => ({
          layers: state.layers.map((l) =>
            l.type === type ? { ...l, opacity } : l
          ),
        })),
      setLayerPointSize: (type, pointSize) =>
        set((state) => ({
          layers: state.layers.map((l) =>
            l.type === type ? { ...l, pointSize } : l
          ),
        })),
      setLayerFilter: (type, filter) =>
        set((state) => ({
          layers: state.layers.map((l) =>
            l.type === type ? { ...l, filter } : l
          ),
        })),
      getLayer: (type) => get().layers.find((l) => l.type === type),
      enabledLayers: () =>
        get()
          .layers.filter((l) => l.enabled)
          .map((l) => l.type),
    }),
    {
      name: 'overview-layers',
    }
  )
);
