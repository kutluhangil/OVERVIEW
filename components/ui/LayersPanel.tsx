'use client';

import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useLayersStore } from '@/store/useLayersStore';
import { useDataStore } from '@/store/useDataStore';
import { useUIStore } from '@/store/useUIStore';
import { Toggle } from './primitives/Toggle';
import { Slider } from './primitives/Slider';
import { StatsCard } from './StatsCard';
import { cn } from '@/lib/utils/cn';
import type { LayerConfig, LayerType } from '@/lib/types';

const LAYER_ICONS: Record<LayerType, string> = {
  earthquake: '◎',
  iss:        '◆',
  flight:     '▲',
  fire:       '●',
  aurora:     '◉',
  ship:       '◈',
  cable:      '▬',
  volcano:    '◬',
  custom:     '◇',
};

export function LayersPanel() {
  const isOpen = useUIStore((s) => s.isLayersPanelOpen);
  const setOpen = useUIStore((s) => s.setLayersPanelOpen);
  const layers = useLayersStore((s) => s.layers);
  const toggleLayer = useLayersStore((s) => s.toggleLayer);
  const setLayerOpacity = useLayersStore((s) => s.setLayerOpacity);
  const setLayerPointSize = useLayersStore((s) => s.setLayerPointSize);
  const setLayerFilter = useLayersStore((s) => s.setLayerFilter);

  const [expandedLayer, setExpandedLayer] = useState<LayerType | null>(null);

  const toggleExpand = useCallback(
    (type: LayerType) => {
      setExpandedLayer((prev) => (prev === type ? null : type));
    },
    []
  );

  return (
    <>
      {/* Collapsed toggle button (always visible) */}
      {!isOpen && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open layers panel"
          className={cn(
            'fixed left-0 top-1/2 -translate-y-1/2 z-40',
            'flex items-center justify-center',
            'h-10 w-6 rounded-r-md',
            'glass border-l-0',
            'text-[#94a3b8] hover:text-accent',
            'transition-all duration-150',
            'hover:shadow-[0_0_10px_rgba(45,212,191,0.2)]'
          )}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Panel */}
      <aside
        className={cn(
          'fixed left-0 top-[52px] bottom-[64px] z-40',
          'w-[260px] flex flex-col',
          'glass border-t-0 border-b-0 border-l-0',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Layers panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2436]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#5b6b82] tracking-widest uppercase font-body">
              Data Layers
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close layers panel"
            className="text-[#5b6b82] hover:text-[#94a3b8] transition-colors p-0.5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Layer list */}
        <div className="flex-1 overflow-y-auto py-1.5">
          {layers.map((layer) => (
            <LayerRow
              key={layer.type}
              layer={layer}
              isExpanded={expandedLayer === layer.type}
              onToggle={() => toggleLayer(layer.type)}
              onExpand={() => toggleExpand(layer.type)}
              onOpacityChange={(v) => setLayerOpacity(layer.type, v)}
              onPointSizeChange={(v) => setLayerPointSize(layer.type, v)}
              onMinMagnitudeChange={(v) =>
                setLayerFilter(layer.type, { ...layer.filter, field: 'magnitude', min: v })
              }
            />
          ))}
        </div>

        {/* Stats section */}
        <div className="border-t border-[#1a2436]">
          <StatsCard />
        </div>
      </aside>
    </>
  );
}

/* ─── LayerRow ────────────────────────────────────────────────────────── */
interface LayerRowProps {
  layer: LayerConfig;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  onOpacityChange: (v: number) => void;
  onPointSizeChange: (v: number) => void;
  onMinMagnitudeChange: (v: number) => void;
}

function LayerRow({
  layer,
  isExpanded,
  onToggle,
  onExpand,
  onOpacityChange,
  onPointSizeChange,
  onMinMagnitudeChange,
}: LayerRowProps) {
  const eventCount = useDataStore(
    useCallback((s) => s.getLayerEvents(layer.type).length, [layer.type])
  );

  return (
    <div
      className={cn(
        'border-b border-[#1a2436]/60 last:border-b-0',
        layer.enabled && 'bg-white/[0.015]'
      )}
    >
      {/* Main row */}
      <div className="flex items-center gap-2 px-3 py-2.5 group">
        <Toggle
          checked={layer.enabled}
          onChange={onToggle}
          color={layer.color}
          size="sm"
          aria-label={`Toggle ${layer.name}`}
        />

        {/* Color dot + icon */}
        <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
          <span
            className="text-[10px] leading-none"
            style={{ color: layer.enabled ? layer.color : '#5b6b82' }}
          >
            {LAYER_ICONS[layer.type]}
          </span>
        </div>

        {/* Name */}
        <span
          className={cn(
            'flex-1 text-sm font-body transition-colors duration-150 truncate',
            layer.enabled ? 'text-[#e8eef5]' : 'text-[#5b6b82]'
          )}
        >
          {layer.name}
        </span>

        {/* Event count */}
        {eventCount > 0 && (
          <span
            className={cn(
              'mono-data text-[10px] px-1.5 py-0.5 rounded',
              'transition-colors duration-150',
              layer.enabled
                ? 'text-[#94a3b8] bg-white/5'
                : 'text-[#5b6b82]'
            )}
          >
            {eventCount > 9999 ? '9999+' : eventCount.toLocaleString()}
          </span>
        )}

        {/* Expand toggle */}
        {layer.enabled && (
          <button
            onClick={onExpand}
            aria-label={isExpanded ? 'Collapse layer settings' : 'Expand layer settings'}
            className="text-[#5b6b82] hover:text-[#94a3b8] transition-colors p-0.5 flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Expanded settings */}
      {isExpanded && layer.enabled && (
        <div
          className="px-3 pb-3 pt-0 space-y-3 animate-fade-in"
          style={{ borderLeft: `2px solid ${layer.color}30` }}
        >
          <Slider
            value={layer.opacity}
            onChange={onOpacityChange}
            min={0}
            max={1}
            step={0.05}
            label="Opacity"
            accentColor={layer.color}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />

          <Slider
            value={layer.pointSize}
            onChange={onPointSizeChange}
            min={0.2}
            max={4}
            step={0.1}
            label="Point Size"
            accentColor={layer.color}
            formatValue={(v) => `${v.toFixed(1)}×`}
          />

          {layer.type === 'earthquake' && layer.filter && (
            <Slider
              value={layer.filter.min ?? 2.5}
              onChange={onMinMagnitudeChange}
              min={0}
              max={9}
              step={0.5}
              label="Min Magnitude"
              accentColor={layer.color}
              formatValue={(v) => `M${v.toFixed(1)}`}
            />
          )}
        </div>
      )}
    </div>
  );
}
