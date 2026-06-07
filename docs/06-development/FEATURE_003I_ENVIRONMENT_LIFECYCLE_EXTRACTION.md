# FEATURE-003I - About Environment Lifecycle Extraction

## Summary

FEATURE-003I extracts About environment lifecycle ownership from About content animation ownership.

This is an ownership migration only:

- No visual redesign.
- No animation redesign.
- No timing redesign.
- No selector renames.
- No layout changes.
- No Hero to White Canvas transition implementation.

The current runtime output is intended to remain visually identical.

## Current State

Before this extraction, `AboutController` owned both content animation and environment side effects:

```txt
AboutController
├── Desktop baseline setup
├── Desktop Chapter A reveal
├── Desktop morph phase
├── Desktop Chapter B reveal
├── Mobile baseline setup
├── Mobile Chapter A reveal
├── Mobile Chapter B reveal
└── About theme mutation
```

The main coupling point was the desktop About timeline:

```txt
About timeline
↓
theme variable tween on html
↓
white canvas environment appearance
```

That made environment state a side effect of the content timeline.

## New Architecture

The runtime ownership now separates environment lifecycle from content animation:

```txt
AboutController
├── AboutEnvironmentLifecycle
├── Chapter A reveal
├── Morph phase
└── Chapter B reveal
```

`AboutController` remains responsible for:

- Desktop About baselines.
- Desktop About timeline and pinning.
- Chapter A reveal.
- Morph phase.
- Chapter B reveal.
- Mobile intro reveal.
- Mobile Chapter B reveal.

`AboutEnvironmentLifecycle` is responsible for:

- Environment activation state.
- Environment deactivation state.
- About theme variable lifecycle.
- Environment state inspection.

## Dependency Relationship

```txt
PinnedSections
↓
createAboutController()
↓
AboutController
↓
createAboutEnvironmentLifecycle()
```

The controller requests environment activation:

```txt
environment.activate({ timeline: aboutTl, position: 0.1 })
```

The environment lifecycle owns the theme values and writes the same tween into the existing timeline at the same position. This preserves the existing scroll-linked timing while removing theme ownership from the content animation code.

## Environment State Machine

```txt
inactive
↓
activating
↓
active
↓
deactivating
↓
inactive
```

State meanings:

```txt
inactive
Environment has no active lifecycle operation.

activating
Environment activation has been requested and the theme activation tween is in progress.

active
Environment activation completed.

deactivating
Environment deactivation has been requested.
```

The state machine is intentionally independent from Chapter A, Morph, and Chapter B content selectors.

## Selector Boundary

`AboutEnvironmentLifecycle` may own:

```txt
html
documentElement
theme variables
.about-section-container
```

Current implementation touches:

```txt
html
```

`AboutEnvironmentLifecycle` must not own:

```txt
.about-char
.about-editorial-text
.about-description
.about-portrait-img
.about-portrait-left-img
.about-sub-content
.sub-section-focus
.sub-section-metrics
.sub-section-stack
```

Those remain `AboutController` content-animation ownership.

## Preserved Theme Contract

The extracted environment lifecycle preserves the existing values exactly:

```txt
--color-bg: #FFFFFF
--color-text-1: #0A0A0A
--color-text-2: #444444
--color-border: rgba(10, 10, 10, 0.15)
--color-accent: #3F702A
--text-shadow-glow: 0 2px 12px rgba(10, 10, 10, 0.02)
--color-card-bg: rgba(255, 255, 255, 0.35)
--color-card-shadow: 0 8px 32px rgba(10, 10, 10, 0.03)
--color-card-shadow-hover: 0 12px 40px rgba(10, 10, 10, 0.05)
--color-text-reveal-bg: rgba(10, 10, 10, 0.12)
ease: power2.inOut
duration: 0.3
timeline position: 0.1
```

## Governance Compliance

```txt
Transitions own transition objects only.
Scenes own scene content.
Environment owns environment state.
```

Current compliance after FEATURE-003I:

```txt
Hero Scene
↓
Environment Transition Layer (future)
↓
About Environment Lifecycle
↓
About Chapter A
↓
About Morph
↓
About Chapter B
```

The environment lifecycle can now be reasoned about without reading Chapter A, Morph, or Chapter B content animation logic.

## Transition Readiness Assessment

Can Hero to White Canvas be implemented without touching Chapter A, Morph, or Chapter B?

```txt
YES
```

Justification:

- The white environment lifecycle now has an explicit owner.
- About theme variables are no longer embedded directly in Chapter A, Morph, or Chapter B animation code.
- The future transition layer can coordinate with environment activation instead of animating About content internals.
- Chapter A, Morph, and Chapter B selectors remain owned by `AboutController`.

Implementation caution:

The future Hero to White Canvas transition must still avoid taking ownership of `.about-char`, `.about-editorial-text`, `.about-description`, `.about-portrait-img`, `.about-portrait-left-img`, `.about-sub-content`, and Chapter B selectors.

## Validation Checklist

Required validation for this feature:

```txt
npx tsc --noEmit
npm run build
git diff --check
```

Runtime verification scope:

- Desktop About visuals remain identical.
- Mobile About visuals remain identical.
- Chapter A reveal unchanged.
- Morph unchanged.
- Chapter B reveal unchanged.
- Pinning unchanged.
- Scroll geometry unchanged.
- Theme appearance unchanged.
- No selector regressions.
