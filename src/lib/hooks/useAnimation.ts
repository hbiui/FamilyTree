import { useState, useCallback } from 'react';

export interface AnimationState {
  isPlaying: boolean;
  type: 'petal' | 'bloodline' | 'nodePopup' | null;
  data: any;
}

export function useFamilyTreeAnimations() {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    type: null,
    data: null,
  });

  const playPetalFall = useCallback((emoji?: string, count?: number) => {
    setAnimationState({
      isPlaying: true,
      type: 'petal',
      data: { emoji, count },
    });
  }, []);

  const playBloodLine = useCallback((points: { x: number; y: number }[]) => {
    setAnimationState({
      isPlaying: true,
      type: 'bloodline',
      data: { points },
    });
  }, []);

  const playNodePopup = useCallback((parentX: number, parentY: number, childX: number, childY: number) => {
    setAnimationState({
      isPlaying: true,
      type: 'nodePopup',
      data: { parentX, parentY, childX, childY },
    });
  }, []);

  const stopAnimation = useCallback(() => {
    setAnimationState({
      isPlaying: false,
      type: null,
      data: null,
    });
  }, []);

  return {
    animationState,
    playPetalFall,
    playBloodLine,
    playNodePopup,
    stopAnimation,
  };
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    frameTime: 16.67,
    droppedFrames: 0,
    memoryUsage: 0,
  });

  const startMonitoring = useCallback(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    let droppedFrames = 0;

    const monitor = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      const fps = 1000 / deltaTime;

      if (deltaTime > 20) {
        droppedFrames++;
      }

      frameCount++;

      if (frameCount % 60 === 0) {
        setMetrics({
          fps: Math.round(fps),
          frameTime: Math.round(deltaTime * 100) / 100,
          droppedFrames,
          memoryUsage: (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0,
        });
      }

      lastTime = currentTime;
      requestAnimationFrame(monitor);
    };

    const rafId = requestAnimationFrame(monitor);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return {
    metrics,
    startMonitoring,
  };
}
