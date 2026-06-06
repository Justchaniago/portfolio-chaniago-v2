# Task Registry

## Status Values

```txt
TODO
IN_PROGRESS
BLOCKED
DONE
CANCELLED
```

## Completed Bootstrap Tasks

| Task ID | Status | Priority | Task | Dependencies | Owner Type |
|---|---:|---:|---|---|---|
| AOS-001 | DONE | P0 | Create mandatory agent bootstrap | None | Documentation |
| AOS-002 | DONE | P0 | Create context brief | AOS-001 | Documentation |
| AOS-003 | DONE | P0 | Create project state | AOS-001 | Documentation |
| AOS-004 | DONE | P0 | Create task registry | AOS-001 | Documentation |
| AOS-005 | DONE | P0 | Create architecture decision record baseline | Phase 0A-0C docs | Documentation |
| AOS-006 | DONE | P0 | Create progress log baseline | AOS-001 | Documentation |
| AOS-007 | DONE | P0 | Create issues and resolutions baseline | AOS-001 | Documentation |
| AOS-008 | DONE | P0 | Create handoff baseline | AOS-001 | Documentation |

## Completed Sprint 1 Tasks

| Task ID | Status | Priority | Task | Dependencies | Owner Type |
|---|---:|---:|---|---|---|
| ARCH-001 | DONE | P0 | Define TypeScript interfaces for scene, transition, renderer, and interaction contracts | ADR-003, ADR-004, ADR-005, ADR-006, ADR-008, ADR-010 | Architecture |
| ARCH-002 | DONE | P0 | Consumer mapping and migration blueprint | ARCH-001 | Architecture |
| ARCH-003A | DONE | P0 | Eclipse transition extraction plan validation | ARCH-002 | Architecture |
| ARCH-003B | DONE | P0 | Small runtime extraction of EclipseTransition boundary | ARCH-003A | Architecture |
| ARCH-004A | DONE | P0 | ContactScene extraction plan validation | ARCH-003B | Architecture |
| ARCH-004B | DONE | P0 | Small runtime extraction of ContactScene reveal boundary | ARCH-004A | Architecture |
| ARCH-005A | DONE | P0 | WorkScene extraction plan validation | ARCH-004B | Architecture |
| ARCH-005B | DONE | P0 | Small runtime extraction of WorkScene root lifecycle boundary | ARCH-005A | Architecture |
| ARCH-006A | DONE | P0 | ExperienceDirector readiness and orchestration planning | ARCH-005B | Architecture |
| ARCH-006B | DONE | P0 | Small runtime extraction of ExperienceDirector orchestration adapter | ARCH-006A | Architecture |
| ARCH-007A | DONE | P1 | ScrollOrchestrator readiness and extraction planning | ARCH-006B | Architecture |
| ARCH-007B | DONE | P1 | Small runtime extraction of ScrollOrchestrator progress publishing | ARCH-007A | Architecture |
| ARCH-008A | DONE | P1 | Motion System Architecture | ARCH-007B | Architecture |
| ARCH-008B | DONE | P1 | Motion System Runtime & Presets | ARCH-008A | Architecture |
| ARCH-008C | DONE | P1 | Motion Adoption Audit | ARCH-008B | Architecture |
| ARCH-009A | DONE | P1 | Interaction System Architecture | ARCH-008C | Architecture |
| ARCH-009B | DONE | P1 | Interaction System Runtime & Presets | ARCH-009A | Architecture |
| ARCH-009C | DONE | P1 | Interaction Adoption Audit | ARCH-009B | Architecture |
| ARCH-010A | DONE | P1 | Renderer System Architecture | ARCH-009C | Architecture |
| ARCH-010B | DONE | P1 | Renderer Contracts | ARCH-010A | Architecture |
| ARCH-010C | DONE | P1 | Hero Fluid Extraction Plan | ARCH-010B | Architecture |
| ARCH-010D | DONE | P1 | Hero Fluid Runtime Extraction | ARCH-010C | Architecture |
| ARCH-010E | DONE | P1 | Hero Fluid Post-Extraction Audit | ARCH-010D | Architecture |
| ARCH-011A | DONE | P1 | Renderer Manager Implementation Planning | ARCH-010E | Architecture |
| ARCH-011B | DONE | P1 | Renderer Manager Runtime Implementation | ARCH-011A | Architecture |
| ARCH-011C | DONE | P1 | Renderer Manager Adoption Audit | ARCH-011B | Architecture |

### ARCH-001 Objective

```txt
Define the first architecture contracts for V2 scene, transition, renderer, and interaction modules without changing runtime behavior.
```

### ARCH-001 Deliverable

```txt
Contract definitions and documentation for:
- SceneModule
- TransitionModule
- RendererModule
- InteractionSystem

Include first-consumer plan.
```

### ARCH-001 Done Definition

```txt
Contracts are defined.
Contracts align with ADRs.
At least one real first consumer is identified.
No UI changes.
No runtime migration.
No speculative empty managers.
Progress log and handoff are updated.
```

## Next Candidate Tasks

| Task ID | Status | Priority | Task | Dependencies | Owner Type |
|---|---:|---:|---|---|---|
| ARCH-012A | TODO | P1 | Advanced Scroll System Planning | ARCH-011C | Architecture |

## Current Active Task

```txt
None.
```

ARCH-001 through ARCH-011C are complete. Select the next task before implementation begins.

### ARCH-003B Objective

```txt
Extract Eclipse transition ownership from PinnedSections into the first runtime TransitionModuleContract consumer without changing visual behavior.
```

### ARCH-003B Deliverable

```txt
Runtime EclipseTransition module with explicit coverage state, transition API, timeline ownership, and PinnedSections integration limited to transition triggering.
```

### ARCH-003B Done Definition

```txt
Eclipse owns its state and visual timeline.
Coverage state is explicit.
PinnedSections no longer owns Eclipse semantics.
Contact reveal remains unchanged.
Work/project choreography remains unchanged.
No visual redesign.
Build passes.
Progress log and handoff are updated.
```

### ARCH-004A Objective

```txt
Document current and future Contact ownership, lifecycle, reverse-scroll behavior, dependencies, risk matrix, and ARCH-004B scope without runtime changes.
```

### ARCH-004A Deliverable

```txt
docs/11_CONTACT_SCENE_EXTRACTION_PLAN.md
```

### ARCH-004A Done Definition

```txt
Current Contact ownership is documented.
Future Contact ownership is documented.
ContactScene lifecycle is defined.
Reverse flow is defined.
Dependency map exists.
Risk matrix exists.
ARCH-004B scope is defined.
No runtime code changed.
No UI changed.
No visual behavior changed.
```

### ARCH-004B Objective

```txt
Extract Contact reveal lifecycle ownership from PinnedSections into the first runtime SceneModuleContract consumer without changing visual behavior.
```

### ARCH-004B Deliverable

```txt
Runtime ContactScene module with prepare, enter, activate, pause, resume, exit, destroy, active state, pointer-events lifecycle ownership, and PinnedSections integration limited to triggering.
```

### ARCH-004B Done Definition

```txt
ContactScene exists.
ContactScene owns Contact reveal lifecycle.
ContactScene owns active state.
ContactScene owns pointer-events lifecycle.
PinnedSections no longer owns Contact reveal tween details.
PinnedSections still owns scroll threshold and Work visibility.
Contact UI is unchanged.
Contact hover interactions are unchanged.
Eclipse timing is unchanged.
Build passes.
Progress log and handoff are updated.
```

### ARCH-005A Objective

```txt
Document current and future Work ownership, lifecycle, reverse-scroll behavior, Project Expansion boundary, ExperienceDirector readiness, dependencies, risk matrix, and ARCH-005B scope without runtime changes.
```

### ARCH-005A Deliverable

```txt
docs/12_WORK_SCENE_EXTRACTION_PLAN.md
```

### ARCH-005A Done Definition

```txt
Current Work ownership is documented.
Future Work ownership is documented.
WorkScene lifecycle is defined.
Project Expansion boundary is documented.
Reverse flow is documented.
Dependency map exists.
Risk matrix exists.
ExperienceDirector readiness is documented.
ARCH-005B scope is defined.
No runtime code changed.
No UI changed.
No visual behavior changed.
```

### ARCH-005B Objective

```txt
Extract Work root lifecycle ownership from PinnedSections into the third runtime SceneModuleContract consumer without changing visual behavior or Project Expansion.
```

### ARCH-005B Deliverable

```txt
Runtime WorkScene module with prepare, enter, activate, pause, resume, exit, destroy, active state, root visibility lifecycle, root pointer-events lifecycle, WorkIntro timeline ownership, and PinnedSections integration limited to triggering.
```

### ARCH-005B Done Definition

```txt
WorkScene exists.
WorkScene owns Work root lifecycle state.
WorkScene owns Work visibility lifecycle.
WorkScene owns Work restoration lifecycle.
WorkScene owns Work root pointer-events lifecycle.
WorkScene owns WorkIntro lifecycle.
PinnedSections no longer owns Work root / WorkIntro tween details.
PinnedSections still owns ScrollTrigger, project sequence, Project Expansion, and Work-to-Eclipse timing.
ProjectCard is unchanged.
Project Expansion is unchanged.
EclipseTransition is unchanged.
ContactScene is unchanged.
Build passes.
Progress log and handoff are updated.
```

### ARCH-006A Objective

```txt
Define ExperienceDirector orchestration responsibilities, state model, permission model, forward/reverse flow, PinnedSections reduction plan, risk matrix, and ARCH-006B scope without runtime changes.
```

### ARCH-006A Deliverable

```txt
docs/13_EXPERIENCE_DIRECTOR_PLAN.md
```

### ARCH-006A Done Definition

```txt
Responsibility model is defined.
Permission model is defined.
State model is defined.
Forward flow is defined.
Reverse flow is defined.
PinnedSections reduction plan exists.
ARCH-006B scope is defined.
No runtime code changed.
No UI changed.
No visual behavior changed.
```

### ARCH-006B Objective

```txt
Extract Work/Eclipse/Contact orchestration intent from PinnedSections into the first runtime ExperienceDirector consumer without changing visual behavior.
```

### ARCH-006B Deliverable

```txt
Runtime ExperienceDirector module with active scene state, pending scene state, active transition state, direction, phase, lock state, permission checks, requestContact(), requestWorkRestore(), and PinnedSections integration limited to threshold-triggered requests.
```

### ARCH-006B Done Definition

```txt
ExperienceDirector exists.
ExperienceDirector owns active scene state.
ExperienceDirector owns Work to Contact orchestration permission.
ExperienceDirector owns Contact to Work restore orchestration permission.
ExperienceDirector owns Eclipse transition permission hints.
PinnedSections no longer directly sequences WorkScene, EclipseTransition, and ContactScene in activate/deactivate helpers.
PinnedSections still owns ScrollTrigger, snap, thresholds, project sequence, Project Expansion, navigation, and global progress publication.
WorkScene is visually unchanged.
ContactScene is visually unchanged.
EclipseTransition is visually unchanged.
Build passes.
Progress log and handoff are updated.
```

### ARCH-007A Objective

```txt
Define ScrollOrchestrator responsibilities, state model, progress publishing architecture, snapping boundaries, and ARCH-007B integration limits without runtime changes.
```

### ARCH-007A Deliverable

```txt
docs/15_SCROLL_ORCHESTRATOR_EXTRACTION_PLAN.md
```

### ARCH-007A Done Definition

```txt
ScrollOrchestrator responsibility model defined.
Scroll state model defined.
Progress publication architecture mapped.
ExperienceDirector integration mapped.
ARCH-007B extraction boundaries defined.
No runtime code changed.
Build passes.
```

### ARCH-007B Objective

```txt
Extract scroll progress, direction, velocity, and progress publication ownership out of PinnedSections and into a stateful ScrollOrchestrator module.
```

### ARCH-007B Deliverable

```txt
components/orchestration/ScrollOrchestrator.ts containing state tracking, update(), and subscribe() hooks.
PinnedSections.tsx updated to delegate scroll progress to ScrollOrchestrator.
```

### ARCH-007B Done Definition

```txt
ScrollOrchestrator exists.
Scroll progress/direction/velocity owned by ScrollOrchestrator.
Progress publishing (window properties/events) handled by ScrollOrchestrator.
ExperienceDirector integration established via subscriber.
PinnedSections scroll state dependencies removed.
ScrollTrigger and Snap remain in PinnedSections.
No visual or behavioral changes.
Build passes.
```

### ARCH-008A Objective

```txt
Define a unified Motion System, token taxonomy, layering hierarchy, GSAP governance standards, premium motion principles, and the ARCH-008B runtime scope without runtime code changes.
```

### ARCH-008A Deliverable

```txt
docs/16_MOTION_SYSTEM_ARCHITECTURE.md
```

### ARCH-008A Done Definition

```txt
Motion audit completed.
Motion responsibility model defined.
Duration, Easing, Distance, and Stagger tokens established.
Motion layers defined.
GSAP governance guidelines set.
Awwwards-quality premium motion principles documented.
ARCH-008B implementation scope defined.
No runtime code changed.
Build passes.
```

### ARCH-008C Objective

```txt
Conduct a comprehensive Motion Adoption Audit to validate token centralization, preset reuse quality, motion system scalability, governance compliance, remaining motion debt, and Phase 2 planning without runtime changes.
```

### ARCH-008C Deliverable

```txt
docs/17_MOTION_ADOPTION_AUDIT.md
```

### ARCH-008C Done Definition

```txt
Motion System centralization validated.
Preset scalability and reusability evaluated.
GSAP governance audited.
Motion debt inventory mapped.
Future adds stress-tested.
Sprint 1 completion reviewed and Phase 2 focus recommended.
No runtime code changed.
Build passes.
```

### ARCH-009A Objective

```txt
Define an Interaction System responsibility model, layered hierarchy, interaction presets, and the ARCH-009B runtime scope without runtime code changes.
```

### ARCH-009A Deliverable

```txt
docs/18_INTERACTION_SYSTEM_ARCHITECTURE.md
```

### ARCH-009A Done Definition

```txt
Interaction audit completed.
Interaction ownership model defined.
Interaction layers defined.
Interaction presets evaluated.
Premium interaction principles documented.
ARCH-009B implementation scope defined.
No runtime code changed.
Build passes.
```

### ARCH-009B Objective

```txt
Create the centralized pointer tracking in InteractionSystem and HoverSweep preset, and adapt the Contact Hover Sweep to consume them with zero regressions and no legacy cleanup.
```

### ARCH-009B Deliverable

```txt
lib/interactionSystem.ts
lib/interactionPresets.ts
Contact.tsx modified to use Adapter integration
```

### ARCH-009B Done Definition

```txt
InteractionSystem exists.
HoverSweep preset exists.
Contact Hover Sweep consumes InteractionSystem via Adapter.
Visual, motion, and decay parity is 100% identical.
No legacy code cleanup is performed in Contact.tsx (deferred to ARCH-009C).
Build passes.
```

### ARCH-009C Objective

```txt
Validate and audit the adoption of InteractionSystem, identify remaining interaction debt, formulate plans to migrate other interactions, and execute legacy cleanups.
```

### ARCH-009C Deliverable

```txt
docs/19_INTERACTION_ADOPTION_AUDIT.md
Legacy cleanup in Contact.tsx (removal of redundant refs and event handlers)
```

### ARCH-009C Done Definition

```txt
Interaction System adoption validated.
Remaining interaction debt listed and categorized.
Contact.tsx legacy pointer tracking and refs removed.
No visual or behavioral changes.
Build passes.
```

### ARCH-010A Objective

```txt
Determine whether the portfolio requires a centralized Renderer System, audit current loops, define rendering boundaries, and structure technology strategy for future features without runtime modifications.
```

### ARCH-010A Deliverable

```txt
docs/20_RENDERER_SYSTEM_ARCHITECTURE.md
```

### ARCH-010A Done Definition

```txt
Uncoordinated render loops audited.
Centralized Renderer System boundaries defined.
WebGL/canvas performance governance rules established.
TypeScript contract interfaces proposed.
Build passes.
```

### ARCH-010B Objective

```txt
Define the formal TypeScript contracts and mock configurations for the central Renderer Manager and its first consumer (Hero fluid simulation) without runtime changes.
```

### ARCH-010B Deliverable

```txt
lib/rendererContracts.ts (or core contracts additions)
Mock RendererManager structure
```

### ARCH-010B Done Definition

```txt
RendererModuleContract defined in codebase.
RendererManagerContract defined in codebase.
Mock/stub configurations verified for HeroFluidRenderer.
Build passes.
```

### ARCH-010C Objective

```txt
Document the extraction plan for the first renderer consumer (Hero fluid simulation), outlining how the Float32Array physics steps and pixel-rendering operations will be wrapped in a compliant RendererModule class.
```

### ARCH-010C Deliverable

```txt
docs/22_HERO_FLUID_EXTRACTION_PLAN.md
```

### ARCH-010C Done Definition

```txt
HeroFluidRenderer class extraction boundaries defined.
Data-flow and event-flow maps for mouse disturbances established.
Visual and performance regression risks analyzed.
No runtime code modified.
Build passes.
```

### ARCH-010D Objective

```txt
Extract the Hero fluid simulation from hooks/useFluidSim.ts into a separate class module HeroFluidRenderer conforming to the RendererModuleContract.
```

### ARCH-010D Deliverable

```txt
lib/renderers/HeroFluidRenderer.ts
hooks/useFluidSim.ts (refactored as adapter or removed)
```

### ARCH-010D Done Definition

```txt
HeroFluidRenderer class exists and implements RendererModuleContract.
Wave equation logic and Float32Array arrays owned by the class.
Canvas repainting logic encapsulated.
Visual and performance parity is 100% identical.
Build passes.
```

### ARCH-010E Objective

```txt
Perform a detailed post-extraction verification audit of HeroFluidRenderer, validating visual parity, memory lifecycle safety, and contract gaps.
```

### ARCH-010E Deliverable

```txt
docs/24_HERO_FLUID_POST_EXTRACTION_AUDIT.md
```

### ARCH-010E Done Definition

```txt
Verification audit completed.
LOC metrics counted and mapped.
Lifecycle memory safety verified.
Remaining coupling analyzed and documented.
Readiness verdict declared.
```

### ARCH-011A Objective

```txt
Define the RendererManager architecture, lifecycle model, registration model, visibility sleep, resize flow, and performance guidelines without implementation.
```

### ARCH-011A Deliverable

```txt
docs/25_RENDERER_MANAGER_ARCHITECTURE.md
```

### ARCH-011A Done Definition

```txt
Architecture defined.
Lifecycle model, registration, visibility sleep, and resize flow mapped.
Performance limits specified.
HeroFluidRenderer compatibility verified.
```

### ARCH-011B Objective

```txt
Create a central RendererManager coordinating registration, requestAnimationFrame ticks, ResizeObservers, and Visibility Sleep gating for all modules.
```

### ARCH-011B Deliverable

```txt
lib/rendererManager.ts
```

### ARCH-011B Done Definition

```txt
RendererManager exists and manages RendererModuleContracts.
Unified RAF tick coordinates registered modules.
Quality policies and Visibility Sleep gating documented as contract gaps for follow-up.
HeroFluidRenderer registered under the manager.
Build passes.
```

### ARCH-011C Objective

```txt
Perform a code-level adoption audit of the RendererManager implementation introduced in ARCH-011B.
```

### ARCH-011C Deliverable

```txt
docs/27_RENDERER_MANAGER_ADOPTION_AUDIT.md
```

### ARCH-011C Done Definition

```txt
RAF ownership audited.
Ownership boundaries audited.
Renderer independence audited.
Registration lifecycle audited.
Remaining renderer debt classified.
Contract gaps documented without fixes.
Visual parity status remains UNVERIFIED.
Build passes.
```

## Completed Planning Tasks

| Task ID | Status | Task |
|---|---:|---|
| PHASE-0A | DONE | Initial Portfolio V2 motion architecture proposal |
| PHASE-0B | DONE | Agency architecture second-pass review |
| PHASE-0C | DONE | Foundation specification and implementation readiness verdict |

## Notes

Do not begin implementation unless the selected task has:

```txt
Objective
Deliverable
Done Definition
```
