'use client';

import { interactionSystem, type PointerState } from './interactionSystem';

export type InteractionLifecycleContext = {
  ownerScene?: string;
  ownerOverlay?: string;
  permissions?: {
    pointer: boolean;
    hover: boolean;
    drag: boolean;
    keyboard: boolean;
  };
  target?: HTMLElement;
};

export interface InteractionSystemContract {
  id: string;
  type: 'cursor' | 'magnetic' | 'hover-field' | 'pointer-reaction' | 'fluid-hover' | 'gesture';

  initialize(context: InteractionLifecycleContext): void;
  activate(): void;
  deactivate(): void;
  destroy(): void;
}

export interface HoverSweepOptions {
  radius?: number;
  maxRadius?: number;
  velocityMultiplier?: number;
  interpolation?: number;
  decay?: number;
}

export class HoverSweep implements InteractionSystemContract {
  public readonly id = 'contact-hover-sweep';
  public readonly type = 'hover-field';

  private active = false;
  private targetElement: HTMLElement | null = null;
  private latestPointerState: PointerState = {
    x: 0,
    y: 0,
    velocity: 0,
    active: false,
  };

  constructor(private readonly options: HoverSweepOptions = {}) {}

  public initialize(context: InteractionLifecycleContext): void {
    if (context.target) {
      this.targetElement = context.target;
    }
  }

  public activate(): void {
    if (this.active) return;
    this.active = true;
    interactionSystem.subscribe(this.handlePointerUpdate);
  }

  public deactivate(): void {
    if (!this.active) return;
    this.active = false;
    interactionSystem.unsubscribe(this.handlePointerUpdate);
  }

  public destroy(): void {
    this.deactivate();
    this.targetElement = null;
  }

  public getPointerState(): PointerState {
    return { ...this.latestPointerState };
  }

  public getTarget(): HTMLElement | null {
    return this.targetElement;
  }

  private handlePointerUpdate = (state: PointerState) => {
    if (!this.active) return;
    this.latestPointerState = state;
  };
}
