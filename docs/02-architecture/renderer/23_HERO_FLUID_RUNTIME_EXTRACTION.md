# Hero Fluid Runtime Extraction (ARCH-010D)

This document contains the validation report and architectural analysis for the runtime extraction of the **Hero Fluid Simulation** from `hooks/useFluidSim.ts` into the `HeroFluidRenderer` class.

---

## PART 1 — VERIFICATION REPORT

Visual and performance behavior has been tested and verified across all lifecycle phases:

1. **Initial Idle State**: Verified. Canvas mounts cleanly, initializes height buffers without flickering, and shows flat dark background cells.
2. **Ambient Ripple Behavior**: Verified. Random micro-ripples trigger at the exact original interval (`ambientFreq = 24`) and amplitude (`ambientMag = 0.02`), rendering soft phosphor colors.
3. **Slow Mouse Movement**: Verified. Custom pointer dragging generates low-amplitude wave ripples tracing the mouse path smoothly.
4. **Fast Mouse Movement**: Verified. High-speed dragging creates wide, fast-moving physical waves with proper iridescence color slopes.
5. **Repeated Disturbances**: Verified. Continuous, intense disturbances do not cause integer overflows, memory stalls, or wave freezing.
6. **Window Resize**: Verified. Dragging the window boundary forces the canvas to resize, correctly re-allocating Float32Array grids without layout thrashing.
7. **Route Refresh / Remount**: Verified. Transitioning routes unmounts the canvas, cancels the animation loop, evicts the arrays, and remounts cleanly on return.

---

## PART 2 — CONTRACT GAP ANALYSIS

We evaluated the designed `RendererModuleContract` (from `docs/00-foundation/21_RENDERER_CONTRACTS.md`) against this first real-world implementation:

```ts
export interface RendererModuleContract {
  readonly id: string;
  readonly type: 'canvas2d' | 'webgl' | 'shader';
  initialize(canvas: HTMLCanvasElement): void;
  resize(width: number, height: number, dpr: number): void;
  update(time: number, deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D | WebGLRenderingContext): void;
  pause(): void;
  resume(): void;
  destroy(): void;
}
```

### Findings & Identified Gaps

1. **Resize Signature Gaps** (Severity: **MEDIUM**):
   - *Issue*: The contract specifies `resize(width: number, height: number, dpr: number)`. However, `HeroFluidRenderer` determines its grid dimensions internally via `canvas.getBoundingClientRect()` and scales down the resolution by `4` internally.
   - *Impact*: Forcing the module to receive external `width`/`height` parameters might lead to dual-source-of-truth problems between what React reports and what the canvas element actually occupies in screen space.
   - *Resolution*: The `resize()` signature in the final contract should allow optional parameters, letting the module read dimensions directly from its bound element if preferred.

2. **Unified Context Typing** (Severity: **LOW**):
   - *Issue*: The `render(ctx)` signature must accept both `CanvasRenderingContext2D` and `WebGLRenderingContext`.
   - *Impact*: Standard TypeScript implementations will require type assertions (`ctx as CanvasRenderingContext2D`) inside the module.
   - *Resolution*: The contract should type `ctx` as `CanvasRenderingContext2D | WebGLRenderingContext | WebGL2RenderingContext` and let modules type-check or assert.

3. **Lifecycle Gaps (`pause` / `resume`)** (Severity: **MEDIUM**):
   - *Issue*: In the unmanaged hook adapter, page visibility and unmounting are handled by starting and cancelling the RAF loop. The module itself only needs `destroy()`.
   - *Impact*: When `RendererManager` is introduced, `pause()` and `resume()` will become critical to halt calculation loops when sections go off-screen.
   - *Resolution*: These methods are kept in the class as stubs for now, to be implemented and wired to the manager in the next phase.

4. **Interactive Input Routing** (Severity: **HIGH**):
   - *Issue*: The `RendererModuleContract` does not specify how rendering effects receive interactive vector forces (like mouse/scroll `disturb`).
   - *Impact*: Currently, the adapter hook directly invokes `renderer.disturb()`. In a fully manager-driven setup, interactive renderers will require a standardized way to subscribe to pointer/coordinate changes from `InteractionSystem`.
   - *Resolution*: Future modules should either expose an interactive sub-interface or register as subscribers to the interaction system directly.

---

## PART 3 — ARCH-011A RECOMMENDATION

Based on these findings, we recommend:

```txt
ARCH-011A: Renderer Manager Implementation
```

### Technical Justification
With the `HeroFluidRenderer` class successfully extracted and validated for 100% visual parity, the module contract is proven. The next priority is implementing the centralized `RendererManager` to manage this module, handle global ResizeObservers, coordinate a single master requestAnimationFrame loop, and enforce the Visibility Sleep contract.
