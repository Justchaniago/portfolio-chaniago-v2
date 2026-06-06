'use client';

export interface PointerState {
  x: number;
  y: number;
  velocity: number;
  active: boolean;
}

export type PointerListener = (state: PointerState) => void;

class InteractionSystemManager {
  private state: PointerState = {
    x: 0,
    y: 0,
    velocity: 0,
    active: false,
  };

  private previousX = 0;
  private previousY = 0;
  private lastMoveTime = 0;
  private listeners = new Set<PointerListener>();
  private rafId: number | null = null;
  private isInitialized = false;

  constructor() {
    // Safe for SSR. Initialization happens when first subscriber joins or manually initialized.
  }

  public initialize() {
    if (typeof window === 'undefined' || this.isInitialized) return;

    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', this.handlePointerDown, { passive: true });
    window.addEventListener('pointerup', this.handlePointerUp, { passive: true });
    document.addEventListener('pointerleave', this.handlePointerLeave, { passive: true });

    this.isInitialized = true;
    this.startLoop();
  }

  public destroy() {
    if (typeof window === 'undefined' || !this.isInitialized) return;

    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointerup', this.handlePointerUp);
    document.removeEventListener('pointerleave', this.handlePointerLeave);

    this.isInitialized = false;
    this.stopLoop();
  }

  public getPointerState(): PointerState {
    return { ...this.state };
  }

  public subscribe(listener: PointerListener) {
    this.listeners.add(listener);
    if (!this.isInitialized) {
      this.initialize();
    }
  }

  public unsubscribe(listener: PointerListener) {
    this.listeners.delete(listener);
    if (this.listeners.size === 0 && this.isInitialized) {
      this.destroy();
    }
  }

  private handlePointerMove = (e: PointerEvent) => {
    this.state.x = e.clientX;
    this.state.y = e.clientY;
    this.state.active = true;
    this.lastMoveTime = performance.now();

    const dx = this.state.x - this.previousX;
    const dy = this.state.y - this.previousY;
    this.state.velocity = Math.hypot(dx, dy);

    this.previousX = this.state.x;
    this.previousY = this.state.y;
  };

  private handlePointerDown = (e: PointerEvent) => {
    this.state.x = e.clientX;
    this.state.y = e.clientY;
    this.state.active = true;
  };

  private handlePointerUp = () => {
    // Mouse remains active until pointer leaves window
  };

  private handlePointerLeave = () => {
    this.state.active = false;
    this.state.velocity = 0;
  };

  private startLoop() {
    if (this.rafId !== null) return;

    const tick = () => {
      if (!this.isInitialized) return;

      const now = performance.now();
      const timeSinceLastMove = now - this.lastMoveTime;

      // Decay velocity if pointer stops moving
      if (timeSinceLastMove > 16 && this.state.velocity > 0.01) {
        this.state.velocity *= 0.85;
        if (this.state.velocity < 0.01) {
          this.state.velocity = 0;
        }
      }

      // Notify all subscribers of the current frame state
      const stateSnapshot = this.getPointerState();
      this.listeners.forEach((listener) => listener(stateSnapshot));

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

export const interactionSystem = new InteractionSystemManager();
