'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { useUIStore } from '@/store/useUIStore';
import { useGlobeStore } from '@/store/useGlobeStore';

interface FlyTarget {
  position: Vector3;
  duration?: number;
}

let flyTarget: FlyTarget | null = null;
let flyProgress = 1;
let flyFrom: Vector3 | null = null;

export function flyToPosition(position: Vector3, duration = 1.2) {
  flyTarget = { position, duration };
  flyProgress = 0;
}

export function CameraRig() {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  const { cameraTarget, setCameraTarget, isRotating, rotationSpeed } = useGlobeStore();

  useEffect(() => {
    if (cameraTarget) {
      flyFrom = camera.position.clone();
      flyTarget = { position: cameraTarget.clone().normalize().multiplyScalar(2.2) };
      flyProgress = 0;
      setCameraTarget(null);
    }
  }, [cameraTarget, camera, setCameraTarget]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const store = useGlobeStore.getState();
      switch (e.key) {
        case ' ':
          e.preventDefault();
          store.setRotating(!store.isRotating);
          break;
        case 'r':
        case 'R':
          // Reset camera
          flyFrom = camera.position.clone();
          flyTarget = { position: new Vector3(0, 0, 2.5) };
          flyProgress = 0;
          break;
        case 'f':
        case 'F':
          document.documentElement.requestFullscreen?.().catch(() => {});
          break;
        case 'Escape':
          useUIStore.getState().setSelectedEvent(null);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [camera]);

  useFrame((_, delta) => {
    if (flyTarget && flyProgress < 1 && flyFrom) {
      flyProgress = Math.min(1, flyProgress + delta / (flyTarget.duration ?? 1.2));
      const t = easeInOutCubic(flyProgress);
      camera.position.lerpVectors(flyFrom, flyTarget.position, t);
      camera.lookAt(0, 0, 0);
      if (flyProgress >= 1) {
        flyTarget = null;
        flyFrom = null;
      }
    }

    // Idle globe rotation via camera azimuth when enabled
    if (isRotating && flyProgress >= 1 && !flyTarget) {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = rotationSpeed * 20;
      }
    } else if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={1.3}
      maxDistance={6}
      enablePan={false}
      rotateSpeed={0.4}
      zoomSpeed={0.8}
    />
  );
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
