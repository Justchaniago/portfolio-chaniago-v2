# Visibility Sleep Runtime Implementation (ARCH-012B)

This document records the runtime implementation and validation of centralized Visibility Sleep support for the current Renderer System consumer.

Scope:

```txt
Consumer-driven implementation.
Current runtime consumer only: HeroFluidRenderer.
No MorphNav migration.
No WebGL, shader, particle, post-processing, quality scaling, resize governance, or future renderer implementation.
No browser visual validation.
No screenshot validation.
No visual parity claim.
```

Final verdict:

```txt
PASS
```

Visual parity status:

```txt
UNVERIFIED
```

---

## 1. Implementation Summary

Implemented runtime Visibility Sleep inside `RendererManager` while preserving renderer ownership boundaries.

Modified:

```txt
lib/rendererManager.ts
hooks/useFluidSim.ts
```

Unchanged by design:

```txt
components/renderers/HeroFluidRenderer.ts
```

`HeroFluidRenderer` did not require `pause()` or `resume()` because manager-side tick skipping is sufficient for the current consumer. The optional contract hooks exist for future notification, but the renderer remains passive and owns no visibility logic.

---

## 2. Visibility Ownership Audit

Verdict:

```txt
PASS
```

RendererManager now owns:

- `ACTIVE` / `SLEEPING` sleep state
- visibility-source state per registered module
- `IntersectionObserver` coordination for a provided visibility target
- `document.visibilityState` handling
- explicit pause/resume coordination
- public scene-active eligibility API
- tick skipping for sleeping modules
- RAF start/stop based on renderable modules

RendererManager still does not own:

- canvas
- ctx
- rendering
- draw calls
- physics
- buffers
- resize calculations
- disturbance calculations

Evidence:

- `lib/rendererManager.ts:15-28` defines `RendererSleepState`, registration options, and visibility records.
- `lib/rendererManager.ts:31-38` stores registry, observer, RAF, timing, and document visibility state only.
- `lib/rendererManager.ts:40-61` registers modules and optional visibility containers without reading renderer internals.
- `lib/rendererManager.ts:122-136` skips `update()` and `render()` for sleeping modules.
- `lib/rendererManager.ts:138-155` owns `IntersectionObserver` coordination.
- `lib/rendererManager.ts:157-173` owns `document.visibilityState` coordination.
- `lib/rendererManager.ts:200-205` computes renderability from document, container, scene, and explicit pause states.
- `components/renderers/HeroFluidRenderer.ts:46-49` still owns canvas and `getContext('2d')`.
- `components/renderers/HeroFluidRenderer.ts:56-167` still owns update/render implementation.
- `components/renderers/HeroFluidRenderer.ts:177-225` still owns disturbance and resize allocation.

---

## 3. Lifecycle Transition Audit

Verdict:

```txt
PASS
```

Implemented runtime states:

```txt
ACTIVE
SLEEPING
```

Transition sources:

| Source | Runtime Behavior | Evidence |
|---|---|---|
| Register | Creates visibility record with `containerVisible`, `sceneActive`, `explicitlyPaused`, and `sleepState`. | `lib/rendererManager.ts:40-61` |
| Offscreen container | `IntersectionObserver` updates `containerVisible`; non-intersecting modules reconcile to `SLEEPING`. | `lib/rendererManager.ts:138-155` |
| Visible container | `IntersectionObserver` updates `containerVisible`; intersecting modules can reconcile to `ACTIVE`. | `lib/rendererManager.ts:138-155` |
| Hidden tab | `visibilitychange` updates `documentVisible`; hidden documents reconcile modules to `SLEEPING`. | `lib/rendererManager.ts:157-173` |
| Visible tab | `visibilitychange` updates `documentVisible`; visible documents can reconcile modules to `ACTIVE`. | `lib/rendererManager.ts:157-173` |
| Explicit pause | `pause(module)` sets `explicitlyPaused = true`. | `lib/rendererManager.ts:78-84`, `lib/rendererManager.ts:175-182` |
| Explicit resume | `resume(module)` sets `explicitlyPaused = false`. | `lib/rendererManager.ts:78-84`, `lib/rendererManager.ts:175-182` |
| Scene active source | `setSceneActive(moduleId, isActive)` updates manager-owned eligibility without importing scene state. | `lib/rendererManager.ts:86-93` |
| Sleeping tick | Sleeping module does not receive `update()` or `render()`. | `lib/rendererManager.ts:128-133` |
| Wake | Resume resets `lastTime` to avoid inflated next-frame delta. | `lib/rendererManager.ts:191-197` |
| All sleeping | RAF loop stops until a visibility source changes. | `lib/rendererManager.ts:215-222` |

Scene activation note:

```txt
RendererManager now supports scene-active eligibility through setSceneActive().
No current Hero scene lifecycle signal exists to wire without inventing a new lifecycle system.
Therefore ARCH-012B does not fabricate parent-scene integration.
```

This is not a blocker because offscreen and tab-hidden sleep are implemented, and scene activation can be supplied by an existing lifecycle owner when one exists.

---

## 4. Hook Integration Audit

Verdict:

```txt
PASS
```

`useFluidSim` now registers the existing Hero canvas as the visibility target:

```txt
rendererManager.register(renderer, { container: canvas });
```

Evidence:

- `hooks/useFluidSim.ts:49-51` initializes the renderer and registers it with the canvas visibility target.
- `hooks/useFluidSim.ts:53-56` keeps resize observation local to the hook/renderer path, preserving the current resize boundary.
- `hooks/useFluidSim.ts:58-62` still unregisters and destroys the renderer on cleanup.

No local visibility manager was added.

No local RAF loop was added.

No duplicate observer system was introduced in the hook.

---

## 5. Renderer Independence Audit

Verdict:

```txt
PASS
```

`HeroFluidRenderer` remains fully decoupled:

- no `requestAnimationFrame`
- no `IntersectionObserver`
- no `document.visibilityState`
- no `visibilitychange`
- no manager internals access
- no canvas/context ownership migration
- no physics/buffer/rendering migration

Evidence:

- `components/renderers/HeroFluidRenderer.ts:3` imports only the public contract type.
- `components/renderers/HeroFluidRenderer.ts:30-40` owns renderer memory and state.
- `components/renderers/HeroFluidRenderer.ts:46-49` owns canvas/context binding.
- `components/renderers/HeroFluidRenderer.ts:56-167` owns update/render.
- `components/renderers/HeroFluidRenderer.ts:177-225` owns disturbance and resize allocation.

---

## 6. Remaining Renderer Debt

| Debt | Classification | Notes |
|---|---:|---|
| Scene activation is supported by `RendererManager.setSceneActive()` but not wired for Hero. | LOW | No existing Hero scene lifecycle signal exists. Wiring one would require inventing a new lifecycle system, which ARCH-012B forbids. |
| `MorphNav` remains an unmanaged Canvas2D finite transition. | MEDIUM | Explicitly out of scope. No migration performed. |
| `public/fluid-test.html` remains a standalone continuous Canvas2D test artifact. | LOW | Not imported by app runtime. |
| `lib/interactionSystem.ts` retains its own pointer RAF loop. | LOW | Interaction timing, not renderer timing. |
| Manager-level listener teardown is still minimal. | LOW | Current app uses singleton manager for app lifetime. A future manager `destroy()` API can remove `visibilitychange` listener and disconnect observer. |

---

## 7. Contract Gap Findings

Verdict:

```txt
PASS WITH DOCUMENTED GAPS
```

Resolved or narrowed:

- `RendererModuleContract` now allows optional `pause()` and `resume()` lifecycle hooks.
- `RendererManager` now owns sleep state and visibility coordination.
- `RendererManager` now supports `IntersectionObserver` and `document.visibilityState`.
- `RendererManager` now exposes `setSceneActive()` as an external scene eligibility input.

Remaining gaps:

- `RendererManager.register()` accepts an optional container, not a required one. This preserves backward compatibility for the current codebase.
- `RendererManager.unregister()` still accepts a module object, not an ID.
- `RendererManager` does not own resize governance.
- `RendererManager` does not implement quality scaling or performance tiers.
- `RendererManager` does not implement global `destroy()` listener teardown.
- Scene activation is not wired for Hero because no existing Hero scene lifecycle signal exists.

These gaps do not block ARCH-012B because the task explicitly forbids speculative feature implementation.

---

## 8. Verification

### Build

Command:

```bash
npm run build
```

Result:

```txt
PASS
```

Observed:

```txt
Next.js 16.2.6 (Turbopack)
Compiled successfully.
TypeScript completed successfully.
Static pages generated successfully.
```

### RAF Ownership Grep

Command:

```bash
grep -R "requestAnimationFrame" hooks components/renderers lib
```

Result:

```txt
lib/interactionSystem.ts:      this.rafId = requestAnimationFrame(tick);
lib/interactionSystem.ts:    this.rafId = requestAnimationFrame(tick);
lib/rendererManager.ts:    this.rafId = requestAnimationFrame(this.tick);
lib/rendererManager.ts:    this.rafId = requestAnimationFrame(this.tick);
```

Interpretation:

```txt
PASS
```

No `requestAnimationFrame` exists in `hooks/useFluidSim.ts` or `components/renderers/HeroFluidRenderer.ts`.

`RendererManager` remains the only renderer scheduling owner.

`lib/interactionSystem.ts` remains an interaction loop, not renderer timing.

### RendererManager Context Grep

Command:

```bash
grep -R "getContext" lib/rendererManager.ts
```

Result:

```txt
0 matches
```

Interpretation:

```txt
PASS
```

RendererManager does not own canvas context access.

### Runtime Validation Scope

Forbidden checks were not run:

```txt
No browser agents.
No browser visual testing.
No screenshots.
No visual parity validation.
No visual parity claim.
```

Visual parity status:

```txt
UNVERIFIED
```

---

## 9. Success Criteria Review

Timing:

```txt
PASS
```

RendererManager remains the sole rendering timing owner.

Visibility:

```txt
PASS
```

Offscreen and visible state transitions are implemented through `IntersectionObserver`.

Hidden and visible tab transitions are implemented through `document.visibilityState`.

Scene-active eligibility is supported through `setSceneActive()` without ownership violations, but not wired for Hero because no existing Hero scene lifecycle signal exists.

Ownership:

```txt
PASS
```

RendererManager does not own canvas, ctx, rendering, buffers, resize, physics, or disturbance calculations.

Architecture:

```txt
PASS
```

HeroFluidRenderer remains decoupled. No duplicate renderer RAF loops or duplicate hook-level visibility systems were introduced.

---

## Final Verdict

```txt
PASS
```

Visual parity status:

```txt
UNVERIFIED
```
