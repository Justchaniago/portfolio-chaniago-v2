'use client';

import { useEffect, useRef, useCallback } from 'react';
import { HeroFluidRenderer, FluidConfig, FLUID_CONFIG } from '@/components/renderers/HeroFluidRenderer';
import { rendererManager } from '@/lib/rendererManager';

export { FLUID_CONFIG };
export type { FluidConfig };

export function useFluidSim(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  cfg: FluidConfig = FLUID_CONFIG,
  mode: 'hero' | 'ambient' = 'hero'
) {
  const rendererRef = useRef<HeroFluidRenderer | null>(null);

  const isAmbient = mode === 'ambient';
  const activeCfg = isAmbient ? {
    damping: 0.988,
    speed: 2,
    dist: 4,
    iri: 3.5,
    tint: 2.5,
    ambientFreq: 12,
    ambientMag: 0.015,
    transparent: true,
  } : cfg;

  const disturb = useCallback((
    mx: number, my: number,
    vx: number, vy: number
  ) => {
    if (rendererRef.current) {
      rendererRef.current.disturb(mx, my, vx, vy);
    }
  }, []);

  const resetLastPos = useCallback(() => {
    // Keep exact original API contract
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new HeroFluidRenderer(activeCfg);
    rendererRef.current = renderer;

    // Initialize module and register into central loop manager
    renderer.initialize(canvas);
    rendererManager.register(renderer, { container: canvas });

    const ro = new ResizeObserver(() => {
      renderer.resize();
    });
    ro.observe(canvas);

    return () => {
      ro.disconnect();
      rendererManager.unregister(renderer);
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [canvasRef, activeCfg]);

  return { disturb, resetLastPos };
}
