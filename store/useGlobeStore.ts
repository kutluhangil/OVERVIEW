import { create } from 'zustand';
import { Vector3 } from 'three';

interface GlobeState {
  isRotating: boolean;
  rotationSpeed: number;
  selectedEventId: string | null;
  cameraTarget: Vector3 | null;
  quality: 'low' | 'medium' | 'high';
  isAutoTour: boolean;
  isCinematicMode: boolean;
  setRotating: (rotating: boolean) => void;
  setRotationSpeed: (speed: number) => void;
  setSelectedEventId: (id: string | null) => void;
  setCameraTarget: (target: Vector3 | null) => void;
  setQuality: (quality: 'low' | 'medium' | 'high') => void;
  setAutoTour: (active: boolean) => void;
  setCinematicMode: (active: boolean) => void;
}

export const useGlobeStore = create<GlobeState>((set) => ({
  isRotating: true,
  rotationSpeed: 0.05,
  selectedEventId: null,
  cameraTarget: null,
  quality: 'high',
  isAutoTour: false,
  isCinematicMode: false,
  setRotating: (rotating) => set({ isRotating: rotating }),
  setRotationSpeed: (speed) => set({ rotationSpeed: speed }),
  setSelectedEventId: (id) => set({ selectedEventId: id }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setQuality: (quality) => set({ quality }),
  setAutoTour: (active) => set({ isAutoTour: active }),
  setCinematicMode: (active) => set({ isCinematicMode: active }),
}));
