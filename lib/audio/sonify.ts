'use client';

import { LayerType } from '@/lib/types';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let initialized = false;

function ensureAudio() {
  if (initialized) return true;
  try {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
    initialized = true;
    return true;
  } catch {
    return false;
  }
}

export function setMasterVolume(vol: number) {
  if (masterGain) masterGain.gain.value = vol;
}

export function playEventSound(
  layer: LayerType,
  magnitude: number = 1,
  lngNorm: number = 0 // -1 to 1 for stereo pan
) {
  if (!ensureAudio() || !audioCtx || !masterGain) return;

  const pan = audioCtx.createStereoPanner();
  pan.pan.value = Math.max(-1, Math.min(1, lngNorm));
  pan.connect(masterGain);

  const gain = audioCtx.createGain();
  gain.connect(pan);

  const now = audioCtx.currentTime;

  switch (layer) {
    case 'earthquake': {
      // Low bass thump, magnitude → pitch / volume
      const freq = 40 + magnitude * 8;
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const vol = Math.min(0.6, magnitude * 0.08);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 1.5);
      break;
    }
    case 'iss': {
      // Soft ascending bleep
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.4);
      break;
    }
    case 'fire': {
      // White noise burst
      const bufferSize = audioCtx.sampleRate * 0.2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 400;
      filter.Q.value = 0.5;
      source.connect(filter);
      filter.connect(gain);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      source.start(now);
      break;
    }
    case 'aurora': {
      // Ethereal pad
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 220 + Math.random() * 100;
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 2);
      break;
    }
    default:
      break;
  }
}

// Ambient space drone
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

export function startAmbient() {
  if (!ensureAudio() || !audioCtx || !masterGain) return;
  if (ambientOsc) return;

  ambientGain = audioCtx.createGain();
  ambientGain.gain.value = 0.04;
  ambientGain.connect(masterGain);

  ambientOsc = audioCtx.createOscillator();
  ambientOsc.type = 'sine';
  ambientOsc.frequency.value = 55;
  ambientOsc.connect(ambientGain);
  ambientOsc.start();
}

export function stopAmbient() {
  ambientOsc?.stop();
  ambientOsc = null;
}

export function resumeAudio() {
  audioCtx?.resume();
}
