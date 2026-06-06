# Documentation Map (DEV-003)

This document is the classification map for the migrated `docs/` repository.

Scope:

```txt
Physical migration complete.
No file deletions.
References updated.
No runtime code changes.
```

Inventory count:

```txt
Existing docs audited: 43
DEV-002 planning docs created: 2
DEV-003 migration report created: 1
DEV-004 startup governance docs created: 2
Total docs after DEV-004B: 48
```

---

## Proposed Top-Level Structure

```txt
docs/
├── 00-foundation/
├── 01-governance/
├── 02-architecture/
│   ├── phase-0/
│   ├── scene-systems/
│   ├── motion-interaction/
│   └── renderer/
├── 03-audits/
├── 04-handoffs/
├── 05-project-management/
├── 06-development/
│   ├── plans/
│   └── specs/
├── 07-operations/
└── archive/
```

Rationale:

- Foundation holds startup context, core contracts, and baseline standards.
- Governance holds rules, decisions, and future development policy.
- Architecture holds system designs and extraction plans.
- Audits holds validation and adoption findings.
- Handoffs holds current transition guidance.
- Project Management holds state, registry, progress, and issue tracking.
- Development holds feature/spec/delivery planning that is not core architecture.
- Operations holds deployment, environment, troubleshooting, and local service runbooks.
- Archive holds superseded phase proposals or historical documents after references are updated in a future migration.
- `docs/runbooks/litellm.md` remains in its pre-existing nested path because it was not present in the approved DEV-002 migration map.

---

## Category Breakdown

| Category | Existing Count | DEV-002 Outputs | DEV-003 Outputs | DEV-004 Outputs | Total After DEV-004B |
|---|---:|---:|---:|---:|---:|
| Foundation | 5 | 0 | 0 | 0 | 5 |
| Governance | 3 | 1 | 0 | 2 | 6 |
| Architecture | 19 | 0 | 0 | 0 | 19 |
| Audits | 7 | 0 | 0 | 0 | 7 |
| Handoffs | 1 | 0 | 0 | 0 | 1 |
| Project Management | 4 | 0 | 0 | 0 | 4 |
| Development | 1 | 1 | 1 | 0 | 3 |
| Operations | 3 | 0 | 0 | 0 | 3 |
| Archive | 0 | 0 | 0 | 0 | 0 |
| Total | 43 | 2 | 1 | 2 | 48 |

---

## Complete Document Inventory

| Current Path | Category | Purpose | Owner | Lifecycle Status | Key Dependencies | Actual Location |
|---|---|---|---|---|---|---|
| `docs/00-foundation/00_AGENT_BOOTSTRAP.md` | Foundation | Mandatory startup and agent operating system instructions. | Agent governance | Active canonical | `01_CONTEXT_BRIEF`, `02_PROJECT_STATE`, `03_TASK_REGISTRY`, `07_HANDOFF`, `04_ARCHITECTURE_DECISIONS` | `docs/00-foundation/00_AGENT_BOOTSTRAP.md` |
| `docs/00-foundation/01_CONTEXT_BRIEF.md` | Foundation | Project summary, context, constraints, and phase reference. | Project context | Active canonical | Phase 0 docs, bootstrap docs | `docs/00-foundation/01_CONTEXT_BRIEF.md` |
| `docs/05-project-management/02_PROJECT_STATE.md` | Project Management | Current phase, sprint, completed work, risks, priorities, next actions. | Project management | Active canonical | Task registry, progress log, handoff | `docs/05-project-management/02_PROJECT_STATE.md` |
| `docs/05-project-management/03_TASK_REGISTRY.md` | Project Management | Task list, statuses, objectives, deliverables, done definitions. | Project management | Active canonical | Project state, progress log | `docs/05-project-management/03_TASK_REGISTRY.md` |
| `docs/01-governance/04_ARCHITECTURE_DECISIONS.md` | Governance | Immutable architecture decisions and ADR-like rules. | Architecture governance | Active canonical | Phase 0 docs, core contracts | `docs/01-governance/04_ARCHITECTURE_DECISIONS.md` |
| `docs/05-project-management/05_PROGRESS_LOG.md` | Project Management | Chronological work log and verification record. | Project management | Active append-only | Task registry, handoff, task docs | `docs/05-project-management/05_PROGRESS_LOG.md` |
| `docs/05-project-management/06_ISSUES_AND_RESOLUTIONS.md` | Project Management | Issue log, root causes, resolutions, related files. | Project management | Active append-only | Architecture docs, runtime task docs | `docs/05-project-management/06_ISSUES_AND_RESOLUTIONS.md` |
| `docs/04-handoffs/07_HANDOFF.md` | Handoffs | Current handoff, known risks, next action guidance. | Handoff owner | Active canonical | Project state, task registry, governance docs | `docs/04-handoffs/07_HANDOFF.md` |
| `docs/00-foundation/08_CORE_CONTRACT_DEFINITIONS.md` | Foundation | Core TypeScript architecture contracts for scenes, transitions, renderers, interactions. | Foundation architecture | Active reference | ADR baseline, ARCH-001 | `docs/00-foundation/08_CORE_CONTRACT_DEFINITIONS.md` |
| `docs/02-architecture/09_CONSUMER_MAPPING_AND_MIGRATION_PLAN.md` | Architecture | Consumer map and migration blueprint. | Architecture planning | Historical active reference | Core contracts, ARCH-002 | `docs/02-architecture/09_CONSUMER_MAPPING_AND_MIGRATION_PLAN.md` |
| `docs/02-architecture/scene-systems/10_ECLIPSE_TRANSITION_EXTRACTION_PLAN.md` | Architecture | Eclipse transition extraction plan and runtime boundary. | Transition architecture | Historical active reference | ARCH-002, PinnedSections, EclipseTransition | `docs/02-architecture/scene-systems/10_ECLIPSE_TRANSITION_EXTRACTION_PLAN.md` |
| `docs/02-architecture/scene-systems/11_CONTACT_SCENE_EXTRACTION_PLAN.md` | Architecture | ContactScene extraction plan, lifecycle, risks, scope. | Scene architecture | Historical active reference | ARCH-003B, Contact, PinnedSections | `docs/02-architecture/scene-systems/11_CONTACT_SCENE_EXTRACTION_PLAN.md` |
| `docs/02-architecture/scene-systems/12_WORK_SCENE_EXTRACTION_PLAN.md` | Architecture | WorkScene extraction plan, project boundary, lifecycle, risk map. | Scene architecture | Historical active reference | ARCH-004B, Work, ProjectCard, PinnedSections | `docs/02-architecture/scene-systems/12_WORK_SCENE_EXTRACTION_PLAN.md` |
| `docs/02-architecture/scene-systems/13_EXPERIENCE_DIRECTOR_PLAN.md` | Architecture | ExperienceDirector orchestration plan and runtime scope. | Orchestration architecture | Historical active reference | WorkScene, ContactScene, EclipseTransition | `docs/02-architecture/scene-systems/13_EXPERIENCE_DIRECTOR_PLAN.md` |
| `docs/03-audits/14_EXPERIENCE_DIRECTOR_POST_EXTRACTION_AUDIT.md` | Audits | Post-extraction audit for ExperienceDirector boundary. | Audit owner | Active validation reference | ARCH-006B, scene modules, transition module | `docs/03-audits/14_EXPERIENCE_DIRECTOR_POST_EXTRACTION_AUDIT.md` |
| `docs/02-architecture/scene-systems/15_SCROLL_ORCHESTRATOR_EXTRACTION_PLAN.md` | Architecture | ScrollOrchestrator extraction plan and progress publication architecture. | Scroll architecture | Historical active reference | ExperienceDirector audit, PinnedSections | `docs/02-architecture/scene-systems/15_SCROLL_ORCHESTRATOR_EXTRACTION_PLAN.md` |
| `docs/02-architecture/motion-interaction/16_MOTION_SYSTEM_ARCHITECTURE.md` | Architecture | Motion token, preset, layer, and governance architecture. | Motion architecture | Active reference | ScrollOrchestrator, GSAP usage | `docs/02-architecture/motion-interaction/16_MOTION_SYSTEM_ARCHITECTURE.md` |
| `docs/03-audits/17_MOTION_ADOPTION_AUDIT.md` | Audits | Motion System adoption and remaining debt audit. | Audit owner | Active validation reference | Motion architecture, motion runtime | `docs/03-audits/17_MOTION_ADOPTION_AUDIT.md` |
| `docs/02-architecture/motion-interaction/18_INTERACTION_SYSTEM_ARCHITECTURE.md` | Architecture | Interaction System architecture, pointer model, preset boundaries. | Interaction architecture | Active reference | Motion System, Contact interactions | `docs/02-architecture/motion-interaction/18_INTERACTION_SYSTEM_ARCHITECTURE.md` |
| `docs/03-audits/19_INTERACTION_ADOPTION_AUDIT.md` | Audits | Interaction System adoption audit and cleanup readiness. | Audit owner | Active validation reference | Interaction runtime, Contact hover sweep | `docs/03-audits/19_INTERACTION_ADOPTION_AUDIT.md` |
| `docs/02-architecture/renderer/20_RENDERER_SYSTEM_ARCHITECTURE.md` | Architecture | Renderer System architecture and rendering technology strategy. | Renderer architecture | Active reference | Interaction audit, current canvas loops | `docs/02-architecture/renderer/20_RENDERER_SYSTEM_ARCHITECTURE.md` |
| `docs/00-foundation/21_RENDERER_CONTRACTS.md` | Foundation | Renderer manager/module contracts and lifecycle model. | Renderer contracts | Active canonical | Core contracts, Renderer architecture | `docs/00-foundation/21_RENDERER_CONTRACTS.md` |
| `docs/02-architecture/renderer/22_HERO_FLUID_EXTRACTION_PLAN.md` | Architecture | Hero fluid extraction plan and renderer class boundary. | Renderer architecture | Historical active reference | Renderer contracts, useFluidSim | `docs/02-architecture/renderer/22_HERO_FLUID_EXTRACTION_PLAN.md` |
| `docs/02-architecture/renderer/23_HERO_FLUID_RUNTIME_EXTRACTION.md` | Architecture | Runtime extraction report for HeroFluidRenderer implementation. | Renderer architecture | Historical active reference | Hero fluid plan, useFluidSim, HeroFluidRenderer | `docs/02-architecture/renderer/23_HERO_FLUID_RUNTIME_EXTRACTION.md` |
| `docs/03-audits/24_HERO_FLUID_POST_EXTRACTION_AUDIT.md` | Audits | HeroFluidRenderer post-extraction audit. | Audit owner | Active validation reference | Hero fluid runtime extraction, Renderer contracts | `docs/03-audits/24_HERO_FLUID_POST_EXTRACTION_AUDIT.md` |
| `docs/02-architecture/renderer/25_RENDERER_MANAGER_ARCHITECTURE.md` | Architecture | RendererManager architecture, registration, lifecycle, visibility sleep blueprint. | Renderer architecture | Active reference | Hero fluid audit, Renderer contracts | `docs/02-architecture/renderer/25_RENDERER_MANAGER_ARCHITECTURE.md` |
| `docs/02-architecture/renderer/26_RENDERER_MANAGER_IMPLEMENTATION.md` | Architecture | RendererManager runtime implementation report. | Renderer architecture | Active implementation reference | RendererManager architecture, HeroFluidRenderer | `docs/02-architecture/renderer/26_RENDERER_MANAGER_IMPLEMENTATION.md` |
| `docs/03-audits/27_RENDERER_MANAGER_ADOPTION_AUDIT.md` | Audits | RendererManager adoption audit, debt, contract gaps. | Audit owner | Active validation reference | RendererManager implementation, Renderer contracts | `docs/03-audits/27_RENDERER_MANAGER_ADOPTION_AUDIT.md` |
| `docs/02-architecture/renderer/28_VISIBILITY_SLEEP_ARCHITECTURE.md` | Architecture | Visibility Sleep architecture and ARCH-012B runtime shape. | Renderer architecture | Active reference | RendererManager audit, Renderer contracts | `docs/02-architecture/renderer/28_VISIBILITY_SLEEP_ARCHITECTURE.md` |
| `docs/03-audits/29_VISIBILITY_SLEEP_RUNTIME.md` | Audits | Visibility Sleep runtime report, verification, remaining debt. | Audit owner | Active validation reference | Visibility architecture, RendererManager runtime | `docs/03-audits/29_VISIBILITY_SLEEP_RUNTIME.md` |
| `docs/01-governance/30_DEVELOPMENT_GOVERNANCE.md` | Governance | Master development governance for future bug fixes, improvements, features, ROI, agent workflow. | Development governance | Active canonical | DEV-001, architecture history | `docs/01-governance/30_DEVELOPMENT_GOVERNANCE.md` |
| `docs/03-audits/contact-link-hover-forensic-audit.md` | Audits | Forensic audit of Contact link hover behavior. | Audit owner | Active specialized audit | Contact typography/interaction docs, Contact component | `docs/03-audits/contact-link-hover-forensic-audit.md` |
| `docs/06-development/plans/contact-typography-interaction.md` | Development | Contact typography interaction architecture and behavior notes. | Interaction/design owner | Active specialized plan | Contact component, interaction behavior | `docs/06-development/plans/contact-typography-interaction.md` |
| `docs/07-operations/deployment.md` | Operations | Deployment runbook. | Operations | Active runbook | Environment and hosting setup | `docs/07-operations/deployment.md` |
| `docs/00-foundation/design-principles.md` | Foundation | Visual philosophy and design principles. | Design governance | Active reference | UI/visual implementation | `docs/00-foundation/design-principles.md` |
| `docs/07-operations/dev-environment.md` | Operations | Development machine/environment notes. | Operations | Active runbook | Environment snapshot, local setup | `docs/07-operations/dev-environment.md` |
| `docs/07-operations/environment-snapshot.md` | Operations | Generated environment snapshot. | Operations | Snapshot/historical active | Dev environment | `docs/07-operations/environment-snapshot.md` |
| `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-addendum-phase-0b.md` | Architecture | Phase 0B agency architecture review addendum. | Foundation architecture | Historical active reference | Phase 0A proposal | `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-addendum-phase-0b.md` |
| `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-foundation-phase-0c.md` | Architecture | Phase 0C foundation specification. | Foundation architecture | Historical active reference | Phase 0A, Phase 0B | `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-foundation-phase-0c.md` |
| `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-proposal.md` | Architecture | Phase 0A original motion architecture proposal. | Foundation architecture | Historical active reference | Initial branch/project context | `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-proposal.md` |
| `docs/07-operations/troubleshooting.md` | Operations | Troubleshooting runbook. | Operations | Active runbook | Deployment, dev environment | `docs/07-operations/troubleshooting.md` |
| `docs/runbooks/litellm.md` | Operations | LiteLLM local service runbook. | Operations | Active runbook, unmoved by DEV-003 | Local LiteLLM service | `docs/runbooks/litellm.md` |
| `docs/06-development/specs/work-section-spec.md` | Development | Work section specification and intended behavior. | Feature/spec owner | Active feature spec | Work scene, ProjectCard, work implementation | `docs/06-development/specs/work-section-spec.md` |
| `docs/01-governance/DOCUMENTATION_MAP.md` | Governance | DEV-002 complete documentation inventory and classification map. | Documentation governance | New DEV-002 output | Current docs inventory | `docs/01-governance/DOCUMENTATION_MAP.md` |
| `docs/06-development/plans/DOCUMENTATION_RESTRUCTURE_PLAN.md` | Development | DEV-002 physical migration plan and risk assessment. | Documentation governance | New DEV-002 output | Documentation map | `docs/06-development/plans/DOCUMENTATION_RESTRUCTURE_PLAN.md` |
| `docs/31_DOCUMENTATION_MIGRATION_REPORT.md` | Development | DEV-003 physical migration report and validation summary. | Documentation governance | New DEV-003 output | Documentation map, restructure plan | `docs/31_DOCUMENTATION_MIGRATION_REPORT.md` |
| `docs/01-governance/AGENT_STARTUP_OPTIMIZATION_PLAN.md` | Governance | DEV-004A startup loading and classification plan. | Documentation governance | New DEV-004A output | Documentation map, bootstrap, handoff, task registry | `docs/01-governance/AGENT_STARTUP_OPTIMIZATION_PLAN.md` |
| `docs/01-governance/AGENT_STARTUP_IMPLEMENTATION_AUDIT.md` | Governance | DEV-004B startup optimization implementation audit. | Documentation governance | New DEV-004B output | Startup optimization plan, bootstrap, handoff, task registry, documentation map | `docs/01-governance/AGENT_STARTUP_IMPLEMENTATION_AUDIT.md` |

---

## Dependency Groups

Startup chain:

```txt
00_AGENT_BOOTSTRAP
→ 01_CONTEXT_BRIEF
→ 02_PROJECT_STATE
→ 03_TASK_REGISTRY
→ 07_HANDOFF
→ 04_ARCHITECTURE_DECISIONS
→ 30_DEVELOPMENT_GOVERNANCE
```

Project management chain:

```txt
02_PROJECT_STATE
03_TASK_REGISTRY
05_PROGRESS_LOG
06_ISSUES_AND_RESOLUTIONS
07_HANDOFF
```

Architecture progression:

```txt
Phase 0A → Phase 0B → Phase 0C
→ ARCH-001 core contracts
→ ARCH-002 consumer map
→ scene extraction plans
→ orchestration plans
→ motion / interaction / renderer architectures
→ visibility sleep architecture
```

Audit progression:

```txt
ExperienceDirector audit
→ Motion adoption audit
→ Interaction adoption audit
→ Hero Fluid post-extraction audit
→ RendererManager adoption audit
→ Visibility Sleep runtime report
```

Operations references:

```txt
deployment
dev-environment
environment-snapshot
troubleshooting
```

---

## Discovery Guidance

For future agents:

1. Start with `00-foundation/00_AGENT_BOOTSTRAP.md`.
2. Read `05-project-management/02_PROJECT_STATE.md`.
3. Read `05-project-management/03_TASK_REGISTRY.md`.
4. Read `04-handoffs/07_HANDOFF.md`.
5. Read `01-governance/30_DEVELOPMENT_GOVERNANCE.md`.
6. Read this documentation map.
7. Open only the documents relevant to the active task.

Agents must not scan the entire docs directory by default.

---

## Startup Guide

Mandatory startup documents:

```txt
docs/00-foundation/00_AGENT_BOOTSTRAP.md
docs/00-foundation/01_CONTEXT_BRIEF.md
docs/05-project-management/02_PROJECT_STATE.md
docs/05-project-management/03_TASK_REGISTRY.md
docs/04-handoffs/07_HANDOFF.md
docs/01-governance/30_DEVELOPMENT_GOVERNANCE.md
docs/01-governance/DOCUMENTATION_MAP.md
```

### Architecture Task Workflow

```txt
Mandatory startup
→ task discovery
→ relevant foundation contracts
→ relevant architecture family only
→ related audit only if validating adoption
→ execution
```

Do not load all architecture documents by default.

### Bug Fix Workflow

```txt
Mandatory startup
→ classify as bug fix
→ issue discovery
→ relevant owner architecture or feature spec
→ focused code inspection
→ smallest safe fix
```

Do not load historical docs, unrelated audits, or operations docs by default.

### Feature Workflow

```txt
Mandatory startup
→ classify as feature
→ relevant feature spec
→ relevant owner architecture
→ design principles if visual output changes
→ execution
```

Do not load audits, operations docs, or historical phase docs by default.

### Audit Workflow

```txt
Mandatory startup
→ identify target system
→ target architecture docs
→ target contracts
→ prior audit for same target only
→ audit
```

Do not load unrelated audits by default.

### Deployment Workflow

```txt
Mandatory startup
→ relevant operations runbook
→ environment snapshot only if diagnosing environment state
→ deployment or troubleshooting task
```

Do not load architecture, audit, or historical docs by default.

### Documentation Workflow

```txt
Mandatory startup
→ relevant documentation plan or governance artifact
→ affected target documents
→ validation
```

Do not inspect runtime code unless the documentation task explicitly requires code evidence.

Physical migration is complete. Use the actual paths listed in this map.
