'use client';

import React, { useMemo } from 'react';
import { Volume2, VolumeX, Settings, Share2 } from 'lucide-react';
import { useLayersStore } from '@/store/useLayersStore';
import { useUIStore } from '@/store/useUIStore';
import { Button } from './primitives/Button';
import { Tooltip } from './primitives/Tooltip';
import { cn } from '@/lib/utils/cn';

export function TopBar() {
  const layers = useLayersStore((s) => s.layers);
  const {
    isSoundEnabled,
    setSoundEnabled,
    setSettingsOpen,
    setShareOpen,
  } = useUIStore();

  const activeLayerCount = useMemo(
    () => layers.filter((l) => l.enabled).length,
    [layers]
  );

  const activeLayerNames = useMemo(
    () => layers.filter((l) => l.enabled).map((l) => l.name).join(', '),
    [layers]
  );

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'h-[52px] flex items-center justify-between px-4',
        'bg-[#050810]/90 backdrop-blur-md',
        'border-b border-[#1a2436]',
        'shadow-[0_1px_0_rgba(45,212,191,0.06)]'
      )}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <LogoMark />
        <div className="flex flex-col justify-center leading-none">
          <span className="font-display font-semibold text-md tracking-[0.12em] text-[#e8eef5] uppercase">
            OVERVIEW
          </span>
          <span className="text-[10px] text-[#5b6b82] tracking-widest uppercase font-body">
            Earth Intelligence
          </span>
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-[#1a2436] mx-2" />

        {/* Active layers badge */}
        <Tooltip content={activeLayerNames || 'No active layers'} placement="bottom">
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
              'border text-xs font-body select-none',
              activeLayerCount > 0
                ? 'border-accent/30 bg-accent/8 text-accent'
                : 'border-[#1a2436] bg-transparent text-[#5b6b82]'
            )}
          >
            <span
              className={cn(
                'inline-block h-1.5 w-1.5 rounded-full',
                activeLayerCount > 0 ? 'bg-accent animate-pulse' : 'bg-[#5b6b82]'
              )}
            />
            <span className="mono-data">
              {activeLayerCount} layer{activeLayerCount !== 1 ? 's' : ''}
            </span>
          </div>
        </Tooltip>
      </div>

      {/* Center: Live status indicator */}
      <LiveIndicator />

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <Tooltip content={isSoundEnabled ? 'Mute sound' : 'Enable sound'} placement="bottom">
          <Button
            variant="icon"
            size="md"
            active={isSoundEnabled}
            onClick={() => setSoundEnabled(!isSoundEnabled)}
            aria-label={isSoundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {isSoundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </Tooltip>

        <Tooltip content="Settings" placement="bottom">
          <Button
            variant="icon"
            size="md"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </Tooltip>

        <div className="w-px h-4 bg-[#1a2436] mx-1" />

        <Tooltip content="Share" placement="bottom">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShareOpen(true)}
            aria-label="Share"
            className="gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </Tooltip>
      </div>
    </header>
  );
}

/* ─── LogoMark: Inline SVG globe ─────────────────────────────────────── */
function LogoMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle
        cx="14"
        cy="14"
        r="12"
        stroke="#2dd4bf"
        strokeWidth="1.2"
        strokeOpacity="0.7"
      />
      {/* Latitude lines */}
      <ellipse
        cx="14"
        cy="14"
        rx="12"
        ry="5"
        stroke="#2dd4bf"
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />
      {/* Vertical axis */}
      <line
        x1="14"
        y1="2"
        x2="14"
        y2="26"
        stroke="#2dd4bf"
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />
      {/* Teal center dot glow */}
      <circle cx="14" cy="14" r="2.5" fill="#2dd4bf" fillOpacity="0.9" />
      <circle cx="14" cy="14" r="4" fill="#2dd4bf" fillOpacity="0.15" />
    </svg>
  );
}

/* ─── LiveIndicator ───────────────────────────────────────────────────── */
function LiveIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#34d399]/20 bg-[#34d399]/5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-50" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34d399]" />
      </span>
      <span className="text-xs font-medium text-[#34d399] tracking-widest uppercase mono-data">
        Live
      </span>
    </div>
  );
}
