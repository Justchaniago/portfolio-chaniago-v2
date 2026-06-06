'use client';

export interface RendererModuleContract {
  readonly id: string;
  readonly type: 'canvas2d' | 'webgl' | 'shader';
  initialize(canvas: HTMLCanvasElement): void;
  resize(): void;
  update(time: number, deltaTime: number): void;
  render(): void;
  destroy(): void;
}

class RendererManagerCoordinator {
  private renderers = new Map<string, RendererModuleContract>();
  private rafId: number | null = null;
  private lastTime = 0;
  private isRunning = false;

  public register(module: RendererModuleContract): void {
    if (this.renderers.has(module.id)) return;
    this.renderers.set(module.id, module);

    if (!this.isRunning && this.renderers.size > 0) {
      this.start();
    }
  }

  public unregister(module: RendererModuleContract): void {
    if (!this.renderers.has(module.id)) return;
    this.renderers.delete(module.id);

    if (this.isRunning && this.renderers.size === 0) {
      this.stop();
    }
  }

  public start(): void {
    if (typeof window === 'undefined' || this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();

    const tick = (now: number) => {
      if (!this.isRunning) return;

      const deltaTime = (now - this.lastTime) / 1000;
      this.lastTime = now;

      this.renderers.forEach((module) => {
        module.update(now, deltaTime);
        module.render();
      });

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  public stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public getActiveCount(): number {
    return this.renderers.size;
  }
}

export const rendererManager = new RendererManagerCoordinator();
