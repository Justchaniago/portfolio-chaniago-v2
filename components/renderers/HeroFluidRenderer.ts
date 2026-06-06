'use client';

import { RendererModuleContract } from '@/lib/rendererManager';

export const FLUID_CONFIG = {
  damping: 0.985,      // Damping for wave decay (0.97 - 0.995)
  speed: 4,          // Propagation speed
  dist: 5,          // Radius of mouse disturbance
  iri: 6,          // Iridescence strength on slopes (0 to 10)
  tint: 4,          // Phosphor color tint in troughs (0 to 10)
  ambientFreq: 24,         // Frequency of random ambient ripples
  ambientMag: 0.02,       // Magnitude of random ambient ripples
} as const;

export interface FluidConfig {
  damping: number;
  speed: number;
  dist: number;
  iri: number;
  tint: number;
  ambientFreq: number;
  ambientMag: number;
  transparent?: boolean;
}

export class HeroFluidRenderer implements RendererModuleContract {
  readonly id = 'hero-fluid';
  readonly type = 'canvas2d';

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private cur: Float32Array = new Float32Array(0);
  private prev: Float32Array = new Float32Array(0);
  private cols = 0;
  private rows = 0;
  private cell = 2;
  private W = 0;
  private H = 0;
  private cfg: FluidConfig;
  private frameCount = 0;

  constructor(cfg: FluidConfig = FLUID_CONFIG) {
    this.cfg = cfg;
  }

  public initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.initSim();
  }

  public resize(): void {
    this.initSim();
  }

  public update(time: number, deltaTime: number): void {
    if (!this.canvas || this.cur.length === 0) return;

    // Ambient micro-ripple
    this.frameCount++;
    if (this.frameCount % this.cfg.ambientFreq === 0) {
      const c = 1 + Math.floor(Math.random() * (this.cols - 2));
      const r = 1 + Math.floor(Math.random() * (this.rows - 2));
      this.cur[r * this.cols + c] += (Math.random() - 0.5) * this.cfg.ambientMag;
    }

    // Classic 2D wave equation step (Double-Buffered)
    const { cur, prev, cols, rows } = this;
    const d = this.cfg.damping;

    for (let r = 1; r < rows - 1; r++) {
      const rCols = r * cols;
      const rPrevCols = (r - 1) * cols;
      const rNextCols = (r + 1) * cols;
      for (let c = 1; c < cols - 1; c++) {
        const i = rCols + c;
        const neighbors =
          prev[rCols + (c - 1)] +
          prev[rCols + (c + 1)] +
          prev[rPrevCols + c] +
          prev[rNextCols + c];

        let val = neighbors * 0.5 - cur[i];
        val *= d;
        cur[i] = val;
      }
    }

    // Swap cur and prev reference buffers
    this.cur = prev;
    this.prev = cur;
  }

  public render(): void {
    if (this.cur.length === 0 || !this.ctx) return;

    const ctx = this.ctx;
    const img = ctx.createImageData(this.W, this.H);
    const px = img.data;
    const { cur, cols, rows, W, H, cell } = this;
    const iriF = this.cfg.iri / 10;
    const tntF = this.cfg.tint / 10;
    const isTransparent = !!this.cfg.transparent;

    for (let py = 0; py < H; py++) {
      const pyW = py * W;
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

        let R = isTransparent ? 10 : 6;
        let G = isTransparent ? 10 : 6;
        let B = isTransparent ? 10 : 6;

        if (h > 0.003) {
          const sp = Math.min(h * 120, 100);
          R += sp; G += sp; B += sp;
        }

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

        if (h < -0.005 && tntF > 0) {
          const dp = Math.min(Math.abs(h) * tntF * 65, 40);
          R += dp * 0.79; G += dp * 0.94; B += dp * 0.66;
        }

        let alpha = 255;
        if (isTransparent) {
          const activity = Math.min(1.0, Math.abs(h) * 110 + slope * 10);
          alpha = Math.min(255, Math.max(0, Math.round(activity * 255)));
        }

        const b4 = (pyW + px2) * 4;
        px[b4] = Math.min(255, Math.max(0, (R + 0.5) | 0));
        px[b4 + 1] = Math.min(255, Math.max(0, (G + 0.5) | 0));
        px[b4 + 2] = Math.min(255, Math.max(0, (B + 0.5) | 0));
        px[b4 + 3] = alpha;
      }
    }

    ctx.putImageData(img, 0, 0);
  }

  public destroy(): void {
    this.canvas = null;
    this.ctx = null;
    this.cur = new Float32Array(0);
    this.prev = new Float32Array(0);
  }

  public disturb(mx: number, my: number, vx: number, vy: number): void {
    if (this.cur.length === 0) return;
    const spd = Math.sqrt(vx * vx + vy * vy);
    if (spd < 0.2) return;

    const mag = Math.min(spd * 0.18, 1.8) * (this.cfg.dist / 5);
    const br = Math.max(2, Math.round((2.5 + this.cfg.dist * 0.45) / this.cell));
    const gc = Math.round(mx / this.cell) + 1;
    const gr = Math.round(my / this.cell) + 1;

    for (let dr = -br; dr <= br; dr++) {
      for (let dc = -br; dc <= br; dc++) {
        const tc = gc + dc;
        const tr = gr + dr;
        if (tc < 1 || tc >= this.cols - 1) continue;
        if (tr < 1 || tr >= this.rows - 1) continue;
        if (dc * dc + dr * dr > br * br) continue;

        const radF = 1 - Math.sqrt(dc * dc + dr * dr) / (br || 1);
        const f = mag * radF;

        this.cur[tr * this.cols + tc] += f;
      }
    }
  }

  private initSim(): void {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const scale = 4;
    const W = Math.max(120, Math.round((rect.width > 10 ? rect.width : window.innerWidth) / scale));
    const H = Math.max(90, Math.round((rect.height > 10 ? rect.height : window.innerHeight) / scale));

    this.canvas.width = W;
    this.canvas.height = H;

    if (W === 0 || H === 0) return;

    this.W = W;
    this.H = H;
    this.cell = 2;
    this.cols = Math.floor(W / this.cell) + 2;
    this.rows = Math.floor(H / this.cell) + 2;
    const n = this.cols * this.rows;

    this.cur = new Float32Array(n);
    this.prev = new Float32Array(n);
  }
}
