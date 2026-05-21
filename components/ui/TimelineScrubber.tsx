'use client';

import React, { useMemo, useCallback } from 'react';
import { Play, Pause, Rocket } from 'lucide-react';
import { useTimeStore } from '@/store/useTimeStore';
import { useGlobeStore } from '@/store/useGlobeStore';
import { useDataStore } from '@/store/useDataStore';
import { toggleAutoTour } from '@/lib/tour/auto-tour';
import { Button } from './primitives/Button';
import { Tooltip } from './primitives/Tooltip';
import { cn } from '@/lib/utils/cn';

type ReplaySpeed = 1 | 5 | 20 | 60;
const SPEEDS: ReplaySpeed[] = [1, 5, 20, 60];

const WINDOWS: { hours: number; label: string }[] = [
  { hours: 1,   label: '1h' },
  { hours: 6,   label: '6h' },
  { hours: 24,  label: '24h' },
  { hours: 168, label: '7d' },
];

export function TimelineScrubber() {
  const storeEvents = useDataStore((s) => s.events);
  const events = useMemo(() => Object.values(storeEvents).flat(), [storeEvents]);
  const mode       = useTimeStore((s) => s.mode);
  const scrubTime  = useTimeStore((s) => s.scrubTime);
  const speed      = useTimeStore((s) => s.speed);
  const isPlaying  = useTimeStore((s) => s.isPlaying);
  const windowHours = useTimeStore((s) => s.windowHours);
  const setScrubTime   = useTimeStore((s) => s.setScrubTime);
  const setSpeed       = useTimeStore((s) => s.setSpeed);
  const setPlaying     = useTimeStore((s) => s.setPlaying);
  const setWindowHours = useTimeStore((s) => s.setWindowHours);
  const goLive         = useTimeStore((s) => s.goLive);

  const isAutoTour = useGlobeStore((s) => s.isAutoTour);

  const now = Date.now();
  const windowMs = windowHours * 60 * 60 * 1000;
  const rangeStart = now - windowMs;
  const rangeEnd   = now;

  // Scrubber value (0–1)
  const scrubValue = useMemo(() => {
    if (mode === 'live') return 1;
    return Math.max(0, Math.min(1, (scrubTime - rangeStart) / windowMs));
  }, [mode, scrubTime, rangeStart, windowMs]);

  const handleScrub = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fraction = parseFloat(e.target.value);
      const time = rangeStart + fraction * windowMs;
      setScrubTime(time);
    },
    [rangeStart, windowMs, setScrubTime]
  );

  // Event density ticks
  const densityBuckets = useMemo(() => {
    const BUCKETS = 120;
    const bucketSize = windowMs / BUCKETS;
    const counts = new Array<number>(BUCKETS).fill(0);
    const maxCount = 1; // will normalize

    for (const ev of events) {
      const offset = ev.timestamp - rangeStart;
      if (offset < 0 || offset >= windowMs) continue;
      const idx = Math.floor(offset / bucketSize);
      if (idx >= 0 && idx < BUCKETS) counts[idx]++;
    }

    const max = Math.max(...counts, 1);
    return counts.map((c) => c / max);
  }, [events, rangeStart, windowMs]);

  const isLive = mode === 'live';

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'h-[64px] flex items-center',
        'bg-[#050810]/92 backdrop-blur-md',
        'border-t border-[#1a2436]',
        'shadow-[0_-1px_0_rgba(45,212,191,0.06)]',
        'px-4 gap-3'
      )}
      aria-label="Timeline scrubber"
    >
      {/* Play / Pause */}
      <Tooltip content={isPlaying ? 'Pause replay' : 'Play replay'}>
        <Button
          variant="icon"
          size="md"
          active={isPlaying}
          disabled={isLive}
          onClick={() => setPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </Tooltip>

      {/* Speed selector */}
      <div className="flex items-center gap-0.5">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            disabled={isLive}
            className={cn(
              'h-6 min-w-[28px] px-1.5 rounded text-[10px] mono-data font-medium',
              'transition-all duration-100',
              speed === s && !isLive
                ? 'bg-accent/20 text-accent border border-accent/40'
                : 'text-[#5b6b82] hover:text-[#94a3b8] border border-transparent disabled:opacity-30 disabled:cursor-not-allowed'
            )}
            aria-label={`Set speed ${s}x`}
            aria-pressed={speed === s}
          >
            {s}×
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-[#1a2436] flex-shrink-0" />

      {/* Window size selector */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {WINDOWS.map((w) => (
          <button
            key={w.hours}
            onClick={() => setWindowHours(w.hours)}
            className={cn(
              'h-6 px-1.5 rounded text-[10px] mono-data font-medium',
              'transition-all duration-100',
              windowHours === w.hours
                ? 'bg-accent/20 text-accent border border-accent/40'
                : 'text-[#5b6b82] hover:text-[#94a3b8] border border-transparent'
            )}
            aria-label={`Show last ${w.label}`}
            aria-pressed={windowHours === w.hours}
          >
            {w.label}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-[#1a2436] flex-shrink-0" />

      {/* Scrubber + density viz */}
      <div className="flex-1 relative flex flex-col justify-center gap-1 min-w-0">
        {/* Event density ticks */}
        <DensityViz buckets={densityBuckets} scrubValue={scrubValue} isLive={isLive} />

        {/* Range input */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.0001}
          value={scrubValue}
          onChange={handleScrub}
          disabled={isLive}
          className={cn(
            'w-full h-0.5 rounded-full appearance-none cursor-pointer',
            'relative z-10',
            isLive && 'opacity-40 cursor-not-allowed'
          )}
          style={{
            background: `linear-gradient(to right, #2dd4bf ${scrubValue * 100}%, #1a2436 ${scrubValue * 100}%)`,
          }}
          aria-label="Scrub timeline"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(scrubValue * 100)}
        />
      </div>

      {/* Time end / NOW */}
      <span className="mono-data text-[10px] text-[#5b6b82] flex-shrink-0 whitespace-nowrap">
        NOW
      </span>

      <div className="h-4 w-px bg-[#1a2436] flex-shrink-0" />

      {/* LIVE button */}
      <Tooltip content={isLive ? 'Currently live' : 'Go to live data'}>
        <button
          onClick={goLive}
          className={cn(
            'flex items-center gap-1.5 px-3 h-7 rounded-md',
            'text-xs font-semibold mono-data tracking-wider uppercase',
            'border transition-all duration-150',
            isLive
              ? 'bg-[#34d399]/15 border-[#34d399]/40 text-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.25)]'
              : 'bg-transparent border-[#1a2436] text-[#5b6b82] hover:border-[#34d399]/30 hover:text-[#34d399]/80'
          )}
          aria-label="Go live"
          aria-pressed={isLive}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full flex-shrink-0',
              isLive ? 'bg-[#34d399] animate-pulse' : 'bg-[#5b6b82]'
            )}
          />
          LIVE
        </button>
      </Tooltip>

      {/* Auto-tour */}
      <Tooltip content={isAutoTour ? 'Stop auto-tour' : 'Start auto-tour'}>
        <Button
          variant="icon"
          size="md"
          active={isAutoTour}
          onClick={toggleAutoTour}
          aria-label="Auto-tour"
          className={isAutoTour ? 'text-accent animate-pulse-glow' : ''}
        >
          <Rocket className="h-4 w-4" />
        </Button>
      </Tooltip>
    </div>
  );
}

/* ─── DensityViz ──────────────────────────────────────────────────────── */
interface DensityVizProps {
  buckets: number[];
  scrubValue: number;
  isLive: boolean;
}

function DensityViz({ buckets, scrubValue, isLive }: DensityVizProps) {
  const cutoff = scrubValue;
  return (
    <div className="absolute bottom-4 left-0 right-0 h-4 flex items-end gap-px pointer-events-none">
      {buckets.map((density, i) => {
        const fraction = i / buckets.length;
        const isPast = fraction <= cutoff;
        const height = Math.max(1, density * 14);
        return (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${height}px`,
              backgroundColor: isPast
                ? `rgba(45,212,191,${0.15 + density * 0.5})`
                : `rgba(45,212,191,${0.04 + density * 0.08})`,
              transition: 'height 0.3s ease',
            }}
          />
        );
      })}
    </div>
  );
}
