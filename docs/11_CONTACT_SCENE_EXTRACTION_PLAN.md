# Contact Scene Extraction Plan

## ARCH-004A

Status:

```txt
Extraction blueprint only.
No runtime implementation.
No runtime migration.
No UI change.
No animation change.
No hover-system change.
```

## Objective

Document the current Contact ownership model and define the future `ContactScene` boundary before runtime extraction begins.

This document answers:

```txt
What Contact currently owns?
What Contact should own?
What triggers Contact?
What does Contact trigger?
What lifecycle should Contact have?
How should reverse scroll behave?
What can ARCH-004B safely extract?
```

## Current Contact Audit

### Current Owners

```txt
Contact.tsx
├─ owns Contact DOM structure
├─ owns Contact CSS
├─ owns wordmark text content
├─ owns wordmark pointer interaction
├─ owns utility link click handlers
├─ owns utility link hover animation
└─ owns interaction cleanup

PinnedSections.tsx
├─ owns Contact initial scene visibility
├─ owns Contact reveal timeline
├─ owns Contact activation threshold
├─ owns Contact pointer-events activation
├─ owns Contact reverse hide behavior
├─ owns Work hide/show during Contact phase
└─ owns scroll-progress trigger logic
```

## ARCH-004B Implementation Result

Status:

```txt
Runtime extraction complete.
Visual redesign not performed.
Interaction redesign not performed.
Contact UI unchanged.
ExperienceDirector runtime not created.
ScrollOrchestrator runtime not created.
WorkScene runtime not created.
```

Runtime module:

```txt
components/scenes/ContactScene.ts
```

First real consumer:

```txt
components/sections/PinnedSections.tsx
```

Extracted ownership:

```txt
ContactScene
├─ owns Contact prepare lifecycle
├─ owns Contact enter lifecycle
├─ owns Contact activate lifecycle
├─ owns Contact pause/resume lifecycle
├─ owns Contact exit lifecycle
├─ owns Contact destroy lifecycle
├─ owns Contact reveal timeline
├─ owns Contact active state
├─ owns Contact hidden/visible state
└─ owns Contact pointer-events lifecycle
```

Remaining temporary ownership:

```txt
PinnedSections
├─ owns ScrollTrigger
├─ owns Contact eligibility threshold
├─ requests ContactScene.prepare()
├─ requests ContactScene.enter()
├─ requests ContactScene.exit()
├─ owns Work visibility toggling
├─ owns Eclipse sequencing bridge
└─ publishes global scroll progress
```

Implementation note:

```txt
ContactScene preserves the exact reveal selectors, timing, easing, stagger, and reverse-hide behavior that previously lived in PinnedSections.
```

### Current Triggers

Primary trigger:

```txt
ScrollTrigger onUpdate in PinnedSections.
```

Contact phase threshold:

```txt
contactFadeStart = 37.34
contactPhaseProgress = contactFadeStart / 37.6
```

Forward trigger:

```txt
progress >= contactPhaseProgress
↓
activateContactPhase()
↓
contactRevealTl.play()
```

Reverse trigger:

```txt
progress < contactPhaseProgress
↓
deactivateContactPhase()
↓
contactRevealTl.reverse()
```

Navigation trigger:

```txt
Quick Jump buttons in Contact.tsx call window.__cinematicNavigate(target)
or fallback to window.scrollTo(...)
```

Interaction triggers:

```txt
Wordmark pointerenter / pointermove / pointerleave
Utility link mouseenter / mouseleave / focus / blur
Window resize
```

### Current Dependencies

```txt
Contact.tsx
├─ React refs/effects/callbacks
├─ gsap
├─ SECTION_ANCHORS
├─ window.__cinematicNavigate
├─ window.requestAnimationFrame
├─ window.resize
├─ DOMRect / getBoundingClientRect
├─ CSS variables for hover gradient
└─ Contact-specific class selectors

PinnedSections.tsx
├─ gsap
├─ ScrollTrigger
├─ master timeline
├─ contactPhaseProgress
├─ contactRevealTl
├─ contactPhaseActive
├─ Work DOM element
├─ Contact DOM element
├─ EclipseTransition state hints
└─ global scroll progress event
```

### Current Inputs

```txt
Contact.tsx
├─ pointer coordinates
├─ pointer velocity
├─ hover/focus state
├─ resize events
├─ quick-jump click targets
└─ DOM geometry

PinnedSections.tsx
├─ ScrollTrigger progress
├─ targetProgressRef override
├─ contactPhaseProgress
├─ contactPhaseActive flag
└─ Eclipse transition completion/exit calls
```

### Current Outputs

```txt
Contact.tsx
├─ CSS custom properties for wordmark hover
├─ inline transform scale on title wrappers
├─ GSAP hover wave for utility links
├─ quick-jump navigation request
└─ requestAnimationFrame interaction loop

PinnedSections.tsx
├─ Contact container opacity
├─ Contact container pointerEvents
├─ Contact content pointerEvents
├─ Contact wordmark reveal y/opacity
├─ Contact utility reveal opacity/y/pointerEvents
├─ Contact footer meta reveal opacity/y
├─ Work opacity/pointerEvents during Contact phase
└─ EclipseTransition complete/exit state hints
```

### What Contact Receives

```txt
Mounted scene container inside PinnedSections.
Pointer events after PinnedSections enables Contact phase.
Navigation target constants through SECTION_ANCHORS.
Global cinematic navigation bridge through window.__cinematicNavigate.
```

### What Contact Controls

```txt
Visual layout of the Contact section.
Wordmark content and hover sweep interaction.
Utility links and link hover animation.
Footer metadata markup.
Contact-local event listeners and animation-frame cleanup.
```

### What Contact Influences

```txt
Navigation through Quick Jump links.
Perceived final identity moment of the portfolio.
Pointer/hover performance during Contact phase.
Accessibility surface for Contact links and section label.
```

## Contact Responsibility Audit

| Responsibility | Classification | Reasoning |
|---|---|---|
| Contact DOM structure | KEEP WITH CONTACT | It is presentation owned by Contact. |
| Contact CSS and layout | KEEP WITH CONTACT | Protected visual surface. |
| Wordmark content | KEEP WITH CONTACT | Contact identity content. |
| Wordmark reveal target selectors | KEEP WITH CONTACT / CONTACTSCENE | Selectors remain presentation; reveal orchestration should move to ContactScene. |
| Wordmark hover sweep | MOVE TO INTERACTION SYSTEM LATER | It is a Contact-local interaction now; future InteractionSystem can own lifecycle if needed. |
| Utility link hover wave | MOVE TO INTERACTION SYSTEM LATER | It is interaction behavior, but safe to keep inside Contact during ARCH-004B. |
| Quick Jump click handling | MOVE TO EXPERIENCEDIRECTOR LATER | Contact should request navigation, not own global scroll implementation. |
| Contact initial hidden state | KEEP WITH CONTACTSCENE | Scene should prepare its own hidden/inactive state. |
| Contact reveal timeline | KEEP WITH CONTACTSCENE | Scene lifecycle should own enter/exit reveal. |
| Contact pointer-events lifecycle | KEEP WITH CONTACTSCENE | Activation belongs to scene lifecycle. |
| Contact activation threshold | MOVE TO EXPERIENCEDIRECTOR | Eligibility should be a scene permission decision. |
| Scroll progress interpretation | MOVE TO SCROLL ORCHESTRATOR | Raw scroll/progress should not be scene-owned. |
| Work hide/show during Contact phase | MOVE TO EXPERIENCEDIRECTOR / WORKSCENE | Contact must not own Work visibility. |
| Eclipse completion dependency | MOVE TO EXPERIENCEDIRECTOR | Director should sequence Transition complete → Contact enter. |
| Global progress publication | MOVE TO SCROLL ORCHESTRATOR | Cross-system event source should be centralized. |

## Future ContactScene Model

Based on `SceneModuleContract`.

### Owned Data

```txt
scene id: contact
activation state
prepared state
reveal timeline
root element reference
content wrapper reference or selectors
interaction availability flag
```

### Public API Candidate

```txt
prepare()
enter()
activate()
pause()
resume()
exit()
destroy()
isActive()
```

### Forbidden Responsibilities

```txt
Do not own ScrollTrigger.
Do not own global scroll progress.
Do not own Work visibility.
Do not own Eclipse visual timing.
Do not own project expansion.
Do not decide global active scene alone.
Do not mutate navigation active state directly.
```

## Contact Lifecycle Design

### prepare()

Purpose:

```txt
Set Contact to its inactive baseline and create the reveal timeline.
```

Trigger:

```txt
PinnedSections / future ExperienceDirector initializes scene registry.
```

Expected Behavior:

```txt
Set Contact container opacity to 0.
Disable Contact pointer events.
Set wordmark chars to y: 112%, opacity: 0.
Set utility columns and footer metadata to hidden/inactive.
Create paused reveal timeline.
```

Ownership:

```txt
ContactScene.
```

### enter()

Purpose:

```txt
Begin visible Contact reveal after Eclipse coverage has completed.
```

Trigger:

```txt
Current: PinnedSections activateContactPhase().
Future: ExperienceDirector after EclipseTransition complete.
```

Expected Behavior:

```txt
Enable Contact container visibility.
Play reveal timeline from the start or current reversible state.
Do not hide Work directly.
```

Ownership:

```txt
ContactScene for reveal.
ExperienceDirector for permission to enter.
```

### activate()

Purpose:

```txt
Allow Contact interactions after scene is visible enough to use.
```

Trigger:

```txt
Reveal reaches active interaction threshold or enter completes.
```

Expected Behavior:

```txt
Enable Contact content pointer events.
Enable utility link interactions.
Allow wordmark hover sweep.
```

Ownership:

```txt
ContactScene.
InteractionSystem later if extracted.
```

### pause()

Purpose:

```txt
Suspend Contact interaction work while scene remains visually present or while navigation transition masks it.
```

Trigger:

```txt
Future navigation transition, reduced motion policy, or global scene pause.
```

Expected Behavior:

```txt
Disable pointer interactions.
Pause or stop requestAnimationFrame loops if active.
Preserve visual state.
```

Ownership:

```txt
ContactScene coordinates; Contact-local interaction code performs cleanup.
```

### resume()

Purpose:

```txt
Restore Contact interactions after pause.
```

Trigger:

```txt
Future navigation transition completes or scene resumes.
```

Expected Behavior:

```txt
Re-enable pointer interactions if Contact is active.
Do not replay reveal animation.
```

Ownership:

```txt
ContactScene.
```

### exit()

Purpose:

```txt
Reverse Contact reveal before returning to Work/Eclipse path.
```

Trigger:

```txt
Current: progress drops below contactPhaseProgress.
Future: ExperienceDirector receives reverse transition request.
```

Expected Behavior:

```txt
Disable interactions early.
Reverse Contact reveal timeline.
Set Contact container inactive after reverse completes.
Do not restore Work directly.
```

Ownership:

```txt
ContactScene for Contact exit.
ExperienceDirector for sequencing Work restore and Eclipse reverse.
```

### destroy()

Purpose:

```txt
Clean up timelines, listeners, animation-frame loops, and local scene state.
```

Trigger:

```txt
Component unmount or scene registry teardown.
```

Expected Behavior:

```txt
Kill reveal timeline.
Cancel active animation frames.
Remove listeners.
Clear scene references.
```

Ownership:

```txt
ContactScene and Contact-local interaction cleanup.
```

## Reverse Scroll Analysis

### Current Reverse Flow

```txt
User scrolls upward from Contact
↓
PinnedSections progress < contactPhaseProgress
↓
deactivateContactPhase()
├─ eclipseTransition.exit()
├─ Work opacity/pointerEvents restored immediately
└─ contactRevealTl.reverse()
↓
contactRevealTl onReverseComplete hides Contact container/content
↓
Master timeline continues reversing Eclipse visual
```

### Correct Future Reverse Ordering

```txt
1. ContactScene deactivates interactions.
2. ContactScene exits/reverses reveal.
3. ContactScene reports exited or hidden.
4. ExperienceDirector restores Eclipse/Work permissions.
5. EclipseTransition reverses or returns through coverage state.
6. WorkScene resumes when the visual state supports it.
```

### Ownership

| Step | Current Owner | Future Owner |
|---|---|---|
| Detect reverse threshold | PinnedSections | ScrollOrchestrator + ExperienceDirector |
| Disable Contact interactions | PinnedSections / Contact | ContactScene |
| Reverse Contact reveal | PinnedSections | ContactScene |
| Hide Contact container | PinnedSections timeline callback | ContactScene |
| Restore Work | PinnedSections | ExperienceDirector + WorkScene |
| Reverse Eclipse | Master timeline + EclipseTransition state hints | EclipseTransition under orchestration |

### Timing Dependencies

```txt
Contact exit should begin before Work is restored.
Work should not become interactable while Contact remains visible.
Eclipse coverage should remain deterministic during Contact exit.
Navigation active state should not switch before visual scene ownership supports it.
```

## Dependency Analysis

| Dependency | Type | Level | Notes |
|---|---|---:|---|
| `PinnedSections` master ScrollTrigger | Trigger source | CRITICAL | Contact currently cannot enter/exit without it. |
| `contactPhaseProgress` | Activation threshold | CRITICAL | Hardcoded scene eligibility. |
| `contactRevealTl` in PinnedSections | Reveal owner | HIGH | Primary ARCH-004B extraction target. |
| `contactPhaseActive` | Scene state flag | HIGH | Should become ContactScene active state. |
| Work DOM visibility toggles | Cross-scene coupling | HIGH | Must not move into ContactScene. |
| EclipseTransition complete/exit calls | Transition coupling | MEDIUM | Sequencing bridge until ExperienceDirector exists. |
| Contact CSS class selectors | DOM coupling | MEDIUM | Acceptable during incremental extraction. |
| `window.__cinematicNavigate` | Navigation bridge | MEDIUM | Should become director navigation request later. |
| `SECTION_ANCHORS` | Navigation constants | MEDIUM | Contact utility links depend on global progress anchors. |
| Wordmark rAF loop | Interaction/performance | MEDIUM | Must be paused/destroyed cleanly later. |
| Utility link GSAP hover | Interaction | LOW | Local interaction; not part of scene extraction. |
| Static Contact markup/styles | Presentation | LOW | Protected surface, not migration risk if untouched. |

## Migration Boundary

### Safe For ARCH-004B

```txt
Create a ContactScene module/helper boundary.
Move Contact prepare/enter/exit reveal timeline setup out of PinnedSections.
Move Contact active/prepared flags into ContactScene.
Keep PinnedSections as temporary caller.
Keep existing selectors and animation values.
Keep Contact.tsx markup, CSS, wordmark hover, and utility link hover unchanged.
```

### Must Remain Temporarily Coupled

```txt
Master ScrollTrigger.
contactPhaseProgress threshold.
Work visibility toggling.
EclipseTransition complete/exit bridge.
Global scroll progress event.
cinematicNavigate.
Nav active thresholds.
```

### Must Not Be Touched Yet

```txt
Contact visual design.
Contact typography.
Contact hover sweep.
Utility link hover animation.
EclipseTransition visual timing.
Work project choreography.
ProjectCard.
lib/motion thresholds.
ExperienceDirector runtime.
ScrollOrchestrator runtime.
WorkScene runtime.
```

## Risk Matrix

| Responsibility | Current Owner | Future Owner | Risk | Notes |
|---|---|---|---:|---|
| Contact reveal timeline | PinnedSections | ContactScene | HIGH | Must preserve exact timeline values and reverse behavior. |
| Contact active flag | PinnedSections | ContactScene | HIGH | Incorrect state can cause pointer or opacity bugs. |
| Contact initial hidden state | PinnedSections | ContactScene | MEDIUM | Safe if selectors and values are preserved. |
| Contact pointer-events lifecycle | PinnedSections | ContactScene | HIGH | Interaction bugs possible if enabled too early. |
| Wordmark reveal selectors | PinnedSections | ContactScene | MEDIUM | Depends on stable Contact class names. |
| Utility/metadata reveal | PinnedSections | ContactScene | MEDIUM | Must preserve stagger/order. |
| Work restore reverse | PinnedSections | ExperienceDirector + WorkScene | CRITICAL | Do not move in ARCH-004B. |
| Contact activation threshold | PinnedSections | ExperienceDirector | CRITICAL | Do not change in ARCH-004B. |
| Wordmark hover sweep | Contact | InteractionSystem later | MEDIUM | Do not touch in ARCH-004B. |
| Quick Jump navigation | Contact | ExperienceDirector later | MEDIUM | Leave current bridge unchanged. |
| Eclipse sequencing | PinnedSections + EclipseTransition | ExperienceDirector + EclipseTransition | HIGH | Do not alter timing in ARCH-004B. |

## ARCH-004B Definition

### Objective

Create the smallest safe runtime extraction of Contact reveal lifecycle ownership from `PinnedSections` into a named `ContactScene` boundary without changing visual behavior.

### Deliverables

```txt
1. A focused ContactScene module/helper boundary.
2. Existing Contact reveal timing preserved exactly.
3. Contact prepare/enter/exit API defined and used by PinnedSections.
4. PinnedSections remains temporary trigger/orchestration owner.
5. No Contact visual or interaction redesign.
6. No WorkScene migration.
7. No ExperienceDirector or ScrollOrchestrator runtime.
8. Validation checklist completed.
```

### Done Definition

```txt
Contact reveal timeline is isolated behind a named ContactScene boundary.
Contact active/prepared state is explicit.
PinnedSections no longer owns Contact reveal tween details.
PinnedSections still owns scroll threshold and Work visibility.
Contact UI is unchanged.
Contact hover interactions are unchanged.
Eclipse timing is unchanged.
Work/project choreography is unchanged.
Build passes.
```

### Non-Goals

```txt
Do not implement ExperienceDirector.
Do not implement ScrollOrchestrator.
Do not migrate WorkScene.
Do not change contactPhaseProgress.
Do not change Contact typography or layout.
Do not change Contact wordmark hover sweep.
Do not change utility link hover animation.
Do not change Quick Jump navigation behavior.
Do not change EclipseTransition timing.
Do not touch ProjectCard.
```

### Rollback Plan

```txt
If ARCH-004B causes Contact reveal, pointer-events, or reverse-scroll regressions:
1. Revert only the ContactScene extraction.
2. Restore Contact reveal timeline setup in PinnedSections.
3. Keep ARCH-004A documentation.
4. Do not revert EclipseTransition.
5. Do not revert unrelated Contact UI or governance docs.
```

### Validation Checklist

```txt
Forward:
- Contact remains hidden before contactPhaseProgress.
- Contact appears at the same threshold.
- Wordmark reveal timing/order is unchanged.
- Utility columns and metadata reveal timing/order are unchanged.
- Work hide timing is unchanged.

Reverse:
- Contact reveal reverses at the same threshold.
- Contact pointer events disable correctly.
- Work reappears as before.
- Eclipse reverse timing is unchanged.

Technical:
- Contact.tsx visual/interaction code unchanged.
- PinnedSections no longer contains Contact reveal tween details after ARCH-004B.
- No lib/motion threshold changes.
- Build passes.
```

## ARCH-004A Completion Criteria

```txt
Current Contact ownership documented.
Future Contact ownership documented.
Lifecycle defined.
Reverse flow defined.
Dependency map exists.
Risk matrix exists.
ARCH-004B scope defined.
No runtime code changed.
No UI changed.
No visual behavior changed.
```
