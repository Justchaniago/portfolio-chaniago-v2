# Development Governance (DEV-001)

This document is the master governance reference for future development work in the portfolio codebase.

Purpose:

```txt
Improve delivery speed.
Reduce unnecessary abstractions.
Reduce token and implementation cost.
Improve bug-fix accuracy.
Preserve architectural integrity.
Keep future work consumer-driven.
```

This document does not introduce runtime code, features, or abstractions.

---

## 1. Development Philosophy

### Core Rules

Build only what current consumers need.

- A consumer is an existing component, hook, module, scene, renderer, or workflow that must use the implementation now.
- Future consumers may inform naming and boundaries, but they do not justify implementation by themselves.

Prefer adaptation over abstraction.

- Adapt the current owner or adapter first.
- Add a new abstraction only when it removes real duplication, clarifies ownership, or supports more than one current consumer.

Prefer extraction over rewrites.

- Move ownership out of overloaded files incrementally.
- Preserve working behavior while reducing responsibility overlap.

Prefer validation before optimization.

- Fix correctness first.
- Measure or inspect evidence before adding performance mechanisms.

Avoid speculative architecture.

- Do not create managers, contracts, registries, or frameworks for hypothetical features.
- Architecture must follow active ownership pressure, not imagined future scope.

Avoid future-proofing without a real consumer.

- Future-proofing is allowed only as a naming or boundary consideration.
- It is not allowed as a reason to implement unused runtime capabilities.

Optimize for delivery velocity and maintainability.

- Smaller changes are easier to review, test, and recover.
- The best architecture is the smallest architecture that preserves ownership and enables current delivery.

### System Examples

Motion System:

- Good: centralizing repeated duration/ease/stagger values into `motionSystem` and `motionPresets` because current animation consumers needed consistent tokens.
- Avoid: creating a generic animation engine that replaces GSAP timelines before multiple active consumers need that engine.

Interaction System:

- Good: extracting shared pointer state and HoverSweep behavior because Contact hover interactions had real duplicated tracking pressure.
- Avoid: replacing every hover, focus, swipe, and cursor behavior with a universal interaction framework before those consumers are ready.

Renderer System:

- Good: introducing `RendererManager` once `HeroFluidRenderer` became a real timing consumer.
- Good: adding Visibility Sleep for the existing Hero renderer only.
- Avoid: implementing WebGL governance, shader orchestration, particle systems, quality tiers, or post-processing stacks before active runtime consumers exist.

---

## 2. Engineering Decision Framework

Every implementation must be classified before coding.

| Tier | Type | Examples | Planning Depth | Validation Depth | Complexity Budget |
|---|---|---|---|---|---|
| Tier 1 | Bug Fix | visual regression, broken animation, layout issue, state issue | Minimal. Identify expected behavior, actual behavior, affected owner, and suspected cause. | Focused. Reproduce if possible, inspect root cause, validate the changed path, run build if code changed. | Very low. Prefer one owner and the smallest patch. |
| Tier 2 | Improvement | cleanup, optimization, refactor, developer experience | Moderate. Define ownership gain, affected consumers, risk, rollback path, and non-goals. | Moderate. Build plus targeted static or runtime checks relevant to touched systems. | Low to medium. Allowed only when complexity buys measurable maintainability. |
| Tier 3 | Feature | new section, new interaction, new gallery behavior, new CMS capability | Full. Define objective, UX impact, owners, consumers, dependencies, risks, validation, and rollout boundary. | Full. Build plus targeted behavior checks. Visual/browser validation only when the feature affects visual output and the task permits it. | Medium. New abstractions require active consumers and clear ownership payoff. |

Classification rules:

- If user-facing behavior is broken, default to Tier 1.
- If behavior is unchanged but code quality changes, default to Tier 2.
- If behavior or capability is added, default to Tier 3.
- If a task mixes tiers, execute the smallest safe Tier 1 fix first unless the user explicitly requests broader work.

---

## 3. Anti Over-Engineering Rules

Explicit prohibitions:

- No new manager without multiple current consumers or one current consumer with clear ownership pressure that cannot be solved locally.
- No new contract without current implementation pressure.
- No new registry without active registration/deregistration needs.
- No extraction without measurable ownership gain.
- No optimization before measurement or concrete evidence.
- No generic utility for a single use case.
- No architecture created solely for hypothetical future needs.
- No broad refactor while fixing a narrow bug.
- No runtime migration hidden inside a documentation task.
- No feature implementation hidden inside architecture planning.

Concrete examples:

Motion System:

- Acceptable: motion tokens and presets because multiple existing animations consumed repeated timing/easing concepts.
- Not acceptable: a universal scene animation runtime before scenes required it.

Interaction System:

- Acceptable: shared pointer state and `HoverSweep` because Contact had an active consumer and a real duplicated interaction problem.
- Not acceptable: migrating ProjectCard gestures, cursor behavior, and navigation interactions in the same task without proof that they share the same ownership problem.

Renderer System:

- Acceptable: `RendererManager` after Hero fluid timing ownership became a concrete problem.
- Acceptable: Visibility Sleep after Hero fluid had a real registered renderer loop.
- Not acceptable: implementing shaders, particles, WebGL context pooling, post-processing, or quality scaling before those consumers exist.

RendererManager rule:

```txt
RendererManager may coordinate timing, registration, visibility, and lifecycle.
RendererManager must not own canvas, ctx, rendering, buffers, physics, resize, or disturbance logic.
```

---

## 4. Bug Fix Governance

Bug fixes must follow this sequence:

1. Reproduce
2. Isolate
3. Root Cause Analysis
4. Smallest Possible Fix
5. Validation
6. Documentation, if required

### Required Behavior

Reproduce:

- Confirm the symptom through code inspection, tests, logs, local run, or user-provided evidence.
- If reproduction is impossible, state the assumption and reduce the fix scope.

Isolate:

- Identify the smallest owner responsible for the failure.
- Avoid crossing module boundaries without evidence.

Root Cause Analysis:

- Explain why the bug occurs.
- Distinguish root cause from nearby symptoms.

Smallest Possible Fix:

- Change the least code needed to fix the proven cause.
- Preserve existing ownership boundaries.

Validation:

- Run the narrowest useful validation.
- Run build when TypeScript/runtime code changes.
- Do not claim visual parity unless visual validation was actually performed and allowed.

Documentation:

- Update docs only when the bug changes architecture, ownership, known risks, or operational guidance.

### Explicitly Prohibited

- Rewrite-first approaches.
- Architecture-first approaches.
- Shotgun fixes.
- Multi-file refactors without proof.
- Replacing working systems because a smaller fix is inconvenient.
- Fixing adjacent issues not requested by the user.

### Severity Levels

Critical:

- App cannot build, load, or perform a primary user journey.
- Data loss, security issue, or severe production blocker.
- Requires immediate fix and direct validation.

High:

- Major interaction, animation, route, or state flow is broken.
- Important user-facing experience is degraded.
- Fix should be narrow and prioritized.

Medium:

- Noticeable bug with workaround or limited surface area.
- Should be fixed when it affects current delivery.

Low:

- Minor visual inconsistency, cleanup, dead code, or non-blocking edge case.
- Batch with related work only when safe.

---

## 5. Feature Delivery Governance

### Discovery

Understand:

- user objective
- intended UX impact
- affected systems
- current owners
- dependencies
- non-goals

Required output before implementation:

```txt
What user value does this feature deliver?
What existing owner should contain it?
What systems does it touch?
What must not change?
```

### Planning

Identify:

- ownership boundary
- active consumers
- data flow
- lifecycle flow
- risks
- validation strategy
- rollback path

Planning depth must match feature risk:

- Small UI additions need lightweight planning.
- Cross-system features need explicit ownership and validation mapping.

### Implementation

Rules:

- Build the smallest viable implementation.
- Preserve ownership boundaries.
- Use existing local patterns.
- Keep infrastructure isolated from presentation.
- Avoid premature abstraction.
- Do not introduce a manager, contract, or registry unless the feature needs it now.

### Validation

Validation requirements:

- TypeScript/runtime code changes require build validation.
- Visual changes require visual validation only when the task permits it.
- Architecture changes require documentation validation and consistency checks.
- Data or backend changes require repository/usecase/infrastructure boundary verification.

Validation report must state:

```txt
What was run.
What passed.
What was not run.
What remains unverified.
```

---

## 6. Agent Workflow Governance

### Before Coding

Agents must:

- inspect current architecture
- inspect ownership boundaries
- inspect active systems
- inspect relevant docs and recent state
- identify the current consumer
- identify non-goals
- check for existing patterns before creating new ones

Agents must not:

- assume architecture from memory alone
- create missing abstractions by default
- start implementation from a plan without reading code
- broaden task scope without user approval
- run visual/browser validation when explicitly forbidden

### During Coding

Agents must:

- implement consumer-first
- preserve boundaries
- minimize changed surface area
- work incrementally
- keep runtime and documentation tasks separate
- avoid unrelated cleanup
- avoid hidden feature work

Agents must not:

- move business logic into UI
- access databases directly from UI
- mix presentation, application, and infrastructure layers
- introduce duplicate RAF loops or duplicate lifecycle owners
- create future systems without active consumers

### After Coding

Agents must:

- validate build when code changed
- run task-specific checks
- document findings when required
- report risks and unverified areas
- state visual parity as `UNVERIFIED` unless visual validation was performed and allowed
- leave the worktree uncommitted unless the user explicitly asks for Git operations

---

## 7. ROI Framework

Every proposed task should be scored from 1 to 5:

| Factor | 1 | 3 | 5 |
|---|---|---|---|
| User Value | Little user-visible or workflow value | Supports a known workflow or visible improvement | Strong direct impact on primary experience or delivery |
| Architectural Value | No ownership improvement | Clarifies or reduces one ownership problem | Removes major coupling or enables reliable future delivery |
| Risk | High risk, unclear blast radius | Moderate risk with known validation path | Low risk and contained |
| Complexity | Large or unclear complexity | Moderate complexity | Small, understandable change |
| Maintenance Cost | Adds ongoing burden | Neutral | Reduces future maintenance |

Decision guidance:

High ROI:

- High user or architectural value.
- Low to moderate risk.
- Clear owner and validation path.
- Should be prioritized.

Medium ROI:

- Useful but not urgent.
- Scope should be reduced before implementation.
- Good candidate for batching with related work.

Low ROI:

- Low value, high complexity, or speculative future benefit.
- Should be deferred or rejected.

Rule:

```txt
Do not implement low-ROI architecture.
Do not optimize low-ROI paths.
Do not create abstractions for low-ROI future needs.
```

---

## 8. Feature Readiness Criteria

A feature is allowed to begin implementation only when these are clear:

Architecture readiness:

- Existing owners are known.
- Required boundaries are documented or obvious from code.
- No unresolved architecture blocker exists.

Ownership clarity:

- Presentation owner is known.
- Application/usecase owner is known when business logic exists.
- Infrastructure owner is known when external services exist.
- Renderer, interaction, motion, and scene ownership are separated when relevant.

Dependency readiness:

- Required data, assets, APIs, components, and state flows exist or are explicitly part of scope.
- Missing dependencies are documented before implementation.

Validation strategy:

- Build/test requirements are known.
- Browser or visual validation requirements are known and allowed.
- Unverified areas can be stated honestly.

Scope readiness:

- Non-goals are explicit.
- Protected areas are listed.
- Rollback or containment path is known for risky work.

Stop condition:

```txt
If a feature requires unclear ownership, missing dependencies, or speculative architecture, stop and document the blocker before coding.
```

---

## 9. Permanent Governance Rules

Future agents must treat this document as binding project guidance.

Default decision:

```txt
Smallest consumer-driven implementation that preserves ownership.
```

Default rejection:

```txt
Speculative abstractions without active consumers.
```

Default validation:

```txt
Build for code changes.
Targeted checks for touched systems.
Explicitly state what remains unverified.
```

Default documentation:

```txt
Update architecture docs only when ownership, workflow, risk, or future handoff changes.
```

Final rule:

```txt
Architecture exists to make delivery safer and faster.
If architecture slows delivery without reducing real risk, it is not justified.
```
