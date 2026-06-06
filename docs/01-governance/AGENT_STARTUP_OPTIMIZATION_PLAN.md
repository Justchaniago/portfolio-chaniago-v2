# Agent Startup Optimization Plan (DEV-004A)

Status:

```txt
PLANNING ONLY
```

Final verdict:

```txt
PASS
READY FOR DEV-004B
```

This document designs the optimized future agent startup workflow after DEV-003 Documentation Physical Migration.

DEV-004A does not modify bootstrap behavior, governance rules, handoff instructions, architecture decisions, runtime code, or document locations.

---

## Current Startup Audit

Current startup sequence:

```txt
00_AGENT_BOOTSTRAP
→ 01_CONTEXT_BRIEF
→ 02_PROJECT_STATE
→ 03_TASK_REGISTRY
→ 07_HANDOFF
→ relevant 04_ARCHITECTURE_DECISIONS entries
→ relevant code
```

Current documented supplemental read path:

```txt
30_DEVELOPMENT_GOVERNANCE
DOCUMENTATION_MAP
task-relevant architecture / audit / development / operation docs
```

Current startup document count:

```txt
Strict bootstrap chain: 5 documents + relevant ADR entries
Practical post-DEV-003 startup: 7 documents when Development Governance and Documentation Map are included
Repository documentation inventory: 46 documents
```

Startup dependency chain:

```txt
Bootstrap defines read order.
Context Brief defines mission and constraints.
Project State defines current status, risks, and next action.
Task Registry defines task ownership and completion state.
Handoff defines most recent work and active warnings.
Development Governance defines task classification and implementation discipline.
Documentation Map defines where to find follow-up context.
```

Startup bottlenecks:

- `07_HANDOFF` contains a long accumulated history and can dominate startup reading.
- `03_TASK_REGISTRY` contains historical done definitions that are not always needed for the next task.
- Architecture docs are numerous and should not be explored unless the active task targets that system.
- Audit docs are validation evidence, not default onboarding material.
- Phase 0 docs remain useful for investigation but are not required for ordinary implementation.

Unnecessary document loading:

- Loading all architecture documents before task classification.
- Loading audits when no audit or regression investigation is requested.
- Loading operations docs for non-deployment tasks.
- Loading historical phase proposals when current canonical summaries are enough.
- Loading runtime implementation reports when only a planning task is requested.

Token waste opportunities:

- Replace broad `docs/` scans with a deterministic startup chain plus `DOCUMENTATION_MAP`.
- Treat `05_PROGRESS_LOG` and `06_ISSUES_AND_RESOLUTIONS` as targeted references, not startup defaults.
- Read only the current active task section in `03_TASK_REGISTRY` once DEV-004B creates guidance for that behavior.
- Read only the latest handoff section once DEV-004B creates handoff compaction or sectioning guidance.

---

## Document Classification Audit

Classification rules:

```txt
MANDATORY: always loaded at startup.
OPTIONAL: loaded when task type or owner requires it.
ON-DEMAND: loaded only when referenced by a task, issue, handoff, or code finding.
HISTORICAL: never loaded by default; used for investigation or provenance.
```

| Document | Startup Class | Reason |
|---|---|---|
| `docs/00-foundation/00_AGENT_BOOTSTRAP.md` | MANDATORY | Defines mandatory agent operating sequence. |
| `docs/00-foundation/01_CONTEXT_BRIEF.md` | MANDATORY | Defines mission, constraints, and current architecture summary. |
| `docs/05-project-management/02_PROJECT_STATE.md` | MANDATORY | Defines current phase, status, risks, and next action. |
| `docs/05-project-management/03_TASK_REGISTRY.md` | MANDATORY | Defines task status, ownership, dependencies, and next candidate work. |
| `docs/04-handoffs/07_HANDOFF.md` | MANDATORY | Defines latest transition context and active warnings. |
| `docs/01-governance/30_DEVELOPMENT_GOVERNANCE.md` | MANDATORY | Defines task classification and future development discipline. |
| `docs/01-governance/DOCUMENTATION_MAP.md` | MANDATORY | Defines post-migration discovery map and prevents broad exploration. |
| `docs/01-governance/04_ARCHITECTURE_DECISIONS.md` | OPTIONAL | Required only for ADRs relevant to the task. |
| `docs/00-foundation/08_CORE_CONTRACT_DEFINITIONS.md` | OPTIONAL | Required for architecture, ownership, or contract work. |
| `docs/00-foundation/21_RENDERER_CONTRACTS.md` | OPTIONAL | Required for renderer lifecycle or RendererManager work. |
| `docs/00-foundation/design-principles.md` | OPTIONAL | Required for visual or design-sensitive work. |
| `docs/02-architecture/09_CONSUMER_MAPPING_AND_MIGRATION_PLAN.md` | HISTORICAL | Early migration blueprint; use for provenance or ownership investigation. |
| `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-proposal.md` | HISTORICAL | Phase 0A proposal; superseded by current summaries and later architecture docs. |
| `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-addendum-phase-0b.md` | HISTORICAL | Phase 0B review addendum; use for provenance only. |
| `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-foundation-phase-0c.md` | HISTORICAL | Phase 0C foundation; use when validating foundation decisions. |
| `docs/02-architecture/scene-systems/10_ECLIPSE_TRANSITION_EXTRACTION_PLAN.md` | HISTORICAL | Completed extraction plan; use for Eclipse provenance. |
| `docs/02-architecture/scene-systems/11_CONTACT_SCENE_EXTRACTION_PLAN.md` | HISTORICAL | Completed extraction plan; use for ContactScene provenance. |
| `docs/02-architecture/scene-systems/12_WORK_SCENE_EXTRACTION_PLAN.md` | HISTORICAL | Completed extraction plan; use for WorkScene provenance. |
| `docs/02-architecture/scene-systems/13_EXPERIENCE_DIRECTOR_PLAN.md` | OPTIONAL | Required for orchestration or ExperienceDirector tasks. |
| `docs/02-architecture/scene-systems/15_SCROLL_ORCHESTRATOR_EXTRACTION_PLAN.md` | OPTIONAL | Required for scroll ownership or ScrollOrchestrator tasks. |
| `docs/02-architecture/motion-interaction/16_MOTION_SYSTEM_ARCHITECTURE.md` | OPTIONAL | Required for motion token, preset, or animation architecture work. |
| `docs/02-architecture/motion-interaction/18_INTERACTION_SYSTEM_ARCHITECTURE.md` | OPTIONAL | Required for pointer, hover, or interaction architecture work. |
| `docs/02-architecture/renderer/20_RENDERER_SYSTEM_ARCHITECTURE.md` | OPTIONAL | Required for renderer system work. |
| `docs/02-architecture/renderer/22_HERO_FLUID_EXTRACTION_PLAN.md` | HISTORICAL | Completed extraction plan; use for HeroFluid provenance. |
| `docs/02-architecture/renderer/23_HERO_FLUID_RUNTIME_EXTRACTION.md` | ON-DEMAND | Runtime extraction report; use when HeroFluid implementation evidence is needed. |
| `docs/02-architecture/renderer/25_RENDERER_MANAGER_ARCHITECTURE.md` | OPTIONAL | Required for RendererManager architecture work. |
| `docs/02-architecture/renderer/26_RENDERER_MANAGER_IMPLEMENTATION.md` | ON-DEMAND | Runtime implementation report; use when manager implementation evidence is needed. |
| `docs/02-architecture/renderer/28_VISIBILITY_SLEEP_ARCHITECTURE.md` | OPTIONAL | Required for visibility sleep architecture or runtime follow-up. |
| `docs/03-audits/14_EXPERIENCE_DIRECTOR_POST_EXTRACTION_AUDIT.md` | ON-DEMAND | Audit evidence only. |
| `docs/03-audits/17_MOTION_ADOPTION_AUDIT.md` | ON-DEMAND | Audit evidence only. |
| `docs/03-audits/19_INTERACTION_ADOPTION_AUDIT.md` | ON-DEMAND | Audit evidence only. |
| `docs/03-audits/24_HERO_FLUID_POST_EXTRACTION_AUDIT.md` | ON-DEMAND | Audit evidence only. |
| `docs/03-audits/27_RENDERER_MANAGER_ADOPTION_AUDIT.md` | ON-DEMAND | Audit evidence only. |
| `docs/03-audits/29_VISIBILITY_SLEEP_RUNTIME.md` | ON-DEMAND | Runtime audit and verification report. |
| `docs/03-audits/contact-link-hover-forensic-audit.md` | ON-DEMAND | Specialized forensic audit; load only for Contact hover investigation. |
| `docs/05-project-management/05_PROGRESS_LOG.md` | ON-DEMAND | Append-only history; load targeted sections only when evidence is needed. |
| `docs/05-project-management/06_ISSUES_AND_RESOLUTIONS.md` | ON-DEMAND | Issue evidence; load for bug investigation or known-risk lookup. |
| `docs/06-development/plans/contact-typography-interaction.md` | OPTIONAL | Required for Contact typography/interaction changes. |
| `docs/06-development/plans/DOCUMENTATION_RESTRUCTURE_PLAN.md` | HISTORICAL | DEV-002/DEV-003 migration plan; use for migration provenance. |
| `docs/06-development/specs/work-section-spec.md` | OPTIONAL | Required for Work section feature or behavior changes. |
| `docs/07-operations/deployment.md` | OPTIONAL | Required for deployment tasks. |
| `docs/07-operations/dev-environment.md` | OPTIONAL | Required for local setup or environment tasks. |
| `docs/07-operations/environment-snapshot.md` | ON-DEMAND | Snapshot evidence; load only for environment diagnosis. |
| `docs/07-operations/troubleshooting.md` | OPTIONAL | Required for debugging local or operational failures. |
| `docs/runbooks/litellm.md` | OPTIONAL | Required for LiteLLM local service operation only. |
| `docs/31_DOCUMENTATION_MIGRATION_REPORT.md` | HISTORICAL | DEV-003 migration evidence; use only for migration validation. |
| `docs/01-governance/AGENT_STARTUP_OPTIMIZATION_PLAN.md` | ON-DEMAND | DEV-004A planning output; becomes implementation input for DEV-004B. |

Classification summary:

```txt
MANDATORY: 7
OPTIONAL: 17
ON-DEMAND: 13
HISTORICAL: 10
Total after DEV-004A plan creation: 47
```

---

## Agent Workflow Design

### Architecture Task

Optimized workflow:

```txt
Mandatory startup
↓
Task discovery from Project State + Task Registry + Handoff
↓
Load Documentation Map
↓
Load relevant foundation contract docs
↓
Load relevant architecture docs for the target system only
↓
Load related audits only if validating adoption or prior findings
↓
Execution
```

Required loading rule:

```txt
Do not load all architecture documents.
Load only the architecture family for the active owner: scene, motion, interaction, renderer, or operations.
```

### Bug Fix Task

Optimized workflow:

```txt
Mandatory startup
↓
Classify as Tier 1 Bug Fix using Development Governance
↓
Issue discovery through user evidence, code search, and targeted issue log lookup
↓
Load relevant feature/spec/architecture docs only for the suspected owner
↓
Inspect code
↓
Smallest safe fix
↓
Focused validation
```

Required loading rule:

```txt
Do not load historical extraction plans unless root cause crosses an extracted ownership boundary.
```

### Feature Task

Optimized workflow:

```txt
Mandatory startup
↓
Classify as Tier 3 Feature using Development Governance
↓
Identify user value, current owner, touched systems, and non-goals
↓
Load relevant feature specs and owner architecture docs
↓
Load design principles only if visual output changes
↓
Execution
```

Required loading rule:

```txt
Do not load operations, audits, or historical phase docs unless the feature explicitly depends on them.
```

### Audit Task

Optimized workflow:

```txt
Mandatory startup
↓
Identify audit target and required contracts
↓
Load target system architecture docs
↓
Load prior audit reports for the same target only
↓
Inspect code and run allowed validation
↓
Produce audit result
```

Required loading rule:

```txt
Audit docs are evidence inputs, not global startup inputs.
```

---

## Token Efficiency Analysis

Before DEV-003:

```txt
Docs were concentrated in a flat directory.
Future agents had high pressure to scan many top-level files before locating the right context.
Startup could drift toward dozens of documents when task scope was unclear.
```

After DEV-003:

```txt
Docs are grouped by ownership category.
The startup chain can remain small.
DOCUMENTATION_MAP can route agents to the right folder and owner-specific docs.
Most architecture, audit, operation, and historical docs can be skipped by default.
```

Estimated document count reduction:

```txt
From potentially 40+ discoverable docs during broad startup
to 7 mandatory startup docs plus targeted follow-up docs.
```

Estimated token reduction:

```txt
Directionally large.
Likely a majority reduction for ordinary bug, feature, and implementation tasks because audits, historical plans, operations docs, and unrelated architecture families are no longer default reads.
```

Estimated onboarding speed improvement:

```txt
Directionally significant.
Agents should reach task-specific code inspection faster because discovery is map-driven instead of directory-scan-driven.
```

No exact token or time savings are claimed because document sizes, agent behavior, and task scope vary.

---

## Risk Assessment

| Risk | Impact | Mitigation |
|---|---|---|
| Incorrect classification | Agent may skip a needed document. | DEV-004B should encode a clear escalation rule: when ownership is uncertain, load the nearest architecture doc and map entry. |
| Missing mandatory docs | Agent may begin with incomplete project state. | Keep Bootstrap, Context Brief, Project State, Task Registry, Handoff, Development Governance, and Documentation Map mandatory. |
| Overly aggressive loading reduction | Agent may miss historical constraints. | Historical docs remain available for provenance and investigation; they are not deleted or archived by this plan. |
| Broken onboarding paths | Future agents may follow old flat paths. | DEV-004B should update startup instructions to migrated paths only after this plan is accepted. |
| Handoff remains too large | Startup still consumes more context than needed. | DEV-004B should define a latest-section-first handoff reading rule or handoff compaction strategy. |
| Task Registry remains long | Agents may read completed done definitions unnecessarily. | DEV-004B should define active-task-first registry reading guidance. |
| Documentation Map becomes stale | Routing accuracy degrades. | Any future document move or new governance artifact should update the map in the same task. |

Stop conditions for DEV-004B:

```txt
Do not remove mandatory project memory.
Do not hide active risks.
Do not make startup dependent on chat history.
Do not make code inspection replace documented project state.
```

---

## DEV-004B Recommendation

Recommended next task:

```txt
DEV-004B — Agent Startup Optimization Implementation
```

Scope:

```txt
Update startup documents with deterministic loading rules.
Add mandatory / optional / on-demand / historical guidance.
Add task-type loading workflows.
Preserve documentation as repository memory.
Do not modify runtime code.
```

Expected implementation targets:

```txt
docs/00-foundation/00_AGENT_BOOTSTRAP.md
docs/04-handoffs/07_HANDOFF.md
docs/01-governance/DOCUMENTATION_MAP.md
```

DEV-004B should not begin until this plan is reviewed.

---

## Success Criteria

Startup workflow defined:

```txt
PASS
```

Document categories defined:

```txt
PASS
```

Architecture workflow defined:

```txt
PASS
```

Bug workflow defined:

```txt
PASS
```

Feature workflow defined:

```txt
PASS
```

Token efficiency opportunities identified:

```txt
PASS
```

Risk assessment completed:

```txt
PASS
```

Readiness verdict:

```txt
PASS
READY FOR DEV-004B
```
