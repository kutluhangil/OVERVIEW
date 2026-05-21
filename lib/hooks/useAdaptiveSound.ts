'use client';

import { useEffect, useRef } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { useUIStore } from '@/store/useUIStore';

// Module-level refs so we can manipulate ongoing nodes without re-creating them
let ambientOscRef: OscillatorNode | null = null;
let ambientGainRef: GainNode | null = null;
let audioCtxRef: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtxRef) {
    try {
      audioCtxRef = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtxRef;
}

export function startAdaptiveAmbient() {
  const ctx = getCtx();
  if (!ctx || ambientOscRef) return;

  const gain = ctx.createGain();
  gain.gain.value = 0.025;
  gain.connect(ctx.destination);
  ambientGainRef = gain;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 55;
  osc.connect(gain);
  osc.start();
  ambientOscRef = osc;
}

export function stopAdaptiveAmbient() {
  try { ambientOscRef?.stop(); } catch { /* already stopped */ }
  ambientOscRef = null;
  ambientGainRef = null;
}

/**
 * Adjusts the ambient drone in real-time based on earthquake activity
 * and aurora intensity without interrupting playback.
 */
export function useAdaptiveSound() {
  const isSoundEnabled = useUIStore((s) => s.isSoundEnabled);
  const earthquakes = useDataStore((s) => s.events.earthquake);
  const aurora = useDataStore((s) => s.events.aurora);
  const rafRef = useRef<number | null>(null);
  const targetFreqRef = useRef(55);
  const targetGainRef = useRef(0.025);

  // Start/stop ambient when sound toggle changes
  useEffect(() => {
    if (isSoundEnabled) {
      startAdaptiveAmbient();
    } else {
      stopAdaptiveAmbient();
    }
    return stopAdaptiveAmbient;
  }, [isSoundEnabled]);

  // Compute targets based on data
  useEffect(() => {
    if (!isSoundEnabled) return;

    const quakeCount = earthquakes.filter((e) => (e.magnitude ?? 0) >= 5).length;
    const maxMag = earthquakes.reduce((m, e) => Math.max(m, e.magnitude ?? 0), 0);
    const auroraIntensity = aurora.reduce((s, e) => s + (e.magnitude ?? 0), 0) / Math.max(aurora.length, 1);

    // Base: 55 Hz (deep space hum)
    // High seismic activity → lower, more ominous (40–60 Hz)
    // Strong aurora → shift toward ethereal (80–100 Hz)
    const seismicPush = Math.min(15, quakeCount * 0.5 + maxMag * 0.8);
    const auroraPush = auroraIntensity * 40;
    targetFreqRef.current = 55 - seismicPush + auroraPush;

    // Volume: quiet baseline, ramps up with activity
    const activityLevel = Math.min(1, quakeCount / 20 + auroraIntensity * 0.3);
    targetGainRef.current = 0.018 + activityLevel * 0.03;
  }, [earthquakes, aurora, isSoundEnabled]);

  // Smooth interpolation toward targets on each animation frame
  useEffect(() => {
    if (!isSoundEnabled) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      const ctx = getCtx();
      if (ctx && ambientOscRef && ambientGainRef) {
        const now = ctx.currentTime;
        const currentFreq = ambientOscRef.frequency.value;
        const currentGain = ambientGainRef.gain.value;
        const smoothFreq = lerp(currentFreq, targetFreqRef.current, 0.005);
        const smoothGain = lerp(currentGain, targetGainRef.current, 0.003);
        ambientOscRef.frequency.setValueAtTime(smoothFreq, now);
        ambientGainRef.gain.setValueAtTime(smoothGain, now);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isSoundEnabled]);
}
