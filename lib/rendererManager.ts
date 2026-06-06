'use client';

export interface RendererModuleContract {
  readonly id: string;
  readonly type: 'canvas2d' | 'webgl' | 'shader';
  initialize(canvas: HTMLCanvasElement): void;
  resize(): void;
  update(time: number, deltaTime: number): void;
  render(): void;
  pause?(): void;
  resume?(): void;
  destroy(): void;
}

export type RendererSleepState = 'ACTIVE' | 'SLEEPING';

export type RendererRegistrationOptions = {
  container?: Element;
  initiallySceneActive?: boolean;
};

type RendererVisibilityRecord = {
  module: RendererModuleContract;
  containerVisible: boolean;
  sceneActive: boolean;
  explicitlyPaused: boolean;
  sleepState: RendererSleepState;
};

class RendererManagerCoordinator {
  private renderers = new Map<string, RendererVisibilityRecord>();
  private observer: IntersectionObserver | null = null;
  private observedContainers = new Map<Element, string>();
  private rafId: number | null = null;
  private lastTime = 0;
  private isRunning = false;
  private documentVisible = true;
  private hasVisibilityListener = false;

  public register(module: RendererModuleContract, options: RendererRegistrationOptions = {}): void {
    if (this.renderers.has(module.id)) return;

    this.ensureDocumentVisibilityListener();

    this.renderers.set(module.id, {
      module,
      containerVisible: true,
      sceneActive: options.initiallySceneActive ?? true,
      explicitlyPaused: false,
      sleepState: 'ACTIVE',
    });

    if (options.container) {
      this.ensureObserver();
      this.observedContainers.set(options.container, module.id);
      this.observer?.observe(options.container);
    }

    this.reconcileModuleState(module.id);
    this.updateLoopState();
  }

  public unregister(module: RendererModuleContract): void {
    const record = this.renderers.get(module.id);
    if (!record) return;

    this.observedContainers.forEach((moduleId, container) => {
      if (moduleId === module.id) {
        this.observer?.unobserve(container);
        this.observedContainers.delete(container);
      }
    });

    this.renderers.delete(module.id);
    this.updateLoopState();
  }

  public pause(module: RendererModuleContract): void {
    this.setExplicitPause(module.id, true);
  }

  public resume(module: RendererModuleContract): void {
    this.setExplicitPause(module.id, false);
  }

  public setSceneActive(moduleId: string, isActive: boolean): void {
    const record = this.renderers.get(moduleId);
    if (!record) return;

    record.sceneActive = isActive;
    this.reconcileModuleState(moduleId);
    this.updateLoopState();
  }

  public start(): void {
    if (typeof window === 'undefined' || this.isRunning || !this.hasRenderableModules()) return;

    this.isRunning = true;
    this.lastTime = performance.now();

    this.rafId = requestAnimationFrame(this.tick);
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

  public getSleepState(moduleId: string): RendererSleepState | null {
    return this.renderers.get(moduleId)?.sleepState ?? null;
  }

  private tick = (now: number) => {
    if (!this.isRunning) return;

    const deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.renderers.forEach((record) => {
      if (record.sleepState === 'SLEEPING') return;

      record.module.update(now, deltaTime);
      record.module.render();
    });

    this.rafId = requestAnimationFrame(this.tick);
  };

  private ensureObserver(): void {
    if (typeof window === 'undefined' || this.observer) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const moduleId = this.observedContainers.get(entry.target);
        if (!moduleId) return;

        const record = this.renderers.get(moduleId);
        if (!record) return;

        record.containerVisible = entry.isIntersecting;
        this.reconcileModuleState(moduleId);
      });

      this.updateLoopState();
    });
  }

  private ensureDocumentVisibilityListener(): void {
    if (typeof document === 'undefined' || this.hasVisibilityListener) return;

    this.documentVisible = document.visibilityState !== 'hidden';
    document.addEventListener('visibilitychange', this.handleDocumentVisibilityChange);
    this.hasVisibilityListener = true;
  }

  private handleDocumentVisibilityChange = () => {
    this.documentVisible = document.visibilityState !== 'hidden';

    this.renderers.forEach((_, moduleId) => {
      this.reconcileModuleState(moduleId);
    });

    this.updateLoopState();
  };

  private setExplicitPause(moduleId: string, isPaused: boolean): void {
    const record = this.renderers.get(moduleId);
    if (!record) return;

    record.explicitlyPaused = isPaused;
    this.reconcileModuleState(moduleId);
    this.updateLoopState();
  }

  private reconcileModuleState(moduleId: string): void {
    const record = this.renderers.get(moduleId);
    if (!record) return;

    const nextState: RendererSleepState = this.isRenderable(record) ? 'ACTIVE' : 'SLEEPING';
    if (record.sleepState === nextState) return;

    record.sleepState = nextState;
    if (nextState === 'SLEEPING') {
      record.module.pause?.();
    } else {
      record.module.resume?.();
      this.lastTime = performance.now();
    }
  }

  private isRenderable(record: RendererVisibilityRecord): boolean {
    return this.documentVisible
      && record.containerVisible
      && record.sceneActive
      && !record.explicitlyPaused;
  }

  private hasRenderableModules(): boolean {
    for (const record of this.renderers.values()) {
      if (record.sleepState === 'ACTIVE') return true;
    }

    return false;
  }

  private updateLoopState(): void {
    if (this.hasRenderableModules()) {
      this.start();
      return;
    }

    this.stop();
  }
}

export const rendererManager = new RendererManagerCoordinator();
