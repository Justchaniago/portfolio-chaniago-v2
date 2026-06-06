# Renderer Manager Adoption Audit (ARCH-011C)

This document records the code-level adoption audit for the `RendererManager` runtime introduced in ARCH-011B.

Audit constraints:

```txt
Code inspection only.
Build validation only.
No browser agents.
No visual validation.
No screenshot comparison.
No visual parity claim.
```

Visual parity status:

```txt
UNVERIFIED
```

---

## 1. RAF Ownership Audit

Verdict:

```txt
PASS
```

Evidence:

- `components/renderers/HeroFluidRenderer.ts` contains no `requestAnimationFrame` or `cancelAnimationFrame` calls. It exposes `update(time, deltaTime)` and `render()` as frame steps only.
- `hooks/useFluidSim.ts` contains no `requestAnimationFrame` or `cancelAnimationFrame` calls. It creates `HeroFluidRenderer`, calls `initialize(canvas)`, registers the renderer, and unregisters it during cleanup.
- `lib/rendererManager.ts` owns the managed renderer RAF loop. `start()` schedules `requestAnimationFrame(tick)`, the tick calls each registered module's `update()` and `render()`, and `stop()` cancels the RAF handle.
- No duplicate RAF loop exists for `HeroFluidRenderer` or `useFluidSim`.

Code references:

- `lib/rendererManager.ts:37-58` starts the single managed renderer tick and dispatches `update()` / `render()`.
- `lib/rendererManager.ts:60-67` cancels the managed renderer RAF.
- `hooks/useFluidSim.ts:49-61` initializes, registers, unregisters, and destroys the renderer without local frame scheduling.
- `components/renderers/HeroFluidRenderer.ts:56-167` contains simulation and drawing steps but no timing loop.

Scope note:

- Other `requestAnimationFrame` usages remain in the application, but they are not duplicate Hero fluid renderer loops. They are cataloged under Remaining Renderer Debt.

---

## 2. Ownership Boundary Audit

Verdict:

```txt
PASS
```

RendererManager owns:

- timing
- scheduling
- registration
- lifecycle coordination for starting/stopping the managed RAF loop

RendererManager does not own:

- canvas
- rendering context
- rendering implementation
- Float32Array buffers
- wave physics
- resize calculations

Evidence:

- `lib/rendererManager.ts` stores only a `Map<string, RendererModuleContract>`, RAF state, `lastTime`, and `isRunning`.
- `lib/rendererManager.ts` does not call `getContext`, does not allocate arrays or buffers, does not read canvas geometry, and does not perform resize calculations.
- `RendererManager` only invokes the public module methods `update()` and `render()` inside the tick.

Code references:

- `lib/rendererManager.ts:13-18` shows manager state limited to registry and timing fields.
- `lib/rendererManager.ts:19-35` handles registration and unregistration.
- `lib/rendererManager.ts:49-52` dispatches frame work to registered modules without owning their implementation details.

---

## 3. Renderer Independence Audit

Verdict:

```txt
PASS
```

HeroFluidRenderer owns:

- canvas reference
- Canvas2D context reference
- Float32Array height buffers
- wave propagation
- ambient ripples
- disturb logic
- pixel rendering
- resize/grid reallocation

Evidence:

- `HeroFluidRenderer` imports only the public `RendererModuleContract` type from `rendererManager`.
- `HeroFluidRenderer` does not import the `rendererManager` singleton.
- `HeroFluidRenderer` does not read manager registry state, RAF state, active counts, or internal manager fields.
- `HeroFluidRenderer.initialize(canvas)` binds the canvas and context.
- `HeroFluidRenderer.update()` owns ambient ripple injection and wave equation propagation.
- `HeroFluidRenderer.render()` owns image data creation and `putImageData`.
- `HeroFluidRenderer.disturb()` owns external force injection.
- `HeroFluidRenderer.resize()` delegates to its own `initSim()` allocation logic.

Code references:

- `components/renderers/HeroFluidRenderer.ts:3` imports the contract type only.
- `components/renderers/HeroFluidRenderer.ts:30-40` owns canvas, context, buffers, dimensions, config, and frame count.
- `components/renderers/HeroFluidRenderer.ts:46-54` owns initialization and resize.
- `components/renderers/HeroFluidRenderer.ts:56-92` owns update and wave propagation.
- `components/renderers/HeroFluidRenderer.ts:94-167` owns rendering.
- `components/renderers/HeroFluidRenderer.ts:177-201` owns disturbance logic.
- `components/renderers/HeroFluidRenderer.ts:203-225` owns resize-derived dimensions and Float32Array allocation.

---

## 4. Registration Lifecycle Audit

Verdict:

```txt
PASS
```

Evidence:

- Registration occurs on mount through `useEffect` in `useFluidSim`.
- Unregister occurs in the `useEffect` cleanup path.
- Manager stops when the registry becomes empty.
- Renderer destroy lifecycle is reachable from the cleanup path.

Code references:

- `hooks/useFluidSim.ts:42-51` creates `HeroFluidRenderer`, initializes it with the canvas, and registers it.
- `hooks/useFluidSim.ts:58-62` disconnects resize observation, unregisters the renderer, destroys it, and clears the ref.
- `lib/rendererManager.ts:28-34` deletes the module and stops the manager when `renderers.size === 0`.
- `components/renderers/HeroFluidRenderer.ts:170-175` clears canvas/context references and Float32Array buffers during `destroy()`.

Lifecycle notes:

- `RendererManager.unregister()` does not call `module.destroy()` directly. The hook adapter calls `renderer.destroy()` immediately after unregistering. This keeps destruction reachable, but differs from the ARCH-011A architecture document's proposed automatic destroy-on-unregister behavior.

---

## 5. Remaining Renderer Debt

| Debt Item | Evidence | Classification | Notes |
|---|---|---:|---|
| `MorphNav` liquid morph uses unmanaged Canvas2D and finite RAF transitions | `components/layout/MorphNav.tsx:114-136`, `components/layout/MorphNav.tsx:354-383` | MEDIUM | Canvas2D rendering is unmanaged. RAF is finite and transition-bound, not continuous idle rendering. Future manager adoption is optional unless the morph becomes continuous or shares renderer resources. |
| `public/fluid-test.html` contains standalone Canvas2D fluid test loop | `public/fluid-test.html` contains `requestAnimationFrame(loop)` and direct `getContext('2d')` | LOW | Public test artifact, not imported by app runtime. Keep isolated or remove in a later cleanup task if obsolete. |
| Future `EclipseTransition` shader remains outside RendererManager | `components/transitions/EclipseTransition.ts` has no WebGL renderer implementation | MEDIUM | No active unmanaged WebGL loop was found. If converted into a shader renderer, it should become a `RendererModuleContract` consumer. |
| Future `ContactScene` particles remain outside RendererManager | `components/scenes/ContactScene.ts` has no canvas/WebGL particle renderer implementation | MEDIUM | No active particle renderer was found. If particles are added, they should register with `RendererManager`. |
| `lib/interactionSystem.ts` has its own continuous RAF loop | `lib/interactionSystem.ts:104-127` | LOW | Interaction timing is not renderer timing. It remains an architectural consideration if renderer consumers later subscribe to centralized interaction snapshots. |
| `components/sections/Contact.tsx` has pointer hover RAF scheduling | `components/sections/Contact.tsx:147-164` | LOW | UI interaction loop, not Canvas2D/WebGL renderer ownership. Candidate for future InteractionSystem consolidation, not RendererManager adoption. |
| `components/work/ProjectCard.tsx` has autoplay RAF progression | `components/work/ProjectCard.tsx:247-283` | LOW | UI state progression loop, not renderer ownership. Protected project-card boundary remains out of ARCH-011C scope. |

Remaining local RAF loop assessment:

```txt
No remaining local RAF loop drives HeroFluidRenderer.
No duplicate managed renderer RAF loop was found.
Non-renderer RAF loops remain and are documented above.
```

Remaining unmanaged Canvas2D systems:

```txt
MorphNav liquid morph.
public/fluid-test.html standalone test artifact.
```

Remaining unmanaged WebGL systems:

```txt
None active in app runtime.
Future Eclipse shader remains a likely RendererManager consumer if implemented.
```

Future RendererManager consumers:

```txt
MorphNav liquid morph, if promoted from finite transition canvas to managed renderer.
Eclipse shader renderer, if implemented.
Contact particle renderer, if implemented.
```

---

## 6. Contract Gap Analysis

Verdict:

```txt
PASS WITH DOCUMENTED GAPS
```

No ARCH-011C fixes were made. Gaps are documented only.

### Gap 1: `RendererModuleContract.resize`

Documents:

- `docs/21_RENDERER_CONTRACTS.md` specifies `resize(width, height, dpr): void`.
- `docs/25_RENDERER_MANAGER_ARCHITECTURE.md` describes manager-side debounced resize dispatch.

Implementation:

- `lib/rendererManager.ts` defines `resize(): void` on the module contract.
- `RendererManager` does not dispatch resize events.
- `useFluidSim` owns a local `ResizeObserver` and calls `renderer.resize()`.
- `HeroFluidRenderer` reads its canvas geometry internally in `initSim()`.

Impact:

```txt
LOW
```

The current Hero fluid migration is internally consistent, but the implementation does not satisfy the documented manager-owned resize dispatcher.

### Gap 2: `RendererModuleContract.render`

Documents:

- `docs/21_RENDERER_CONTRACTS.md` specifies `render(ctx: CanvasRenderingContext2D | WebGLRenderingContext): void`.

Implementation:

- `lib/rendererManager.ts` defines `render(): void`.
- `HeroFluidRenderer` owns and stores its Canvas2D context after `initialize(canvas)`.

Impact:

```txt
LOW
```

This preserves renderer independence, but it diverges from the documented manager/context-sharing contract.

### Gap 3: Pause/resume and Visibility Sleep are not implemented

Documents:

- `docs/21_RENDERER_CONTRACTS.md` specifies module `pause()` and `resume()`.
- `docs/25_RENDERER_MANAGER_ARCHITECTURE.md` specifies IntersectionObserver-based Visibility Sleep and tab blur suspension.

Implementation:

- `lib/rendererManager.ts` has no module pause/resume contract methods.
- `RendererManager` has no IntersectionObserver and no viewport/container binding.

Impact:

```txt
MEDIUM
```

The first consumer works, but future off-screen renderer consumers will need this gap resolved or intentionally superseded.

### Gap 4: Registration API differs from architecture document

Documents:

- `docs/25_RENDERER_MANAGER_ARCHITECTURE.md` proposes `register(module, container)` and `unregister(id)`.

Implementation:

- `lib/rendererManager.ts` implements `register(module)` and `unregister(module)`.
- Duplicate registration returns silently instead of throwing on ID collision.

Impact:

```txt
LOW
```

Current lifecycle is safe for the single Hero fluid consumer, but multi-consumer diagnostics are weaker than the architecture document specifies.

### Gap 5: Manager destroy and quality controls are not implemented

Documents:

- `docs/21_RENDERER_CONTRACTS.md` includes `initialize()`, `start()`, `pause()`, `resume()`, `resize(width, height, dpr)`, `setQuality()`, and `destroy()` on the manager contract.
- `docs/25_RENDERER_MANAGER_ARCHITECTURE.md` includes quality throttling.

Implementation:

- `RendererManager` implements `register`, `unregister`, `start`, `stop`, and `getActiveCount`.
- No global quality policy is implemented.
- No manager-level destroy method is implemented.

Impact:

```txt
MEDIUM
```

The implementation is consumer-driven and sufficient for Hero fluid timing ownership, but it is not yet the full contract described in the planning documents.

---

## Audit Questions

1. Is RendererManager the sole timing owner?

```txt
PASS
```

For managed renderer modules, yes. HeroFluidRenderer and useFluidSim no longer own RAF timing. Non-renderer RAF loops remain outside this ownership claim and are documented as debt.

2. Is HeroFluidRenderer properly decoupled?

```txt
PASS
```

It depends only on the public module contract type and owns its own canvas, context, buffers, physics, disturbance, resize allocation, and rendering.

3. Are ownership boundaries respected?

```txt
PASS
```

RendererManager coordinates registry and timing. HeroFluidRenderer owns rendering state and implementation.

4. Are duplicate RAF loops eliminated?

```txt
PASS
```

Duplicate Hero fluid renderer RAF loops are eliminated. No second active managed renderer loop was found.

5. Is the project ready for the next renderer consumer?

```txt
PASS WITH DOCUMENTED GAPS
```

The project is ready for another simple consumer that follows the current minimal contract. It is not yet ready for a consumer requiring documented manager-owned resize, visibility sleep, quality throttling, or shared context routing without additional implementation work.

---

## Build Validation

Required command:

```bash
npm run build
```

Result:

```txt
PASS
```

Validated on 2026-06-06 during ARCH-011C.

---

## Final Verdict

```txt
PASS
```

Visual parity status:

```txt
UNVERIFIED
```
