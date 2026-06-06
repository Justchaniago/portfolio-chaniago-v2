# Interaction System Architecture (ARCH-009A)

## Executive Summary

This document defines the **Interaction System Architecture** for Ferry Rusly Chaniago Portfolio V2. It establishes responsibility models, layered scopes, preset structures, and governance rules to create high-performance, physics-based, delightful pointer/touch interactions, keeping inputs decoupled from local rendering blocks.

---

## PART 1 — INTERACTION AUDIT

An audit of the repository reveals the following interaction handlers:

| Interaction System | Trigger | State | Side Effects | Dependencies | Owner |
|---|---|---|---|---|---|
| **Contact Hover Sweep** | `onPointerMove` | Bounding rect coordinates, velocity, pointer active flag | Dynamic inline CSS variables (`--contact-hover-x`), warmth stops | requestAnimationFrame, Window Resize | `Contact.tsx` (view layer) |
| **Utility Link Hover** | `onMouseEnter`, `onMouseLeave` | Active hover state | Letter stagger translations (y: -6px) via custom GSAP tween | GSAP | `Contact.tsx` (view layer) |
| **Quick Jump Buttons** | `onClick` | Nav target index | Smooth jump/scroll timeline triggers | `cinematicNavigate` | `Contact.tsx` (view layer) |
| **Project Card Swipes** | `onPointerDown`, `onPointerMove`, `onPointerUp` | Swipe start coordinate, diff X delta, drag lock | Horizontal slide moves, scale morphing | GSAP | `ProjectCard.tsx` (view layer) |
| **Project Expansion UI** | Scroll Trigger snap morphs | expanded boolean | Fullscreen overlay triggers, autoplay stop | GSAP | `PinnedSections.tsx` / `ProjectCard.tsx` |

---

## PART 2 — INTERACTION RESPONSIBILITY MODEL

To ensure clean delegation of inputs from rendering:

### What the Interaction System Owns
1. **Pointer & Gesture Trackers**: Unified listeners for absolute pointer coordinates, velocity calculations, and delta tracking.
2. **Magnetic & Inertial Math**: Physics equations (spring forces, friction, magnetic drag calculations).
3. **Interactive States**: Centralized hover active flags, active coordinates, and focus indicators.
4. **Interaction Presets**: General patterns (magnetic attracts, character scrambles, reveal masks).

### What the Interaction System MUST NOT Own
1. **Scroll Metrics**: Capturing wheel movements or calculating viewport percentages (owned by `ScrollOrchestrator`).
2. **Scene Lifecycles**: Determining when sections are loaded or entered (owned by `ExperienceDirector`).
3. **Motion Tokens**: Declaring durations or ease presets (owned by `MotionSystem`).
4. **Business Logic & Routing**: Managing route pushes or navigational states.

---

## PART 3 — INTERACTION LAYER MODEL

Interactions are structured into five layers:

```txt
┌────────────────────────────────────────────────────────┐
│                   NARRATIVE SEQUENCES                  │
│       - Owners: ExperienceDirector, Story Timelines    │
├────────────────────────────────────────────────────────┤
│                    SPATIAL INTERACTIVE                 │
│       - Owners: Custom pointer gestures, swipe morphs  │
├────────────────────────────────────────────────────────┤
│                    CURSOR CHOREOGRAPHY                 │
│       - Owners: Custom Cursor system, pointer physics  │
├────────────────────────────────────────────────────────┤
│                     HOVER SYSTEM                       │
│       - Owners: Contact sweep, magnetic targets        │
├────────────────────────────────────────────────────────┤
│                     MICRO INTERACTIONS                 │
│       - Owners: Navigation links, buttons              │
└────────────────────────────────────────────────────────┘
```

| Layer | Purpose | Owner | Allowed Scope | Examples |
|---|---|---|---|---|
| **Micro Interaction** | Feedback on simple UI clicks | Local Component | Class list toggling, inline style changes | NavRail button scales |
| **Hover Interaction** | High-end pointer captures | Hover Manager | Physics calculations, mouse vectors | Utility link letter staggers |
| **Cursor Interaction** | Global pointer visual follower | Cursor Manager | Absolute tracking, spring/elastic settles | Custom circle cursor, magnetic pulls |
| **Spatial Interaction** | Large-scale touch/swipe gestures | Swipe Manager | Pointer diff capture, layout coordinate tweens | Project gallery swipe transitions |
| **Narrative Interaction** | Complex scroll/scroll-free story | `ExperienceDirector` | State unlocks, timed delays | Settle navigation jumps |

---

## PART 4 — INTERACTION INVENTORY

We catalog the status and recommended strategy for every portfolio interaction:

| System | Current State | Classification | Strategy & Rationale |
|---|---|---|---|
| **Custom Cursor** | Non-existent | `Future Upgrade` | To be created. Needs unified absolute pointer tracking. |
| **Contact Hover Sweep** | Raw implementation inside `Contact.tsx` | `Needs Refactor` | Extract sweep physics and coordinates from the view layer. |
| **Project Card Gestures** | Raw swipes in `ProjectCard.tsx` | `Protected` | Keep inline. Modifying swipe gestures risks breaking horizontal gallery feel. |
| **Navigation Hover** | CSS standard pointer changes | `Acceptable` | standard CSS rules are sufficient. |
| **Quick Jump** | Inline `window.scrollTo` click callbacks | `Reusable` | Decoupled via `cinematicNavigate` bridge. |

---

## PART 5 — INTERACTION PRESET ARCHITECTURE

To avoid duplicating pointer tracking and math loops:

### Proposed Presets
- **`HoverLift`**: Custom transform properties combining scale and y-offsets using spring decay.
- **`HoverSweep`**: Multi-character sweep mapping absolute coordinates to custom properties.
- **`MagneticPull`**: Smooth pointer attraction calculating distance offsets and dividing coordinates by weight.
- **`CursorAttract` / `CursorRepel`**: Repulsion and attraction dynamics for custom cursor states.

### Scalability
By packaging these as reusable mathematical config creators, any view component can register a listener and obtain smooth velocity-based coordinate deltas.

---

## PART 6 — PREMIUM INTERACTION PRINCIPLES

All interactive layouts must adhere to these premium principles:

1. **Spring-Based Lag (Organic Settle)**: Interactive changes must utilize inertia and spring physics rather than instantaneous transitions. If the mouse leaves, properties must decay smoothly.
2. **Velocity-Driven Amplitude**: Animations must reflect interaction speeds. High velocity sweeps should produce larger stagger offsets and warmer background color glows.
3. **Gesture Gating**: Interactive gestures (like drag-to-morph) must remain locked during global scene transitions to prevent state corruption.

---

## PART 7 — FUTURE FEATURE STRESS TEST

- **Interactive Project Exploration**: The proposed `SwipeManager` preset can govern horizontal swipes for galleries and slider details.
- **Narrative Storytelling Sequences**: The interaction system integrates cleanly with `ExperienceDirector` to lock pointer events during narrative playback.
- **What breaks first?**: Stale rectangle cache on resize. When cards shift position during resize, cached bounds become invalid. Interactions must subscribe to window resize triggers to flush bounding rect caches.

---

## PART 8 — INTERACTION SYSTEM INTEGRATION

```txt
┌────────────────────────────────────────────────────────┐
│                   Interaction System                   │
│   - Tracks pointer, calculates physics & drag deltas  │
└───────────────────────────┬────────────────────────────┘
                            │ Dispatches offsets
                            ▼
┌────────────────────────────────────────────────────────┐
│                     Motion System                      │
│   - Provides easing tokens                             │
└───────────────────────────┬────────────────────────────┘
                            │ Tweens elements
                            ▼
┌────────────────────────────────────────────────────────┐
│                        Scenes                          │
│   - Render UI visual states                            │
└────────────────────────────────────────────────────────┘
```

- **No Circularity**: The Interaction System maps physical pointer coordinates and coordinates with the Motion System for eases. It holds no scene-level references.

---

## PART 9 — RISK ANALYSIS

| Risk Identifier | Description | Severity | Mitigation |
|---|---|---|---|
| **Pointer Frame Lag** | Multiple `requestAnimationFrame` hooks clash, degrading frame rates. | **HIGH** | Consolidate calculations into a single pointer loop. |
| **Stale Bounding Rects** | Element layouts change, making cached coordinate targets incorrect. | **MEDIUM** | Flush boundaries on resize and route changes. |
| **Touch Gesture Collisions** | Swipes collide with mobile browser scroll triggers. | **CRITICAL** | Use `touch-action: pan-y` on container elements. |

---

## PART 10 — ARCH-009B DEFINITION

### Objective
Create the `InteractionSystem` runtime module, and refactor the Contact Hover Sweep interaction inside `Contact.tsx` to utilize centralized pointer tracking and sweep calculation presets.

### Deliverables
1. **Module Creation**: `lib/interactionSystem.ts` containing pointer listeners, velocity calculations, and a central coordinate publisher.
2. **Refactor Contact Target**: Update `Contact.tsx` to consume coordinates from `interactionSystem.ts`, removing raw pointer event listener calculations from the React file.

### Done Definition
- `lib/interactionSystem.ts` exists.
- Pointer coordinates, velocity, and warmth stops are driven by `interactionSystem.ts`.
- The Contact hover sweep visuals and performance are unchanged.
- `npm run build` succeeds.

### Non-Goals
- Do not migrate `ProjectCard` swipe gestures.
- Do not build the Custom Cursor component.
- Do not modify routing navigation.

### Rollback Plan
If contact hover interactions lag or fail, restore the inline pointer handlers in `Contact.tsx`.
