import { create } from 'zustand';

type TimeMode = 'live' | 'replay';
type ReplaySpeed = 1 | 5 | 20 | 60;

interface TimeState {
  mode: TimeMode;
  scrubTime: number;
  speed: ReplaySpeed;
  isPlaying: boolean;
  windowHours: number;
  setMode: (mode: TimeMode) => void;
  setScrubTime: (time: number) => void;
  setSpeed: (speed: ReplaySpeed) => void;
  setPlaying: (playing: boolean) => void;
  setWindowHours: (hours: number) => void;
  goLive: () => void;
  getVisibleRange: () => [number, number];
}

export const useTimeStore = create<TimeState>((set, get) => ({
  mode: 'live',
  scrubTime: Date.now(),
  speed: 1,
  isPlaying: false,
  windowHours: 24,
  setMode: (mode) => set({ mode }),
  setScrubTime: (time) => set({ scrubTime: time, mode: 'replay' }),
  setSpeed: (speed) => set({ speed }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setWindowHours: (windowHours) => set({ windowHours }),
  goLive: () => set({ mode: 'live', scrubTime: Date.now(), isPlaying: false }),
  getVisibleRange: () => {
    const { mode, scrubTime, windowHours } = get();
    const end = mode === 'live' ? Date.now() : scrubTime;
    const start = end - windowHours * 60 * 60 * 1000;
    return [start, end];
  },
}));
