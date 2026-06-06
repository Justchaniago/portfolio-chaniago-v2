# Issues And Resolutions

## Issue-001: Architecture Coupling Risk

Impact:

```txt
Motion conflicts
Timing conflicts
Transition glitches
Hard reverse-scroll behavior
Poor future scalability
```

Root Cause:

```txt
Multiple scene, transition, and reveal concerns were historically coordinated through centralized scroll progress and parent timelines.
```

Resolution:

```txt
Approved V2 architecture separates ExperienceDirector, ScrollOrchestrator, Scenes, Transitions, Renderers, Interactions, Motion, and Performance governance.
```

Status:

```txt
Architecture approved. Implementation pending.
```

Related Files:

```txt
docs/portfolio-v2-motion-architecture-proposal.md
docs/portfolio-v2-motion-architecture-addendum-phase-0b.md
docs/portfolio-v2-motion-architecture-foundation-phase-0c.md
```

## Issue-002: Missing Repository Memory

Impact:

```txt
Future agents may repeat audits, lose context, or make conflicting architecture decisions.
```

Root Cause:

```txt
Important decisions existed in chat and ad hoc reports, not in a mandatory startup sequence.
```

Resolution:

```txt
Created docs/00_AGENT_BOOTSTRAP.md and required supporting documents 01 through 07.
```

Status:

```txt
Resolved.
```

Related Files:

```txt
docs/00_AGENT_BOOTSTRAP.md
docs/01_CONTEXT_BRIEF.md
docs/02_PROJECT_STATE.md
docs/03_TASK_REGISTRY.md
docs/04_ARCHITECTURE_DECISIONS.md
docs/05_PROGRESS_LOG.md
docs/07_HANDOFF.md
```

## Issue-003: Branch Policy Alignment

Impact:

```txt
Work could accidentally continue on a non-approved branch.
```

Root Cause:

```txt
Initial planning branch was agency-motion-architecture before the mandatory bootstrap specified architecture/v2-motion-refactor.
```

Resolution:

```txt
Created and switched to architecture/v2-motion-refactor.
```

Status:

```txt
Resolved.
```

## Issue-004: Active Refactor Targets Need Classification

Impact:

```txt
Sprint 1 could treat transitional code as approved final architecture.
```

Root Cause:

```txt
Current worktree contains ongoing changes in Contact, PinnedSections, and motion section detection that are aligned with refactor direction but not final architecture.
```

Resolution:

```txt
Classified the following files as REFACTOR_TARGET:

components/sections/Contact.tsx
components/sections/PinnedSections.tsx
lib/motion.ts
```

Classification Details:

```txt
components/sections/Contact.tsx
- Classification: REFACTOR_TARGET
- Reasoning: Contact scroll progress coupling has been reduced, but final ContactScene lifecycle does not exist yet.
- Risk Level: Medium
- Migration Notes: Fold current behavior into future ContactScene lifecycle. Do not treat current file as final ownership boundary.

components/sections/PinnedSections.tsx
- Classification: REFACTOR_TARGET
- Reasoning: Still contains central scroll orchestration and transition/contact activation logic.
- Risk Level: High
- Migration Notes: Primary target for future extraction into ScrollOrchestrator, ExperienceDirector, Scene contracts, and EclipseTransition.

lib/motion.ts
- Classification: REFACTOR_TARGET
- Reasoning: Active section threshold is still hardcoded against current timeline values.
- Risk Level: Low
- Migration Notes: Future section state should come from ScrollOrchestrator and ExperienceDirector, not hardcoded progress thresholds.
```

Status:

```txt
Resolved for governance. Implementation pending.
```

## Issue-005: Eclipse Transition Ownership Embedded In PinnedSections

Impact:

```txt
PinnedSections treated Eclipse timeline progress as transition state, making Work to Contact sequencing difficult to reason about and hard to migrate safely.
```

Root Cause:

```txt
The `.debug-circle` timeline, Eclipse timing constants, blackout semantics, and coverage meaning lived inside the monolithic PinnedSections timeline.
```

Resolution:

```txt
Created `components/transitions/EclipseTransition.ts` as the first runtime TransitionModuleContract consumer.

Extracted:
- Eclipse timing constants
- `.debug-circle` timeline setup
- explicit coverage state
- transition lifecycle API

PinnedSections now requests the transition and temporarily retains scroll triggering, Contact activation, and Work visibility coordination.
```

Coverage State Model:

```txt
IDLE      = Transition is reset and not visible.
ENTERING  = Eclipse arc/rise has started.
COVERING  = Eclipse has reached coverage/blackout territory.
EXITING   = Contact phase is reversing and Eclipse is leaving coverage.
COMPLETE  = Eclipse takeover is complete and Contact may be active.
```

Status:

```txt
Partially resolved.
```

## Issue-008: Orchestration Still Embedded In PinnedSections

Impact:

```txt
Scene and transition consumers now exist, but PinnedSections still decides active scene, Contact eligibility, Work restore, Eclipse complete/exit hints, and reverse ordering.
```

Root Cause:

```txt
Runtime scene and transition extraction happened before a director existed, so PinnedSections remained the temporary orchestration bridge.
```

Resolution:

```txt
ARCH-006A documented the ExperienceDirector orchestration plan in docs/13_EXPERIENCE_DIRECTOR_PLAN.md.
ARCH-006B created components/orchestration/ExperienceDirector.ts and moved Work/Eclipse/Contact sequencing intent out of PinnedSections.
```

Extracted Ownership:

```txt
ExperienceDirector now owns:
- active scene state
- previous scene state
- pending scene state
- active transition state
- direction state
- director phase state
- lock state
- Contact enter permission
- Work restore permission
- Eclipse transition permission hints
- Work → Eclipse → Contact ordering
- Contact → Eclipse → Work ordering
```

Remaining Coupling:

```txt
PinnedSections still owns ScrollTrigger, snap logic, contactPhaseProgress, project sequence, Project Expansion, ProjectCard choreography, navigation jump settling, global progress publication, and section visibility branching outside the Work/Contact bridge.
```

Status:

```txt
Partially resolved.
```

## Issue-007: Work Ownership Embedded In PinnedSections

Impact:

```txt
Work enter/exit, Work restore, project storytelling, project card geometry, and Work-to-Eclipse handoff are concentrated in PinnedSections, making the next runtime extraction high risk.
```

Root Cause:

```txt
PinnedSections owns the master Work timeline, including Work root visibility, WorkIntro reveal, project intro animation, ProjectCard geometry, ProjectCard data attributes, and reverse-scroll Work restoration.
```

Resolution:

```txt
ARCH-005A documented the WorkScene extraction plan in docs/12_WORK_SCENE_EXTRACTION_PLAN.md.
ARCH-005B created components/scenes/WorkScene.ts and moved Work root lifecycle, restoration, pointer-events, and WorkIntro lifecycle ownership out of PinnedSections.
```

Extracted Ownership:

```txt
WorkScene now owns:
- Work prepare lifecycle
- Work enter lifecycle
- Work activate lifecycle
- Work pause/resume lifecycle
- Work exit lifecycle
- Work destroy lifecycle
- Work root visibility
- Work root restoration
- Work root pointer-events lifecycle
- WorkIntro initial state
- WorkIntro reveal timeline
- WorkIntro exit timeline
```

Protected Boundary:

```txt
Project Expansion and ProjectCard are classified as CRITICAL RISK.

ARCH-005B must not modify:
- ProjectCard internals
- Project expansion geometry
- ProjectCard data attribute bridge
- Gallery autoplay
- Horizontal gestures
- CTA routing
- Project image fallback behavior
```

Remaining Coupling:

```txt
PinnedSections still owns Project Expansion, ProjectCard geometry choreography, project intro sequence, ScrollTrigger ownership, Contact eligibility, Eclipse sequencing bridge, navigation progress publication, and global timeline timing.
```

Status:

```txt
Partially resolved.
```

Remaining Coupling:

```txt
PinnedSections still owns ScrollTrigger, Contact phase threshold, Work visibility toggling, and global progress publication.
```

## Issue-006: Contact Reveal Ownership Embedded In PinnedSections

Impact:

```txt
Contact enter/exit behavior is coupled to global scroll progress, Work visibility, and Eclipse sequencing.
```

Root Cause:

```txt
Contact visual/interaction presentation lives in Contact.tsx, but scene activation, reveal timeline, pointer-events lifecycle, and reverse-hide behavior live in PinnedSections.tsx.
```

Resolution:

```txt
ARCH-004A documented the ContactScene extraction plan in docs/11_CONTACT_SCENE_EXTRACTION_PLAN.md.
ARCH-004B created components/scenes/ContactScene.ts and moved Contact reveal lifecycle ownership out of PinnedSections.
```

Extracted Ownership:

```txt
ContactScene now owns:
- Contact prepare lifecycle
- Contact enter lifecycle
- Contact activate lifecycle
- Contact pause/resume lifecycle
- Contact exit lifecycle
- Contact destroy lifecycle
- Contact reveal timeline
- Contact active state
- Contact pointer-events lifecycle
```

Remaining Coupling:

```txt
PinnedSections still owns Contact eligibility threshold, Work visibility, ScrollTrigger ownership, Eclipse sequencing bridge, and global progress publication.
```

Status:

```txt
Partially resolved.
```

## Issue-009: Scroll State and Progress Publication Coupled to View Layer

Impact:

```txt
Global window updates, progress custom events, and scroll direction/velocity tracking were hardcoded within the main scroll trigger lifecycle of PinnedSections.tsx, making it impossible to decouple the scroll layer from the view layer.
```

Root Cause:

```txt
No standalone ScrollOrchestrator existed to act as a stateful event-driven publisher for progress, direction, and velocity data.
```

Resolution:

```txt
ARCH-007B created components/orchestration/ScrollOrchestrator.ts and extracted scroll progress, direction, velocity tracking, and PubSub progress publication.
```

Extracted Ownership:

```txt
ScrollOrchestrator now owns:
- scrollProgress state
- scrollDirection state
- scrollVelocity state
- progress subscription registry
- window.__scrollTriggerProgress updates
- scrollTriggerProgress event dispatches
```

Remaining Coupling:

```txt
PinnedSections still owns ScrollTrigger instantiation, snap calculations, project responsive card geometries, morph animation timelines, and cinematicNavigate jump animations.
```

Status:

```txt
Partially resolved (Scroll state & publication extracted; ScrollTrigger setup remains in PinnedSections).
```

## Issue-010: Animation Sprawl and Magic Motion Numbers

Impact:

```txt
Animation durations, easing curves, stagger offsets, and movement distances were declared as raw numbers or strings directly inside scene modules, creating inconsistency and risking visual motion drift.
```

Root Cause:

```txt
Lack of a unified runtime motion configuration and preset system to govern all UI and scene animations.
```

Resolution:

```txt
ARCH-008B implemented lib/motionSystem.ts (exporting standard duration, easing, stagger, scale, and distance tokens) and lib/motionPresets.ts (exporting reusable GSAP animations).
```

Extracted Ownership:

```txt
Motion System now owns:
- unified duration, ease, stagger, and distance tokens.
- reusable presets (fadeIn, workContainerEnter, contactTitleReveal, eclipseRise, etc.).
```

Migrated Consumers:

```txt
WorkScene, ContactScene, and EclipseTransition have been refactored to consume Motion System tokens and presets.
```

Status:

```txt
Resolved for Sprint 1 scene and transition components. Remaining motion debt exists in Hero, About, and MorphNav.
```

## Issue-011: Scattered Pointer Tracking and Interaction Drift

Impact:

```txt
Pointer coordinates, velocity, and hover tracking calculations were implemented locally inside individual visual components (e.g. Contact.tsx), leading to code duplication, scattered event listeners, and potential frame lag due to multiple RAF loops.
```

Root Cause:

```txt
Lack of a centralized interaction state manager and reusable interaction presets.
```

Resolution:

```txt
ARCH-009B implemented a centralized interactionSystem.ts (which manages global pointer coordinates, velocity, active status, and ticks via a single RAF loop) and a HoverSweep preset in interactionPresets.ts.
```

Extracted Ownership:

```txt
Interaction System now owns:
- Centralized pointer x and y coordinates.
- Centralized velocity tracking and auto-decay physics.
- Global active state tracking.
- Reusable HoverSweep preset logic.
```

Migrated Consumers:

```txt
Contact.tsx hover sweep has been refactored to consume the centralized Interaction System and HoverSweep preset via an Adapter Pattern.
```

Status:

```txt
Resolved in ARCH-009C by executing the cleanups and removing redundant local pointer states/listeners in Contact.tsx.
```

## Issue-012: Uncoordinated Canvas Simulation Loops and CPU Overhead

Impact:

```txt
The fluid simulation in hooks/useFluidSim.ts coordinated its own local requestAnimationFrame loops, double height-map buffers, and Canvas2D pixels calculations directly inside the React hook cycle, exposing the application to performance stalls and rendering leaks.
```

Root Cause:

```txt
No separate class module existed to encapsulate height-map logic, wave propagation steps, and canvas repaints.
```

Resolution:

```txt
ARCH-010D created components/renderers/HeroFluidRenderer.ts encapsulating all wave propagation calculations and double Float32Array buffers. Refactored hooks/useFluidSim.ts into a lightweight adapter hook delegating loop steps and draws directly to the class instance.
```

Status:

```txt
Resolved. Fluid simulation math is fully extracted from the hook lifecycle.
```

## Issue-013: Centralized Tick Coordination and Loop Scheduling

Impact:

```txt
Running multiple parallel requestAnimationFrame loops increases CPU usage and can lead to unsynchronized visual update ticks.
```

Root Cause:

```txt
HeroFluidRenderer was driven by its own local rendering lifecycle adapter, scheduling ticks independently.
```

Resolution:

```txt
ARCH-011B implemented the centralized RendererManager coordinating all registered RendererModuleContract instances through a single global requestAnimationFrame tick loop. HeroFluidRenderer was migrated to be driven by this central scheduler.
```

Status:

```txt
Resolved. Master loop coordinates HeroFluidRenderer.
```
