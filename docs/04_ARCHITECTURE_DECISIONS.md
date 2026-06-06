# Architecture Decisions

Architecture decisions are immutable once accepted.

To change an accepted decision, create a new ADR that supersedes the old one.

## ADR-001: Repository Documentation Is System Memory

Status:

```txt
Accepted
```

Decision:

Repository documentation is the source of truth for all future agents and contributors.

Reason:

Agents may not share memory, may lose context, and may resume work days later.

Alternatives:

- Chat history as source of truth
- Agent memory as source of truth
- Human memory as source of truth

Tradeoffs:

- More documentation overhead
- Much better continuity and lower context loss

## ADR-002: Dedicated Refactor Branch

Status:

```txt
Accepted
```

Decision:

All refactor work must happen on:

```txt
architecture/v2-motion-refactor
```

Reason:

Main branch must remain stable while architecture experimentation continues.

Tradeoffs:

- Requires branch discipline
- Prevents accidental main branch instability

## ADR-003: ExperienceDirector Owns Experience State

Status:

```txt
Accepted
```

Decision:

Introduce `ExperienceDirector` as the runtime authority for:

```txt
currentScene
currentTransition
experienceMode
interactionPermissions
globalExperienceState
```

It does not own:

```txt
animation
DOM
rendering
scroll logic
```

Reason:

Scroll alone is not sufficient as the source of truth for an agency-grade interactive platform.

## ADR-004: ScrollOrchestrator Owns Scroll State

Status:

```txt
Accepted
```

Decision:

Raw `ScrollTrigger` progress should be owned by `ScrollOrchestrator`, not consumed directly by scenes.

Reason:

Direct progress consumption creates coupling and reverse-scroll bugs.

## ADR-005: Scenes Own Themselves

Status:

```txt
Accepted
```

Decision:

Scenes own their own lifecycle, animation internals, interactions, and renderers.

Scenes must not animate other scenes.

Reason:

Prevents `PinnedSections` or any parent controller from becoming a god timeline.

## ADR-006: Transitions Bridge Scenes

Status:

```txt
Accepted
```

Decision:

Transitions own transition objects only.

They never own scene content.

Reason:

The Eclipse should bridge Work and Contact, not control Work internals or Contact typography.

## ADR-007: GSAP Is Primary Motion Engine

Status:

```txt
Accepted
```

Decision:

GSAP owns:

```txt
scene motion
scroll motion
transitions
choreography
reveal systems
project expansion
eclipse
contact reveal
```

Framer Motion is optional for small UI presence only.

Reason:

The portfolio is cinematic, scroll-linked, and timeline-heavy.

## ADR-008: Renderer Lifecycle Is Required

Status:

```txt
Accepted
```

Decision:

Canvas, WebGL, ASCII, fluid, particles, and shader systems must implement lifecycle controls.

Reason:

Future renderers can otherwise keep running while inactive and collapse performance.

## ADR-009: PerformanceDirector Governs Budgets

Status:

```txt
Accepted
```

Decision:

`PerformanceDirector` owns renderer budgets, pause strategy, resource allocation, and quality policy.

Reason:

Future heavy motion and renderer systems need central governance.

## ADR-010: No Abstractions Without Consumers

Status:

```txt
Accepted
```

Decision:

Do not create future managers, registries, controllers, or services unless there is an active consumer.

Reason:

Avoid empty architecture and speculative complexity.
