'use client';

import { useEffect, useRef, useCallback } from 'react';

// ── Config — edit nilai ini untuk polish ──────────────────────
export const FLUID_CONFIG = {
  damping: 0.985,      // Damping for wave decay (0.97 - 0.995)
  speed: 4,          // Propagation speed
  dist: 5,          // Radius of mouse disturbance
  iri: 6,          // Iridescence strength on slopes (0 to 10)
  tint: 4,          // Phosphor color tint in troughs (0 to 10)
  ambientFreq: 24,         // Frequency of random ambient ripples
  ambientMag: 0.02,       // Magnitude of random ambient ripples
} as const;

export type FluidConfig = typeof FLUID_CONFIG;

interface Sim {
  cur: Float32Array;        // Current height buffer
  prev: Float32Array;        // Previous height buffer
  cols: number;
  rows: number;
  cell: number;
  W: number;
  H: number;
}

// ── Wave equation step (Double-Buffered) ──────────────────────
function stepSim(s: Sim, cfg: FluidConfig): void {
  const { cur, prev, cols, rows } = s;
  const d = cfg.damping;

  // Classic 2D wave equation: new_height = (neighbors_sum) / 2 - old_height
  // Computed stably using read-only 'prev' and writing into 'cur'
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      const i = r * cols + c;
      const neighbors =
        prev[r * cols + (c - 1)] +
        prev[r * cols + (c + 1)] +
        prev[(r - 1) * cols + c] +
        prev[(r + 1) * cols + c];

      let val = neighbors * 0.5 - cur[i];
      val *= d;
      cur[i] = val;
    }
  }

  // Swap s.cur and s.prev references to set up the next frame
  s.cur = prev;
  s.prev = cur;
}

// ── Directional disturbance ───────────────────────────────────
function disturbSim(
  s: Sim, cfg: FluidConfig,
  mx: number, my: number,
  vx: number, vy: number
): void {
  const spd = Math.sqrt(vx * vx + vy * vy);
  if (spd < 0.2) return;

  const mag = Math.min(spd * 0.18, 1.8) * (cfg.dist / 5);
  const br = Math.max(2, Math.round((2.5 + cfg.dist * 0.45) / s.cell));
  const gc = Math.round(mx / s.cell) + 1;
  const gr = Math.round(my / s.cell) + 1;

  for (let dr = -br; dr <= br; dr++) {
    for (let dc = -br; dc <= br; dc++) {
      const tc = gc + dc;
      const tr = gr + dr;
      if (tc < 1 || tc >= s.cols - 1) continue;
      if (tr < 1 || tr >= s.rows - 1) continue;
      if (dc * dc + dr * dr > br * br) continue;

      const radF = 1 - Math.sqrt(dc * dc + dr * dr) / (br || 1);
      const f = mag * radF;

      // Inject force into current buffer
      s.cur[tr * s.cols + tc] += f;
    }
  }
}

// ── Pixel renderer ────────────────────────────────────────────
function renderSim(s: Sim, cfg: FluidConfig, img: ImageData): void {
  const px = img.data;
  const { cur, cols, rows, W, H, cell } = s;
  const iriF = cfg.iri / 10;
  const tntF = cfg.tint / 10;

  for (let py = 0; py < H; py++) {
    for (let px2 = 0; px2 < W; px2++) {
      const gc = Math.min(Math.floor(px2 / cell) + 1, cols - 2);
      const gr = Math.min(Math.floor(py / cell) + 1, rows - 2);
      const i = gr * cols + gc;
      const h = cur[i];

      const cL = Math.max(1, gc - 1);
      const cR = Math.min(cols - 2, gc + 1);
      const rU = Math.max(1, gr - 1);
      const rD = Math.min(rows - 2, gr + 1);

      const dxH = cur[gr * cols + cR] - cur[gr * cols + cL];
      const dyH = cur[rD * cols + gc] - cur[rU * cols + gc];
      const slope = Math.sqrt(dxH * dxH + dyH * dyH);

      let R = 6, G = 6, B = 6; // Deep monochromatic void base color

      // Specular Highlight — White on crests
      if (h > 0.003) {
        const sp = Math.min(h * 120, 100);
        R += sp; G += sp; B += sp;
      }

      // Metallic Iridescence — High-frequency ripple coloration on slopes
      if (slope > 0.01 && iriF > 0) {
        const hue = ((Math.atan2(dyH, dxH) / (Math.PI * 2)) + 1) % 1 * 360;
        const h6 = hue / 60;
        const xv = 1 - Math.abs(h6 % 2 - 1);
        let cr = 0, cg = 0, cb = 0;

        if (h6 < 1) { cr = 1; cg = xv; }
        else if (h6 < 2) { cr = xv; cg = 1; }
        else if (h6 < 3) { cg = 1; cb = xv; }
        else if (h6 < 4) { cg = xv; cb = 1; }
        else if (h6 < 5) { cr = xv; cb = 1; }
        else { cr = 1; cb = xv; }

        const inten = Math.min(slope * iriF * 220, 150);
        R += cr * inten; G += cg * inten; B += cb * inten;
      }

      // Phosphor Tint — Glow in troughs (representing the accent color)
      if (h < -0.005 && tntF > 0) {
        const dp = Math.min(Math.abs(h) * tntF * 65, 40);
        R += dp * 0.79; G += dp * 0.94; B += dp * 0.66; // #C9F0A8 mix tint
      }

      const b4 = (py * W + px2) * 4;
      px[b4] = Math.min(255, Math.max(0, (R + 0.5) | 0));
      px[b4 + 1] = Math.min(255, Math.max(0, (G + 0.5) | 0));
      px[b4 + 2] = Math.min(255, Math.max(0, (B + 0.5) | 0));
      px[b4 + 3] = 255;
    }
  }
}

// ── Hook ─────────────────────────────────────────────────────
export function useFluidSim(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  cfg: FluidConfig = FLUID_CONFIG
) {
  const simRef = useRef<Sim | null>(null);
  const rafRef = useRef<number>(0);
  const frameRef = useRef(0);
  const lxRef = useRef(-1);
  const lyRef = useRef(-1);

  const initSim = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Performance optimization: Render at a lower resolution (e.g. scaled down by 4)
    // The GPU will automatically upscale with smooth bilinear interpolation.
    // This reduces CPU calculations by a factor of 16, resulting in a locked 60fps.
    const scale = 4;
    const W = Math.max(120, Math.round((rect.width > 10 ? rect.width : window.innerWidth) / scale));
    const H = Math.max(90, Math.round((rect.height > 10 ? rect.height : window.innerHeight) / scale));

    canvas.width = W;
    canvas.height = H;

    if (W === 0 || H === 0) return;

    // Finer cells in scaled-down coordinate space
    const cell = 2;
    const cols = Math.floor(W / cell) + 2;
    const rows = Math.floor(H / cell) + 2;
    const n = cols * rows;

    simRef.current = {
      cur: new Float32Array(n),
      prev: new Float32Array(n),
      cols, rows, cell, W, H,
    };
  }, [canvasRef]);

  const disturb = useCallback((
    mx: number, my: number,
    vx: number, vy: number
  ) => {
    if (!simRef.current) return;
    disturbSim(simRef.current, cfg, mx, my, vx, vy);
  }, [cfg]);

  const resetLastPos = useCallback(() => {
    lxRef.current = -1;
    lyRef.current = -1;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let stopped = false;

    function loop() {
      if (stopped) return;
      const s = simRef.current;
      const ctx = canvas?.getContext('2d');
      if (!s || !ctx || s.W === 0) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // Ambient micro-ripple
      frameRef.current++;
      if (frameRef.current % cfg.ambientFreq === 0) {
        const c = 1 + Math.floor(Math.random() * (s.cols - 2));
        const r = 1 + Math.floor(Math.random() * (s.rows - 2));
        s.cur[r * s.cols + c] += (Math.random() - 0.5) * cfg.ambientMag;
      }

      // Physics Steps
      stepSim(s, cfg);

      // Render Frame
      const img = ctx.createImageData(s.W, s.H);
      renderSim(s, cfg, img);
      ctx.putImageData(img, 0, 0);

      rafRef.current = requestAnimationFrame(loop);
    }

    // Double RAF ensures styling/layout is settled before initializing simulation
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        initSim();
        loop();
      })
    );

    const ro = new ResizeObserver(() => {
      initSim();
    });
    ro.observe(canvas);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [canvasRef, cfg, initSim]);

  return { disturb, resetLastPos };
}
