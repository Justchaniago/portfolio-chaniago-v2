# AUDIT-ABOUT-003 - Timeline Ownership Migration Audit

Date: 2026-06-07

Status: Complete

Scope: Documentation-only ownership and migration audit for moving About animation ownership from `PinnedSections.tsx` to a future About-owned controller without changing behavior.

Non-goals:
- No production code changes.
- No GSAP timeline changes.
- No ScrollTrigger changes.
- No layout, styling, selector, component, or architecture changes.

## Executive Verdict

Current state:

```txt
About owns DOM
PinnedSections owns About behavior
```

FEATURE-003G created explicit DOM boundaries:

```txt
About.tsx
├─ AboutEnvironment
├─ Shared Morph Boundary
├─ AboutChapterA
└─ AboutChapterB
```

The primary remaining bottleneck is runtime ownership. `PinnedSections.tsx` still owns desktop About baselines, desktop pinning, desktop scrubbed `aboutTl`, mobile intro reveal, mobile Chapter B reveal, and About theme mutation.

Target state:

```txt
PinnedSections
├─ Hero
├─ Work
├─ Contact
└─ AboutController
```

Transition readiness after migration: `PARTIAL`, moving toward `YES` only after the controller boundary and theme lifecycle are explicit.

## Evidence Sources

Verified references only:

- `components/sections/About.tsx`
- `components/sections/PinnedSections.tsx`
- `components/about/AboutEnvironment.tsx`
- `components/about/AboutChapterA.tsx`
- `components/about/AboutChapterB.tsx`

Governance rules applied:

```txt
Scenes own themselves.
Transitions own transition objects only.
Scenes never animate other scenes.
Transitions never animate scene content.
Global overlays remain globally owned.
```

## Deliverable 1 - Current Timeline Ownership Map

```txt
PinnedSections
├─ Shared observers
├─ Hero timelines
├─ About timelines
├─ Contact triggers
└─ Section composition
```

| Runtime Unit | Current Owner | Trigger | Pin | Scrub | Controlled Selectors / State | Side Effects | Dependencies |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Section observer triggers | `PinnedSections.tsx` | `#hero-section`, `#about-section`, `#work-section`, `#contact-section` | No | No | `window.__activeSection`, `activeSectionChange` | Publishes global active section | Section IDs and global listeners |
| Global scroll progress publisher | `PinnedSections.tsx` | `document.documentElement` | No | `true` | `window.__scrollTriggerProgress`, `scrollTriggerProgress` | Publishes global progress | Document scroll geometry and global listeners |
| Hero text fade | `PinnedSections.tsx` | `#hero-section` | No | `true` | `.hero-text-content` | Hero content opacity/y exit | Hero DOM selector |
| Hero canvas fade | `PinnedSections.tsx` | `#hero-section` | No | `true` | `.hero-fluid-canvas` | Hero canvas opacity exit | Hero DOM selector |
| Desktop About baseline setup | `PinnedSections.tsx` | media query `(min-width: 769px)` | N/A | N/A | `.about-portrait-img`, `.about-eyebrow`, `.about-char`, `.about-description`, `.about-portrait-left-img`, `.about-sub-content` | Establishes hidden/reveal baselines | About DOM selectors |
| Desktop About `aboutTl` | `PinnedSections.tsx` | `#about-section` | Yes | `0.5` | Chapter A reveal, morph, Chapter B reveal, `html` theme vars | Pins About and mutates visual state | About DOM, CSS vars, ScrollTrigger |
| Mobile About baseline setup | `PinnedSections.tsx` | media query `(max-width: 768px)` | N/A | N/A | `.about-portrait-img`, `.about-eyebrow`, `.about-description`, `.about-char`, `.about-sub-content` | Establishes mobile hidden states | About DOM selectors |
| Mobile intro `introTl` | `PinnedSections.tsx` | `#about-section` | No | No | `.about-portrait-img`, `.about-eyebrow`, `.about-char`, `.about-description` | Reveals mobile Chapter A | About DOM selectors |
| Mobile sub-content trigger | `PinnedSections.tsx` | `.about-sub-content` | No | No | `.about-sub-content` | Reveals mobile Chapter B and pointer events | AboutChapterB selector |
| Contact reveal trigger | `PinnedSections.tsx` | `#contact-section` | No | No | `contactScene.enter()`, `contactScene.exit()` | Starts/stops Contact reveal | Contact scene lifecycle |
| Contact theme reset trigger | `PinnedSections.tsx` | `#contact-section` | No | No | `html` CSS variables | Resets light theme leaving Contact upward | Global theme vars |

Work note:

`PinnedSections.tsx` renders `ProjectShowcase`, but current Work-specific ScrollTriggers/timelines are not in the inspected `PinnedSections.tsx` body. They remain outside this About migration scope.

## Deliverable 2 - About Runtime Dependency Graph

```txt
PinnedSections.tsx
└─ gsap.matchMedia()
   ├─ Desktop branch
   │  ├─ gsap.set baselines
   │  │  ├─ AboutChapterA selectors
   │  │  ├─ Shared Morph Boundary selectors
   │  │  └─ AboutChapterB selectors
   │  └─ aboutTl
   │     ├─ trigger: #about-section
   │     ├─ pin: true
   │     ├─ scrub: 0.5
   │     ├─ Environment/theme variables
   │     ├─ Chapter A reveal
   │     ├─ Morph state
   │     └─ Chapter B reveal
   │
   └─ Mobile branch
      ├─ gsap.set baselines
      ├─ introTl
      │  ├─ trigger: #about-section
      │  └─ Chapter A + primary portrait reveal
      └─ sub-content trigger
         ├─ trigger: .about-sub-content
         └─ Chapter B reveal
```

Direct selector dependencies:

```txt
.about-portrait-img
.about-portrait-left-img
.about-portrait-trigger
.about-editorial-text
.about-eyebrow
.about-char
.about-description
.about-sub-content
.sub-section-eyebrow
.sub-section-focus
.sub-section-metrics
.sub-section-stack
html
#about-section
```

Baseline dependencies:

- Desktop `.about-portrait-img` starts clipped, translated, and hidden.
- Desktop `.about-portrait-left-img` starts translated right and hidden.
- Desktop `.about-sub-content` starts hidden.
- Desktop text children start hidden via `.about-eyebrow`, `.about-char`, and `.about-description`.
- Mobile `.about-portrait-img`, text, chars, and `.about-sub-content` receive separate baselines.

Media-query dependencies:

- Desktop branch owns pinned scrubbed timeline.
- Mobile branch owns independent reveal timelines/triggers.
- `About.tsx` still owns mobile CSS overrides for `.about-editorial-text`, portraits, `.about-sub-content`, `.about-glass-overlay`, and `.sub-section-focus-grid`.

Global CSS variable dependencies:

- Desktop `aboutTl` mutates `html` theme variables for the light About environment.
- `.about-section-container`, Chapter A, and Chapter B consume those variables.
- Contact theme reset also mutates `html` variables, so theme lifecycle is cross-scene.

Window event dependencies:

- `PinnedSections.tsx` publishes `activeSectionChange`.
- `PinnedSections.tsx` publishes `scrollTriggerProgress`.
- These are global overlay/navigation concerns, not About-owned scene animation concerns.

Coupling points:

| Coupling Point | Risk |
| --- | --- |
| `aboutTl` controls Environment, Chapter A, Morph, Chapter B, and theme vars | About cannot own itself until this is split behind one About boundary. |
| `.about-portrait-img` participates in Chapter A and Morph | Portrait migration is high risk. |
| `.about-sub-content` is Chapter B DOM but externally revealed | Chapter B remains behavior-external. |
| `html` theme mutation is embedded in About timeline | Theme lifecycle cannot be treated as pure About content. |
| Desktop pinning lives with parent section composition | Pin migration can alter scroll geometry. |

## Deliverable 3 - Ownership Classification Table

### Keep In PinnedSections

| Responsibility | Classification | Justification |
| --- | --- | --- |
| Section rendering/composition | Keep in `PinnedSections` | Parent still composes Hero, About, Work, Contact sections. |
| Active section observer | Keep in `PinnedSections` for now | It publishes global navigation state and is not About-specific. |
| Global scroll progress publisher | Keep in `PinnedSections` for now | It feeds global overlays such as navigation progress. |
| Hero text fade | Keep in `PinnedSections` until HeroScene extraction | Not About-specific. |
| Hero fluid canvas fade | Keep in `PinnedSections` until HeroScene extraction | Not About-specific. |
| Contact reveal trigger | Keep in `PinnedSections` or Contact scene orchestration | Not part of About ownership migration. |
| Contact theme reset trigger | Shared contract | Cross-scene theme concern; should not move blindly into About. |

### Move To AboutController

| Responsibility | Classification | Justification |
| --- | --- | --- |
| Desktop About baseline setup | Move to `AboutController` | Targets About-owned DOM only. |
| Desktop `aboutTl` | Move to `AboutController` | Owns Chapter A, Morph, Chapter B animation. |
| Desktop About pinning | Move to `AboutController` with caution | Pinning is About scene behavior, but scroll geometry risk is high. |
| Mobile About baseline setup | Move to `AboutController` | Targets About-owned DOM only. |
| Mobile intro `introTl` | Move to `AboutController` | Owns About Chapter A reveal behavior. |
| Mobile sub-content trigger | Move to `AboutController` | Owns About Chapter B mobile reveal behavior. |
| About cleanup for timelines/triggers | Move to `AboutController` | About-created timelines should be cleaned by About owner. |

### Shared Contract

| Responsibility | Classification | Justification |
| --- | --- | --- |
| Theme lifecycle | Shared contract | About needs light environment state, but `html` variables affect more than About. |
| Active section publication | Shared contract | About may report readiness/visibility later, but global active section state remains overlay/runtime-owned. |
| ScrollTrigger plugin instance | Shared runtime | AboutController may create About triggers, but plugin registration and global scroll policy remain shared. |
| Viewport mode | Shared contract | AboutController needs desktop/mobile mode; global responsive policy should remain centralized or explicit. |

## Deliverable 4 - Controller Boundary Design

Future controller:

```txt
AboutController
```

### Inputs

```txt
root section element or stable selector: #about-section
viewport mode: desktop | mobile
reduced motion flag if introduced later
theme lifecycle adapter
GSAP / ScrollTrigger runtime
About DOM selector contract
```

### Outputs

```txt
Environment state: light environment requested/active
Chapter A state: hidden | revealing | visible | exiting
Morph state: idle | active | complete
Chapter B state: hidden | revealing | visible
cleanup result: timelines/triggers killed
```

### Internal Responsibilities

```txt
desktop baseline setup
desktop timeline ownership
desktop About pinning
mobile baseline setup
mobile intro reveal
mobile Chapter B reveal
About-specific ScrollTrigger creation
About-specific cleanup
About selector validation in development/audit mode
```

### Forbidden Responsibilities

```txt
Hero transition
Hero animations
Work animations
Contact animations
NavRail ownership
MorphNav ownership
global progress publishing
global active section publication
direct animation of non-About scene content
transition object ownership
```

Boundary rule:

`PinnedSections` may instantiate or call `AboutController`, but must not know About internal selectors after migration.

## Deliverable 5 - Migration Strategy

Options:

```txt
Option A: Move desktop timeline first
Option B: Move mobile timelines first
Option C: Create AboutController shell first
```

Chosen option: `Option C - Create AboutController shell first`.

Why:

- It creates an ownership seam without moving behavior immediately.
- It allows parity tests against the existing selector/timeline behavior.
- It avoids starting with desktop pinning, the highest scroll-geometry risk.
- It avoids starting with mobile timelines, which would split ownership by viewport and leave desktop About internals in the parent.

Recommended order:

```txt
1. Create no-op AboutController shell and selector contract.
2. Move selector constants/baseline definitions into controller without behavior changes.
3. Move mobile intro and mobile sub-content timelines.
4. Move desktop baseline setup.
5. Move desktop aboutTl without changing timeline values.
6. Move desktop About pinning only as part of the exact desktop aboutTl move.
7. Introduce theme lifecycle adapter, but keep values and timing identical.
8. Remove direct About selectors from PinnedSections after parity verification.
```

## Deliverable 6 - Risk Analysis

| Step | Risk Level | Expected Regressions | Selector Break Risk | Pinning Risk | Mobile Risk | Theme Risk |
| --- | --- | --- | --- | --- | --- | --- |
| No-op `AboutController` shell | Low | None if unused/pass-through | Low | Low | Low | Low |
| Move selector constants/baselines | Medium | Initial state drift if values differ | Medium | Low | Medium | Low |
| Move mobile intro timeline | Medium | Mobile reveal timing drift | Medium | Low | High | Low |
| Move mobile sub-content trigger | Medium | Chapter B reveal/pointer-events drift | Medium | Low | High | Low |
| Move desktop baseline setup | High | Desktop hidden/reveal state drift | High | Medium | Low | Medium |
| Move desktop `aboutTl` | High | Chapter A, Morph, Chapter B timing drift | High | High | Low | High |
| Move desktop pinning | Critical | Scroll height, pin spacer, scrub progress drift | Medium | Critical | Low | Medium |
| Introduce theme lifecycle adapter | High | Background/text/card color timing drift | Low | Medium | Medium | High |
| Remove About selectors from `PinnedSections` | Medium | Missed selector or stale cleanup | Medium | Medium | Medium | Medium |

Mitigations:

- Preserve selector strings exactly until after parity is proven.
- Preserve every timeline position, duration, ease, start, end, scrub, and pin option.
- Compare desktop and mobile screenshots at Chapter A, mid-morph, and Chapter B states.
- Run selector-count checks before and after migration.
- Treat theme lifecycle as shared until a dedicated theme policy exists.

## Deliverable 7 - Transition Readiness Reassessment

Can we safely begin planning:

```txt
Hero
↓
Environment Transition Layer
↓
White Canvas Environment
↓
Chapter A
```

after Timeline Ownership Migration?

Answer: `PARTIAL`.

Justification:

- Timeline ownership migration would remove the biggest blocker: `PinnedSections` animating About internals.
- Planning can begin once AboutController owns About baselines, reveal timelines, morph state, and cleanup.
- Implementation should still wait until theme lifecycle is explicit, because the white canvas is currently tied to global `html` variables.
- Transition design must not target `.about-char`, `.about-portrait-img`, `.about-sub-content`, or other scene content.

Readiness improves to `YES` only when:

```txt
AboutController owns About internals
Theme/environment lifecycle has a stable contract
EnvironmentTransitionLayer owns transition objects only
Chapter A reveal remains About-owned
```

## Deliverable 8 - Target Architecture

```txt
HeroScene
↓
EnvironmentTransitionLayer
↓
AboutEnvironment
↓
AboutChapterA
↓
AboutMorphController
↓
AboutChapterB
↓
GlobalOverlayLayer
```

| Layer | Owner | Responsibilities | Allowed Interactions | Forbidden Interactions |
| --- | --- | --- | --- | --- |
| `HeroScene` | Future Hero owner | Hero content, Hero renderer eligibility, Hero exit state | Emits scene exit readiness | Animate About content |
| `EnvironmentTransitionLayer` | Future transition module | Transition objects, coverage state, handoff timing | Reports covered/complete to runtime | Animate About typography, portraits, Chapter B |
| `AboutEnvironment` | About scene/controller | Background, glow, glass, light environment state | Consume theme lifecycle contract | Own Hero transition or Chapter A text reveal |
| `AboutChapterA` | About scene/controller | Editorial text, chars, intro copy, intro reveal state | Receive AboutController state | Own transition coverage or Chapter B reveal |
| `AboutMorphController` | About scene/controller | A to B state bridge, portrait morph, Chapter A exit, Chapter B entry | Coordinate About-owned chapter states | Animate Hero/Work/Contact or global overlays |
| `AboutChapterB` | About scene/controller | Focus, metrics, stack, CTA visibility | Receive AboutController state | Own global navigation or Hero transition |
| `GlobalOverlayLayer` | Navigation/overlay runtime | `NavRail`, `MorphNav`, active section UI, progress UI | Consume active/progress events | Animate scene internals |

## Current Governance Violations

| Violation | Current State | Target Correction |
| --- | --- | --- |
| Scene internals animated by parent | `PinnedSections.tsx` animates About selectors directly | `AboutController` owns About selector/timeline internals |
| Hidden state ownership | About hidden/reveal baselines live outside About modules | Baselines move into AboutController |
| Multi-layer timeline ownership | `aboutTl` owns Environment, Chapter A, Morph, Chapter B | AboutController owns a coordinated About timeline, later split internally |
| Global theme embedded in scene timeline | `aboutTl` mutates `html` variables | Theme lifecycle becomes shared contract |
| Transition readiness ambiguity | Future transition could target About internals | Transition layer owns transition objects only |

Acceptable current ownership:

- Global active section events remain globally owned.
- Global progress publishing remains globally owned.
- `NavRail` and `MorphNav` remain global overlays.

## Final Migration Answer

How do we move About animation ownership from `PinnedSections.tsx` to an About-owned controller without changing behavior?

```txt
Create AboutController shell first.
Move behavior in parity-preserving increments.
Keep every selector, timing value, ScrollTrigger option, baseline, and theme value identical.
Move theme lifecycle last.
Do not begin Hero -> Environment transition implementation until AboutController owns About internals.
```

Expected outcome:

```txt
Current State
↓
About DOM extracted
↓
Animation ownership still external
↓
AboutController owns About
↓
Hero -> Environment Transition planning can safely proceed
```
