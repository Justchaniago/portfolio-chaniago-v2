# Consumer Mapping And Migration Plan

## ARCH-002

Status:

```txt
Migration blueprint only.
No runtime implementation.
No UI change.
No animation change.
```

## Objective

Map current ownership to future ownership and define the safest migration path.

This document answers:

```txt
What currently owns behavior?
Who should own it in the future?
What is the safest migration path?
What should be migrated first?
What must never be migrated together?
```

## Current Ownership Audit

### PinnedSections.tsx

Current Owner:

```txt
PinnedSections
```

Current Responsibilities:

```txt
Master ScrollTrigger
Scene visibility gating
Global scroll progress publishing
Navigation jump masking
Hero exit animation
About reveal and exit animation
Work intro animation
Project timeline choreography
Project card geometry setup
Project expansion attributes
Theme CSS variable animation
Eclipse transition timeline
Contact phase activation
Contact reveal timeline
Reduced-motion early return
Snap point calculation
```

Dependencies:

```txt
gsap
ScrollTrigger
SECTION_ANCHORS
Hero
About
ProjectShowcase
Contact
NavRail
projects data
global window.__scrollTriggerProgress
global window.__cinematicNavigate
global window.__navTransitioning
Lenis global
class-name selectors across scenes
```

Consumers:

```txt
MorphNav consumes scrollTriggerProgress
NavRail consumes scrollTriggerProgress
Contact quick jump consumes __cinematicNavigate
Navigation systems consume __cinematicNavigate
Scene components are animated by class selectors
```

Coupling Level:

```txt
CRITICAL
```

Reason:

`PinnedSections` currently owns scroll, scene visibility, transition choreography, scene internals, navigation masking, project choreography, and Contact reveal behavior.

### Contact.tsx

Current Owner:

```txt
Contact component
```

Current Responsibilities:

```txt
Contact DOM structure
Contact utility link content
Contact quick jump behavior
External connect links
JUSTCHANIAGO wordmark structure
Wordmark hover field interaction
Wordmark hover geometry cache
Wordmark requestAnimationFrame loop
Utility link hover animation
Contact local CSS
Pointer and resize listeners
```

Dependencies:

```txt
gsap
SECTION_ANCHORS
window.__cinematicNavigate
DOM class selectors inside Contact
CSS variables for wordmark hover
```

Consumers:

```txt
PinnedSections controls Contact visibility and reveal state
User pointer interactions consume Contact hover systems
Quick Jump buttons consume cinematic navigation
```

Coupling Level:

```txt
HIGH
```

Reason:

Contact owns useful local interaction systems, but its scene lifecycle and reveal activation are still externally controlled by `PinnedSections`.

### lib/motion.ts

Current Owner:

```txt
motion utility module
```

Current Responsibilities:

```txt
Motion easing tokens
Duration tokens
Stagger tokens
ScrollTrigger defaults
Text animation defaults
Section anchor progress constants
Active section index threshold logic
```

Dependencies:

```txt
Hardcoded 37.6 master timeline duration
Hardcoded scene thresholds
Current PinnedSections timeline shape
```

Consumers:

```txt
NavRail
MorphNav
Contact quick jump links
PinnedSections cinematic navigation
Any code using SECTION_ANCHORS or getActiveSectionIndex
```

Coupling Level:

```txt
MEDIUM
```

Reason:

Motion tokens are useful, but section state still depends on hardcoded timeline thresholds that should eventually belong to `ScrollOrchestrator` and `ExperienceDirector`.

## Future Ownership Map

| Current Responsibility | Current Owner | Future Owner |
|---|---|---|
| Raw ScrollTrigger progress | `PinnedSections` | `ScrollOrchestrator` |
| Scene selection | `PinnedSections` | `ExperienceDirector` |
| Scene lifecycle calls | `PinnedSections` | `SceneOrchestrator` via `ExperienceDirector` |
| Hero animation internals | `PinnedSections` | `HeroScene` |
| About animation internals | `PinnedSections` | `AboutScene` |
| Work intro animation | `PinnedSections` | `WorkScene` |
| Project choreography | `PinnedSections` / `ProjectCard` | `WorkScene` + project-specific modules |
| Project card local interactions | `ProjectCard` | `WorkScene` / Project interaction system |
| Eclipse progression | `PinnedSections` | `EclipseTransition` |
| Contact reveal | `PinnedSections` | `ContactScene` |
| Contact wordmark hover | `Contact` | `ContactHoverField` owned by `ContactScene` |
| Contact utility link hover | `Contact` | `ContactScene` local interaction |
| Contact quick jump | `Contact` + global function | Navigation adapter / `ScrollOrchestrator` |
| Section anchors | `lib/motion.ts` | `ScrollOrchestrator` route/scene map |
| Active section detection | `lib/motion.ts` | `ExperienceDirector` state |
| Motion easing/duration tokens | `lib/motion.ts` | `motion/tokens` |
| Navigation masking | `PinnedSections` | Future transition/navigation module |

## Contract Consumer Mapping

### ExperienceDirectorContract

First Real Consumer:

```txt
Work → Eclipse → Contact path
```

Why:

This path currently exposes the clearest need for central experience state:

```txt
Work active
Eclipse transition active
Contact active
interaction permissions change
scene visibility changes
```

Future Consumers:

```txt
ScrollOrchestrator
SceneOrchestrator
TransitionOrchestrator
NavRail
MorphNav
Overlay systems
Interaction permissions
```

Dependencies:

```txt
SceneModuleContract
TransitionModuleContract
Scroll state snapshots
```

Migration Difficulty:

```txt
HIGH
```

Notes:

Do not implement `ExperienceDirector` first as an empty manager. Validate it through the Work → Eclipse → Contact extraction.

### SceneModuleContract

First Real Consumer:

```txt
ContactScene
```

Why:

Contact already has clear scene-owned responsibilities:

```txt
JUSTCHANIAGO reveal
utility layer reveal
metadata reveal
wordmark hover field
utility link hover
quick jump links
```

Future Consumers:

```txt
HeroScene
AboutScene
WorkScene
ContactScene
```

Dependencies:

```txt
GSAP context
scene DOM refs
local renderer contracts if needed
local interaction contracts
```

Migration Difficulty:

```txt
MEDIUM
```

Notes:

Contact should be scene-lifecycle mapped before broad `PinnedSections` decomposition.

### TransitionModuleContract

First Real Consumer:

```txt
EclipseTransition
```

Why:

Eclipse is already conceptually separate and should bridge Work and Contact without owning either scene.

Future Consumers:

```txt
EclipseTransition
Future page transitions
Future scene transitions
Navigation mask transition
```

Dependencies:

```txt
GSAP timeline
transition DOM/ref
from/to scene IDs
direction
```

Migration Difficulty:

```txt
MEDIUM
```

Notes:

This is the best first runtime extraction candidate because it has a focused visual object.

### RendererModuleContract

First Real Consumer:

```txt
HeroFluidRenderer
```

Why:

Hero already has fluid/canvas-like behavior and will need lifecycle control before more renderer systems are added.

Future Consumers:

```txt
HeroFluidRenderer
Future ASCII hand renderer
Future WebGL renderer
Future particle renderer
Future shader renderer
```

Dependencies:

```txt
owner scene
PerformanceDirector policy
resize events
reduced motion state
```

Migration Difficulty:

```txt
MEDIUM
```

Notes:

Do not start renderer extraction before transition/scene ownership boundaries are stable.

### InteractionSystemContract

First Real Consumer:

```txt
ContactHoverField
```

Why:

The Contact wordmark hover has real interaction-system behavior:

```txt
pointer tracking
velocity
geometry caching
energy decay
RAF loop
CSS variable output
```

Future Consumers:

```txt
Custom cursor
Magnetic systems
Hero fluid pointer adapter
Contact hover field
Utility hover systems
Future pointer fields
```

Dependencies:

```txt
scene activation permissions
DOM target/ref
optional renderer adapter
RAF lifecycle
```

Migration Difficulty:

```txt
LOW to MEDIUM
```

Notes:

Contact hover field is a good later extraction after ContactScene lifecycle is scoped.

## Migration Sequencing

### Recommended Order

| Order | Scope | Risk | Reason |
|---:|---|---|---|
| 1 | Document and freeze current Work → Eclipse → Contact ownership | LOW | Prevents more behavior from entering `PinnedSections` |
| 2 | Extract `EclipseTransition` plan from `PinnedSections` | MEDIUM | Focused object, no scene content ownership |
| 3 | Map `ContactScene` lifecycle without runtime migration | MEDIUM | Contact has clear local scene responsibilities |
| 4 | First runtime extraction: `EclipseTransition` only | HIGH | Validates transition contract with minimal UI surface |
| 5 | Move Contact reveal ownership into `ContactScene` | HIGH | Removes Contact content animation from parent orchestration |
| 6 | Introduce narrow `ExperienceDirector` consumer for Work/Eclipse/Contact | HIGH | Only after real lifecycle calls exist |
| 7 | Move active section thresholds out of `lib/motion.ts` | MEDIUM | Requires stable scroll/experience state |
| 8 | Extract renderer/interaction systems | MEDIUM | Safer after scene lifecycle exists |

### What Should Be Extracted First

```txt
EclipseTransition
```

Reason:

It is a transition object with a clear boundary and should not own scene content.

### What Should Be Extracted Second

```txt
ContactScene lifecycle mapping
```

Reason:

Contact reveal and interactions are currently split between parent and scene.

### What Should Remain Untouched Initially

```txt
Hero animation internals
About animation internals
Project expansion choreography
ProjectCard gallery interactions
Custom cursor
Renderer systems
```

Reason:

They are broader and riskier than the Work → Eclipse → Contact seam.

### What Should Be Migrated Together

```txt
Eclipse transition object + its coverage state
```

```txt
Contact reveal timeline + ContactScene lifecycle
```

### What Must Never Be Migrated Together

```txt
EclipseTransition + ContactScene + ExperienceDirector runtime
```

Reason:

That would create a large rewrite with multiple failure points.

```txt
Project expansion + Eclipse extraction
```

Reason:

Project choreography is complex and should not be mixed with transition extraction.

```txt
Renderer lifecycle + scene orchestration
```

Reason:

Renderer lifecycle should wait until scene boundaries are validated.

## Work → Eclipse → Contact Analysis

### Current Ownership

```txt
Work:
- Visual component: ProjectShowcase / ProjectCard
- Activation and timeline: PinnedSections

Eclipse:
- Visual object: .debug-circle inside PinnedSections render
- Timeline: PinnedSections

Contact:
- DOM and interactions: Contact.tsx
- Reveal and activation: PinnedSections
```

### Future Ownership

```txt
Work:
- WorkScene

Eclipse:
- EclipseTransition

Contact:
- ContactScene

Mode / activation:
- ExperienceDirector

Scroll input:
- ScrollOrchestrator
```

### Coupling Points

```txt
PinnedSections uses class selectors for Contact internals.
PinnedSections directly hides Work before Contact reveal.
PinnedSections owns eclipse timing.
PinnedSections owns global progress publication.
lib/motion.ts hardcodes Contact active threshold.
Contact quick jump depends on global __cinematicNavigate.
```

### Migration Blockers

```txt
No SceneOrchestrator exists.
No TransitionOrchestrator exists.
No ExperienceDirector exists.
No refs-based scene registry exists.
PinnedSections still owns master timeline and selectors.
```

### Migration Risks

```txt
Reverse scroll regressions
Contact reveal timing regressions
Work visibility flicker
Navigation active-state mismatch
Eclipse coverage mismatch
```

### Can This Path Become The First Runtime Extraction Candidate?

```txt
YES
```

Justification:

Work → Eclipse → Contact is the most isolated high-value seam. It has a clear transition object, known ownership violations, and a visible payoff. The first runtime extraction should be limited to `EclipseTransition` only, not the full path.

## PinnedSections Decomposition Plan

### Responsibilities That Remain Temporarily

```txt
Top-level pinned layout
Initial master ScrollTrigger during migration
Current section mounting
Temporary compatibility layer for navigation
Temporary global __cinematicNavigate until replacement is scoped
```

### Responsibilities That Leave

| Responsibility | Future Module |
|---|---|
| Raw scroll state ownership | `ScrollOrchestrator` |
| Scene activation decisions | `ExperienceDirector` |
| Hero timeline internals | `HeroScene` |
| About timeline internals | `AboutScene` |
| Work timeline internals | `WorkScene` |
| Project choreography | `WorkScene` / project modules |
| Eclipse transition timeline | `EclipseTransition` |
| Contact reveal timeline | `ContactScene` |
| Active section state | `ExperienceDirector` |
| Section thresholds | `ScrollOrchestrator` |
| Navigation mask transition | future navigation transition module |

### Decomposition Rule

```txt
Remove one responsibility at a time.
Keep compatibility behavior until the replacement is validated.
Do not move visual code and ownership code in the same task.
```

## Risk Matrix

| Responsibility | Current Owner | Future Owner | Migration Difficulty | Risk Level | Notes |
|---|---|---|---|---|---|
| Master ScrollTrigger | PinnedSections | ScrollOrchestrator | High | HIGH | Core timeline dependency |
| Scene visibility | PinnedSections | ExperienceDirector | High | HIGH | Can cause flicker |
| Hero animation | PinnedSections | HeroScene | Medium | MEDIUM | Existing visual must be preserved |
| About animation | PinnedSections | AboutScene | Medium | MEDIUM | Portrait timing sensitive |
| Work intro | PinnedSections | WorkScene | Medium | MEDIUM | Coupled to project timeline |
| Project expansion | PinnedSections / ProjectCard | WorkScene / project modules | High | CRITICAL | Complex and not first target |
| Eclipse timeline | PinnedSections | EclipseTransition | Medium | HIGH | Best first extraction, visible risk |
| Contact reveal | PinnedSections | ContactScene | Medium | HIGH | Timing/reverse sensitive |
| Contact hover field | Contact | InteractionSystem owned by ContactScene | Low-Medium | MEDIUM | Localized but RAF-based |
| Utility link hover | Contact | ContactScene local interaction | Low | LOW | Localized |
| Active section threshold | lib/motion.ts | ExperienceDirector / ScrollOrchestrator | Medium | MEDIUM | Nav mismatch risk |
| Quick jump navigation | Contact / globals | ScrollOrchestrator / navigation adapter | Medium | MEDIUM | Depends on global behavior |
| Renderer lifecycle | Component-local | RendererModule + PerformanceDirector | Medium | MEDIUM | Future scalability |
| Custom cursor | Overlay/component | Overlay + InteractionSystem | Medium | MEDIUM | Cross-scene behavior |

## ARCH-003 Preparation

### Recommended ARCH-003 Scope

```txt
ARCH-003: EclipseTransition Extraction Plan
```

### Objective

Define the smallest safe runtime extraction plan for moving Eclipse transition ownership out of `PinnedSections` and into an `EclipseTransition` module.

### Deliverables

```txt
1. Exact current Eclipse responsibilities.
2. Proposed EclipseTransition file/module boundary.
3. Required props/context for EclipseTransition.
4. Compatibility strategy with current PinnedSections timeline.
5. Validation checklist for forward and reverse scroll.
6. Non-goals and rollback plan.
```

### Done Definition

```txt
EclipseTransition extraction plan exists.
No runtime code changed unless a separate implementation task is approved.
Work and Contact ownership boundaries are preserved.
Contact reveal is not migrated.
Project expansion is not touched.
Validation checklist exists.
```

### Non-Goals

```txt
Do not implement EclipseTransition yet.
Do not implement ExperienceDirector.
Do not move Contact reveal.
Do not change Work project choreography.
Do not alter visual timing.
Do not change UI.
```

### Migration Boundary

Only the following may be considered in ARCH-003 planning:

```txt
.debug-circle visual object
Eclipse timeline ownership
Eclipse coverage state
Forward/reverse transition semantics
```

Everything else remains out of scope.

## ARCH-002 Completion Status

```txt
Current ownership is documented.
Future ownership is documented.
First real consumers are identified.
Migration order is defined.
Risk matrix exists.
ARCH-003 scope is defined.
No runtime code changed.
No UI changed.
No visual behavior changed.
No speculative implementations created.
```
