# Documentation Restructure Plan (DEV-003)

This document records the completed physical migration plan for the `docs/` directory.

Constraints for DEV-002:

```txt
File moves completed.
No file deletions.
References updated.
No runtime code changes.
No architecture changes.
Migration completed.
```

Migration verdict:

```txt
PASS
```

Readiness verdict:

```txt
READY FOR DEV-004A
```

Migration summary:

```txt
Folders created: 15
Files moved: 44
Migration report created: 1
Literal documentation path references validated: 528
Unresolved references after validation: 0
Unmapped existing nested docs discovered: 1
```

---

## Proposed Folder Structure

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

Reasoning:

- Separates Architecture, Governance, Audits, Handoffs, and Project Management as required.
- Keeps startup/foundation materials easy to find.
- Avoids forcing deployment and troubleshooting into unrelated categories.
- Leaves `archive/` available for future superseded docs after references are updated.

---

## Migration Sequence

### Phase 1: Create Folders

Create the target directory tree only.

Risk:

```txt
LOW
```

No references change yet.

### Phase 2: Move Low-Risk Independent Docs

Move operations and standalone development/spec docs first:

- deployment
- dev environment
- environment snapshot
- troubleshooting
- design principles
- work section spec
- contact typography plan

Risk:

```txt
LOW
```

These are less likely to be hardcoded in startup sequences.

### Phase 3: Move Audits

Move adoption, extraction, runtime, and forensic audit docs.

Risk:

```txt
MEDIUM
```

Many project-management docs reference audit paths directly.

### Phase 4: Move Architecture Docs

Move phase plans, extraction plans, system architecture docs, runtime implementation reports, and renderer architecture docs.

Risk:

```txt
HIGH
```

These documents have dense cross-references and historical task references.

### Phase 5: Move Foundation And Governance Docs

Move startup, context, decisions, contracts, and governance docs.

Risk:

```txt
HIGH
```

Startup instructions and handoff docs reference these paths directly.

### Phase 6: Move Project Management And Handoff Docs

Move active state, task registry, progress log, issues, and handoff last.

Risk:

```txt
CRITICAL
```

These files are the primary entrypoint for future agents. All references must be updated in the same DEV-003 change.

### Phase 7: Reference Update And Validation

Update every `docs/...` reference after moves.

Required validation:

```txt
rg "docs/[A-Za-z0-9_./-]+\\.md" docs
rg "00_AGENT_BOOTSTRAP|01_CONTEXT_BRIEF|02_PROJECT_STATE|03_TASK_REGISTRY|07_HANDOFF|04_ARCHITECTURE_DECISIONS" docs
git diff --check
```

Optional validation:

```txt
markdown link checker, if available.
```

---

## File Move Plan

| Current Path | Target Path | Sequence Phase | Dependency Risk |
|---|---|---:|---|
| `docs/00-foundation/00_AGENT_BOOTSTRAP.md` | `docs/00-foundation/00_AGENT_BOOTSTRAP.md` | 5 | Critical startup references in bootstrap, handoff, and agent flow. |
| `docs/00-foundation/01_CONTEXT_BRIEF.md` | `docs/00-foundation/01_CONTEXT_BRIEF.md` | 5 | Referenced by bootstrap and handoff startup sequence. |
| `docs/05-project-management/02_PROJECT_STATE.md` | `docs/05-project-management/02_PROJECT_STATE.md` | 6 | Active status entrypoint; many docs reference it. |
| `docs/05-project-management/03_TASK_REGISTRY.md` | `docs/05-project-management/03_TASK_REGISTRY.md` | 6 | Active task entrypoint; many docs reference it. |
| `docs/01-governance/04_ARCHITECTURE_DECISIONS.md` | `docs/01-governance/04_ARCHITECTURE_DECISIONS.md` | 5 | Startup and governance reference. |
| `docs/05-project-management/05_PROGRESS_LOG.md` | `docs/05-project-management/05_PROGRESS_LOG.md` | 6 | Append-only history referenced by task records. |
| `docs/05-project-management/06_ISSUES_AND_RESOLUTIONS.md` | `docs/05-project-management/06_ISSUES_AND_RESOLUTIONS.md` | 6 | Related-file references need update. |
| `docs/04-handoffs/07_HANDOFF.md` | `docs/04-handoffs/07_HANDOFF.md` | 6 | Critical future-agent entrypoint. |
| `docs/00-foundation/08_CORE_CONTRACT_DEFINITIONS.md` | `docs/00-foundation/08_CORE_CONTRACT_DEFINITIONS.md` | 5 | Core architecture dependency for later contracts. |
| `docs/02-architecture/09_CONSUMER_MAPPING_AND_MIGRATION_PLAN.md` | `docs/02-architecture/09_CONSUMER_MAPPING_AND_MIGRATION_PLAN.md` | 4 | Referenced by early architecture progression. |
| `docs/02-architecture/scene-systems/10_ECLIPSE_TRANSITION_EXTRACTION_PLAN.md` | `docs/02-architecture/scene-systems/10_ECLIPSE_TRANSITION_EXTRACTION_PLAN.md` | 4 | Referenced by progress and issue records. |
| `docs/02-architecture/scene-systems/11_CONTACT_SCENE_EXTRACTION_PLAN.md` | `docs/02-architecture/scene-systems/11_CONTACT_SCENE_EXTRACTION_PLAN.md` | 4 | Referenced by Contact ownership issues. |
| `docs/02-architecture/scene-systems/12_WORK_SCENE_EXTRACTION_PLAN.md` | `docs/02-architecture/scene-systems/12_WORK_SCENE_EXTRACTION_PLAN.md` | 4 | Referenced by Work ownership issues. |
| `docs/02-architecture/scene-systems/13_EXPERIENCE_DIRECTOR_PLAN.md` | `docs/02-architecture/scene-systems/13_EXPERIENCE_DIRECTOR_PLAN.md` | 4 | Referenced by ExperienceDirector issue and audit. |
| `docs/03-audits/14_EXPERIENCE_DIRECTOR_POST_EXTRACTION_AUDIT.md` | `docs/03-audits/14_EXPERIENCE_DIRECTOR_POST_EXTRACTION_AUDIT.md` | 3 | Referenced as readiness input for scroll planning. |
| `docs/02-architecture/scene-systems/15_SCROLL_ORCHESTRATOR_EXTRACTION_PLAN.md` | `docs/02-architecture/scene-systems/15_SCROLL_ORCHESTRATOR_EXTRACTION_PLAN.md` | 4 | Referenced by progress and handoff. |
| `docs/02-architecture/motion-interaction/16_MOTION_SYSTEM_ARCHITECTURE.md` | `docs/02-architecture/motion-interaction/16_MOTION_SYSTEM_ARCHITECTURE.md` | 4 | Referenced by motion adoption audit. |
| `docs/03-audits/17_MOTION_ADOPTION_AUDIT.md` | `docs/03-audits/17_MOTION_ADOPTION_AUDIT.md` | 3 | Referenced by later interaction planning. |
| `docs/02-architecture/motion-interaction/18_INTERACTION_SYSTEM_ARCHITECTURE.md` | `docs/02-architecture/motion-interaction/18_INTERACTION_SYSTEM_ARCHITECTURE.md` | 4 | Referenced by interaction adoption audit. |
| `docs/03-audits/19_INTERACTION_ADOPTION_AUDIT.md` | `docs/03-audits/19_INTERACTION_ADOPTION_AUDIT.md` | 3 | Referenced by renderer system architecture. |
| `docs/02-architecture/renderer/20_RENDERER_SYSTEM_ARCHITECTURE.md` | `docs/02-architecture/renderer/20_RENDERER_SYSTEM_ARCHITECTURE.md` | 4 | Referenced by renderer contracts and audits. |
| `docs/00-foundation/21_RENDERER_CONTRACTS.md` | `docs/00-foundation/21_RENDERER_CONTRACTS.md` | 5 | Contract dependency for renderer runtime docs. |
| `docs/02-architecture/renderer/22_HERO_FLUID_EXTRACTION_PLAN.md` | `docs/02-architecture/renderer/22_HERO_FLUID_EXTRACTION_PLAN.md` | 4 | Referenced by Hero runtime extraction. |
| `docs/02-architecture/renderer/23_HERO_FLUID_RUNTIME_EXTRACTION.md` | `docs/02-architecture/renderer/23_HERO_FLUID_RUNTIME_EXTRACTION.md` | 4 | Referenced by Hero post-extraction audit. |
| `docs/03-audits/24_HERO_FLUID_POST_EXTRACTION_AUDIT.md` | `docs/03-audits/24_HERO_FLUID_POST_EXTRACTION_AUDIT.md` | 3 | Referenced by RendererManager architecture. |
| `docs/02-architecture/renderer/25_RENDERER_MANAGER_ARCHITECTURE.md` | `docs/02-architecture/renderer/25_RENDERER_MANAGER_ARCHITECTURE.md` | 4 | Referenced by RendererManager implementation/adoption audit. |
| `docs/02-architecture/renderer/26_RENDERER_MANAGER_IMPLEMENTATION.md` | `docs/02-architecture/renderer/26_RENDERER_MANAGER_IMPLEMENTATION.md` | 4 | Referenced by adoption audit and open IDE tabs. |
| `docs/03-audits/27_RENDERER_MANAGER_ADOPTION_AUDIT.md` | `docs/03-audits/27_RENDERER_MANAGER_ADOPTION_AUDIT.md` | 3 | Referenced by visibility architecture. |
| `docs/02-architecture/renderer/28_VISIBILITY_SLEEP_ARCHITECTURE.md` | `docs/02-architecture/renderer/28_VISIBILITY_SLEEP_ARCHITECTURE.md` | 4 | Referenced by runtime sleep report. |
| `docs/03-audits/29_VISIBILITY_SLEEP_RUNTIME.md` | `docs/03-audits/29_VISIBILITY_SLEEP_RUNTIME.md` | 3 | Referenced by project state and handoff. |
| `docs/01-governance/30_DEVELOPMENT_GOVERNANCE.md` | `docs/01-governance/30_DEVELOPMENT_GOVERNANCE.md` | 5 | Must be added to startup/handoff references. |
| `docs/03-audits/contact-link-hover-forensic-audit.md` | `docs/03-audits/contact-link-hover-forensic-audit.md` | 3 | Specialized audit; may be referenced by Contact docs. |
| `docs/06-development/plans/contact-typography-interaction.md` | `docs/06-development/plans/contact-typography-interaction.md` | 2 | Specialized plan; lower central dependency risk. |
| `docs/07-operations/deployment.md` | `docs/07-operations/deployment.md` | 2 | Operational runbook; update any README references if present. |
| `docs/00-foundation/design-principles.md` | `docs/00-foundation/design-principles.md` | 2 | Design reference; may be manually linked by future docs. |
| `docs/07-operations/dev-environment.md` | `docs/07-operations/dev-environment.md` | 2 | Operational runbook; update setup references. |
| `docs/07-operations/environment-snapshot.md` | `docs/07-operations/environment-snapshot.md` | 2 | Snapshot; low risk. |
| `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-addendum-phase-0b.md` | `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-addendum-phase-0b.md` | 4 | Referenced by context and issues. |
| `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-foundation-phase-0c.md` | `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-foundation-phase-0c.md` | 4 | Referenced by context and issues. |
| `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-proposal.md` | `docs/02-architecture/phase-0/portfolio-v2-motion-architecture-proposal.md` | 4 | Referenced by context and issues. |
| `docs/07-operations/troubleshooting.md` | `docs/07-operations/troubleshooting.md` | 2 | Operational runbook; update runbook links. |
| `docs/06-development/specs/work-section-spec.md` | `docs/06-development/specs/work-section-spec.md` | 2 | Feature spec; may be referenced by Work docs. |
| `docs/01-governance/DOCUMENTATION_MAP.md` | `docs/01-governance/DOCUMENTATION_MAP.md` | 5 | DEV-002 output; update after migration. |
| `docs/06-development/plans/DOCUMENTATION_RESTRUCTURE_PLAN.md` | `docs/06-development/plans/DOCUMENTATION_RESTRUCTURE_PLAN.md` | 2 | DEV-002 output; useful until DEV-003 completes. |

---

## Dependency Risks

Critical risks:

- Startup sequence paths in `00_AGENT_BOOTSTRAP.md` and `07_HANDOFF.md` may break future agent onboarding.
- Project state, task registry, progress log, and handoff are high-frequency entrypoints.
- Many docs contain literal `docs/<file>.md` references that must be updated after movement.

High risks:

- Architecture task docs reference previous/next task documents.
- Renderer and visibility docs reference each other across contracts, plans, audits, and runtime reports.
- Historical task names are path-sensitive in progress logs and issue records.

Medium risks:

- Specialized audits and feature specs may be manually referenced but have fewer central dependencies.
- Phase 0 docs are historical but still referenced by context and issue documents.

Low risks:

- Operations docs and environment snapshots have fewer in-repo dependencies.
- Standalone design principles can move early if references are updated.

---

## DEV-003 Recommendation

Create:

```txt
DEV-003: Documentation Physical Migration
```

Objective:

```txt
Physically migrate docs into the approved hierarchy, update all references, and validate discoverability.
```

Deliverables:

```txt
Folder structure created.
Files moved to target locations.

Note:

```txt
docs/runbooks/litellm.md existed outside the approved top-level migration map and was not moved by DEV-003.
```
All docs/... references updated.
Startup sequence updated.
Handoff updated.
Documentation map updated with final paths.
Link/reference validation completed.
```

Required validation:

```txt
find docs -type f | sort
rg "docs/[A-Za-z0-9_./-]+\\.md" docs
rg "00_AGENT_BOOTSTRAP|01_CONTEXT_BRIEF|02_PROJECT_STATE|03_TASK_REGISTRY|07_HANDOFF|04_ARCHITECTURE_DECISIONS|30_DEVELOPMENT_GOVERNANCE" docs
git diff --check
```

Non-goals:

```txt
Do not rewrite document content.
Do not change architecture decisions.
Do not change runtime code.
Do not archive documents unless explicitly approved.
```

---

## Readiness Verdict

Document inventory completed:

```txt
PASS
```

Category structure defined:

```txt
PASS
```

Migration sequence defined:

```txt
PASS
```

Dependency risks identified:

```txt
PASS
```

Ready for physical migration task:

```txt
READY FOR DEV-003
```
