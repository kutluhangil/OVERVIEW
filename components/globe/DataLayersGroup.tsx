'use client';

import { useMemo } from 'react';
import { useLayersStore } from '@/store/useLayersStore';
import { useDataStore } from '@/store/useDataStore';
import { useTimeStore } from '@/store/useTimeStore';
import { PointLayer } from '@/components/layers/PointLayer';
import { ArcLayer } from '@/components/layers/ArcLayer';
import { RingLayer } from '@/components/layers/RingLayer';
import { SatelliteLayer } from '@/components/layers/SatelliteLayer';
import { AuroraLayer } from '@/components/layers/AuroraLayer';
import { LAYER_CONFIGS } from '@/lib/types';

export function DataLayersGroup() {
  const layers = useLayersStore((s) => s.layers);
  const events = useDataStore((s) => s.events);
  const [rangeStart, rangeEnd] = useTimeStore((s) => s.getVisibleRange());

  // Filter events to the visible time window
  const filteredEvents = useMemo(() => {
    const result: typeof events = {
      earthquake: [],
      iss: [],
      flight: [],
      fire: [],
      aurora: [],
      ship: [],
      cable: [],
      volcano: [],
      custom: [],
    };

    for (const [layer, layerEvents] of Object.entries(events) as [keyof typeof events, typeof events[keyof typeof events]][]) {
      // Cables and volcanoes are static — show all
      if (layer === 'cable' || layer === 'volcano') {
        result[layer] = layerEvents;
      } else {
        result[layer] = layerEvents.filter(
          (e) => e.timestamp >= rangeStart && e.timestamp <= rangeEnd
        );
      }
    }

    return result;
  }, [events, rangeStart, rangeEnd]);

  return (
    <group>
      {layers.map((layer) => {
        if (!layer.enabled) return null;
        const layerEvents = filteredEvents[layer.type];

        switch (layer.renderType) {
          case 'satellite':
            return (
              <SatelliteLayer
                key={layer.type}
                events={layerEvents}
                color={layer.color}
                visible
              />
            );
          case 'arc':
            return (
              <ArcLayer
                key={layer.type}
                events={layerEvents}
                color={layer.color}
                opacity={layer.opacity}
                visible
              />
            );
          case 'overlay':
            return (
              <AuroraLayer key={layer.type} visible />
            );
          case 'point':
          case 'ring':
          default: {
            // Apply magnitude filter client-side
            const filtered =
              layer.filter?.field === 'magnitude' && layer.filter.min != null
                ? layerEvents.filter(
                    (e) => (e.magnitude ?? 0) >= (layer.filter!.min ?? 0)
                  )
                : layerEvents;

            return (
              <group key={layer.type}>
                <PointLayer
                  events={filtered}
                  color={layer.color}
                  opacity={layer.opacity}
                  pointSize={layer.pointSize}
                  visible
                />
                {/* Ripple rings only for earthquakes and volcanos */}
                {(layer.type === 'earthquake' || layer.type === 'volcano') && (
                  <RingLayer
                    events={filtered.slice(0, 50)}
                    color={layer.color}
                    visible
                  />
                )}
              </group>
            );
          }
        }
      })}
    </group>
  );
}
