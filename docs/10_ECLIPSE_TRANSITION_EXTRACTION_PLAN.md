# Eclipse Transition Extraction Plan

## ARCH-003A

Status:

```txt
Extraction blueprint validation only.
No runtime implementation.
No runtime migration.
No UI change.
No animation change.
```

## Objective

Fully document and validate the Eclipse transition system before any runtime extraction begins.

This document answers:

```txt
What Eclipse currently owns?
What Eclipse should own?
What triggers Eclipse?
What does Eclipse trigger?
How does reverse scroll work?
What dependencies exist?
What can be safely extracted?
What must remain temporarily coupled?
```

## Current Eclipse Audit

### Current Owner

```txt
PinnedSections.tsx
```

Current Eclipse implementation lives in:

```txt
components/sections/PinnedSections.tsx
```

Current visual object:

```txt
.debug-circle
```

Current timeline owner:

```txt
PinnedSections master GSAP timeline
```

## ARCH-003B Implementation Result

Status:

```txt
Runtime extraction complete.
Visual redesign not performed.
ContactScene extraction not performed.
WorkScene extraction not performed.
ExperienceDirector runtime not created.
ScrollOrchestrator runtime not created.
```

Runtime module:

```txt
components/transitions/EclipseTransition.ts
```

First real consumer:

```txt
components/sections/PinnedSections.tsx
```

Extracted ownership:

```txt
EclipseTransition
├─ owns Eclipse timing constants
├─ owns `.debug-circle` visual timeline setup
├─ owns coverage state
├─ owns transition lifecycle API
└─ exposes covered() and getState()
```

Remaining temporary ownership:

```txt
PinnedSections
├─ owns ScrollTrigger
├─ owns master scroll timeline
├─ requests EclipseTransition.prepare(timeline)
├─ owns Contact activation threshold
├─ owns Contact reveal timeline
├─ owns Work visibility toggling
└─ publishes global scroll progress
```

## Coverage State Model

| State | Meaning | Entry Condition | Exit Condition |
|---|---|---|---|
| `IDLE` | Eclipse is reset and not active. | Transition reset or reverse completes before arc start. | Eclipse enter begins. |
| `ENTERING` | Eclipse arc/rise has started but coverage is not complete. | First or second Eclipse tween starts. | Full coverage begins or transition resets. |
| `COVERING` | Eclipse has reached coverage/blackout territory. | Full-cover tween completes or blackout hold starts. | Blackout completes, reverse begins, or reset occurs. |
| `EXITING` | Contact phase is reversing and Eclipse is leaving coverage. | `PinnedSections` deactivates Contact phase on reverse scroll. | Timeline callbacks return state to `COVERING`, `ENTERING`, or `IDLE`. |
| `COMPLETE` | Eclipse takeover is complete and Contact may be active. | Blackout hold completes or Contact phase activates. | Contact phase deactivates or transition resets. |

Valid transitions:

```txt
IDLE -> ENTERING
ENTERING -> COVERING
COVERING -> COMPLETE
COMPLETE -> EXITING
EXITING -> COVERING
COVERING -> ENTERING
ENTERING -> IDLE
```

Implementation note:

```txt
Timeline callbacks update transition state, but downstream systems no longer need to infer Eclipse coverage from raw timeline progress.
PinnedSections still owns temporary Contact gating until ContactScene / ExperienceDirector extraction.
```

### Current Triggers

Primary trigger:

```txt
ScrollTrigger progress on PinnedSections master timeline
```

Timeline constants:

```txt
eclipseArcStart    = 35.72
eclipseRiseStart   = 36.08
eclipseFullCover   = 36.94
blackoutEnd        = 37.32
contactFadeStart   = 37.34
```

Contact phase threshold:

```txt
contactPhaseProgress = contactFadeStart / 37.6
```

### Current Dependencies

```txt
gsap
ScrollTrigger
PinnedSections master timeline
PinnedSections scrollTrigger onUpdate
Work section DOM
Contact section DOM
contactRevealTl
contactPhaseActive flag
hardcoded timeline duration 37.6
.debug-circle class selector
```

### Current Inputs

```txt
Scroll progress
Scroll direction indirectly through scrub/snap
Master timeline time
Reduced motion preference
Timeline constants
```

### Current Outputs

```txt
.debug-circle opacity
.debug-circle y
.debug-circle scale
blackout hold via .debug-circle opacity
indirect Contact activation through contactPhaseProgress threshold
indirect Work deactivation through activateContactPhase()
```

### What Eclipse Receives

```txt
Master timeline time
Current scroll position through ScrollTrigger
Timeline start/end constants
```

### What Eclipse Controls

```txt
Eclipse visual object state:
- opacity
- vertical position
- scale
```

### What Eclipse Influences

```txt
Perceived transition from Work to Contact
Blackout timing
Contact eligibility timing
Reverse-scroll readability
Navigation active-state expectations
```

### Current-State Diagram

```txt
ScrollTrigger
↓
PinnedSections master timeline
├─ Work project timeline
├─ .debug-circle Eclipse animation
├─ contactPhaseProgress check
├─ activateContactPhase()
│  ├─ hide Work
│  └─ play contactRevealTl
└─ deactivateContactPhase()
   ├─ show Work
   └─ reverse contactRevealTl
```

## Eclipse Responsibility Audit

| Responsibility | Classification | Reasoning |
|---|---|---|
| Eclipse circle visual object | KEEP WITH ECLIPSE | It is the transition object. |
| Eclipse circle opacity/y/scale | KEEP WITH ECLIPSE | It is the transition motion. |
| Coverage state | KEEP WITH ECLIPSE | Transition must report when viewport is covered. |
| Blackout hold state | KEEP WITH ECLIPSE | It is part of transition coverage. |
| Contact reveal timeline | MOVE TO CONTACT | Contact content reveal belongs to ContactScene. |
| Work visibility | MOVE TO WORK / FUTURE ORCHESTRATION | WorkScene owns itself; ExperienceDirector coordinates activation. |
| Contact activation | MOVE TO FUTURE ORCHESTRATION | ExperienceDirector should decide scene activation after transition coverage. |
| Scroll progress interpretation | MOVE TO FUTURE ORCHESTRATION | ScrollOrchestrator owns raw scroll state. |
| Hardcoded contact threshold | MOVE TO FUTURE ORCHESTRATION | ExperienceDirector should expose active mode/scene. |
| Project final state | MOVE TO WORK | WorkScene owns project state and final anchor readiness. |
| Navigation active state | MOVE TO FUTURE ORCHESTRATION | Nav consumes active scene, not Eclipse internals. |

## Trigger Flow Analysis

### Current Forward Scroll Flow

```txt
User scrolls down
↓
ScrollTrigger updates PinnedSections timeline
↓
Work project reaches final phase
↓
.debug-circle begins at eclipseArcStart
↓
.debug-circle rises at eclipseRiseStart
↓
.debug-circle reaches full cover at eclipseFullCover
↓
blackout hold runs until blackoutEnd
↓
progress crosses contactPhaseProgress
↓
PinnedSections activateContactPhase()
├─ hides Work
└─ plays contactRevealTl
```

### Current Reverse Scroll Flow

```txt
User scrolls upward from Contact
↓
ScrollTrigger progress falls below contactPhaseProgress
↓
PinnedSections deactivateContactPhase()
├─ shows Work
└─ reverses contactRevealTl
↓
.debug-circle timeline reverses as master timeline scrubs backward
↓
Work becomes visible behind / after Eclipse reversal
```

### Entry Conditions

Current:

```txt
Timeline time reaches eclipseArcStart.
```

Desired future:

```txt
ExperienceDirector enters ECLIPSE_MODE after WorkScene reaches final transition boundary.
```

### Exit Conditions

Current:

```txt
Timeline progresses beyond contactPhaseProgress.
```

Desired future:

```txt
EclipseTransition reports covered/complete.
ExperienceDirector activates ContactScene.
```

### Trigger Points

```txt
eclipseArcStart
- .debug-circle opacity/y/scale begins

eclipseRiseStart
- full takeover movement begins

eclipseFullCover
- viewport should be covered

blackoutEnd
- blackout hold complete

contactFadeStart / contactPhaseProgress
- Contact phase activation begins
```

## Dependency Analysis

| Dependency | Type | Level | Notes |
|---|---|---:|---|
| PinnedSections master timeline | Timeline owner | CRITICAL | Eclipse is currently embedded in it. |
| `.debug-circle` class selector | Visual object lookup | HIGH | Current extraction target. |
| ScrollTrigger scrub | Trigger source | HIGH | Drives Eclipse forward/reverse. |
| Hardcoded timeline values | Timing input | HIGH | Tightly coupled to 37.6 master duration. |
| `contactPhaseProgress` | Contact eligibility | HIGH | Couples transition completion to Contact reveal. |
| `contactRevealTl` | Contact content reveal | HIGH | Should not belong to Eclipse. |
| `workEl` opacity/pointerEvents | Work visibility | HIGH | Should not belong to Eclipse. |
| `contactPhaseActive` | Phase state | MEDIUM | Temporary orchestration flag. |
| reduced motion early return | accessibility | MEDIUM | Future transition needs fallback. |
| Nav progress consumers | indirect dependency | MEDIUM | Active-state thresholds can mismatch. |
| CSS visual shape of circle | visual design | LOW | Protected visual but extractable with object. |

### Hidden Coupling

```txt
Eclipse completion is inferred from timeline time, not explicit coverage state.
Contact reveal starts from progress threshold, not transition lifecycle event.
Work visibility is toggled in the same closure as Contact activation.
Reverse behavior depends on ScrollTrigger scrub reversing multiple unrelated systems together.
Navigation active state depends on hardcoded progress thresholds.
```

## Reverse Scroll Analysis

### Desired Reverse Ownership

```txt
1. ContactScene exits first.
2. ExperienceDirector enters ECLIPSE_MODE.
3. EclipseTransition returns to covered state if needed.
4. EclipseTransition reverses.
5. WorkScene reactivates.
```

### Current Reverse Ownership

```txt
PinnedSections detects progress below contactPhaseProgress.
PinnedSections calls deactivateContactPhase().
PinnedSections shows Work immediately.
PinnedSections reverses contactRevealTl.
PinnedSections master timeline reverses .debug-circle.
```

### What Should Reverse First

```txt
Contact content should exit first.
```

### What Should Fade First

```txt
Contact utility / metadata / wordmark should exit before Work is reactivated.
```

### What Should Deactivate First

```txt
Contact interactions and pointer events.
```

### Timing Dependencies

```txt
Contact exit must complete or be safely covered before Work reappears.
Eclipse coverage state must be deterministic.
Work reactivation should happen after Contact is no longer visible.
Navigation state should not switch before the visual state supports it.
```

### Current Mismatch

```txt
Work is restored immediately in deactivateContactPhase().
Contact reveal reverses in parallel.
Eclipse reverses through scrub at the same time.
```

Risk:

```txt
Work / Eclipse / Contact can visually compete during reverse scroll.
```

## Future EclipseTransition Model

Based on `TransitionModuleContract`.

### Inputs

```txt
from: SceneId
to: SceneId
direction: forward | reverse
reducedMotion: boolean
timelineDriver: GSAP timeline or parent timeline adapter
visualTarget: Eclipse visual object ref
```

### Outputs

```txt
covered state
complete state
progress state
transition lifecycle events
```

### Lifecycle

```txt
prepare(context)
- set Eclipse visual object initial state
- create or attach transition timeline
- do not touch Work or Contact internals

enter(context)
- run Eclipse into viewport coverage
- emit/report covered when coverage reaches full screen

covered()
- return true when Eclipse visually covers viewport

exit(context)
- release or reverse Eclipse from covered state

complete(context)
- mark transition complete
- release temporary transition state

destroy()
- kill transition timeline
- cleanup transition-owned refs/listeners
```

### Activation Rules

```txt
Eclipse activates only when WorkScene reaches final transition boundary.
Eclipse activates before ContactScene can enter.
Eclipse does not activate Contact directly.
```

### Completion Rules

```txt
Eclipse is complete when:
- coverage state is true
- blackout hold has completed if required
- ExperienceDirector can safely activate the next scene
```

### Deactivation Rules

```txt
Eclipse can deactivate only after:
- next scene has safely entered
or
- reverse transition has safely returned to previous scene
```

## Extraction Boundary

### Implemented In ARCH-003B

```txt
Implemented extraction target:
- .debug-circle visual object
- Eclipse timeline setup
- Eclipse timing constants
- Eclipse coverage state semantics
- forward/reverse lifecycle naming
```

Implemented boundary:

```txt
Created an EclipseTransition module that exports transition lifecycle and timeline attachment helpers.
PinnedSections may still call it.
No ExperienceDirector required yet.
No Contact reveal migration.
No WorkScene migration.
```

### Must Remain In PinnedSections Temporarily

```txt
Master ScrollTrigger
Snap behavior
Scene mounting
Current Work project timeline
Current Contact phase activation
Current contactRevealTl
Current global progress publishing
Current cinematicNavigate compatibility
```

### Must Not Be Touched Yet

```txt
Project expansion choreography
ProjectCard internals
Contact reveal ownership
Contact hover systems
Hero animation internals
About animation internals
Navigation active-state logic
ExperienceDirector runtime
ScrollOrchestrator runtime
```

## Risk Matrix

| Responsibility | Current Owner | Future Owner | Risk Level | Migration Difficulty | Notes |
|---|---|---|---:|---:|---|
| Eclipse visual object | PinnedSections | EclipseTransition | MEDIUM | MEDIUM | Extractable if DOM/ref boundary is stable. |
| Eclipse timing constants | PinnedSections | EclipseTransition / motion tokens later | MEDIUM | LOW | Must not alter values during extraction. |
| Eclipse timeline tween setup | PinnedSections | EclipseTransition | HIGH | MEDIUM | Visual regression risk. |
| Eclipse coverage state | Implicit timeline time | EclipseTransition | HIGH | MEDIUM | Must become explicit without changing visuals. |
| Contact reveal trigger | PinnedSections | ExperienceDirector + ContactScene | HIGH | HIGH | Not part of ARCH-003B. |
| Work reactivation reverse | PinnedSections | ExperienceDirector + WorkScene | HIGH | HIGH | Reverse-scroll risk. |
| Master ScrollTrigger | PinnedSections | ScrollOrchestrator | CRITICAL | HIGH | Not part of ARCH-003B. |
| Project final state | PinnedSections / Project timeline | WorkScene | CRITICAL | HIGH | Must not be touched with Eclipse. |
| Nav active threshold | lib/motion.ts / progress event | ExperienceDirector | MEDIUM | MEDIUM | Can mismatch if changed too early. |
| Reduced motion fallback | PinnedSections early return | Transition / Performance policy | MEDIUM | MEDIUM | Needs later policy. |

### Critical Failure Risks

```txt
Changing master timeline duration.
Changing Eclipse visual timing.
Changing Contact activation threshold during Eclipse extraction.
Touching project expansion at the same time.
Introducing ExperienceDirector runtime during Eclipse extraction.
```

### Regression Risks

```txt
Eclipse arc starts at wrong scroll point.
Eclipse no longer fully covers viewport.
Contact appears too early.
Work disappears too early.
Reverse scroll reveals Work and Contact together.
```

### Reverse Scroll Risks

```txt
Work reactivates before Contact exits.
Eclipse reverses before blackout coverage is restored.
Navigation reports Work while Contact remains visible.
```

### Timing Risks

```txt
Hardcoded 37.6 duration dependency.
contactPhaseProgress dependency.
Scrub smoothing affecting perceived transition state.
Snap target behavior affecting final transition.
```

## ARCH-003B Definition

### Objective

Create the smallest safe runtime extraction of Eclipse transition ownership from `PinnedSections` without changing visual behavior.

### Deliverables

```txt
1. A focused EclipseTransition module or helper boundary.
2. Existing Eclipse visual timing preserved exactly.
3. PinnedSections remains the caller/compatibility owner.
4. No Contact reveal migration.
5. No Work scene migration.
6. Validation checklist completed.
7. Rollback path documented.
```

### Done Definition

```txt
Eclipse transition code is isolated behind a named boundary.
PinnedSections still drives the master timeline.
Visual output is unchanged.
Forward scroll behavior is unchanged.
Reverse scroll behavior is unchanged.
Contact reveal behavior is unchanged.
Work project behavior is unchanged.
Build passes.
Rollback is one-file or low-touch.
```

### Non-Goals

```txt
Do not implement ExperienceDirector.
Do not implement ScrollOrchestrator.
Do not migrate Contact reveal.
Do not migrate WorkScene.
Do not touch ProjectCard.
Do not change timing constants.
Do not change .debug-circle visual design.
Do not alter navigation.
```

### Rollback Plan

```txt
If ARCH-003B causes visual or timing regressions:
1. Revert only the EclipseTransition extraction change.
2. Restore inline .debug-circle timeline setup in PinnedSections.
3. Keep documentation.
4. Do not revert unrelated docs or refactor-target classifications.
```

### Validation Checklist

```txt
Forward scroll:
- Work remains visible before Eclipse.
- Eclipse arc appears at same point.
- Eclipse covers viewport at same point.
- Contact does not appear earlier.

Reverse scroll:
- Contact does not remain visible over Work unexpectedly.
- Eclipse reverses at same point.
- Work reappears at same point.

Technical:
- No Contact files changed.
- No ProjectCard files changed.
- No lib/motion threshold changes.
- Build passes.
```

## ARCH-003A Completion Status

```txt
Current Eclipse ownership is documented.
Future Eclipse ownership is documented.
Trigger flow is documented.
Reverse flow is documented.
Dependency map exists.
Risk matrix exists.
Extraction boundary exists.
ARCH-003B scope is fully defined.
No runtime code changed.
No UI changed.
No visual behavior changed.
```

## ARCH-003B Completion Status

```txt
Eclipse transition code is isolated behind `components/transitions/EclipseTransition.ts`.
PinnedSections still drives the master ScrollTrigger timeline.
Visual tween values and timings are unchanged.
Contact reveal behavior is unchanged.
Work project behavior is unchanged.
ProjectCard is unchanged.
lib/motion thresholds are unchanged.
Build passes.
```
