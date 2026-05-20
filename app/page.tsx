'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect } from 'react';
import { TopBar } from '@/components/ui/TopBar';
import { LayersPanel } from '@/components/ui/LayersPanel';
import { EventDetailCard } from '@/components/ui/EventDetailCard';
import { TimelineScrubber } from '@/components/ui/TimelineScrubber';
import { NarrationTicker } from '@/components/ui/NarrationTicker';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { ShareModal } from '@/components/ui/ShareModal';
import { DataUploadModal } from '@/components/upload/DataUploadModal';
import { useDataPoller } from '@/lib/data/poller';
import { useHistoryBuffer } from '@/lib/data/history-buffer';
import { useReplayEngine } from '@/lib/data/replay-engine';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';

const GlobeCanvas = dynamic(
  () => import('@/components/globe/GlobeCanvas').then((m) => m.GlobeCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#000308] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-[#2dd4bf] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-[#2dd4bf] text-sm font-mono tracking-wider">INITIALIZING OVERVIEW</div>
          <div className="text-[#5b6b82] text-xs mt-1">Loading Earth...</div>
        </div>
      </div>
    ),
  }
);

export default function OverviewPage() {
  useDataPoller();
  useHistoryBuffer();
  useReplayEngine();
  useKeyboardShortcuts();

  return (
    <main className="fixed inset-0 overflow-hidden">
      {/* 3D Globe — base layer */}
      <div className="absolute inset-0 z-0">
        <GlobeCanvas />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top Bar */}
        <div className="pointer-events-auto">
          <TopBar />
        </div>

        {/* Left Panel */}
        <div className="pointer-events-auto">
          <LayersPanel />
        </div>

        {/* Event Detail Card */}
        <div className="pointer-events-auto">
          <EventDetailCard />
        </div>

        {/* Bottom — Narration + Timeline */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
          <NarrationTicker />
          <TimelineScrubber />
        </div>
      </div>

      {/* Modals */}
      <SettingsModal />
      <ShareModal />
      <DataUploadModal />
    </main>
  );
}
