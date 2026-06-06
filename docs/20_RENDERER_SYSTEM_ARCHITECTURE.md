# Renderer System Architecture (ARCH-010A)

## Executive Summary

This document establishes the **Renderer System Architecture** for Ferry Rusly Chaniago Portfolio V2. It audits current uncoordinated canvas loops, defines rendering responsibility boundaries, structures technology choices, maps future WebGL/shader features, and provides high-level contracts for a centralized master render controller.

---

## PART 1 — CURRENT RENDERING AUDIT

An audit of the repository reveals two active canvas/drawing loops that operate independently without centralized coordination:

### Current Rendering Ownership Map

| Component / Hook | Rendering Method | Target / Canvas | Current Owner | Active RAF Loop | Dependencies | Off-screen Behavior |
|---|---|---|---|---|---|---|
| **`Hero.tsx` / `useFluidSim.ts`** | Canvas2D height-map double-buffer simulation | `.hero-fluid-canvas` | Local React Hook | Independent RAF | Window Resize, mouse position | **Runs constantly** (even when scrolled out of view) |
| **`MorphNav.tsx`** | Canvas2D particle/bubble expansion burst | Navigation Overlay | Local component | Local RAF | Toggled menu state | Stops when animation completes |
| **`EclipseTransition.ts`** | DOM translation / scaling | `.debug-circle` | Eclipse Transition Module | GSAP ticker | GSAP timeline | N/A (runs during transitions) |
| **`Contact.tsx`** | CSS properties (gradient sweep) | `JUSTCHANIAGO` character elements | React Component | Local RAF | InteractionSystem coordinates | Pauses when inactive / decayed |

### Key Issues Identified
1. **Off-screen Rendering Waste**: The Hero fluid simulation continues to calculate physics steps and repaint the canvas via requestAnimationFrame even when the user has scrolled all the way to the Contact section.
2. **Context Exhaustion Risk**: If WebGL or Three.js are introduced at the component level, creating a canvas per component will exceed browser limits for active WebGL contexts (typically 8–16) and trigger context loss.
3. **No Performance Throttling**: There is no central mechanism to drop particles, reduce resolution, or pause draw loops on low-battery or high-temperature mobile devices.

---

## PART 2 — FUTURE VISION AUDIT

As the portfolio grows to support agency-grade visual experiences, future features will introduce significant rendering demands:

- **Hero Noise Fields**: CPU-intensive vector fields.
- **WebGL Background Layers**: Complex shaders, particle clusters, and iridescence meshes.
- **Atmospheric Noise / Fog Shaders**: Multi-pass post-processing.
- **Particle Trails**: Continuous mouse tracking drawing thousands of nodes.

### Suitability of Current Component-Owned Model
- **Verdict**: **Fails**. Under the current model, adding WebGL layers to Hero, About, and Contact sections would result in multiple active WebGL canvas contexts running simultaneously. This leads to immediate mobile device crashes, memory leaks, and uncoordinated CPU/GPU usage. A unified Renderer System is mandatory.

---

## PART 3 — RENDERER RESPONSIBILITY MODEL

To scale cleanly, we separate rendering execution from scene content.

### Ownership Boundary Matrix

| Responsibility | Should Own | Should NOT Own |
|---|:---:|:---:|
| **Master Render Tick** (Single coordinate RAF loop) | ✓ | |
| **Canvas & WebGL Context lifecycle** | ✓ | |
| **Resize Event Coalescing** | ✓ | |
| **Section Visibility Throttling** (Pause off-screen canvas loops) | ✓ | |
| **Dynamic Quality Scaling** (Throttling resolution/particles based on frame time) | ✓ | |
| **Shader compilation and GPU cache** | ✓ | |
| **Scene Lifecycles / Activation** | | ✓ (ExperienceDirector) |
| **Scroll Metrics / Progress** | | ✓ (ScrollOrchestrator) |
| **Pointer Coordinates / Gestures** | | ✓ (InteractionSystem) |
| **Animation Durations / Easings** | | ✓ (MotionSystem) |

---

## PART 4 — RENDERER BOUNDARY DESIGN

```txt
┌────────────────────────────────────────────────────────┐
│                   ExperienceDirector                   │
│         - Controls scene lifecycles & permissions     │
└───────────────────────────┬────────────────────────────┘
                            │ Activates / Deactivates
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Renderer System                     │
│         - Coordinates Canvas, WebGL, & Master RAF loop │
└─────────────┬─────────────────────────────┬────────────┘
              │ Coordinates                 │ Feeds pointer vectors
              ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│       ScrollOrchestrator  │ │     InteractionSystem     │
│   - Feeds scroll progress │ │   - Feeds mouse velocity  │
└───────────────────────────┘ └───────────────────────────┘
```

- **Separation of Concerns**: Renderers do not make semantic decisions. A WebGL background renderer simply queries the scroll progress from `ScrollOrchestrator` and mouse speed from `InteractionSystem` to update shader uniforms.

---

## PART 5 — TECHNOLOGY AUDIT

| Technology | Use Case | Strengths | Weaknesses | Suitability |
|---|---|---|---|---|
| **DOM / CSS** | Layout, typography, simple reveals | Perfect accessibility, GPU-accelerated transforms | Poor performance with >100 individual nodes | **Primary** for structure and text content |
| **Canvas2D** | 2D particle systems, fast UI bursts | Fast setup, low memory footprint | No GPU shader capabilities; bottlenecked by CPU pixel writes | **Secondary** for UI effects (e.g., MorphNav) |
| **WebGL (Raw / TWGL)** | Complex shaders, high-perf effects | Full GPU access, zero overhead, highly custom | Heavy boilerplate, complex math | **Primary** for backgrounds and shader effects |
| **Three.js** | 3D meshes, lighting, models | Massive ecosystem, comprehensive math utilities | Bundle size (~600kb), potential overhead | **Highly Suitable** if complex 3D geometry is added |
| **React Three Fiber** | Declarative 3D layers in React | Elegant React integration | Hooks tie render loop to React lifecycle, risking frame lag | **Low Suitability** for high-end scene transitions |

- **Strategy Recommendation**: Use **Raw WebGL (or a lightweight helper like TWGL)** for screen-space shader backgrounds and particle fields. Keep canvas instances restricted to a maximum of **two** (one global background layer, one navigation overlay layer).

---

## PART 6 — FUTURE FEATURE MAPPING

Ownership boundaries for future additions:

| Future Feature | Scene Owner | Interaction Owner | Renderer Owner | Motion Owner |
|---|---|---|---|---|
| **Hero Fluid Sim** | `HeroScene` | `InteractionSystem` | `HeroFluidRenderer` | `MotionPresets` |
| **Eclipse Shader** | `EclipseTransition` | None | `EclipseGLRenderer` | `MotionPresets` |
| **Cursor Glow Trail**| Global Overlay | `InteractionSystem` | `CursorTrailRenderer` | `MotionPresets` |
| **Contact Particles**| `ContactScene` | `InteractionSystem` | `ContactParticleRenderer` | `MotionPresets` |

---

## PART 7 — PERFORMANCE GOVERNANCE

All renderers must comply with these strict governance rules:

1. **Visibility Throttling**: Renderers must listen to `IntersectionObserver` updates and completely halt their frame loops (`cancelAnimationFrame`) when their target section is out of the viewport.
2. **Double-buffered RAF prevention**: Component-specific frame loops are forbidden. All canvas repaints must hook into a single master tick loop.
3. **Dynamic Resolution Throttling**: On frame drops (performance < 55fps), renderers must dynamically scale down the canvas resolution (e.g. from DPR 2 to 1) rather than skipping frames.
4. **Context Disposal**: On scene destruction, all textures, buffers, and shader programs must be explicitly deleted from GPU memory via `gl.deleteProgram()`, `gl.deleteBuffer()`, etc., to prevent leaks.

---

## PART 8 — RENDERER CONTRACT DESIGN

Conforming to our architecture standards, we define the conceptual interfaces:

### RendererModuleContract
Individual rendering modules (e.g. Fluid sim, particles) must implement this lifecycle:
```ts
export type RendererType = 'canvas2d' | 'webgl' | 'shader';

export interface RendererModuleContract {
  readonly id: string;
  readonly type: RendererType;
  
  initialize(canvas: HTMLCanvasElement): void;
  resize(width: number, height: number, dpr: number): void;
  update(time: number, deltaTime: number): void;
  render(): void;
  pause(): void;
  resume(): void;
  destroy(): void;
}
```

### RendererManagerContract
The central manager coordinating canvas contexts and ticks:
```ts
export interface RendererManagerContract {
  registerRenderer(renderer: RendererModuleContract): void;
  unregisterRenderer(id: string): void;
  
  startLoop(): void;
  stopLoop(): void;
  setQuality(level: 'high' | 'medium' | 'low'): void;
}
```

---

## PART 9 — ARCHITECTURE IMPACT ASSESSMENT

- **Current Architecture**: Render loops run unchecked in React hooks, wasting CPU/GPU cycles off-screen.
- **Renderer System Architecture**: A master controller shuts down off-screen render loops, scales resolutions dynamically, and shares a single WebGL context.
- **Verdict**: **100% Justified**. It turns uncoordinated animation loops into a predictable, performant, and scale-ready system.

---

## PART 10 — ARCH-010B RECOMMENDATION

We recommend:

```txt
ARCH-010B: Renderer Contracts
```

### Technical Rationale
Establishing the formal TypeScript interfaces, types, and mock configurations for the `RendererManager` and its first consumer (`HeroFluidRenderer`) will validate the architecture boundaries prior to full runtime implementation.

---

## ARCH-010A Success Verdict
- [x] Rendering ownership audited
- [x] Future rendering roadmap audited
- [x] Renderer responsibility model defined
- [x] Renderer boundaries defined
- [x] Technology strategy documented
- [x] Future feature ownership mapped
- [x] Performance governance documented
- [x] Renderer contracts proposed
- [x] Next phase recommended
