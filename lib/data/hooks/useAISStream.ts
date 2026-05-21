'use client';

import { useEffect, useRef } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { useLayersStore } from '@/store/useLayersStore';
import { GeoEvent } from '@/lib/types';

const WS_URL = 'wss://stream.aisstream.io/v0/stream';
const MAX_SHIPS = 500;
const PRUNE_INTERVAL_MS = 30_000;
const SHIP_TTL_MS = 120_000; // remove ship if no update for 2 minutes

interface AISPositionReport {
  UserID: number;
  Latitude: number;
  Longitude: number;
  Sog: number;       // speed over ground (knots)
  Cog: number;       // course over ground
  TrueHeading: number;
}

interface AISMetaData {
  MMSI: number;
  ShipName: string;
  latitude: number;
  longitude: number;
  time_utc: string;
}

interface AISMessage {
  MessageType: string;
  Message?: { PositionReport?: AISPositionReport };
  MetaData?: AISMetaData;
}

export function useAISStream() {
  const apiKey = process.env.NEXT_PUBLIC_AISSTREAM_KEY;
  const wsRef = useRef<WebSocket | null>(null);
  const shipMapRef = useRef<Map<number, { event: GeoEvent; lastSeen: number }>>(new Map());
  const pruneTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const shipsEnabled = useLayersStore((s) =>
    s.layers.find((l) => l.type === 'ship')?.enabled ?? false
  );

  useEffect(() => {
    if (!apiKey || !shipsEnabled) return;

    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            APIKey: apiKey,
            BoundingBoxes: [[[-90, -180], [90, 180]]],
            FilterMessageTypes: ['PositionReport'],
          })
        );
      };

      ws.onmessage = (evt: MessageEvent<string>) => {
        try {
          const msg: AISMessage = JSON.parse(evt.data);
          if (msg.MessageType !== 'PositionReport') return;

          const report = msg.Message?.PositionReport;
          const meta = msg.MetaData;
          if (!report || !meta) return;

          const lat = report.Latitude ?? meta.latitude;
          const lng = report.Longitude ?? meta.longitude;
          if (!isFinite(lat) || !isFinite(lng)) return;
          if (lat === 0 && lng === 0) return;

          const mmsi = meta.MMSI;
          const name = meta.ShipName?.trim() || `MMSI ${mmsi}`;
          const speed = report.Sog ?? 0;

          const event: GeoEvent = {
            id: `ship-${mmsi}`,
            layer: 'ship',
            lat,
            lng,
            timestamp: Date.now(),
            magnitude: Math.min(1, speed / 25),
            label: name,
            meta: {
              mmsi,
              speed_knots: speed,
              heading: report.TrueHeading,
              cog: report.Cog,
            },
          };

          shipMapRef.current.set(mmsi, { event, lastSeen: Date.now() });

          // Flush to store (throttled — at most the latest MAX_SHIPS)
          const ships = Array.from(shipMapRef.current.values())
            .sort((a, b) => b.lastSeen - a.lastSeen)
            .slice(0, MAX_SHIPS)
            .map((s) => s.event);

          useDataStore.getState().replaceEvents('ship', ships);
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = (e) => {
        if (e.code !== 1000) {
          // Reconnect after 5s unless intentionally closed
          setTimeout(connect, 5000);
        }
      };
    }

    connect();

    pruneTimerRef.current = setInterval(() => {
      const cutoff = Date.now() - SHIP_TTL_MS;
      for (const [mmsi, entry] of shipMapRef.current) {
        if (entry.lastSeen < cutoff) shipMapRef.current.delete(mmsi);
      }
    }, PRUNE_INTERVAL_MS);

    return () => {
      wsRef.current?.close(1000, 'component unmount');
      wsRef.current = null;
      if (pruneTimerRef.current) clearInterval(pruneTimerRef.current);
    };
  }, [apiKey, shipsEnabled]);
}
