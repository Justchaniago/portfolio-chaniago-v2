# Work Scene Extraction Plan

## ARCH-005A

Status:

```txt
Extraction blueprint only.
No runtime implementation.
No runtime migration.
No UI change.
No animation change.
No project expansion change.
```

## Objective

Document current Work ownership and define the future `WorkScene` boundary before runtime extraction begins.

This document answers:

```txt
What Work currently owns?
What Work should own?
What triggers Work?
What does Work trigger?
What belongs to Project Expansion?
What belongs to ExperienceDirector?
What belongs to ScrollOrchestrator?
What must remain untouched?
```

## Current Work Audit

### Current Owners

```txt
ProjectShowcase.tsx
├─ owns Work section DOM shell
├─ owns WorkIntro placement
├─ owns project intro markup
├─ owns ProjectCard mounting
└─ owns static Work presentation structure

PinnedSections.tsx
├─ owns Work initial hidden state
├─ owns Work enter visibility
├─ owns Work intro reveal timeline
├─ owns project intro animation timeline
├─ owns project card initial geometry
├─ owns project card scroll choreography
├─ owns project expansion timeline attributes
├─ owns project exit choreography
├─ owns Work restore after Contact reverse
├─ owns Work pointer-events lifecycle
└─ owns Work-to-Eclipse handoff timing

ProjectCard.tsx
├─ owns expanded-state React bridge through data attributes
├─ owns gallery active slide state
├─ owns autoplay progression
├─ owns horizontal gesture handling
├─ owns pill emergence/morph/exit animation
├─ owns CTA routing
├─ owns project image fallback behavior
└─ owns internal cleanup for observers, timeouts, and animation frames
```

## ARCH-005B Implementation Result

Status:

```txt
Runtime extraction complete.
Visual redesign not performed.
Project Expansion refactor not performed.
ProjectCard refactor not performed.
ExperienceDirector runtime not created.
ScrollOrchestrator runtime not created.
Motion tokens not introduced.
```

Runtime module:

```txt
components/scenes/WorkScene.ts
```

First real consumer:

```txt
components/sections/PinnedSections.tsx
```

Extracted ownership:

```txt
WorkScene
├─ owns Work prepare lifecycle
├─ owns Work enter lifecycle
├─ owns Work activate lifecycle
├─ owns Work pause/resume lifecycle
├─ owns Work exit lifecycle
├─ owns Work destroy lifecycle
├─ owns Work root visibility
├─ owns Work root restoration
├─ owns Work root pointer-events lifecycle
├─ owns WorkIntro initial state
├─ owns WorkIntro reveal timeline
└─ owns WorkIntro exit timeline
```

Remaining temporary ownership:

```txt
PinnedSections
├─ owns ScrollTrigger
├─ owns snap behavior
├─ requests WorkScene.prepare()
├─ requests WorkScene.enter()
├─ requests WorkScene.resume()
├─ requests WorkScene.exit()
├─ owns project setup
├─ owns project intro sequence
├─ owns project card geometry choreography
├─ owns ProjectCard data attribute bridge
├─ owns Project Expansion timing
├─ owns Contact eligibility threshold
├─ owns Eclipse sequencing bridge
└─ publishes global scroll progress
```

Implementation note:

```txt
WorkScene preserves the exact Work root and WorkIntro selectors, timing, easing, values, and timeline positions that previously lived in PinnedSections.
```

### Current Triggers

Primary trigger:

```txt
PinnedSections master ScrollTrigger timeline.
```

Work enter trigger:

```txt
timeline time 4.85
↓
.work-section-container opacity/pointerEvents enabled
```

Work intro reveal trigger:

```txt
timeline time 5.0 / 5.15
↓
.work-intro-line-1 and .work-intro-line-2 reveal
```

Work intro exit trigger:

```txt
timeline time 7.2
↓
.work-intro-container moves/fades out
```

Project loop trigger:

```txt
projects.forEach(...)
start = 8.0 + idx * 9.5
```

Project expansion trigger:

```txt
timeline time start + 4.4
↓
Project card expands to fullscreen
```

ProjectCard state trigger:

```txt
PinnedSections sets data-expanded / data-exiting attributes
↓
ProjectCard MutationObserver updates React state
```

Contact reverse trigger affecting Work:

```txt
progress < contactPhaseProgress
↓
PinnedSections deactivateContactPhase()
↓
Work opacity/pointerEvents restored immediately
```

### Current Dependencies

```txt
PinnedSections.tsx
├─ gsap
├─ ScrollTrigger
├─ projects data
├─ hardcoded timeline duration 37.6
├─ project timeline start formula
├─ responsive card geometry
├─ Work DOM class selectors
├─ ProjectCard DOM class selectors
├─ ProjectCard data attributes
├─ ContactScene reverse path
├─ EclipseTransition handoff
└─ global progress publication

ProjectShowcase.tsx
├─ projects data
├─ WorkIntro
├─ ProjectCard
└─ CSS class naming consumed by PinnedSections

ProjectCard.tsx
├─ React state
├─ MutationObserver
├─ IntersectionObserver
├─ requestAnimationFrame
├─ pointer events
├─ Next router
├─ gsap local timelines
├─ project gallery data
└─ data-expanded / data-exiting / data-morph-complete attributes
```

### Current Inputs

```txt
Scroll progress
Scroll direction
Scroll velocity
Snap target time
Viewport width
Project data
Project gallery data
Pointer gestures inside ProjectCard
Contact phase reverse threshold
Eclipse transition timing
```

### Current Outputs

```txt
Work container opacity/pointerEvents
Work intro y/opacity
Project intro opacity/y/filter/scaleX/pointerEvents
Project card geometry/top/left/width/height/borderRadius/y/opacity
Project image wrapper borderRadius/yPercent
Project slide wrapper scale
ProjectCard data-expanded/data-exiting attributes
Project gallery pill visibility and shape
HTML theme variables for project modes
Project card exit y/pointerEvents
Work restore after Contact reverse
```

### What Work Receives

```txt
Project data from ProjectShowcase.
Timeline commands from PinnedSections.
Visibility activation from PinnedSections.
Attribute commands from PinnedSections for ProjectCard state.
```

### What Work Controls

```txt
Work section structure.
WorkIntro markup.
Project intro presentation markup.
ProjectCard mounting.
ProjectCard local expanded/gallery interaction behavior.
```

### What Work Influences

```txt
Main portfolio project storytelling.
Theme variables during fullscreen project phases.
Final visual anchor before Eclipse.
Reverse-scroll restoration after Contact exit.
Navigation active-state expectations through global progress.
```

## Current-State Map

```txt
ScrollTrigger
↓
PinnedSections master timeline
├─ shows Work container
├─ reveals WorkIntro
├─ hides WorkIntro
├─ initializes every ProjectCard
├─ animates project intro copy
├─ animates project card entry
├─ expands project card fullscreen
├─ sets ProjectCard data-expanded/data-exiting
├─ exits project card
├─ hands off to EclipseTransition
└─ restores Work when ContactScene exits on reverse

ProjectCard
↓
MutationObserver reads data attributes
↓
React local state drives gallery / pill / interactions
```

## Work Responsibility Audit

| Responsibility | Classification | Reasoning |
|---|---|---|
| Work section DOM shell | KEEP WITH WORKSCENE | WorkScene should own Work scene root state. |
| Work initial hidden state | KEEP WITH WORKSCENE | Scene lifecycle should prepare its inactive state. |
| Work enter visibility | KEEP WITH WORKSCENE | WorkScene should own enter/activate visibility. |
| Work pointer-events lifecycle | KEEP WITH WORKSCENE | Scene should know when it is interactive. |
| WorkIntro reveal | KEEP WITH WORKSCENE | It is Work scene entry presentation. |
| WorkIntro exit | KEEP WITH WORKSCENE | It is Work scene handoff to project storytelling. |
| Project intro copy reveal | KEEP WITH WORKSCENE | It is Work scene/project sequence presentation, but high risk. |
| Project card initial geometry | KEEP WITH WORKSCENE LATER | WorkScene can own setup, but should not be first extraction. |
| Project activation timing | MOVE TO EXPERIENCEDIRECTOR LATER | Director should eventually know active project/scene phase. |
| Project visibility timeline | KEEP WITH WORKSCENE LATER | Work owns visual project storytelling, but extraction must be incremental. |
| Project expansion geometry | KEEP WITH PROJECT EXPANSION / PROJECTCARD BOUNDARY | Critical visual behavior; do not move in ARCH-005B. |
| ProjectCard gallery state | KEEP WITH PROJECTCARD | Local interaction state belongs to ProjectCard. |
| ProjectCard MutationObserver bridge | KEEP WITH PROJECTCARD | Bridge is fragile and should not be touched with WorkScene. |
| ProjectCard autoplay | KEEP WITH PROJECTCARD | Local runtime behavior. |
| ProjectCard gestures | KEEP WITH PROJECTCARD | Local interaction behavior. |
| ProjectCard routing CTA | KEEP WITH PROJECTCARD | Component-level navigation action. |
| Scroll progress interpretation | MOVE TO SCROLLORCHESTRATOR | Raw progress should be centralized later. |
| Snap transition map | MOVE TO SCROLLORCHESTRATOR | Current snap logic is scroll ownership. |
| Work ↔ Eclipse sequencing | MOVE TO EXPERIENCEDIRECTOR | Director should coordinate scene-to-transition handoff. |
| Work restore after Contact reverse | MOVE TO EXPERIENCEDIRECTOR + WORKSCENE | WorkScene should resume, Director should decide when. |
| Global progress event | MOVE TO SCROLLORCHESTRATOR | Cross-system progress source. |

### Ownership Questions

Who owns project activation?

```txt
Current: PinnedSections timeline and ProjectCard data attributes.
Future: ExperienceDirector should know active project phase; WorkScene should execute visual activation; ProjectCard should own local interactive state.
```

Who owns project visibility?

```txt
Current: PinnedSections.
Future: WorkScene for Work/project visuals; ExperienceDirector for global permission.
```

Who owns project expansion?

```txt
Current: PinnedSections timeline starts expansion, ProjectCard reacts to attributes and owns internal expanded interactions.
Future: Project Expansion boundary / ProjectCard should remain protected until a dedicated extraction plan.
```

Who owns Work enter/exit?

```txt
Current: PinnedSections.
Future: WorkScene lifecycle, triggered by ExperienceDirector or temporary PinnedSections bridge.
```

Who owns Work restoration after Contact reverse?

```txt
Current: PinnedSections.
Future: ExperienceDirector decides timing; WorkScene resumes/restores its own root visibility.
```

## Future WorkScene Model

Based on `SceneModuleContract`.

### Owned Data

```txt
scene id: work
prepared state
active state
paused state
root element selector/ref
intro timeline or timeline attachment
work visibility state
project sequence setup state
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
Do not own snap logic.
Do not own global progress publication.
Do not own Contact reveal.
Do not own Eclipse visual timing.
Do not own ProjectCard internal gallery state.
Do not own ProjectCard gesture handling.
Do not own ProjectCard autoplay.
Do not own routing.
Do not decide global active scene alone.
```

## Work Lifecycle Design

### prepare()

Purpose:

```txt
Set Work root, WorkIntro, project intros, ProjectCards, and project pills to inactive baseline.
```

Trigger:

```txt
Current future bridge: PinnedSections initializes WorkScene.
Future: ExperienceDirector scene registration.
```

Expected Behavior:

```txt
Set `.work-section-container` opacity 0 and pointerEvents none.
Set `.work-intro-container` opacity/y baseline.
Set `.work-intro-line-1` and `.work-intro-line-2` hidden below mask.
Optionally prepare safe non-expansion project baselines.
Do not start project expansion.
```

Ownership:

```txt
WorkScene.
```

### enter()

Purpose:

```txt
Bring Work scene into view after About exits.
```

Trigger:

```txt
Current: timeline time 4.85.
Future: ExperienceDirector after AboutScene exits.
```

Expected Behavior:

```txt
Enable Work root opacity/pointerEvents.
Begin WorkIntro reveal.
Do not activate any ProjectCard expanded state.
```

Ownership:

```txt
WorkScene for visuals.
ExperienceDirector for permission.
```

### activate()

Purpose:

```txt
Allow Work scene to become active and receive project sequence progression.
```

Trigger:

```txt
Work root reveal complete or scroll reaches project sequence.
```

Expected Behavior:

```txt
Mark Work active.
Allow Work project storytelling timeline to progress.
Keep ProjectCard internals isolated.
```

Ownership:

```txt
WorkScene.
```

### pause()

Purpose:

```txt
Suspend Work interactions/visibility authority while another scene or transition has control.
```

Trigger:

```txt
Contact enter, navigation mask, future ExperienceDirector pause.
```

Expected Behavior:

```txt
Disable Work pointer events.
Preserve visual state if covered by Eclipse/Contact.
Do not reset ProjectCard internals.
```

Ownership:

```txt
WorkScene.
```

### resume()

Purpose:

```txt
Restore Work after Contact exits on reverse or after a navigation transition returns to Work.
```

Trigger:

```txt
Current future bridge: PinnedSections reverse threshold.
Future: ExperienceDirector after ContactScene exits and Eclipse permits Work.
```

Expected Behavior:

```txt
Restore Work root opacity/pointerEvents.
Do not replay WorkIntro if returning to late Work/project phase.
Do not reset ProjectCard gallery state unless a dedicated project lifecycle asks for it.
```

Ownership:

```txt
WorkScene for root restore.
ExperienceDirector for timing.
```

### exit()

Purpose:

```txt
Release Work scene before Eclipse takeover / Contact enter.
```

Trigger:

```txt
Current: final project handoff and Contact activation path.
Future: ExperienceDirector requests Work exit before EclipseTransition.
```

Expected Behavior:

```txt
Disable Work pointer events.
Allow final project to remain as visual anchor until Eclipse covers it.
Do not fade Work early unless the transition requires it.
```

Ownership:

```txt
WorkScene for Work state.
EclipseTransition for coverage.
ExperienceDirector for sequencing.
```

### destroy()

Purpose:

```txt
Clean up Work-owned timelines/state.
```

Trigger:

```txt
Component unmount or scene registry teardown.
```

Expected Behavior:

```txt
Kill Work-owned timelines.
Clear refs/state.
Do not directly kill ProjectCard internal observers except through React unmount.
```

Ownership:

```txt
WorkScene.
```

## Project Expansion Boundary

Project Expansion is classified as:

```txt
CRITICAL RISK
```

### Current Project Expansion Surface

```txt
PinnedSections
├─ expands ProjectCard geometry to fullscreen
├─ mutates ProjectCard data-expanded
├─ mutates ProjectCard data-exiting
├─ adjusts image wrapper borderRadius
├─ adjusts slide wrapper scale
└─ shifts project cards on exit

ProjectCard
├─ observes data-expanded/data-exiting/data-morph-complete
├─ drives expanded local state
├─ runs pill emergence/morph/exit
├─ controls gallery slides
├─ controls autoplay
├─ controls gestures
├─ controls CTA routing
└─ handles cleanup
```

### What WorkScene May Own Later

```txt
Project sequence prepare state.
Project intro reveal/exit.
Project card entry into poster position.
High-level project phase lifecycle.
```

### What WorkScene Must Never Own

```txt
ProjectCard internal gallery index.
ProjectCard autoplay timing.
ProjectCard horizontal gesture detection.
ProjectCard pointer capture.
ProjectCard CTA routing behavior.
ProjectCard image fallback.
ProjectCard local timeout/observer cleanup.
```

### What Remains Isolated

```txt
ProjectCard expanded interaction runtime remains inside ProjectCard.
Project Expansion geometry remains protected until a dedicated Project Expansion extraction plan exists.
ARCH-005B must not move expansion choreography.
```

## Reverse Scroll Analysis

### Current Flow

```txt
User scrolls upward from Contact
↓
PinnedSections progress < contactPhaseProgress
↓
deactivateContactPhase()
├─ eclipseTransition.exit()
├─ Work opacity/pointerEvents restored immediately
└─ contactScene.exit()
↓
Master timeline reverses Eclipse and project timeline values
```

### Future Flow

```txt
User scrolls upward from Contact
↓
ScrollOrchestrator reports reverse boundary
↓
ExperienceDirector requests ContactScene.exit()
↓
ContactScene exits / disables interactions
↓
ExperienceDirector verifies transition state
↓
ExperienceDirector requests WorkScene.resume()
↓
EclipseTransition reverses under director permission
```

### Correct Ownership

| Step | Current Owner | Future Owner |
|---|---|---|
| Detect reverse boundary | PinnedSections | ScrollOrchestrator |
| Decide Contact exit | PinnedSections | ExperienceDirector |
| Execute Contact exit | ContactScene | ContactScene |
| Restore Work root | PinnedSections | WorkScene |
| Decide restore timing | PinnedSections | ExperienceDirector |
| Reverse Eclipse | Master timeline + EclipseTransition | EclipseTransition under ExperienceDirector |

### Current Coupling

```txt
Work restore happens before ContactScene reports exit complete.
Work restore and Eclipse exit are triggered by the same PinnedSections function.
Work root visibility is not owned by a Work lifecycle object.
Project state and Work root state are mixed inside one large master timeline.
```

## Dependency Analysis

| Dependency | Type | Level | Notes |
|---|---|---:|---|
| PinnedSections master timeline | Trigger/timeline owner | CRITICAL | Work extraction cannot remove it in ARCH-005B. |
| ScrollTrigger progress | Trigger source | CRITICAL | Future ScrollOrchestrator owner. |
| Project Expansion | Visual/runtime system | CRITICAL | Must not be touched in ARCH-005B. |
| ProjectCard | Interactive runtime | CRITICAL | Owns gallery, gestures, observers, autoplay. |
| ProjectCard data attributes | Bridge | HIGH | Fragile bridge between timeline and React state. |
| projects data | Content input | MEDIUM | Shared by ProjectShowcase and PinnedSections. |
| responsive card geometry | Visual setup | HIGH | Moving it risks layout regression. |
| WorkIntro selectors | Visual timeline target | MEDIUM | Safe first extraction candidate. |
| project intro selectors | Visual timeline targets | HIGH | Numerous dynamic selectors. |
| EclipseTransition | Transition dependency | HIGH | Work handoff depends on Eclipse. |
| ContactScene | Reverse dependency | HIGH | Work restore currently tied to Contact reverse. |
| HTML theme variables | Global visual side effect | HIGH | Project fullscreen changes nav/theme state. |
| Navigation progress | External consumer | MEDIUM | Depends on global progress event. |
| cinematicNavigate | External transition | MEDIUM | Reads master timeline and destination progress. |

## Migration Boundary

### Safe For ARCH-005B

```txt
Create a WorkScene module/helper boundary.
Move Work root prepare/enter/pause/resume/exit state ownership out of PinnedSections.
Move WorkIntro reveal/exit setup only if exact timing and selectors are preserved.
Keep PinnedSections as temporary caller.
Keep master ScrollTrigger and snap behavior in PinnedSections.
Keep project expansion and ProjectCard untouched.
```

### Must Remain Temporarily Coupled

```txt
Master ScrollTrigger.
Snap behavior.
Project sequence timeline.
Project card geometry.
Project expansion choreography.
ProjectCard data-expanded/data-exiting bridge.
Contact reverse trigger.
Eclipse handoff.
Global progress event.
cinematicNavigate.
```

### Must Not Be Touched Until Later Phases

```txt
ProjectCard internals.
Project expansion geometry.
Project gallery autoplay.
Project swipe gestures.
Project CTA routing.
Project image fallback behavior.
Project mutation/IntersectionObserver logic.
lib/motion thresholds.
Navigation active-state logic.
ExperienceDirector runtime.
ScrollOrchestrator runtime.
ContactScene reveal lifecycle.
EclipseTransition visual timing.
```

## ExperienceDirector Readiness

### Emerging Orchestration Responsibilities

```txt
WorkScene enter after About exit.
WorkScene active project phase tracking.
WorkScene exit before Eclipse takeover.
EclipseTransition complete before ContactScene enter.
ContactScene exit before WorkScene resume on reverse.
Navigation scene permissions.
Pointer-events ownership across active/inactive scenes.
```

### Future ExperienceDirector Responsibilities

```txt
currentScene
previousScene
nextScene
activeTransition
activeProjectPhase
scene permissions
transition permissions
reverse sequencing
scene enter/exit ordering
cross-scene pointer-events policy
```

### Data ExperienceDirector Should Eventually Own

```txt
activeSceneId
targetSceneId
direction
transitionState
contactEligibility
workEligibility
activeProjectIndex
activeProjectPhase
navigationLock
```

### Readiness Finding

```txt
EclipseTransition and ContactScene now expose enough ownership boundaries for an ExperienceDirector to coordinate them later.
WorkScene is the missing scene boundary, but ARCH-005B should not implement ExperienceDirector yet.
```

## Risk Matrix

| Responsibility | Current Owner | Future Owner | Risk | Migration Difficulty | Notes |
|---|---|---|---:|---:|---|
| Work root prepare | PinnedSections | WorkScene | MEDIUM | LOW | Safe first target if values preserved. |
| Work root enter/visibility | PinnedSections | WorkScene | HIGH | MEDIUM | Affects section visibility and pointer events. |
| Work root resume after Contact | PinnedSections | WorkScene + ExperienceDirector | HIGH | MEDIUM | Reverse-scroll sensitive. |
| WorkIntro reveal | PinnedSections | WorkScene | MEDIUM | MEDIUM | Safe if timing/selectors unchanged. |
| WorkIntro exit | PinnedSections | WorkScene | MEDIUM | MEDIUM | Must preserve project handoff. |
| Project intro animation | PinnedSections | WorkScene later | HIGH | HIGH | Dynamic project selectors. |
| Project card initial geometry | PinnedSections | WorkScene later | HIGH | HIGH | Responsive and visual-regression sensitive. |
| Project expansion | PinnedSections + ProjectCard | Project Expansion boundary | CRITICAL | CRITICAL | Do not touch in ARCH-005B. |
| ProjectCard internal state | ProjectCard | ProjectCard | CRITICAL | CRITICAL | Must remain isolated. |
| Work → Eclipse handoff | PinnedSections | ExperienceDirector + WorkScene + EclipseTransition | HIGH | HIGH | Not first extraction target. |
| Contact reverse → Work restore | PinnedSections | ExperienceDirector + WorkScene | HIGH | HIGH | Must not change timing in ARCH-005B. |
| Scroll ownership | PinnedSections | ScrollOrchestrator | CRITICAL | CRITICAL | Later phase only. |
| Theme variable mutation | PinnedSections | WorkScene / Theme policy later | HIGH | HIGH | Keep unchanged until dedicated plan. |

## ARCH-005B Definition

### Objective

Create the smallest safe runtime extraction of Work root lifecycle ownership from `PinnedSections` into a named `WorkScene` boundary without changing visual behavior.

### Deliverables

```txt
1. A focused WorkScene module/helper boundary.
2. Work root prepare/enter/pause/resume/exit API.
3. Existing Work root opacity and pointer-events behavior preserved.
4. Optional WorkIntro reveal/exit ownership only if exact timeline positions and values are preserved.
5. PinnedSections remains temporary trigger/timeline owner.
6. Project expansion remains untouched.
7. ProjectCard remains untouched.
8. Validation checklist completed.
```

### Done Definition

```txt
WorkScene exists.
WorkScene owns Work root lifecycle state.
WorkScene owns Work root pointer-events lifecycle.
PinnedSections no longer owns Work root visibility details.
PinnedSections still owns ScrollTrigger, snap, project timeline, and expansion choreography.
ProjectCard is unchanged.
Project expansion is unchanged.
ContactScene is unchanged.
EclipseTransition is unchanged.
Build passes.
```

### Non-Goals

```txt
Do not implement ExperienceDirector.
Do not implement ScrollOrchestrator.
Do not migrate Project Expansion.
Do not modify ProjectCard.
Do not modify ProjectCard data attributes.
Do not modify gallery autoplay.
Do not modify gestures.
Do not modify routing.
Do not modify navigation thresholds.
Do not modify ContactScene reveal.
Do not modify EclipseTransition timing.
Do not redesign UI or animations.
```

### Rollback Plan

```txt
If ARCH-005B causes Work visibility, reverse-scroll, project entry, or pointer-events regressions:
1. Revert only the WorkScene extraction.
2. Restore Work root visibility setup in PinnedSections.
3. Keep ARCH-005A documentation.
4. Do not revert EclipseTransition or ContactScene.
5. Do not revert unrelated docs or ProjectCard.
```

### Validation Checklist

```txt
Forward:
- Work remains hidden before its current entry.
- Work appears at the same timeline point.
- WorkIntro reveal timing is unchanged if moved.
- Project sequence starts at the same point.

Reverse:
- Work restores after Contact reverse as before.
- Eclipse reverse timing is unchanged.
- Contact exit behavior is unchanged.

Technical:
- ProjectCard files unchanged.
- Project expansion selectors and timing unchanged.
- lib/motion thresholds unchanged.
- Build passes.
```

## ARCH-005A Completion Criteria

```txt
Current Work ownership documented.
Future Work ownership documented.
Lifecycle defined.
Project Expansion boundary documented.
Reverse flow documented.
Dependency map exists.
Risk matrix exists.
ExperienceDirector readiness documented.
ARCH-005B scope defined.
No runtime code changed.
No UI changed.
No visual behavior changed.
```
