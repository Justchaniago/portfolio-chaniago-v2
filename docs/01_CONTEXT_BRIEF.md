# Context Brief

## Project Summary

`Portfolio V2` is an interactive personal portfolio currently around 40% complete.

The project is evolving from:

```txt
Portfolio Website
```

into:

```txt
Agency-Grade Interactive Experience Platform
```

The current experience includes:

- Hero scene with fluid interaction direction
- About portrait/editorial scene
- Work scene with project expansion system
- Eclipse transition concept
- Contact scene with `JUSTCHANIAGO` identity
- Custom cursor concept
- Motion-heavy storytelling flow

## Mission

Preserve:

- UI
- UX
- storytelling
- visual language
- typography direction
- interaction concepts
- existing motion concepts

Refactor:

- architecture foundation
- motion ownership
- scene ownership
- transition ownership
- renderer lifecycle
- interaction lifecycle
- performance governance

This is not a redesign.

This is not a visual rewrite.

## Architecture Summary

Approved direction:

```txt
ScrollTrigger
↓
ScrollOrchestrator
↓
ExperienceDirector
├─ SceneOrchestrator
├─ TransitionOrchestrator
├─ OverlayOrchestrator
├─ RendererRegistry
├─ InteractionRegistry
└─ PerformanceDirector
```

Approved layers:

```txt
ExperienceDirector
ScrollOrchestrator
Scene Layer
Transition Layer
Interaction Layer
Renderer Layer
Motion Layer
Performance Layer
Overlay Layer
```

## Current Refactor Goal

Build the V2 motion architecture foundation incrementally while preserving the current experience.

First implementation should focus on:

```txt
contracts
orchestration boundaries
documentation
ownership clarity
```

Not:

```txt
visual redesign
large file movement
empty abstractions without consumers
```

## Approved Foundations

Approved architecture documents:

- `docs/portfolio-v2-motion-architecture-proposal.md`
- `docs/portfolio-v2-motion-architecture-addendum-phase-0b.md`
- `docs/portfolio-v2-motion-architecture-foundation-phase-0c.md`

Approved verdict:

```txt
READY FOR IMPLEMENTATION
```

## Major Constraints

- Work must happen on `architecture/v2-motion-refactor`.
- Main branch remains stable.
- Preserve current UI and UX unless explicitly approved.
- Do not re-audit Phase 0A, Phase 0B, or Phase 0C.
- Architecture changes require ADR supersession.
- Documentation is repository memory.
- Do not create abstractions without active consumers.

## Current Milestone

Phase 1 should prepare the refactor foundation:

```txt
Documentation baseline
Architecture contracts
Ownership boundaries
Incremental migration plan
```
