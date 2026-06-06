# Hero Fluid Extraction Plan (ARCH-010C)

## Executive Summary

This document specifies the extraction blueprint for the **Hero Fluid Simulation** from its current React hook implementation (`useFluidSim.ts`) into a centralized `HeroFluidRenderer` class conforming to the `RendererModuleContract`. It establishes strict ownership separation between the Hero Scene (view layer) and the Renderer System (computational layer).

---

## PART 1 — CURRENT HERO FLUID AUDIT

### Current State of `useFluidSim.ts`
- **Simulation Math**: Implements Double-Buffered 2D wave equations on `Float32Array` buffers.
- **Rendering**:repaints the downscaled canvas using Canvas2D `putImageData` on every frame.
- **Frame Loop**: Coordinates its own `requestAnimationFrame` loop internally.
- **Event Piping**: Returns a `disturb` function called by `Hero.tsx` upon scroll, mouse move, and touch triggers.

### Hero Fluid Ownership Map (Current)

```txt
┌────────────────────────────────────────────────────────┐
│                        Hero.tsx                        │
│   - Mounts <canvas> element                            │
│   - Captures local mouse/touch/scroll events           │
│   - Invokes hook's disturb() callback                  │
└───────────────────────────┬────────────────────────────┘
                            │ Calls disturb()
                            ▼
┌────────────────────────────────────────────────────────┐
│                    useFluidSim.ts                      │
│   - Allocates Float32Array height buffers              │
│   - Orchestrates independent RAF frame loop            │
│   - Calculates wave physics and repaints pixels        │
│   - Attaches local ResizeObserver to canvas            │
└────────────────────────────────────────────────────────┘
```

---

## PART 2 — RESPONSIBILITY DECOMPOSITION

To separate scene logic from rendering execution, we decompose the responsibilities:

| Responsibility | Current Owner | Future Owner | Status |
|---|---|---|---|
| **Canvas DOM Mount** | `Hero.tsx` | `Hero.tsx` (Scene) | **Stay In Hero** |
| **Activation Intent** (When to run) | `Hero.tsx` | `HeroScene` (via Director) | **Stay In Hero** |
| **Storytelling / Reveal Timeline** | `Hero.tsx` | `HeroScene` | **Stay In Hero** |
| **Double Height Buffers** (`cur`/`prev`) | `useFluidSim` | `HeroFluidRenderer` | **Move To Renderer** |
| **Wave Equation Calculations** | `useFluidSim` | `HeroFluidRenderer` | **Move To Renderer** |
| **Canvas repainting (`renderSim`)** | `useFluidSim` | `HeroFluidRenderer` | **Move To Renderer** |
| **Central loop coordination (RAF)** | `useFluidSim` | `RendererManager` | **Move To Renderer** |
| **Resize listener & Debounce** | `useFluidSim` | `RendererManager` | **Move To Renderer** |
| **Mouse coordinate capture** | `Hero.tsx` | `InteractionSystem` | **Move Later (Sprint 2)**|

---

## PART 3 — RENDERER CONSUMER MAPPING

We design the class `HeroFluidRenderer` as the first module consumer.

### Input / Output Schema

```txt
  Pointer / Scroll vectors
             │
             ▼ (disturb)
┌────────────────────────────────────────────────────────┐
│                   HeroFluidRenderer                    │
│   - Inputs: Canvas width/height, config tokens         │
│   - State: Double Float32Array height buffers          │
│   - Calculations: stepSim(), disturbSim()              │
│   - Outputs: ImageData write pixels                    │
└───────────────────────────┬────────────────────────────┘
                            │ putImageData()
                            ▼
                     Canvas Viewport
```

- **What Hero Scene Provides**: The `<canvas>` DOM element, activation lifecycle boundaries (play/pause requests), and initial configuration properties.
- **What HeroFluidRenderer Provides**: High-performance pixel rendering, wave physics solver, and a local `disturb()` method to accept external vector forces.

---

## PART 4 — LIFECYCLE MAPPING

We coordinate the lifecycle handoff between the Scene and the Renderer:

```txt
┌────────────────────────────────────────────────────────────────────────┐
│                              LIFECYCLE                                 │
├──────────────────────┬────────────────────────┬────────────────────────┤
│ Stage                │ Hero Scene (Trigger)   │ Renderer System        │
├──────────────────────┼────────────────────────┼────────────────────────┤
│ 1. Mount             │ Mounts <canvas> and   │ Creates                │
│                      │ forwards ref.          │ HeroFluidRenderer.     │
├──────────────────────┼────────────────────────┼────────────────────────┤
│ 2. Initialize        │ Passes canvas ref to   │ Allocates buffers and  │
│                      │ RendererManager.       │ registers module.      │
├──────────────────────┼────────────────────────┼────────────────────────┤
│ 3. Run               │ Scene becomes active.  │ Starts tick loop;      │
│                      │                        │ runs update & render.  │
├──────────────────────┼────────────────────────┼────────────────────────┤
│ 4. Pause (Scroll out)│ Scene goes off-screen. │ Halts calculations and │
│                      │                        │ stops drawing cycles.  │
├──────────────────────┼────────────────────────┼────────────────────────┤
│ 5. Unmount           │ Scene destroyed.       │ Evicts GPU buffers and │
│                      │                        │ deletes Float32Arrays. │
└──────────────────────┴────────────────────────┴────────────────────────┘
```

---

## PART 5 — PERFORMANCE AUDIT

Auditing the current unmanaged rendering problems and their solutions:

### Problems & Solutions

1. **Independent RAF Loop** (Severity: **HIGH**):
   - *Problem*: Runs 60fps constantly, competing for CPU ticks when other scenes are active.
   - *Solution*: `RendererManager` halts the tick loop entirely when the scene is deactivated or scrolled out of view.
2. **Local ResizeObserver Thrashing** (Severity: **MEDIUM**):
   - *Problem*: Triggering individual layout recalibrations creates risk of layout cycles.
   - *Solution*: A single debounced resize listener on `RendererManager` coalesces resize events.
3. **No GPU/Memory cleanup** (Severity: **HIGH**):
   - *Problem*: If the user navigates pages, old canvas buffers are not garbage-collected, creating a leak risk.
   - *Solution*: Conforming to `destroy()` forces explicit buffer eviction.

---

## PART 6 — MIGRATION RISK ANALYSIS

| Risk Area | Description | Severity | Mitigation |
|---|---|---|---|
| **Visual Regression** | Ripple speeds, phosphor tints, or ambient noise waves change feel. | **HIGH** | Retain original physics parameters (`FLUID_CONFIG`) and double-buffer math in exact form. |
| **Resize Stutter** | Reallocating Float32Arrays during window resize causes frame drops. | **MEDIUM** | Debounce resize recalculations by `150ms` to avoid reallocations during continuous dragging. |
| **Touch Event Clash** | Mobile swipe-to-scroll conflicts with touch disturbances. | **MEDIUM** | Gated check in local scene event handler to ignore disturbances if page is transitioning. |
| **Off-screen Repaint** | Background ticks consume mobile CPU when in Contact section. | **HIGH** | Halt rendering automatically using `IntersectionObserver` on the parent container. |

---

## PART 7 — EXTRACTION STRATEGY

We establish a safe 4-phase extraction sequence:

```txt
┌────────────────────────────────────────────────────────┐
│                        PHASE 1                         │
│   - Create HeroFluidRenderer conforming to contract    │
│   - Copy exact Float32Array math from useFluidSim      │
├────────────────────────────────────────────────────────┤
│                        PHASE 2                         │
│   - Implement Adapter pattern inside useFluidSim       │
│   - Let useFluidSim delegate loop to the new class     │
├────────────────────────────────────────────────────────┤
│                        PHASE 3                         │
│   - Mount central RendererManager                      │
│   - Delete useFluidSim hook; register module directly  │
├────────────────────────────────────────────────────────┤
│                        PHASE 4                         │
│   - Validate frame decay, scroll disturbances,         │
│     off-screen sleep, and clean up adapter code        │
└────────────────────────────────────────────────────────┘
```

---

## PART 8 — RENDERER READINESS TEST

- **Are contracts sufficient?**: **READY**.
- **Justification**: The `RendererModuleContract` and `RendererManagerContract` defined in `docs/00-foundation/21_RENDERER_CONTRACTS.md` provide all lifecycle methods (`initialize`, `resize`, `update`, `render`, `pause`, `resume`, `destroy`) required to encapsulate this simulation. No contract changes are needed.

---

## PART 9 — ARCH-010D RECOMMENDATION

We recommend:

```txt
ARCH-010D: Hero Fluid Runtime Extraction
```

### Technical Rationale
With the extraction plan documented, the next logical milestone is the actual runtime extraction of the `HeroFluidRenderer` class and its validation against the legacy hook to guarantee 100% visual and performance parity before building the master manager.

---

## ARCH-010C Success Verdict
- [x] Hero Fluid audited
- [x] Ownership decomposition completed
- [x] Renderer consumer mapped
- [x] Lifecycle mapped
- [x] Performance audited
- [x] Migration risks identified
- [x] Extraction strategy documented
- [x] Renderer readiness assessed
- [x] Next phase recommended
