# Renderer Manager Architecture (ARCH-011A)

This document contains the system design and architecture blueprint for the centralized **RendererManager**. It establishes a single requestAnimationFrame tick loop, coordinates debounced window resize propagation, and enforces Visibility Sleep gating.

---

## PART 1 — CURRENT RENDERER INVENTORY

We audited all active and candidate visual drawing systems in the repository:

| Renderer Module | Technology | Current Owner | Loop Owner | Readiness |
|---|---|---|---|---|
| **HeroFluidRenderer** | Canvas2D | `useFluidSim.ts` (Adapter) | Local RAF loop in `useFluidSim.ts` | **READY**. Math and buffers are fully extracted into the class; ready for centralized ticking. |
| **MorphNav Liquid Morph** | Canvas2D | `MorphNav.tsx` | Transient `animateValue` RAF loop (runs only on menu open/close) | **PARTIAL**. Transient nature means it does not need a continuous tick, but registration is safe. |
| **Eclipse GL Shader** | WebGL (Future) | `EclipseTransition.ts` (Future) | Central Loop (Future) | **READY**. Contracts ready for WebGL context allocation. |
| **Contact Particles** | Canvas2D / WebGL (Future) | `ContactScene.ts` (Future) | Central Loop (Future) | **READY**. Contracts accommodate particle buffers. |

---

## PART 2 — RENDERER MANAGER OWNERSHIP

To establish a strict separation between orchestration and drawing, we define the boundaries:

### Owned by RendererManager
- **Single Master RAF Loop**: The only continuous loop ticker in the application space.
- **Registry System**: Active module inventory mapping IDs to registered `RendererModuleContract` classes.
- **Visibility Sleep Coordinator**: Runs a shared `IntersectionObserver` observing module containers.
- **Resize Dispatcher**: Captures window `resize` events, debounces propagation, and updates width/height.
- **Quality Throttling**: Applies global performance caps (lowering resolution divisor when frames drop).

### NOT Owned by RendererManager
- **Scene State**: Does not know whether the user is on Work or Contact (held in `ExperienceDirector` / Scene).
- **Scroll Position**: Does not track scroll progress (held in `ScrollOrchestrator`).
- **Interaction Pointer State**: Does not track pointer coordinates (held in `InteractionSystem`).
- **CSS Styling & DOM Layout**: Does not govern visual DOM styles.

---

## PART 3 — LIFECYCLE MODEL

Individual rendering modules transition across five states managed by `RendererManager`:

```txt
       ┌───────────────┐
       │    Created    │
       └───────┬───────┘
               │ initialize(canvas)
               ▼
       ┌───────────────┐
       │  Initialized  │
       └───────┬───────┘
               │ register() / resume()
               ▼
   ┌──► ┌───────────────┐
   │    │    Active     │
   │    └───────┬───────┘
   │            │ pause() [Off-screen sleep]
   │            ▼
   │    ┌───────────────┐
   │    │    Paused     │
   │    └───────┬───────┘
   │            │ resume() [Viewport enter]
   └────────────┘
               │ destroy()
               ▼
       ┌───────────────┐
       │   Destroyed   │
       └───────────────┘
```

### State Transition Matrix

| Current State | Target State | Trigger Method | Actions Executed |
|---|---|---|---|
| `Created` | `Initialized` | `initialize(canvas)` | Context bound; internal buffer dimensions allocated. |
| `Initialized` | `Active` | `register()` / `resume()` | Registered under manager; loop ticks execute `update`/`render`. |
| `Active` | `Paused` | `pause()` | calculations frozen; rendering skipped. Buffers retained. |
| `Paused` | `Active` | `resume()` | Calculations and render repaints resume. |
| `Active`/`Paused` | `Destroyed` | `destroy()` | References nullified; buffer memory evicted. |

---

## PART 4 — REGISTRATION MODEL

### API Surface
```ts
class RendererManager {
  public register(module: RendererModuleContract, container: HTMLElement): void;
  public unregister(id: string): void;
  public initialize(): void;
  public pause(): void;
  public resume(): void;
  public destroy(): void;
}
```

### Governance Rules
1. **Uniqueness**: Registry key must check `id` collision. Duplicate registration attempts throw an error.
2. **Container Binding**: Registration requires passing the module's parent container DOM element to hook up the `IntersectionObserver`.
3. **Graceful Destruction**: Unregistering automatically invokes the module's `.destroy()` method.

---

## PART 5 — VISIBILITY SLEEP ARCHITECTURE

Visibility Sleep coordinates when loops run:

| Module Viewport State | Manager Observer Action | Target Module State | CPU/GPU Cycle Status |
|---|---|---|---|
| **Intersects Viewport** | Intersection ratio > 0 | `Active` | **Running**. `update()` and `render()` executed on every tick. |
| **Scrolled Off-screen** | Intersection ratio = 0 | `Paused` | **Idle**. Buffers retained in memory, but tick ticks bypass calculations. |
| **Browser Tab Blur** | Window focus loss | `Paused` | **Suspended**. Master loop halted entirely. |

---

## PART 6 — RESIZE ARCHITECTURE

Resize actions follow a debounced unidirectional flow:

```txt
┌────────────────────────────────────────────────────────┐
│                   window 'resize'                      │
└───────────────────────────┬────────────────────────────┘
                            │ Debounced 150ms
                            ▼
┌────────────────────────────────────────────────────────┐
│                   RendererManager                      │
│   - Reads window.innerWidth / height                   │
│   - Reads window.devicePixelRatio                      │
└───────────────────────────┬────────────────────────────┘
                            │ Broadcasts resize()
                            ▼
┌────────────────────────────────────────────────────────┐
│                RendererModule (Fluid)                  │
│   - Recalculates canvas grid columns/rows              │
│   - Re-allocates Float32Arrays                         │
└────────────────────────────────────────────────────────┘
```

---

## PART 7 — PERFORMANCE GOVERNANCE

Strict guidelines are enforced to guarantee Awwwards-grade execution smoothness:

1. **Target Budget**: Locked 60fps (16.67ms total per tick).
2. **Context Count Limits**:
   - Maximum **2 canvases** allowed in memory (1 shared WebGL Canvas, 1 UI/Overlay Canvas2D).
   - Maximum **1 active WebGL context** to prevent browser context crashes.
3. **Failure Recovery Gating**:
   - If frame budget exceeds `32ms` for three consecutive frames, quality shifts to `medium` or `low`.
   - In `medium` quality, coordinate resolution divisor increases from `4` to `6`.
   - In `low` quality, ambient micro-ripples are deactivated and propagation steps occur every second frame.

---

## PART 8 — COMPATIBILITY CHECK

The manager's API supports all target renderers:

- **HeroFluidRenderer**: Fully compatible. Direct mapping to `initialize()`, `resize()`, `update()`, `render()`, and `destroy()`.
- **Future Eclipse Shader**: Fully compatible. The manager will pass the WebGL context directly in the `render(ctx)` broadcast.

---

## FINAL VERDICT

```txt
READY FOR ARCH-011B
```
