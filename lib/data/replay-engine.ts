'use client';

import { useEffect, useRef } from 'react';
import { useTimeStore } from '@/store/useTimeStore';

export function useReplayEngine() {
  const { mode, isPlaying, speed, setScrubTime, scrubTime, goLive } = useTimeStore();
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (mode === 'replay' && isPlaying) {
      const tick = (now: number) => {
        if (lastRef.current) {
          const deltaMs = (now - lastRef.current) * speed;
          const newTime = scrubTime + deltaMs;
          if (newTime >= Date.now()) {
            goLive();
            return;
          }
          setScrubTime(newTime);
        }
        lastRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
      };
      lastRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
      lastRef.current = 0;
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [mode, isPlaying, speed, scrubTime, setScrubTime, goLive]);
}
