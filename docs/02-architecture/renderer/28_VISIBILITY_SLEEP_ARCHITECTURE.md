# Visibility Sleep Architecture (ARCH-012A)

This document defines the architecture plan for centralized Visibility Sleep governance in the Renderer System.

Task constraints:

```txt
Architecture only.
No runtime code changes.
No browser testing.
No visual parity validation.
No screenshots.
No performance benchmarking.
Consumer-driven scope: HeroFluidRenderer and RendererManager only.
```

Final verdict:

```txt
PASS
```

---

## 1. Objective

Visibility Sleep must allow `RendererManager` to suspend renderer module execution when:

- the renderer leaves the viewport
- the parent section becomes inactive
- the browser tab becomes hidden
- the renderer is explicitly paused by lifecycle state

The design must preserve the ARCH-011 ownership boundary:

```txt
RendererManager owns timing and sleep coordination.
HeroFluidRenderer owns canvas, context, buffers, physics, resize allocation, disturbance, and rendering.
```

---

## 2. Repository Audit

### Current Rendering Consumers

| Consumer | Technology | Ownership | Timing Source | Visibility Source | Pause Mechanism | Lifecycle State |
|---|---|---|---|---|---|---|
| `HeroFluidRenderer` | Canvas2D | Renderer class owns canvas ref, context, Float32Array buffers, wave physics, ambient ripples, `disturb()`, `render()`, and local resize allocation. | `RendererManager` calls `update()` and `render()` from the central RAF loop. | None in renderer manager. Hero pointer/scroll disturbances are constrained by Hero event handlers and scroll position checks, but the render tick remains active while registered. | None currently exposed on the renderer contract. Only unregister/destroy stops execution. | Created in `useFluidSim`, initialized, registered, unregistered, destroyed. No explicit Active/Sleeping state. |
| `RendererManager` | Coordinator | Owns renderer registry, RAF handle, last tick time, active running flag. | Owns central RAF for registered modules. | None currently. No `IntersectionObserver`, scene activation input, `document.visibilityState`, blur, or focus listener. | `stop()` only when registry becomes empty. No per-module sleep state. | Running while at least one module is registered; stopped when registry is empty. |
| `MorphNav` canvas effect | Canvas2D | `MorphNav` owns fixed full-screen canvas, context lookup, resize listener, draw calls, and open/close transition rendering. | Local finite `requestAnimationFrame` inside `animateValue()`. | Menu state and route-change close path. No viewport or browser visibility sleep. | Finite animation resolves when open/close completes; no manager pause. | `navState`: closed/opening/open/closing. Not a RendererManager consumer. |
| `public/fluid-test.html` | Canvas2D test artifact | Standalone public HTML owns canvas, context, arrays, physics, render loop, input. | Local continuous `requestAnimationFrame(loop)`. | None. | None. | Public test artifact, not imported by app runtime. |
| WebGL consumers | None active | No active `getContext('webgl')`, `getContext('webgl2')`, `WebGLRenderingContext`, or `WebGL2RenderingContext` usage found in app code. | None. | None. | None. | None active. |

Evidence:

- `lib/rendererManager.ts:13-18` stores only registry and timing state.
- `lib/rendererManager.ts:37-58` owns the central RAF loop and calls registered modules.
- `components/renderers/HeroFluidRenderer.ts:30-40` owns canvas, context, buffers, dimensions, config, and frame count.
- `components/renderers/HeroFluidRenderer.ts:56-167` owns update/render work.
- `hooks/useFluidSim.ts:49-61` initializes, registers, unregisters, and destroys `HeroFluidRenderer`.
- `components/layout/MorphNav.tsx:114-136` defines a finite RAF helper.
- `components/layout/MorphNav.tsx:354-383` performs direct Canvas2D draw calls during open/close transitions.
- `public/fluid-test.html:105-115` contains a standalone continuous Canvas2D loop.

### Current Visibility Mechanisms

| Mechanism | Current Usage | Ownership | Relevance to Visibility Sleep |
|---|---|---|---|
| `IntersectionObserver` | `components/work/ProjectCard.tsx` uses it to reset slide state when a card leaves viewport. | ProjectCard local UI behavior. | Existing but not reusable for renderer sleep. It is component-local and tied to ProjectCard state. |
| Scene activation | `ExperienceDirector` tracks `activeScene`, `pendingScene`, transition state, and requests Work/Contact scene lifecycle methods. | `ExperienceDirector` owns scene orchestration state for Work/Contact bridge. | Useful as a source of renderer eligibility, but RendererManager must not own this state. It should only consume an explicit active/inactive signal. |
| Scene pause/resume | `WorkScene` and `ContactScene` expose `pause()` and `resume()`. | Scene modules. | Demonstrates existing lifecycle language, but these are scene/UI lifecycles, not renderer sleep controls. |
| Scroll progress activation | `ScrollOrchestrator` publishes progress and PinnedSections maps progress into ExperienceDirector requests. | `ScrollOrchestrator` and PinnedSections. | Useful only as an upstream source. RendererManager should not read scroll progress directly. |
| `document.visibilityState` / `visibilitychange` | No app usage found. | None. | Missing. Required for tab-hidden sleep in ARCH-012B. |
| Window `blur` / `focus` | No app-level sleep usage found. | None. | Not recommended as the primary source; `visibilitychange` is more direct for tab visibility. |

Duplicated logic:

- There is no duplicated renderer visibility sleep logic because no centralized or local renderer sleep logic exists yet.
- There are multiple unrelated visibility-like concerns: ProjectCard viewport reset, ExperienceDirector scene activation, and ScrollOrchestrator progress publication. These must not be merged into RendererManager ownership.

Ownership conflicts:

- RendererManager currently has no visibility ownership, so no runtime conflict exists.
- A future conflict would occur if RendererManager tried to compute scene state or scroll thresholds itself. ARCH-012B must avoid that.

Missing lifecycle controls:

- `RendererModuleContract` has no `pause()` / `resume()` methods.
- `RendererManager` has no module sleep state.
- `RendererManager` has no container registration for `IntersectionObserver`.
- `RendererManager` has no `document.visibilityState` listener.
- `HeroFluidRenderer` has no explicit paused state, though it can support sleep by simply not receiving `update()` / `render()` calls.

---

## 3. Ownership Model

### RendererManager May Own

- visibility observation for registered renderer containers
- document visibility listener
- pause coordination
- resume coordination
- per-module sleep state
- deciding whether a registered module receives `update()` / `render()` on the next tick

### RendererManager Must Not Own

- rendering
- buffers
- Canvas2D context
- resize calculations
- scene state
- scroll thresholds
- pointer state
- `HeroFluidRenderer.disturb()` semantics
- wave physics or decay strategy

### Renderer Module Responsibilities

Renderer modules continue owning:

- rendering
- update logic
- physics
- memory
- resource cleanup
- resize allocation

Renderer modules may expose:

```ts
pause(): void;
resume(): void;
```

Contract rule:

- `pause()` and `resume()` are lifecycle notifications only.
- They must not start or stop RAF loops.
- They must not move canvas/context ownership to the manager.
- For `HeroFluidRenderer`, ARCH-012B may implement `pause()` / `resume()` as lightweight state updates or no-op lifecycle hooks if manager-side tick skipping is sufficient.

---

## 4. Lifecycle Model

Target states:

```txt
Created
  ↓
Initialized
  ↓
Active
 ↕
Sleeping
  ↓
Destroyed
```

### State Definitions

| State | Meaning | Owner |
|---|---|---|
| Created | Renderer instance exists but has no canvas/context. | Hook/adapter creates module. |
| Initialized | Renderer has canvas/context/resources and can be registered. | Renderer owns initialization internals; hook/adapter calls initialize. |
| Active | Renderer is registered and eligible for `update()` / `render()` ticks. | RendererManager owns active eligibility; renderer owns work performed during tick. |
| Sleeping | Renderer remains registered and retains resources, but manager skips `update()` / `render()`. | RendererManager owns sleep decision; renderer owns retained memory/resources. |
| Destroyed | Renderer has released references and buffers. | Hook/adapter or manager lifecycle calls destroy, depending on final ARCH-012B API choice. |

### Valid Transitions

| Transition | Trigger | Transition Owner |
|---|---|---|
| Created -> Initialized | `initialize(canvas)` | Hook/adapter triggers; renderer executes. |
| Initialized -> Active | `rendererManager.register(...)` with visible/eligible sources | RendererManager. |
| Active -> Sleeping | container leaves viewport, scene source marks inactive, document becomes hidden, or explicit pause request | RendererManager. |
| Sleeping -> Active | all required visibility sources are eligible again | RendererManager. |
| Active -> Destroyed | unregister + destroy cleanup | Hook/adapter currently; manager may coordinate unregister in future. |
| Sleeping -> Destroyed | unregister + destroy cleanup while sleeping | Hook/adapter currently; manager may coordinate unregister in future. |

### Invalid Transitions

| Transition | Reason |
|---|---|
| Created -> Active | Renderer cannot receive ticks before `initialize(canvas)`. |
| Created -> Sleeping | Sleep state only applies to registered initialized modules. |
| Sleeping -> Initialized | Sleeping retains initialized resources; reinitialization would risk duplicate canvas/context binding. |
| Destroyed -> Active | Destroyed modules must be recreated and initialized. |
| Destroyed -> Sleeping | Destroyed modules have no retained resources to sleep. |

---

## 5. Visibility Source Options

### Option A: IntersectionObserver Only

Description:

```txt
RendererManager observes the registered renderer container and sleeps modules when the container is not intersecting.
```

Strengths:

- Simple and directly tied to offscreen renderer suspension.
- Keeps RendererManager out of scene state.
- Works for the Hero canvas because it has a concrete DOM container.

Weaknesses:

- Does not handle hidden browser tabs.
- Does not handle scene-inactive-but-still-intersecting cases.
- In a pinned layout, an element can remain mounted/intersecting while visually suppressed by timeline opacity or z-index.

Verdict:

```txt
INSUFFICIENT
```

### Option B: IntersectionObserver + `document.visibilityState`

Description:

```txt
RendererManager observes registered containers and also sleeps all modules when the document is hidden.
```

Strengths:

- Covers viewport and tab-hidden suspension.
- Keeps browser-level visibility inside RendererManager.
- Still does not require RendererManager to own scene state.

Weaknesses:

- Does not handle parent section inactive state in the pinned scene system.
- Hero may remain physically intersecting while no longer intended as the active scene.

Verdict:

```txt
PARTIAL
```

### Option C: IntersectionObserver + Scene Activation + `document.visibilityState`

Description:

```txt
RendererManager combines three independent sleep inputs:
1. container visibility from IntersectionObserver
2. explicit scene/parent lifecycle eligibility supplied by the adapter or scene owner
3. document visibility from document.visibilityState
```

Strengths:

- Covers offscreen renderers.
- Covers hidden tabs.
- Covers pinned-layout scene inactivity.
- Preserves ownership because scene owners publish only an eligibility boolean; RendererManager does not compute active scene.
- Keeps HeroFluidRenderer free from timing ownership and visibility orchestration.

Weaknesses:

- Requires a small registration model expansion in ARCH-012B.
- Requires defining how `useFluidSim` or the Hero section provides parent lifecycle eligibility.

Verdict:

```txt
RECOMMENDED
```

Recommendation:

```txt
Use Option C.
```

Justification:

The current app is a pinned multi-scene experience. IntersectionObserver alone cannot reliably represent scene activity because a section can remain mounted or geometrically intersecting while the experience director or timeline has made another section active. `document.visibilityState` is required for tab-hidden suspension. Scene activation must enter as an external signal so RendererManager can coordinate sleep without owning scenes, scroll thresholds, or timeline state.

---

## 6. Proposed ARCH-012B Runtime Shape

This is a migration target, not an ARCH-012A implementation.

### Contract Additions

Renderer module:

```ts
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
```

Registration options:

```ts
type RendererRegistrationOptions = {
  container: HTMLElement;
  initiallySceneActive?: boolean;
};
```

Manager control:

```ts
rendererManager.register(module, { container, initiallySceneActive });
rendererManager.unregister(module);
rendererManager.setSceneActive(module.id, isActive);
```

### Sleep Predicate

A renderer is active only when all required sources are eligible:

```txt
isRenderable =
  registered
  AND containerVisible
  AND sceneActive
  AND documentVisible
  AND NOT explicitlyPaused
```

If `isRenderable` is false:

```txt
RendererManager skips module.update()
RendererManager skips module.render()
RendererManager may notify module.pause()
```

If `isRenderable` becomes true:

```txt
RendererManager may notify module.resume()
RendererManager resumes calling update() and render()
```

### Manager Tick Rule

RendererManager remains the only managed renderer RAF owner.

```txt
If at least one registered module is renderable:
  RAF loop may run.

If modules are registered but all are sleeping:
  RAF loop may stop until a visibility source changes.

If no modules are registered:
  RAF loop stops.
```

This preserves timing ownership while reducing unnecessary offscreen work.

### HeroFluidRenderer Adoption Path

1. Add optional `pause()` and `resume()` methods to the renderer contract.
2. Add manager-side sleep state and visibility-source tracking.
3. Register Hero fluid with a container element from `useFluidSim` or the Hero adapter.
4. Keep `HeroFluidRenderer` canvas/context/buffer ownership unchanged.
5. When sleeping, skip `update()` and `render()`; do not destroy buffers.
6. On resume, continue with retained buffers and current canvas state.

No runtime change should move:

- `canvas.getContext('2d')`
- Float32Array allocation
- wave propagation
- pixel rendering
- resize calculations
- disturbance logic

---

## 7. Performance Governance

Expected qualitative gains:

- Offscreen renderer suspension reduces unnecessary update/render work.
- Hidden-tab suspension avoids spending cycles while the page is not visible.
- Scene-inactive sleep prevents pinned sections from continuing expensive renderer work when visually out of the active experience.
- Battery usage should improve on laptops and mobile devices because fewer frame computations are executed while renderers are not visible or eligible.
- The manager becomes safer for multi-renderer scaling because registered modules can remain mounted without all of them rendering every frame.

No numerical performance claims are made in ARCH-012A.

---

## 8. Boundary Risks And Safeguards

| Risk | Safeguard |
|---|---|
| RendererManager starts owning scene state | Only accept boolean scene eligibility from adapter/scene owner. Do not import ExperienceDirector into RendererManager. |
| RendererManager starts owning canvas/context | Registration may receive a container for observation, not a rendering context. Renderer modules keep canvas/context references. |
| HeroFluidRenderer starts owning timing | `pause()` / `resume()` must not schedule RAF. Manager remains tick owner. |
| Sleeping destroys renderer resources | Sleep must retain resources. Destroy remains a separate lifecycle. |
| IntersectionObserver conflicts with pinned layout | Use scene activation as an additional source, not IO alone. |
| Tab resume creates a large delta | ARCH-012B should reset manager `lastTime` on resume so the next `deltaTime` is not inflated. |

---

## 9. ARCH-012B Definition

Recommended next task:

```txt
ARCH-012B: Visibility Sleep Runtime Implementation
```

Objective:

```txt
Implement centralized Visibility Sleep in RendererManager for the existing HeroFluidRenderer consumer only.
```

Deliverables:

```txt
lib/rendererManager.ts
hooks/useFluidSim.ts
components/renderers/HeroFluidRenderer.ts
docs/03-audits/29_VISIBILITY_SLEEP_RUNTIME.md
tracking doc updates
```

Done definition:

```txt
RendererManager tracks per-module sleep state.
RendererManager observes the registered Hero renderer container.
RendererManager responds to document.visibilityState.
RendererManager accepts explicit scene-active eligibility for the Hero renderer.
Sleeping modules do not receive update() or render() calls.
HeroFluidRenderer remains owner of canvas, context, buffers, physics, resize allocation, disturbance, and rendering.
RendererManager remains the only managed renderer timing owner.
No MorphNav migration.
No WebGL/shader/particle design or implementation.
Build passes.
```

Non-goals:

```txt
Do not migrate MorphNav.
Do not implement shader, particle, WebGL, or post-processing architecture.
Do not move resize ownership.
Do not run visual validation unless a later task explicitly requires it.
```

---

## 10. Success Criteria Review

Visibility ownership is clearly defined:

```txt
PASS
```

RendererManager responsibilities remain bounded:

```txt
PASS
```

Renderer ownership boundaries remain intact:

```txt
PASS
```

Migration path to runtime implementation is documented:

```txt
PASS
```

Stop conditions triggered:

```txt
NONE
```

Final verdict:

```txt
PASS
```
