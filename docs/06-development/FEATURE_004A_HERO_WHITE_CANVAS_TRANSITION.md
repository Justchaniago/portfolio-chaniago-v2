# FEATURE-004A - Hero to White Canvas Chapter Transition

Date: 2026-06-07

Status: Implemented

Scope: Dedicated Hero to White Canvas transition layer. No About content reveal redesign, About morph redesign, selector rename, layout rewrite, or About internals ownership change.

## Design Philosophy

This feature separates:

```txt
Transition
```

from:

```txt
Content Reveal
```

The transition creates the feeling of entering a new chapter before the About story begins.

Required experience:

```txt
Hero
↓
Large Rounded White Card
↓
Card rises from below
↓
Card slowly expands
↓
Card covers viewport
↓
White Environment established
↓
Visual breathing moment
↓
Chapter A reveal begins
```

Rejected experience:

```txt
Hero
↓
Card expands
↓
About instantly appears
```

The transition layer does not reveal About content. It creates a temporary transition object, establishes the white environment, then yields ownership back to About.

## Runtime Architecture

```txt
PinnedSections
├── NavRail
├── EnvironmentTransitionLayer
├── Hero
├── About
├── Work
└── Contact
```

`EnvironmentTransitionLayer` is mounted outside Hero and outside About.

It uses:

```txt
position: fixed
pointer-events: none
viewport-sized layer
transition-owned card
transition-owned coverage layer
```

It does not render inside:

```txt
Hero
About
```

## Transition Object Lifecycle

```txt
Create
↓
Rise
↓
Expand
↓
Cover
↓
Handoff
↓
Destroy / hide
```

Runtime objects:

```txt
.environment-transition-layer
.environment-transition-card
.environment-transition-coverage
```

These are transition-owned selectors. They are intentionally separate from About selectors.

## ScrollTrigger Strategy

Single transition trigger:

```txt
trigger: #about-section
start: top bottom
end: top center
scrub: true
```

This creates a transition band as the About section begins entering the viewport, before About content reveal ownership begins.

There are no nested transition ScrollTriggers.

## Geometry

Desktop initial card:

```txt
width: calc(100vw - 80px)
height: 80vh
border-radius: 40px
position: below viewport
```

Mobile initial card:

```txt
width: calc(100vw - 32px)
height: 76vh
border-radius: 24px
position: below viewport
```

Final coverage:

```txt
width: 100vw
height: 100vh
border-radius: 0
scale: 1
```

## Phase Map

### Phase 1 - Card Entry

Progress:

```txt
0.00 -> 0.40
```

Motion:

```txt
yPercent: 110 -> 0
```

Ownership:

```txt
Transition layer only.
```

### Phase 2 - Expansion

Progress:

```txt
0.40 -> 0.75
```

Animated properties:

```txt
width
height
scale
border-radius
```

Target:

```txt
100vw
100vh
radius: 0
```

### Phase 3 - Environment Handoff

Progress:

```txt
0.75 -> 0.85
```

Actions:

```txt
Environment activation requested.
Transition shadow disappears.
Coverage layer becomes fully white.
```

The transition layer does not import About or AboutController. It receives environment handoff callbacks from `PinnedSections`.

### Phase 4 - Settling Zone

Progress:

```txt
0.85 -> 1.00
```

Motion:

```txt
No About content animation.
No Chapter A animation.
No Morph animation.
No Chapter B animation.
```

Only the white transition coverage remains visually still through the end of transition ownership.

## Perceptual Continuity Handoff

`FEATURE-004A-FIX-001` keeps the transition card visually locked after full coverage so users do not see the ownership swap between:

```txt
Transition Layer
↓
About Environment
```

Required perception:

```txt
Card
↓
becomes
↓
White Canvas World
```

Forbidden perception:

```txt
Card disappears
↓
White Canvas appears
```

Continuity rules:

```txt
Coverage complete.
Environment activates underneath the card.
No visible opacity change.
No visible color change.
No visible ownership swap.
Transition card remains locked as the white world.
```

The transition layer now exits only after the About-owned reveal window has started. It does not exit at coverage completion.

## Environment Settling Zone

Purpose:

```txt
Establish the new chapter.
Create anticipation.
Separate transition from content.
Improve perceived quality.
```

Timing:

```txt
The transition-owned settling zone occupies the final segment of the transition trigger.
The existing AboutController reveal starts later, at its own About-owned trigger timing.
```

Benefit:

```txt
The user perceives a new white environment before the About story begins.
```

## AboutController Coordination

`EnvironmentTransitionLayer` does not reveal Chapter A.

Coordination flow:

```txt
Transition coverage reaches handoff threshold.
↓
PinnedSections forwards environment handoff.
↓
AboutEnvironmentLifecycle activates.
↓
AboutController continues existing ownership.
↓
Chapter A reveal begins later through AboutController.
↓
Transition layer quietly fades out after Chapter A is underway.
```

The existing AboutController remains responsible for:

```txt
Chapter A reveal
Morph
Chapter B reveal
About pinning
Mobile About reveal
```

## Governance Compliance

### Transition owns transition objects only

PASS.

The transition owns only:

```txt
.environment-transition-layer
.environment-transition-card
.environment-transition-coverage
```

### About owns About content

PASS.

The transition never animates:

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

### Environment owns environment state

PASS.

Environment activation is routed through `AboutEnvironmentLifecycle` via a handoff callback.

## Comparative Analysis

Apple:

```txt
The transition uses a single physical object and a quiet settling moment, aligning with Apple's preference for clarity and controlled motion.
```

Linear:

```txt
The transition separates system state from content state, matching Linear-style product discipline.
```

Active Theory:

```txt
The transition creates spatial drama through a large object entering and taking over the viewport.
```

Stink Studios:

```txt
The card-to-environment handoff reads as editorial scene direction rather than a basic section fade.
```

Awwwards editorial portfolios:

```txt
The white card creates a chapter break and introduces a new visual environment before narrative content appears.
```

Answer:

```txt
The transition feels like a chapter change, not merely a section animation.
```

Reason:

```txt
The card is temporary, physical, and environment-oriented.
About content remains delayed and separately owned.
```

## Manual Verification Checklist

Hero:

```txt
No card visible at rest before scroll.
```

Entry:

```txt
Card rises from below.
```

Expansion:

```txt
Rounded card expands smoothly.
```

Full Coverage:

```txt
Viewport becomes fully white during transition ownership.
```

Settling Zone:

```txt
No About content animation during transition settling.
```

Chapter A:

```txt
Reveal remains AboutController-owned and begins after transition ownership ends.
```

Ownership:

```txt
Transition never animates About selectors.
```

Mobile:

```txt
Geometry remains balanced.
Radius remains proportional.
No clipping.
```

## Validation

Required validation:

```txt
npx tsc --noEmit
npm run build
git diff --check
```
