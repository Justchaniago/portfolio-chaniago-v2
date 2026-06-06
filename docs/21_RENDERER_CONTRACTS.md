# Renderer Contracts (ARCH-010B)

## Executive Summary

This document defines the formal **Renderer System Contracts** for Ferry Rusly Chaniago Portfolio V2. It specifies the global `RendererManagerContract`, the individual `RendererModuleContract`, the lifecycle state transition model, and performance boundaries. It also maps the extraction boundaries for `HeroFluidRenderer` as the first runtime consumer.

---

## PART 1 — RENDERER CONTRACT AUDIT

### Audit of Core Contracts (`08_CORE_CONTRACT_DEFINITIONS.md`)
- **What exists**: `08_CORE` defined a high-level conceptual `RendererModuleContract` but lacked a master coordinator to manage execution.
- **What is missing**:
  1. **Renderer Manager Contract**: A central authority that controls canvas instances and tick distribution.
  2. **Visibility State Gating**: Rules for turning off drawing loops when scenes are paused or hidden.
  3. **Context Sharing Model**: Guidelines for sharing a single WebGL context across multiple shader passes.
  4. **Quality Policy Mapping**: Contracts that bind performance throttling directly to quality levels.

---

## PART 2 — RENDERER CONTRACT DESIGN

The `RendererManagerContract` acts as the master coordinator.

```ts
export type RendererQuality = 'high' | 'medium' | 'low' | 'off';

export interface RendererManagerContract {
  // Registers an individual renderer module (e.g. fluid, particles)
  register(module: RendererModuleContract): void;
  
  // Unregisters and destroys a module
  unregister(id: string): void;
  
  // Attaches event listeners and begins the master RAF loop
  initialize(): void;
  
  // Starts or resumes the master loop and all active modules
  start(): void;
  
  // Pauses the master loop and stops all active repaints
  pause(): void;
  
  // Resumes all non-paused registered modules
  resume(): void;
  
  // Debounces and broadcasts resize updates to all registered modules
  resize(width: number, height: number, dpr: number): void;
  
  // Dynamically changes global rendering quality to adjust load
  setQuality(quality: RendererQuality): void;
  
  // Stops the loop, unregisters all modules, and evicts GPU assets
  destroy(): void;
}
```

---

## PART 3 — RENDERER MODULE CONTRACT

Each visual shader or canvas effect (e.g. `HeroFluidRenderer`, `EclipseGLRenderer`) must implement this contract:

```ts
export interface RendererModuleContract {
  readonly id: string;
  readonly type: 'canvas2d' | 'webgl' | 'shader';
  
  // Called by RendererManager when the module is registered
  initialize(canvas: HTMLCanvasElement): void;
  
  // Called during window resizing (debounced by manager)
  resize(width: number, height: number, dpr: number): void;
  
  // Main calculation/physics step (called every frame)
  update(time: number, deltaTime: number): void;
  
  // Drawing step (called immediately after update)
  render(ctx: CanvasRenderingContext2D | WebGLRenderingContext): void;
  
  // Temporarily halts render calculations (e.g. when section goes off-screen)
  pause(): void;
  
  // Resumes calculations
  resume(): void;
  
  // Releases GPU buffers, textures, program caches, and local memory
  destroy(): void;
}
```

---

## PART 4 — HERO FLUID CONTRACT

As the first consumer, we map the extraction boundary for the fluid simulation currently living in `useFluidSim.ts`.

### Ownership Division

| System Aspect | Current Owner | Future Owner | Extraction Action |
|---|---|---|---|
| **Height Arrays / Wave Physics** | Hook (`useFluidSim`) | `HeroFluidRenderer` class | Move Float32Array double-buffering steps to `update()`. |
| **Draw Calculations** | Hook (`useFluidSim`) | `HeroFluidRenderer` class | Move pixel writing / image data put to `render()`. |
| **Animation Loop / Tick** | Hook (`useFluidSim`) | `RendererManager` | Delete local RAF loop; subscribe module to manager. |
| **Resize Observer** | Hook (`useFluidSim`) | `RendererManager` | Delete local ResizeObserver; subscribe to `resize()`. |
| **Mouse Event Disturbance** | Hook (`useFluidSim`) | `InteractionSystem` | Read velocity/pointer from Interaction System. |
| **Canvas DOM Element** | React Component (`Hero`) | React Component (`Hero`) | Keep in DOM. Pass ref to `RendererManager.register`. |

---

## PART 5 — RENDERER OWNERSHIP MATRIX

Centralized system boundaries for all future rendering features:

| Future Feature | Scene Owner | Interaction Owner | Renderer Owner | Motion Owner |
|---|---|---|---|---|
| **Hero Fluid Sim** | `HeroScene` | `InteractionSystem` | `HeroFluidRenderer` | `MotionPresets` |
| **Hero Noise Field** | `HeroScene` | None | `HeroNoiseRenderer` | `MotionPresets` |
| **Cursor Glow Trail**| Global Overlay | `InteractionSystem` | `CursorTrailRenderer` | `MotionPresets` |
| **Eclipse Shader** | `EclipseTransition` | None | `EclipseGLRenderer` | `MotionPresets` |
| **Contact Particles**| `ContactScene` | `InteractionSystem` | `ContactParticleRenderer` | `MotionPresets` |

---

## PART 6 — PERFORMANCE GOVERNANCE

The following contracts define strict performance rules:

### 1. Visibility Sleep Contract
- Individual `RendererModuleContract` objects must be paused (`pause()`) by the manager when their host section is hidden.
- Managed by `IntersectionObserver` inside `RendererManager`.

### 2. Canvas & Context Limits
- Maximum of **two** canvas contexts are allowed in memory at any time:
  1. One global background Canvas (Shared WebGL context for shaders).
  2. One overlay Canvas (Canvas2D for UI overlays like MorphNav).
- Creating individual canvases inside sections is forbidden.

### 3. GPU Memory Eviction
- Modules must release resources on `destroy()`.
- Explicit program deletion: `gl.deleteProgram()`, `gl.deleteShader()`, and `gl.deleteBuffer()` must be called to prevent memory leakage.

---

## PART 7 — RENDERER LIFECYCLE MODEL

```txt
       ┌───────────────┐
       │    Created    │
       └───────┬───────┘
               │ initialize()
               ▼
       ┌───────────────┐
       │  Initialized  │
       └───────┬───────┘
               │ start()
               ▼
  ┌──► ┌───────────────┐
  │    │    Active     │
  │    └───────┬───────┘
  │            │ pause()
  │            ▼
  │    ┌───────────────┐
  │    │    Paused     │
  │    └───────┬───────┘
  │            │ resume()
  └────────────┘
               │ destroy()
               ▼
       ┌───────────────┐
       │   Destroyed   │
       └───────────────┘
```

### Valid State Transitions
- `Created` → `Initialized` (via `initialize()`)
- `Initialized` → `Active` (via `start()`)
- `Active` → `Paused` (via `pause()`)
- `Paused` → `Active` (via `resume()`)
- `Active` / `Paused` → `Destroyed` (via `destroy()`)

### Invalid State Transitions (Blocked)
- `Created` → `Active` (Cannot start without initialization)
- `Paused` → `Initialized` (Cannot reinitialize without destruction)
- `Destroyed` → `Active` (Cannot run a disposed renderer)

---

## PART 8 — CONSUMER READINESS AUDIT

We evaluate if `Hero Fluid` is ready for extraction:

- **Verdict**: **PARTIALLY READY**.
- **Justification**:
  - *Strengths*: The mathematical calculations (`stepSim`, `disturbSim`, `renderSim`) are already pure functions decoupled from React, making them easy to encapsulate into a class.
  - *Weaknesses*: The physics step relies on direct canvas writes and is coupled to React refs and window events. We must first establish an extraction blueprint (`ARCH-010C`) to isolate the render loops and mouse event hooks.

---

## PART 9 — ARCH-010C RECOMMENDATION

We recommend:

```txt
ARCH-010C: Hero Fluid Extraction Plan
```

### Technical Rationale
Before implementing the central `RendererManager` runtime, creating the detailed extraction plan for `HeroFluidRenderer` will stress-test our contract boundaries against a real, highly CPU-intensive consumer. This prevents writing speculative coordinator runtime code without a concrete client.

---

## ARCH-010B Success Verdict
- [x] Renderer contracts defined
- [x] Renderer module contracts defined
- [x] Hero fluid consumer mapped
- [x] Ownership matrix documented
- [x] Lifecycle model documented
- [x] Performance governance documented
- [x] Consumer readiness assessed
- [x] Next phase recommended
