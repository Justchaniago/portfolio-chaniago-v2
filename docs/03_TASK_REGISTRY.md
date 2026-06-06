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
| ARCH-007A | TODO | P1 | ScrollOrchestrator readiness and extraction planning | ARCH-006B | Architecture |
| ARCH-008 | TODO | P2 | Define motion token constants and first consumer | ADR baseline | Motion |

## Current Active Task

```txt
None.
```

ARCH-001, ARCH-002, ARCH-003A, ARCH-003B, ARCH-004A, ARCH-004B, ARCH-005A, ARCH-005B, ARCH-006A, and ARCH-006B are complete. Select the next task before implementation begins.

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
ProjectCard and Project Expansion are unchanged.
Build passes.
Progress log and handoff are updated.
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
