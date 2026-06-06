# ScrollOrchestrator Extraction Plan (ARCH-007A)

## Executive Summary

This plan defines the architectural specifications for extracting scroll triggers, snapping calculations, progress publishing, and direction tracking from `PinnedSections.tsx` into a stateful, viewport-agnostic `ScrollOrchestrator` module.

---

## PART 1 — CURRENT SCROLL AUDIT

An audit of the current codebase shows that scroll-related responsibilities are heavily concentrated inside `PinnedSections.tsx`.

### Audit Details

| Scroll Responsibility | Current Owner | Inputs | Outputs | Dependencies | Consumers |
|---|---|---|---|---|---|
| **ScrollTrigger Setup** | `PinnedSections.tsx` | Wheel/Touch events, document scroll length | Master timeline progress, callback triggers | GSAP, `ScrollTrigger` | Scroll rendering, viewport layouts |
| **Snapping Calculations** | `PinnedSections.tsx` | Current progress, velocity, direction, project data array | Destination progress target | GSAP snap config, `projects` data | ScrollTrigger snap engine |
| **Progress Publishing** | `PinnedSections.tsx` | `self.progress` update callback | `window.__scrollTriggerProgress`, `scrollTriggerProgress` CustomEvent | DOM Window | `MorphNav`, `NavRail`, `Contact` |
| **Threshold Evaluation** | `PinnedSections.tsx` | progress compare (e.g. `progress < contactPhaseProgress`) | `activateContactPhase()`, `deactivateContactPhase()` | `ExperienceDirector` | `ExperienceDirector`, Scene visible flags |
| **Cinematic Navigation** | `PinnedSections.tsx` | `targetProgress` via click handler | `window.scrollTo`, timeline pin, overlay animations | GSAP, `window`, `overlayRef`, `stickyRef` | `NavRail`, `MorphNav` |
| **Section Indexing** | `lib/motion.ts` | raw progress float | active section index `[0..3]` | `SECTION_ANCHORS` | `MorphNav`, `NavRail` |

---

## PART 2 — SCROLL RESPONSIBILITY MODEL

To ensure clean separation of concerns and avoid circular dependencies, scroll-related responsibilities are classified as follows:

### 1. KEEP IN SCROLLORCHESTRATOR
- **scrollProgress**: Tracks the unified raw scroll progress `[0.0 -> 1.0]`.
- **scrollDirection**: Tracks scroll direction (`1` for scroll down, `-1` for scroll up).
- **snapPoints**: Holds and calculates the resting points on the master timeline.
- **progress publication**: Encapsulates dispatching events and window object updates.

*Reasoning*: ScrollOrchestrator acts as the physical sensor for scroll mechanics. It translates physical gestures into structured viewport data.

### 2. KEEP IN EXPERIENCEDIRECTOR
- **activeSection**: Tracks the high-level scene state (`hero`, `about`, `work`, `contact`).
- **thresholds**: Implements logical boundaries for scene activation permissions.

*Reasoning*: The director is the policy layer. It determines whether the user is permitted to transition from `work` to `contact` based on scene status, rather than just scroll progress.

### 3. KEEP IN SCENE
- **timelines**: GSAP tween layouts, CSS custom property tweens, and DOM element configurations.

*Reasoning*: Each scene is a layout-concerned view component and must own its target elements, selectors, and tween calculations.

### 4. KEEP IN NAVIGATION
- **cinematicNavigate**: Overlay jump transitions, overlay colors, scroll disables, and snap toggles.

*Reasoning*: Navigation handles user-initiated jumps across the experience, requiring special rendering overlays that sit outside of normal scroll triggers.

---

## PART 3 — SCROLL STATE MODEL

### Scroll State Structure
The `ScrollOrchestratorState` is defined as:

```ts
export type ScrollOrchestratorState = {
  progress: number;
  direction: 1 | -1;
  velocity: number;
  isSnapping: boolean;
  isCinematicJumping: boolean;
};
```

### State Transition Diagram

```txt
  [Scroll Event] ──>  Update Progress, Velocity, & Direction
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
      Within Transition Zone      Reached Resting Point
              │                           │
              ▼                           ▼
    Trigger Snap (isSnapping=true)  Lock Snap (isSnapping=false)
```

### Flow Sequences

#### Forward Scroll Handoff
1. Viewport scrolls downward -> progress changes.
2. `ScrollOrchestrator` detects progress >= `contactPhaseProgress` threshold.
3. `ScrollOrchestrator` publishes progress event.
4. `ScrollOrchestrator` calls `ExperienceDirector.requestContact()`.
5. `ExperienceDirector` updates state to `pendingScene: contact` and proceeds with scene entry.

#### Reverse Scroll Handoff
1. Viewport scrolls upward -> progress drops.
2. `ScrollOrchestrator` detects progress < `contactPhaseProgress` threshold.
3. `ScrollOrchestrator` calls `ExperienceDirector.requestWorkRestore()`.
4. `ExperienceDirector` executes transition exit and restores `work` scene.

---

## PART 4 — SNAP OWNERSHIP ANALYSIS

Snapping is currently tightly coupled to the responsive geometry of project cards in `PinnedSections.tsx`.

### Ownership Boundaries

```txt
┌───────────────────────────────────────────────────────────┐
│                     ScrollOrchestrator                    │
│   - Calculates snap points dynamically                    │
│   - Executes snap capture timeline tween                  │
└─────────────────────────────┬─────────────────────────────┘
                              │ Registers Jumps
                              ▼
┌───────────────────────────────────────────────────────────┐
│                         Navigation                        │
│   - Disables snapping during jump                         │
│   - Requests cinematicNavigate(targetProgress)            │
└─────────────────────────────┬─────────────────────────────┘
                              │ Updates state
                              ▼
┌───────────────────────────────────────────────────────────┐
│                     ExperienceDirector                    │
│   - Consumes lock flags                                   │
└───────────────────────────────────────────────────────────┘
```

---

## PART 5 — PROGRESS PUBLICATION ANALYSIS

### Current Communication Model
- **Direct Mutator**: `PinnedSections.tsx` writes directly to `window.__scrollTriggerProgress` inside the ScrollTrigger `onUpdate` loop.
- **Custom Event**: Dispatches `scrollTriggerProgress` to window listeners.
- **Issues**: No type safety, global window pollution, lack of subscription control.

### Future Communication Model
- **PubSub Event Registry**: `ScrollOrchestrator` implements a subscription registry.
- **Unified Event Dispatches**: Custom components (like `MorphNav`, `NavRail`) register callbacks directly with the orchestrator instead of polling global window variables.

---

## PART 6 — EXPERIENCEDIRECTOR INTEGRATION

To prevent circular dependencies:
1. `ScrollOrchestrator` depends on the `ExperienceDirector` interface to request state changes.
2. `ExperienceDirector` does **not** depend on `ScrollOrchestrator`. It remains independent of viewport, layout, scroll triggers, and DOM events.
3. Data flow is unidirectional:
   - **ScrollOrchestrator** -> publishes progress & triggers -> **ExperienceDirector** -> updates lifecycle -> **Scenes**.

---

## PART 7 — HERO & ABOUT BOUNDARY

Hero and About sections still live inside `PinnedSections.tsx` with raw GSAP configurations.

### Rules of Separation
- `ScrollOrchestrator` will only hold progress values and trigger callbacks at progress thresholds (`0.0` and `0.05`).
- `ScrollOrchestrator` must never touch the text splitting libraries, portrait image elements, or typography styles of the Hero and About views.
- In future phases, Hero and About will be extracted into separate `HeroScene` and `AboutScene` modules following the contract set up by `SceneModule`.

---

## PART 8 — MIGRATION BOUNDARY

To ensure safety and reversibility, the extraction is split into phases.

### Smallest Safe ARCH-007B Runtime Target
- **Objective**: Implement the `ScrollOrchestrator` abstraction class.
- **Scope**: Extract the unified progress tracking and event dispatching (`window.__scrollTriggerProgress` and custom events).
- **Protected Elements**: Keep the physical `ScrollTrigger` setup, snap configurations, morph loops, and `cinematicNavigate` inline inside `PinnedSections.tsx`. Use the new orchestrator as a delegate for updates.

---

## PART 9 — RISK MATRIX

| Responsibility | Current Owner | Future Owner | Risk | Difficulty | Mitigation |
|---|---|---|---|---|---|
| **Progress Publishing** | `PinnedSections.tsx` | `ScrollOrchestrator` | **LOW** | **Low** | Map to window event dispatchers. |
| **ScrollTrigger Setup** | `PinnedSections.tsx` | `ScrollOrchestrator` | **HIGH** | **Medium** | Ensure container element triggers align. |
| **Snapping Calculations** | `PinnedSections.tsx` | `ScrollOrchestrator` | **CRITICAL** | **High** | Snapping mathematics must be isolated and verified. |
| **Morph Geometry Integration** | `PinnedSections.tsx` | `ProjectShowcase` / Timeline Generator | **CRITICAL** | **High** | Recalculate card positions on resize events. |

---

## PART 10 — ARCH-007B DEFINITION

### Objective
Create the `ScrollOrchestrator` runtime module and extract progress tracking and publication from `PinnedSections.tsx` without changing visual, scroll, or snapping behavior.

### Deliverables
1. **Runtime Abstraction**: `components/orchestration/ScrollOrchestrator.ts` containing the subscription registry, progress tracking, and event emission.
2. **PinnedSections Integration**: Update `PinnedSections.tsx` to instantiate `ScrollOrchestrator` and delegate progress updates.

### Done Definition
- `ScrollOrchestrator` exists and compile checks pass.
- Progress updates (`window.__scrollTriggerProgress` and CustomEvents) are dispatched from the orchestrator.
- Snapping behavior is unchanged.
- Page layouts, animations, and transitions function correctly.
- `npm run build` succeeds.

### Non-Goals
- Do not relocate the GSAP `ScrollTrigger` instance.
- Do not migrate snapping code.
- Do not touch the Project Portal Morph timelines.

### Rollback Plan
If regressions occur:
1. Revert `PinnedSections.tsx` to the baseline git commit.
2. Retain `ScrollOrchestrator` as an unlinked runtime module.
