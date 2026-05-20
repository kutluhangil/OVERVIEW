import { create } from 'zustand';
import { GeoEvent } from '@/lib/types';

interface UIState {
  isLayersPanelOpen: boolean;
  isTimelineOpen: boolean;
  isSettingsOpen: boolean;
  isShareOpen: boolean;
  isUploadOpen: boolean;
  isSoundEnabled: boolean;
  selectedEvent: GeoEvent | null;
  narrationText: string;
  narrationKey: number;
  setLayersPanelOpen: (open: boolean) => void;
  setTimelineOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setShareOpen: (open: boolean) => void;
  setUploadOpen: (open: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSelectedEvent: (event: GeoEvent | null) => void;
  setNarration: (text: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLayersPanelOpen: true,
  isTimelineOpen: true,
  isSettingsOpen: false,
  isShareOpen: false,
  isUploadOpen: false,
  isSoundEnabled: false,
  selectedEvent: null,
  narrationText: '',
  narrationKey: 0,
  setLayersPanelOpen: (open) => set({ isLayersPanelOpen: open }),
  setTimelineOpen: (open) => set({ isTimelineOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setShareOpen: (open) => set({ isShareOpen: open }),
  setUploadOpen: (open) => set({ isUploadOpen: open }),
  setSoundEnabled: (enabled) => set({ isSoundEnabled: enabled }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setNarration: (text) =>
    set((s) => ({ narrationText: text, narrationKey: s.narrationKey + 1 })),
}));
