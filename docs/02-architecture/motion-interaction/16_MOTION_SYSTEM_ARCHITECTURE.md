# Motion System Architecture (ARCH-008A)

## Executive Summary

This document defines the **Motion System Architecture** for the Ferry Rusly Chaniago Portfolio V2. It establishes design guidelines, token specs, layer boundaries, and governance rules to create an agency-level (Awwwards-quality) motion standard, eliminating magic numbers and preventing animation sprawl.

---

## PART 1 — MOTION AUDIT

An audit of the repository reveals the following active animation systems:

| Animation System | Technology | Type | Magic Numbers / Hardcoded Settings | Classification |
|---|---|---|---|---|
| **Hero Entrance** | GSAP (Inline) | Scene | Duration: Inline tweens, `x` offsets (-180, 180), `y` offsets (-100, -50). | Scene Motion |
| **About Biography Text Reveal** | GSAP (Inline) | Scene | Character stagger delay: 0.025s. `y` offset: 120px. | Scene Motion |
| **Project Showcase Intro & Exit** | GSAP (Inline) | Scene | Masked blur offsets (8px, 12px), title translations (30px, 40px), y-translates. | Scene Motion |
| **Project Morphing Grid** | GSAP (Inline) | Scene | Transition time: 1.2s. Bezier: `premiumBezier` (custom). Border-radius: `0px` to `48px`. | Scroll Motion |
| **Eclipse Transition Circle** | GSAP (Transition Module) | Transition | Rise/cover timings: [35.72, 36.08, 36.94, 37.32]. Scale: 0.82 to 1.08. | Transition Motion |
| **Contact Letter Sweep & Footer** | GSAP (Scene Module) | Scene | Character stagger delay: 0.045s. Slide up: 112%. Utility column delays. | Scene Motion |
| **NavRail & MorphNav** | CSS & GSAP (Inline) | UI/Nav | Custom ease curves, pointer scale states. | Interaction Motion |
| **Fluid Background Canvas** | WebGL (Custom Shader) | Interactive | Noise frequencies, vertex weights. | Decorative Motion |

---

## PART 2 — MOTION RESPONSIBILITY MODEL

To ensure motion scalability, we define strict boundaries for the **Motion System**:

### What the Motion System Owns
1. **Duration Tokens**: Unified micro, fast, normal, medium, slow, and cinematic timeline values.
2. **Ease Tokens**: Mathematical ease profiles (premium bezier presets, elastic, exponent curves).
3. **Motion Presets**: Reuse contracts (e.g. clip-reveals, staggers, magnetics).
4. **Governance Rules**: Policies defining allowed GSAP parameters, performance targets, and easing selections.

### What the Motion System MUST NOT Own
1. **Business Logic**: Gating route transitions or evaluating navigation states.
2. **Scene Lifecycle State**: Determining whether a section is loaded or prepared.
3. **Scroll Metrics**: Capturing wheel events, tracking velocity, or calculating pixel scroll distances.
4. **DOM Access**: Querying classes, IDs, or raw nodes (except via abstract reference bridges).

---

## PART 3 — MOTION TOKEN ARCHITECTURE

Animations are configured using semantic tokens rather than magic values.

### 1. Duration Tokens
- `MOTION_DURATION_MICRO`: `150ms` (e.g., hover indicators, tooltip toggles).
- `MOTION_DURATION_FAST`: `300ms` (e.g., button fills, icon scale swaps).
- `MOTION_DURATION_NORMAL`: `500ms` (e.g., drawer sliding, modal popups).
- `MOTION_DURATION_MEDIUM`: `700ms` (e.g., headline fades, scroll indicators).
- `MOTION_DURATION_SLOW`: `900ms` (e.g., section entrances, page splits).
- `MOTION_DURATION_CINEMATIC`: `1200ms` (e.g., fullscreen grid morph, eclipse takeover).

### 2. Easing Tokens
- `MOTION_EASE_STANDARD`: `'power2.out'` (clean, default transitions).
- `MOTION_EASE_PREMIUM_IN_OUT`: `'custom-bezier(0.76, 0.00, 0.24, 1.00)'` (fluid, signature ease).
- `MOTION_EASE_EXPO_OUT`: `'expo.out'` (high anticipation, quick settle).
- `MOTION_EASE_BACK_OUT`: `'back.out(1.7)'` (playful bounce for UI interactive items).

### 3. Spatial & Distance Tokens
- `MOTION_DISTANCE_SUBTLE`: `12px` (character reveals).
- `MOTION_DISTANCE_MODERATE`: `40px` (card transitions).
- `MOTION_DISTANCE_DRAMATIC`: `100px` (section exits).

### Naming Conventions
Tokens are prefixed with `MOTION_`, followed by the category (`DURATION_`, `EASE_`, `STAGGER_`), and ending with the semantic weight (`MICRO`, `CINEMATIC`, `PREMIUM`).

---

## PART 4 — MOTION LAYER MODEL

Animations are classified into five layers to establish architectural hierarchy:

```txt
┌────────────────────────────────────────────────────────┐
│                    GLOBAL TRANSITIONS                  │
│       - Owners: EclipseTransition, Page Manager        │
├────────────────────────────────────────────────────────┤
│                     SCENE TIMELINES                    │
│       - Owners: WorkScene, ContactScene                │
├────────────────────────────────────────────────────────┤
│                   INTERACTION PHYSICS                  │
│       - Owners: Custom pointer gestures, hover sweeps  │
├────────────────────────────────────────────────────────┤
│                       MICRO-INTERACTIONS               │
│       - Owners: NavRail buttons, layout links          │
└────────────────────────────────────────────────────────┘
```

| Layer | Purpose | Owner | Allowed Scope |
|---|---|---|---|
| **Micro Motion** | Direct visual feedback | UI Components | Hover states, tooltip toggles, color morphs |
| **Interaction Motion** | Physics-based reactivity | Interaction Managers | Character hover sweeps, magnetic forces |
| **Scene Motion** | Local layout storytellers | `SceneModule` | Heading entrances, description paragraph fades |
| **Transition Motion** | Scene bridges | `TransitionModule` | Fullscreen circle sweeps, blackouts |
| **Global Motion** | Site-level choreography | `ExperienceDirector` | Navigation jump settles, scroll-triggers |

---

## PART 5 — GSAP GOVERNANCE RULES

To prevent timeline sprawl and performance degradation, the following rules apply:

1. **No Magic Durations**: All durations must reference a `MOTION_DURATION` token.
2. **Bezier Encapsulation**: Custom cubic-beziers must be declared inside the `MotionSystem` module; inline CSS or custom string beziers in component files are forbidden.
3. **Hardware Acceleration Gating**: Tweens modifying layouts (`top`, `left`, `margin`) are restricted. Animators must use transform properties (`x`, `y`, `scale`, `rotation`, `clipPath`) for composite-only performance.
4. **Subscription Limits**: ScrollTrigger `onUpdate` callbacks must not trigger style mutations outside of structural delegates.

---

## PART 6 — PREMIUM MOTION PRINCIPLES

To create an Awwwards-quality aesthetic, all animations must adhere to these mathematical guidelines:

1. **Anticipation & Weight (Deceleration Bias)**: Ease curves must utilize high initial acceleration followed by slow momentum settle. Standard linear or symmetric sine eases are forbidden for primary storytelling.
2. **Inertia & Magnetic Pull**: Interactive elements must implement interpolation lag (e.g., `0.15` lag tracking) to simulate weight. The cursor or character should float toward the target rather than instantly snapping.
3. **Continuity & Handoff**: Visual elements must share motion vectors. When a project card slides up, its inner image must translate downward in parallax at a matched proportional rate.

---

## PART 7 — MOTION INVENTORY

We catalog the status and recommended strategy for every portfolio motion system:

| Target System | Current Quality | Classification | Strategy & Rationale |
|---|---|---|---|
| **Hero** | Acceptable | `Future Upgrade` | Basic fade/shift. Add premium character stagger later. |
| **About** | Acceptable | `Future Upgrade` | Text slide is smooth; needs token standardization. |
| **WorkIntro** | Acceptable | `Acceptable` | Standard bezier slide up. |
| **Project Expansion** | Critical | `Protected` | Do not modify. Snapping and expansion geometry are tightly coupled. |
| **Eclipse** | Excellent | `Acceptable` | Isolated inside `EclipseTransition` runtime. |
| **Contact** | Excellent | `Acceptable` | Character hover sweep utilizes high-end pointer physics. |
| **Navigation** | Acceptable | `Needs Refactor` | The `cinematicNavigate` timeline needs to resolve tokens. |

---

## PART 8 — MOTION SYSTEM INTEGRATION

The Motion System acts as a dependency-free token provider to the orchestrators and scenes:

```txt
┌─────────────────────┐
│    Motion System    │
└──────────┬──────────┘
           ├───────────────────────┬───────────────────────┐
           ▼                       ▼                       ▼
   ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
   │  WorkScene   │        │ ContactScene │        │   Eclipse    │
   └──────────────┘        └──────────────┘        └──────────────┘
```

- **Scenes** read tokens (`MOTION_DURATION_CINEMATIC`) to declare their internal GSAP tweens.
- **Orchestrators** read easing curves to synchronize cross-scene navigation.

---

## PART 9 — RISK ANALYSIS

| Risk Identifier | Description | Severity | Mitigation |
|---|---|---|---|
| **Layout Thrashing** | Direct DOM style updates during rapid scroll updates. | **MEDIUM** | Use composite-only properties. |
| **Snap Lag** | High-precision snap-to calculations in PinnedSections clash with scroll handlers. | **HIGH** | Postpone snap migration until ARCH-008B. |
| **Resize Recalculations** | Layout shifts on resize break absolute timelines. | **CRITICAL** | Clear timeline references on resize callbacks. |

---

## PART 10 — ARCH-008B DEFINITION

### Objective
Implement the `MotionSystem` runtime module, providing unified duration, easing, stagger, and animation configuration tokens to all scenes and transition components.

### Deliverables
1. **Module Creation**: `lib/motionSystem.ts` (exporting standard tokens, custom premium easing profiles, and animation configuration generators).
2. **Refactor Scene Targets**: Update `WorkScene.ts`, `ContactScene.ts`, and `EclipseTransition.ts` to consume tokens from `motionSystem.ts` instead of raw magic numbers.

### Done Definition
- `lib/motionSystem.ts` exists.
- Magic durations, stagger delays, and string eases are replaced in `WorkScene`, `ContactScene`, and `EclipseTransition`.
- Visual behavior remains identical.
- Build compiles successfully.

### Non-Goals
- Do not migrate or alter the physics hover logic inside `Contact.tsx`.
- Do not alter `ScrollTrigger` snapping boundaries.
- Do not modify project expansion timelines.

### Rollback Plan
If visual or timing anomalies emerge, revert scene integrations to baseline values while keeping the `motionSystem.ts` file intact.
