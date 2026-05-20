'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, MapPin, Clock, Zap } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useGlobeStore } from '@/store/useGlobeStore';
import { timeAgo, formatCoords, formatMagnitude, formatAltitude } from '@/lib/utils/format';
import { Button } from './primitives/Button';
import { cn } from '@/lib/utils/cn';
import type { LayerType, GeoEvent } from '@/lib/types';

const LAYER_LABELS: Record<LayerType, string> = {
  earthquake: 'EARTHQUAKE',
  iss:        'ISS TRACK',
  flight:     'FLIGHT',
  fire:       'WILDFIRE',
  aurora:     'AURORA',
  ship:       'VESSEL',
  cable:      'CABLE',
  volcano:    'VOLCANO',
  custom:     'CUSTOM',
};

const LAYER_COLORS: Record<LayerType, string> = {
  earthquake: '#ff5a5f',
  iss:        '#ffd93d',
  flight:     '#5eead4',
  fire:       '#ff7847',
  aurora:     '#a78bfa',
  ship:       '#60a5fa',
  cable:      '#34d399',
  volcano:    '#f472b6',
  custom:     '#2dd4bf',
};

export function EventDetailCard() {
  const selectedEvent = useUIStore((s) => s.selectedEvent);
  const setSelectedEvent = useUIStore((s) => s.setSelectedEvent);
  const setSelectedEventId = useGlobeStore((s) => s.setSelectedEventId);

  const handleClose = useCallback(() => {
    setSelectedEvent(null);
    setSelectedEventId(null);
  }, [setSelectedEvent, setSelectedEventId]);

  // Esc key handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (selectedEvent) {
      window.addEventListener('keydown', onKey);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEvent, handleClose]);

  return (
    <AnimatePresence>
      {selectedEvent && (
        <EventCard event={selectedEvent} onClose={handleClose} />
      )}
    </AnimatePresence>
  );
}

/* ─── EventCard (inner) ──────────────────────────────────────────────── */
interface EventCardProps {
  event: GeoEvent;
  onClose: () => void;
}

function EventCard({ event, onClose }: EventCardProps) {
  const layerColor = LAYER_COLORS[event.layer];
  const layerLabel = LAYER_LABELS[event.layer];
  const metaUrl = typeof event.meta.url === 'string' ? event.meta.url : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'fixed right-4 top-[68px] z-50',
        'w-[280px]',
        'glass-elevated rounded-xl',
        'overflow-hidden'
      )}
      role="dialog"
      aria-label="Event details"
    >
      {/* Color accent bar */}
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(to right, ${layerColor}, ${layerColor}40)` }}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-col gap-1">
            {/* Layer badge */}
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold mono-data tracking-widest w-fit"
              style={{
                color: layerColor,
                backgroundColor: `${layerColor}18`,
                border: `1px solid ${layerColor}35`,
              }}
            >
              {layerLabel}
            </span>
            {/* Event label */}
            <p className="text-sm font-body text-[#e8eef5] leading-snug mt-0.5">
              {event.label}
            </p>
          </div>

          <Button
            variant="icon"
            size="sm"
            onClick={onClose}
            aria-label="Close event detail"
            className="flex-shrink-0 -mt-0.5 -mr-1"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Magnitude — large display */}
        {event.magnitude != null && (
          <div className="flex items-baseline gap-1.5 mb-3">
            <span
              className="mono-data font-semibold leading-none"
              style={{
                color: layerColor,
                fontSize: '36px',
                textShadow: `0 0 20px ${layerColor}60`,
              }}
            >
              {formatMagnitude(event.magnitude)}
            </span>
            <span className="text-xs text-[#5b6b82] font-body mb-0.5">magnitude</span>
          </div>
        )}

        {/* Altitude for ISS */}
        {event.alt != null && event.layer === 'iss' && (
          <div className="flex items-center gap-1.5 mb-3">
            <Zap className="h-3.5 w-3.5 flex-shrink-0" style={{ color: layerColor }} />
            <span className="mono-data text-sm" style={{ color: layerColor }}>
              {formatAltitude(event.alt)}
            </span>
            <span className="text-xs text-[#5b6b82]">altitude</span>
          </div>
        )}

        {/* Separator */}
        <div className="h-px bg-[#1a2436] mb-3" />

        {/* Data rows */}
        <div className="space-y-2">
          {/* Coordinates */}
          <DataRow
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Location"
            value={formatCoords(event.lat, event.lng)}
          />

          {/* Time */}
          <DataRow
            icon={<Clock className="h-3.5 w-3.5" />}
            label="Time"
            value={timeAgo(event.timestamp)}
          />

          {/* Extra meta fields */}
          {typeof event.meta.depth === 'number' && (
            <DataRow
              icon={<span className="text-[10px] text-[#5b6b82]">▼</span>}
              label="Depth"
              value={`${event.meta.depth.toFixed(1)} km`}
            />
          )}

          {typeof event.meta.speed === 'number' && (
            <DataRow
              icon={<span className="text-[10px] text-[#5b6b82]">⟶</span>}
              label="Speed"
              value={`${Math.round(event.meta.speed).toLocaleString()} m/s`}
            />
          )}

          {typeof event.meta.country === 'string' && event.meta.country && (
            <DataRow
              icon={<span className="text-[10px] text-[#5b6b82]">◎</span>}
              label="Region"
              value={event.meta.country}
            />
          )}
        </div>

        {/* External link */}
        {metaUrl && (
          <a
            href={metaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'mt-3 flex items-center justify-center gap-1.5',
              'w-full py-1.5 rounded-md text-xs font-medium',
              'border transition-all duration-150',
              'border-[#1a2436] text-[#94a3b8]',
              'hover:border-accent/40 hover:text-accent hover:bg-accent/5',
              'active:scale-[0.98]'
            )}
          >
            <ExternalLink className="h-3 w-3" />
            View source data
          </a>
        )}
      </div>
    </motion.div>
  );
}

/* ─── DataRow ──────────────────────────────────────────────────────────── */
interface DataRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DataRow({ icon, label, value }: DataRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#5b6b82] flex-shrink-0">{icon}</span>
      <span className="text-xs text-[#5b6b82] font-body w-14 flex-shrink-0">{label}</span>
      <span className="mono-data text-xs text-[#94a3b8] truncate">{value}</span>
    </div>
  );
}
