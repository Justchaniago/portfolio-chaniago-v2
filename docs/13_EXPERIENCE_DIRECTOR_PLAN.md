# ExperienceDirector Orchestration Plan

## ARCH-006A

Status:

```txt
Orchestration blueprint only.
No runtime implementation.
No runtime migration.
No UI change.
No animation change.
No ScrollTrigger change.
```

## Objective

Define the orchestration architecture for `ExperienceDirector` now that the repository has real runtime consumers:

```txt
EclipseTransition
ContactScene
WorkScene
```

This document answers:

```txt
What should ExperienceDirector own?
What should ExperienceDirector never own?
How should scenes communicate?
How should transitions communicate?
How should reverse flow work?
How should permissions work?
How should active scene state work?
What is the smallest safe ARCH-006B runtime boundary?
```

## Orchestration Audit

### Current Runtime Consumers

```txt
WorkScene
├─ owns Work root lifecycle
├─ owns Work root visibility
├─ owns Work root restoration
├─ owns Work root pointer-events
└─ owns WorkIntro timeline attachment

EclipseTransition
├─ owns Eclipse visual timeline attachment
├─ owns Eclipse timing constants
├─ owns coverage state
└─ owns transition lifecycle API

ContactScene
├─ owns Contact reveal lifecycle
├─ owns Contact active state
├─ owns Contact pointer-events lifecycle
└─ owns Contact reveal timeline
```

## ARCH-006B Implementation Result

Status:

```txt
Runtime extraction complete.
ScrollTrigger extraction not performed.
Snap extraction not performed.
Project Expansion refactor not performed.
ProjectCard refactor not performed.
UI and animation values unchanged.
```

Runtime module:

```txt
components/orchestration/ExperienceDirector.ts
```

First real consumer:

```txt
components/sections/PinnedSections.tsx
```

Extracted ownership:

```txt
ExperienceDirector
├─ owns activeScene
├─ owns previousScene
├─ owns pendingScene
├─ owns activeTransition
├─ owns direction
├─ owns phase
├─ owns locked
├─ owns Contact enter permission
├─ owns Work restore permission
├─ owns Eclipse transition permission hints
├─ owns requestContact()
└─ owns requestWorkRestore()
```

Remaining temporary ownership:

```txt
PinnedSections
├─ owns ScrollTrigger
├─ owns snap behavior
├─ owns contactPhaseProgress threshold
├─ requests ExperienceDirector.requestContact()
├─ requests ExperienceDirector.requestWorkRestore()
├─ owns project sequence timeline
├─ owns Project Expansion timeline
├─ owns global progress publication
├─ owns cinematicNavigate
└─ owns section visibility branching outside the Work/Contact bridge
```

Implementation note:

```txt
ExperienceDirector preserves the previous call order:
forward = Eclipse complete → Work exit → Contact enter
reverse = Eclipse exit → Work resume → Contact exit
```

### Current Orchestration Owner

```txt
PinnedSections.tsx
```

### Current Orchestration Responsibilities In PinnedSections

```txt
ScrollTrigger ownership
snap target calculation
global progress publication
scene threshold decisions
Contact eligibility
Work restore decision
Work to Eclipse to Contact ordering
reverse Contact to Work ordering
scene visibility branching
transition timing bridge
navigation jump timeline settling
```

### Current Sequencing

Forward:

```txt
Scroll progress reaches contactPhaseProgress
↓
PinnedSections activateContactPhase()
├─ eclipseTransition.complete()
├─ workScene.exit()
└─ contactScene.enter()
```

Reverse:

```txt
Scroll progress drops below contactPhaseProgress
↓
PinnedSections deactivateContactPhase()
├─ eclipseTransition.exit()
├─ workScene.resume()
└─ contactScene.exit()
```

### Current Permission Decisions

```txt
PinnedSections decides:
- when Work may enter
- when Work must exit
- when Contact may enter
- when Contact must exit
- when Eclipse is complete
- when Eclipse is exiting
- when Work may restore
```

### Current Hidden Coupling

```txt
Scene permission is inferred from scroll progress.
Transition permission is inferred from timeline position.
Navigation state is inferred from global progress.
Reverse ordering is embedded inside deactivateContactPhase().
Work restore happens before ContactScene reports exit complete.
```

## ExperienceDirector Responsibility Model

### Allowed Responsibilities

ExperienceDirector must own:

```txt
activeScene
previousScene
pendingScene
activeTransition
scene permissions
transition permissions
forward ordering
reverse ordering
scene enter/exit sequencing
transition enter/exit sequencing
scene activation policy
scene restoration policy
cross-scene pointer permission policy
navigation lock / transition lock state
```

ExperienceDirector may expose:

```txt
getState()
getActiveScene()
requestScene(sceneId, direction)
requestTransition(transitionId, direction)
canEnter(sceneId)
canExit(sceneId)
canRestore(sceneId)
canStartTransition(transitionId)
```

### Forbidden Responsibilities

ExperienceDirector must not own:

```txt
GSAP tween values
GSAP timeline internals
DOM queries
CSS selectors
visual styling
project expansion geometry
ProjectCard internal state
Contact hover interactions
WorkIntro animation values
Eclipse circle animation values
ScrollTrigger raw progress
snap target calculation
HTML theme variable tween values
navigation UI rendering
```

### Communication Rules

```txt
Scenes do not call other scenes directly.
Transitions do not activate scenes directly.
ScrollTrigger does not mutate scene internals directly.
PinnedSections should eventually forward intent to ExperienceDirector.
ExperienceDirector calls public lifecycle APIs only.
ExperienceDirector reads public state/query APIs only.
```

## State Model

### Core State

```ts
type ExperienceSceneId = 'hero' | 'about' | 'work' | 'contact';
type ExperienceTransitionId = 'eclipse';
type ExperienceDirection = 'forward' | 'reverse';

type ExperienceDirectorState = {
  activeScene: ExperienceSceneId;
  previousScene: ExperienceSceneId | null;
  pendingScene: ExperienceSceneId | null;
  activeTransition: ExperienceTransitionId | null;
  direction: ExperienceDirection;
  phase:
    | 'IDLE'
    | 'SCENE_EXITING'
    | 'TRANSITION_ENTERING'
    | 'TRANSITION_COVERING'
    | 'SCENE_ENTERING'
    | 'SCENE_ACTIVE'
    | 'REVERSING';
  locked: boolean;
};
```

### State Meanings

| Field | Meaning |
|---|---|
| `activeScene` | Scene currently permitted to be interactive/visible as primary experience. |
| `previousScene` | Last active scene before transition request. |
| `pendingScene` | Scene requested but not yet active. |
| `activeTransition` | Transition currently mediating between scenes. |
| `direction` | Current orchestration direction. |
| `phase` | Director-level orchestration phase. |
| `locked` | Prevents conflicting scene/transition requests during critical handoff. |

## State Diagram

Forward Work to Contact:

```txt
SCENE_ACTIVE(work)
↓
SCENE_EXITING(work)
↓
TRANSITION_ENTERING(eclipse)
↓
TRANSITION_COVERING(eclipse)
↓
SCENE_ENTERING(contact)
↓
SCENE_ACTIVE(contact)
```

Reverse Contact to Work:

```txt
SCENE_ACTIVE(contact)
↓
SCENE_EXITING(contact)
↓
TRANSITION_COVERING(eclipse)
↓
TRANSITION_ENTERING(eclipse reverse)
↓
SCENE_ENTERING(work restore)
↓
SCENE_ACTIVE(work)
```

## Permission Model

### Scene Activation Permission

```txt
Only ExperienceDirector may grant a scene permission to enter or activate.
```

Rules:

```txt
WorkScene may enter when:
- About is inactive or exiting
- no blocking transition is active
- scroll intent is within Work range

ContactScene may enter when:
- WorkScene has exited or is paused
- EclipseTransition is covered or complete
- direction is forward
```

### Scene Exit Permission

```txt
Only ExperienceDirector may request scene exit after ARCH-006B.
```

Rules:

```txt
WorkScene may exit when:
- EclipseTransition is about to enter
- ContactScene is pending
- direction is forward

ContactScene may exit when:
- direction is reverse
- WorkScene is pending restore
```

### Scene Restore Permission

```txt
Only ExperienceDirector may request restore/resume of a previous scene.
```

Rules:

```txt
WorkScene may restore when:
- ContactScene has begun or completed exit
- EclipseTransition is exiting or coverage is sufficient
- direction is reverse
```

### Transition Permission

```txt
Only ExperienceDirector may mark a transition as active/pending in the orchestration state.
```

Rules:

```txt
EclipseTransition may enter when:
- WorkScene is active or exiting
- ContactScene is pending
- direction is forward

EclipseTransition may exit when:
- ContactScene is exiting
- WorkScene is pending restore
- direction is reverse
```

## Forward Flow Design

### WorkScene To EclipseTransition To ContactScene

Activation order:

```txt
1. ScrollOrchestrator / temporary PinnedSections reports forward boundary.
2. ExperienceDirector sets pendingScene = contact.
3. ExperienceDirector requests WorkScene.exit().
4. ExperienceDirector requests EclipseTransition.enter()/cover() through timeline bridge.
5. EclipseTransition reports covered/complete.
6. ExperienceDirector requests ContactScene.enter().
7. ContactScene activates.
8. ExperienceDirector sets activeScene = contact.
```

State changes:

```txt
activeScene: work
pendingScene: contact
activeTransition: eclipse
phase: TRANSITION_COVERING
↓
activeScene: contact
pendingScene: null
activeTransition: null or eclipse complete
phase: SCENE_ACTIVE
```

Ownership boundaries:

```txt
ExperienceDirector owns ordering and permissions.
WorkScene owns Work lifecycle effects.
EclipseTransition owns Eclipse visual/state.
ContactScene owns Contact lifecycle effects.
PinnedSections owns temporary trigger bridge until ScrollOrchestrator exists.
```

## Reverse Flow Design

### ContactScene To EclipseTransition To WorkScene

Reverse order:

```txt
1. ScrollOrchestrator / temporary PinnedSections reports reverse boundary.
2. ExperienceDirector sets pendingScene = work.
3. ExperienceDirector requests ContactScene.exit().
4. ExperienceDirector requests EclipseTransition.exit().
5. ExperienceDirector requests WorkScene.resume() when permission is valid.
6. WorkScene restores.
7. ExperienceDirector sets activeScene = work.
```

Restore ordering:

```txt
ContactScene exit starts first.
WorkScene restore must be director-authorized.
EclipseTransition reverse must remain visually coherent.
WorkScene should not restore because ContactScene directly calls it.
```

Permission changes:

```txt
ContactScene loses interaction permission immediately on exit request.
WorkScene receives restore permission only from ExperienceDirector.
EclipseTransition receives reverse permission only from ExperienceDirector.
```

## PinnedSections Reduction Plan

### Orchestration To Leave PinnedSections

```txt
Contact phase activation decision
Contact phase deactivation decision
Work restore decision
Work exit decision before Contact
Eclipse complete/exit state hints
active scene tracking
pending scene tracking
transition lock state
cross-scene permission rules
```

### Temporarily Remains In PinnedSections

```txt
Master ScrollTrigger
scrub timeline
snap target calculation
project sequence timeline
Project Expansion timeline
cinematicNavigate jump/settle behavior
global scroll progress publication
DOM mounting of sections
```

### Future Phase Removal

| Responsibility | Future Owner | Phase |
|---|---|---|
| scene permission decisions | ExperienceDirector | ARCH-006B |
| active scene state | ExperienceDirector | ARCH-006B |
| reverse ordering | ExperienceDirector | ARCH-006B |
| raw scroll progress | ScrollOrchestrator | Later |
| snap target calculation | ScrollOrchestrator | Later |
| project expansion timeline | Project Expansion boundary | Later dedicated plan |
| navigation active state | ExperienceDirector / Navigation adapter | Later |

## Migration Boundary

### Smallest Safe ARCH-006B Runtime Extraction

Objective:

```txt
Introduce ExperienceDirector as a stateful orchestration adapter used by PinnedSections for Work ↔ Eclipse ↔ Contact sequencing only.
```

Safe extraction target:

```txt
Move activateContactPhase() / deactivateContactPhase() orchestration logic into ExperienceDirector.
```

PinnedSections in ARCH-006B may still own:

```txt
ScrollTrigger
contactPhaseProgress threshold
master timeline
project sequence
Project Expansion
global progress event
cinematicNavigate
```

ExperienceDirector in ARCH-006B should own:

```txt
activeScene
pendingScene
activeTransition
direction
requestContact()
requestWorkRestore()
canEnterContact()
canRestoreWork()
```

Do not migrate:

```txt
ScrollTrigger
snap logic
project timeline
ProjectCard
Project Expansion
animation values
DOM selectors
navigation UI
```

## Risk Matrix

| Responsibility | Current Owner | Future Owner | Risk | Notes |
|---|---|---|---:|---|
| active scene state | PinnedSections implicit progress | ExperienceDirector | HIGH | Needed, but wrong defaults can break visibility. |
| Contact activation decision | PinnedSections | ExperienceDirector | HIGH | Must preserve contactPhaseProgress trigger. |
| Contact reverse decision | PinnedSections | ExperienceDirector | HIGH | Reverse-scroll sensitive. |
| Work restore decision | PinnedSections | ExperienceDirector + WorkScene | HIGH | Currently immediate; changing order risks visual regression. |
| Eclipse complete/exit hints | PinnedSections | ExperienceDirector + EclipseTransition | MEDIUM | Must not alter Eclipse visual timing. |
| scene lifecycle calls | PinnedSections | ExperienceDirector | MEDIUM | Existing scene APIs support this. |
| transition lifecycle calls | PinnedSections | ExperienceDirector | MEDIUM | Existing transition API supports this. |
| ScrollTrigger ownership | PinnedSections | ScrollOrchestrator later | CRITICAL | Not part of ARCH-006B. |
| snap logic | PinnedSections | ScrollOrchestrator later | CRITICAL | Touching it risks full-site navigation feel. |
| Project Expansion | PinnedSections + ProjectCard | Dedicated boundary later | CRITICAL | Protected. |
| animation values | Scenes/transitions | Scenes/transitions | HIGH | Director must never own these. |
| global progress event | PinnedSections | ScrollOrchestrator later | MEDIUM | Leave unchanged for ARCH-006B. |
| navigation jump settling | PinnedSections | Director/Nav adapter later | HIGH | Leave unchanged for ARCH-006B. |

## ARCH-006B Definition

### Objective

Create the smallest safe runtime `ExperienceDirector` adapter for Work ↔ Eclipse ↔ Contact orchestration without changing ScrollTrigger, animations, Project Expansion, or UI behavior.

### Deliverables

```txt
1. ExperienceDirector runtime module.
2. Explicit activeScene / pendingScene / activeTransition state.
3. requestContact() orchestration method.
4. requestWorkRestore() orchestration method.
5. PinnedSections delegates activateContactPhase/deactivateContactPhase decisions to ExperienceDirector.
6. Existing Contact threshold preserved.
7. Existing Work, Contact, and Eclipse visual behavior preserved.
8. Documentation updated.
```

### Done Definition

```txt
ExperienceDirector exists.
ExperienceDirector owns active scene state.
ExperienceDirector owns Work ↔ Contact orchestration permission.
ExperienceDirector owns Eclipse transition permission hints.
PinnedSections no longer directly sequences workScene/eclipsTransition/contactScene in activate/deactivate helpers.
PinnedSections still owns ScrollTrigger and threshold triggering.
Scenes and transitions still own animation values.
Project Expansion is unchanged.
ProjectCard is unchanged.
Build passes.
```

### Non-Goals

```txt
Do not implement ScrollOrchestrator.
Do not move ScrollTrigger.
Do not move snap logic.
Do not change contactPhaseProgress.
Do not change animation values.
Do not change UI.
Do not change Project Expansion.
Do not change ProjectCard.
Do not change Contact hover systems.
Do not change Work project sequence.
Do not change navigation UI.
```

### Rollback Plan

```txt
If ARCH-006B causes sequencing, reverse-scroll, or visibility regressions:
1. Revert only ExperienceDirector runtime integration.
2. Restore direct PinnedSections calls to WorkScene, EclipseTransition, and ContactScene.
3. Keep ARCH-006A documentation.
4. Do not revert WorkScene, ContactScene, or EclipseTransition.
5. Do not revert unrelated docs.
```

## ARCH-006A Completion Criteria

```txt
Responsibility model defined.
Permission model defined.
State model defined.
Forward flow defined.
Reverse flow defined.
PinnedSections reduction plan exists.
ARCH-006B scope defined.
No runtime code changed.
No UI changed.
No visual behavior changed.
```
