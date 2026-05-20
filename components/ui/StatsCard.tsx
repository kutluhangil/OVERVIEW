'use client';

import React, { useMemo } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { useLayersStore } from '@/store/useLayersStore';
import { formatAltitude } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface StatRow {
  label: string;
  value: string;
  color?: string;
}

export function StatsCard() {
  const layers = useLayersStore((s) => s.layers);
  const events = useDataStore((s) => s.events);

  const stats = useMemo((): StatRow[] => {
    const result: StatRow[] = [];
    const now = Date.now();
    const since24h = now - 24 * 60 * 60 * 1000;

    // Earthquakes
    const eqLayer = layers.find((l) => l.type === 'earthquake');
    if (eqLayer?.enabled) {
      const eq = events.earthquake ?? [];
      const today = eq.filter((e) => e.timestamp >= since24h);
      result.push({
        label: 'Quakes today',
        value: today.length.toLocaleString(),
        color: '#ff5a5f',
      });

      const strongest = eq.reduce<number>((max, e) => {
        const mag = (e.magnitude ?? 0);
        return mag > max ? mag : max;
      }, 0);
      if (strongest > 0) {
        result.push({
          label: 'Strongest (M)',
          value: strongest.toFixed(1),
          color: '#ff5a5f',
        });
      }
    }

    // ISS
    const issLayer = layers.find((l) => l.type === 'iss');
    if (issLayer?.enabled) {
      const issEvents = events.iss ?? [];
      if (issEvents.length > 0) {
        const latest = issEvents[issEvents.length - 1];
        if (latest.alt != null) {
          result.push({
            label: 'ISS Altitude',
            value: formatAltitude(latest.alt),
            color: '#ffd93d',
          });
        }
        const speedVal = latest.meta?.speed;
        if (typeof speedVal === 'number') {
          result.push({
            label: 'ISS Speed',
            value: `${Math.round(speedVal).toLocaleString()} m/s`,
            color: '#ffd93d',
          });
        }
      }
    }

    // Flights
    const flightLayer = layers.find((l) => l.type === 'flight');
    if (flightLayer?.enabled) {
      const flights = events.flight ?? [];
      result.push({
        label: 'Active Flights',
        value: flights.length.toLocaleString(),
        color: '#5eead4',
      });
    }

    // Wildfires
    const fireLayer = layers.find((l) => l.type === 'fire');
    if (fireLayer?.enabled) {
      const fires = events.fire ?? [];
      result.push({
        label: 'Active Fires',
        value: fires.length.toLocaleString(),
        color: '#ff7847',
      });
    }

    // Ships
    const shipLayer = layers.find((l) => l.type === 'ship');
    if (shipLayer?.enabled) {
      const ships = events.ship ?? [];
      result.push({
        label: 'Tracked Ships',
        value: ships.length.toLocaleString(),
        color: '#60a5fa',
      });
    }

    // Volcanoes
    const volcLayer = layers.find((l) => l.type === 'volcano');
    if (volcLayer?.enabled) {
      const volcs = events.volcano ?? [];
      result.push({
        label: 'Active Volcanoes',
        value: volcs.length.toLocaleString(),
        color: '#f472b6',
      });
    }

    return result;
  }, [layers, events]);

  if (stats.length === 0) {
    return (
      <div className="px-4 py-3">
        <p className="text-[10px] text-[#5b6b82] font-body text-center">
          Enable layers to see stats
        </p>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 space-y-0.5">
      <p className="text-[10px] text-[#5b6b82] tracking-widest uppercase font-body mb-2">
        Live Stats
      </p>
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center justify-between py-0.5">
          <span className="text-xs text-[#5b6b82] font-body">{stat.label}</span>
          <span
            className={cn('mono-data text-xs font-medium tabular-nums')}
            style={{ color: stat.color ?? '#2dd4bf' }}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
