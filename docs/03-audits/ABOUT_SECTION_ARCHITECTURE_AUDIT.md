# AUDIT-ABOUT-001 - About Section Architecture & Ownership Audit

Date: 2026-06-07

Status: Complete

Scope: Documentation-only audit of the current committed About section architecture before any further Hero to About transition redesign.

Non-goals:
- No production code changes.
- No timeline changes.
- No layout or transition redesign.
- No selector, animation, or refactor work.

## Executive Verdict

The current implementation is not a clean two-step `Hero -> About` model, and it is not yet a cleanly separated `Hero -> White Canvas Environment -> Chapter A -> Morph -> Chapter B` model either.

Current reality:

```txt
Hero
↓
About section
  ├─ CSS/theme-driven white canvas environment
  ├─ Chapter A DOM
  ├─ embedded desktop morph phase
  └─ Chapter B DOM
```

The white canvas, Chapter A, morph phase, and Chapter B are visually distinguishable, but they are not independent scene modules. `About.tsx` owns DOM and inline visual styling. `PinnedSections.tsx` owns the active GSAP setup, ScrollTriggers, pinning, desktop/mobile reveal timelines, and theme variable mutation.

Transition readiness: `PARTIAL`.

## Evidence Sources

- `components/sections/About.tsx`
- `components/sections/PinnedSections.tsx`
- `docs/01-governance/04_ARCHITECTURE_DECISIONS.md`
- `docs/00-foundation/08_CORE_CONTRACT_DEFINITIONS.md`

Relevant governance rules:

- Scenes own lifecycle, animation internals, interactions, and renderers.
- Scenes must not animate other scenes.
- Transitions own transition objects only.
- Transitions never own scene content.
- A transition must not animate scene typography, scene renderers, hover animation, or scene content visibility beyond lifecycle events.

## Deliverable 1 - Scene Architecture Map

Verified current scene map:

```txt
About Scene
├── About Container / White Canvas Environment
│   └── .about-section-container
│       ├── backgroundColor: var(--color-bg)
│       ├── position: absolute
│       ├── z-index: 1
│       └── overflow: hidden
│
├── Background / Decorative Layer
│   └── .about-glow-behind
│       ├── radial white glow
│       ├── z-index: 1
│       └── pointer-events: none
│
├── Portrait / Morph Layer
│   ├── .about-portrait-img
│   │   ├── right portrait
│   │   ├── z-index: 2
│   │   └── initial clipPath + transform state
│   └── .about-portrait-left-img
│       ├── secondary left portrait
│       ├── z-index: 2
│       └── initial opacity 0
│
├── Overlay / Glass Layer
│   └── .about-glass-overlay
│       ├── bottom curved glass dome
│       ├── z-index: 3
│       └── hidden on mobile
│
├── Chapter A Editorial Layer
│   └── .about-editorial-text
│       ├── .about-eyebrow
│       ├── .about-text-line
│       ├── .about-char
│       └── .about-description
│
├── Chapter B Deep Dive Layer
│   └── .about-sub-content
│       ├── .sub-section-eyebrow
│       ├── View CTA
│       ├── .sub-section-focus
│       ├── .sub-section-metrics
│       └── .sub-section-stack
│
├── About Interaction Overlay
│   └── .about-portrait-trigger
│       ├── z-index: 10
│       └── pointer-events: auto
│
└── Global Overlay
    └── NavRail
        ├── rendered by PinnedSections
        └── not About-owned
```

Layer existence result:

| Expected Layer | Exists? | Current Form |
| --- | --- | --- |
| Background Layer | Yes | `.about-section-container` plus `.about-glow-behind` |
| Chapter A Layer | Yes | `.about-editorial-text` subtree |
| Morph Layer | Partial | Timeline phase inside desktop `aboutTl`, not a separate DOM layer/module |
| Chapter B Layer | Yes | `.about-sub-content` subtree |
| Overlay Layer | Yes | About hover trigger, glass overlay, and global `NavRail` split across owners |

## Deliverable 2 - Layer Ownership Audit

| Element | Parent | Layer | Position | Z-index | Initial State | DOM Owner | Visual Owner | Runtime Animation Owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| About container `.about-section-container` | `#about-section` | White canvas environment | absolute, inset 0 | 1 | `backgroundColor: var(--color-bg)` | `About.tsx` | `About.tsx` + global theme vars | `PinnedSections.tsx` desktop `aboutTl` mutates `html` CSS vars |
| Background glow `.about-glow-behind` | `.about-section-container` | Background/decorative | absolute, bottom `-15vh`, centered | 1 | opacity `0.85` | `About.tsx` | `About.tsx` | None found |
| Main portrait `.about-portrait-img` | `.about-section-container` | Portrait/morph | absolute, bottom `-10vh`, right `0vw` | 2 | clipPath inset, translateY `120px` | `About.tsx` | `About.tsx` | desktop `aboutTl`, mobile `introTl` |
| Secondary portrait `.about-portrait-left-img` | `.about-section-container` | Portrait/morph / Chapter B | absolute, bottom `-10vh`, left `-11vw` | 2 | opacity `0` | `About.tsx` | `About.tsx` | desktop `aboutTl` |
| Portrait trigger `.about-portrait-trigger` | `.about-section-container` | Interaction overlay | absolute, bottom/right 0 | 10 | pointer active | `About.tsx` | `About.tsx` | custom cursor system via data attributes, no GSAP owner found |
| Glass overlay `.about-glass-overlay` | `.about-section-container` | Overlay/glass | absolute, bottom `-3vh`, centered | 3 | visible desktop, hidden mobile | `About.tsx` | `About.tsx` | None found |
| Chapter A wrapper `.about-editorial-text` | `.about-section-container` | Chapter A editorial | absolute desktop; relative mobile | 4 desktop, 5 mobile | visible wrapper, child opacity starts 0 | `About.tsx` | `About.tsx` | desktop `aboutTl` exits wrapper |
| Eyebrow `.about-eyebrow` | `.about-editorial-text` | Chapter A editorial | flow within wrapper | inherited | opacity `0`, y `15px` | `About.tsx` | `About.tsx` | desktop `aboutTl`, mobile `introTl` |
| Headline chars `.about-char` | `.about-text-line` | Chapter A editorial | inline-block chars | inherited | yPercent/opacity set by GSAP; char-level will-change | `About.tsx` | `About.tsx` | desktop `aboutTl`, mobile `introTl` |
| Intro copy `.about-description` | `.about-editorial-text` | Chapter A editorial | flow within wrapper | inherited | opacity `0`, y `20px` | `About.tsx` | `About.tsx` | desktop `aboutTl`, mobile `introTl` |
| Chapter B wrapper `.about-sub-content` | `.about-section-container` | Chapter B deep dive | absolute desktop; relative mobile | 4 desktop, 5 mobile | opacity `0`, pointer-events none | `About.tsx` | `About.tsx` | desktop `aboutTl`, mobile sub-content trigger |
| Deep Dive label `.sub-section-eyebrow` | `.about-sub-content` | Chapter B header | flex row | inherited | no CSS opacity baseline; animated by desktop `aboutTl` | `About.tsx` | `About.tsx` | desktop `aboutTl` |
| View CTA | `.sub-section-eyebrow` | Chapter B action | inline in header | inherited | opacity `0.75`, pointer active | `About.tsx` | `About.tsx` | click handler scrolls window; wrapper visibility animated by `aboutTl` or mobile trigger |
| Focus cards `.sub-section-focus` | `.about-sub-content` | Chapter B content | flex column | inherited | no CSS opacity baseline; animated by desktop `aboutTl` | `About.tsx` | `About.tsx` | desktop `aboutTl` |
| Metrics `.sub-section-metrics` | `.about-sub-content` | Chapter B content | flex column | inherited | no CSS opacity baseline; animated by desktop `aboutTl` | `About.tsx` | `About.tsx` | desktop `aboutTl` |
| Stack pills `.sub-section-stack` | `.about-sub-content` | Chapter B content | flex column | inherited | no CSS opacity baseline; animated by desktop `aboutTl` | `About.tsx` | `About.tsx` | desktop `aboutTl` |
| Navigation rail `NavRail` | `PinnedSections` root | Global overlay | global rail component | component-defined | active state from events | `PinnedSections.tsx` renders; `NavRail.tsx` owns internals | `NavRail.tsx` | `PinnedSections.tsx` active-section/progress events drive it |

## Deliverable 3 - Timeline Ownership Audit

| Timeline / ScrollTrigger | Purpose | Trigger | Start | End | Pin | Scrub | Controlled Elements |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Section observer triggers | Publish active section id for navigation | `#hero-section`, `#about-section`, `#work-section`, `#contact-section` | `top 40%` | `bottom 40%` | No | No | `window.__activeSection`, `activeSectionChange` event |
| Global scroll progress publisher | Publish full-page scroll progress for rail fill | `document.documentElement` | `top top` | `bottom bottom` | No | `true` | `window.__scrollTriggerProgress`, `scrollTriggerProgress` event |
| Hero text fade | Fade/move hero text during Hero exit | `#hero-section` | `top top` | `bottom top` | No | `true` | `.hero-text-content` opacity, y |
| Hero fluid canvas fade | Fade Hero canvas during Hero exit | `#hero-section` | `top top` | `bottom top` | No | `true` | `.hero-fluid-canvas` opacity |
| Desktop About baseline setup | Set initial desktop About animation baselines | media query `(min-width: 769px)` | N/A | N/A | N/A | N/A | `.about-portrait-img`, `.about-eyebrow`, `.about-char`, `.about-description`, `.about-portrait-left-img`, `.about-sub-content` |
| Desktop `aboutTl` phase 1 | Reveal Chapter A intro | `#about-section` | `top top` | `+=100%` | Yes | `0.5` | `.about-portrait-img`, `.about-eyebrow`, `.about-char`, `.about-description` |
| Desktop `aboutTl` phase 2 | Morph from Chapter A to Chapter B | `#about-section` | `top top` | `+=100%` | Yes | `0.5` | `.about-editorial-text`, `.about-portrait-img`, `.about-portrait-left-img`, `.about-sub-content`, `.sub-section-eyebrow`, `.sub-section-focus`, `.sub-section-metrics`, `.sub-section-stack` |
| Desktop `aboutTl` theme tween | Convert global theme variables to light About canvas | `#about-section` via `aboutTl` | timeline position `0.1` | duration `0.3` | Yes via timeline | `0.5` | `html` CSS variables including `--color-bg`, text, border, accent, card vars |
| Mobile baseline setup | Set initial mobile About animation baselines | media query `(max-width: 768px)` | N/A | N/A | N/A | N/A | `.about-portrait-img`, `.about-eyebrow`, `.about-description`, `.about-char`, `.about-sub-content` |
| Mobile `introTl` | Reveal mobile Chapter A intro | `#about-section` | `top 75%` | default ScrollTrigger end | No | No | `.about-portrait-img`, `.about-eyebrow`, `.about-char`, `.about-description` |
| Mobile sub-content trigger | Reveal mobile Chapter B content | `.about-sub-content` | `top 80%` | default ScrollTrigger end | No | No | `.about-sub-content` opacity, y, pointer-events |
| Contact reveal trigger | Enter/exit Contact scene | `#contact-section` | `top 70%` | default ScrollTrigger end | No | No | `contactScene.enter()`, `contactScene.exit()` |
| Contact theme reset trigger | Keep light theme when leaving Contact upward | `#contact-section` | `top bottom` | default ScrollTrigger end | No | No | `html` CSS variables to light values |

Timeline ownership finding:

```txt
About DOM owner: About.tsx
About animation owner: PinnedSections.tsx
About desktop scene progression owner: PinnedSections.tsx
About mobile reveal owners: PinnedSections.tsx
About content data owner: About.tsx hardcoded arrays/text
```

## Deliverable 4 - Multi-Ownership Detection

| Element / State | Owners | Risk Level | Red Flag |
| --- | --- | --- | --- |
| Primary portrait `.about-portrait-img` | `About.tsx` inline initial clip/transform; desktop GSAP baseline; desktop `aboutTl`; mobile CSS overrides; mobile `introTl` | High | Same element is baseline-styled, responsive-overridden, and animated by separate desktop/mobile systems. |
| Chapter A eyebrow/copy/chars | `About.tsx` inline opacity/transform; desktop GSAP baseline; desktop `aboutTl`; mobile `introTl` | High | Intro content is not exclusively owned by a Chapter A scene timeline. |
| `.about-editorial-text` wrapper | `About.tsx` desktop absolute styles; mobile CSS structural overrides; desktop `aboutTl` exit | Medium | Layout ownership and morph ownership are split. |
| `.about-sub-content` | `About.tsx` inline opacity/pointer state; desktop GSAP baseline; desktop `aboutTl`; mobile CSS structural overrides; mobile sub-content trigger | High | Chapter B reveal has separate desktop and mobile timeline owners. |
| Theme variables / white canvas | root CSS variables; desktop `aboutTl`; contact reset ScrollTrigger; container reads `var(--color-bg)` | High | Environment is global CSS state, not a dedicated About environment layer. |
| Active section state | `PinnedSections` ScrollTriggers; `window.__activeSection`; `activeSectionChange` event; `NavRail` and `MorphNav` consumers | Medium | Global navigation state is event-driven outside About. Acceptable for overlay, but not About-owned. |
| View CTA scroll behavior | `About.tsx` click handler; document scroll geometry; PinnedSections ScrollTriggers react downstream | Medium | CTA behavior couples Chapter B action to global scroll length instead of a scene/navigation service. |

## Deliverable 5 - Scene Responsibility Audit

### Environment: White Canvas

Questions:

- Is it a CSS background? Yes. `.about-section-container` uses `backgroundColor: var(--color-bg)`.
- Is it a dedicated layer? No. It is the About container background plus global `html` theme variables.
- Is it animated? Yes, indirectly. Desktop `aboutTl` mutates `html` CSS variables to white/light values.
- Who owns it? DOM is `About.tsx`; runtime theme mutation is `PinnedSections.tsx`.

Finding:

The white canvas is CSS/theme-driven and globally coupled. It is not a separate transition-owned or environment-owned module.

### Chapter A: Intro State

Observed elements:

- `.about-portrait-img`
- `.about-editorial-text`
- `.about-eyebrow`
- `.about-char`
- `.about-description`

Questions:

- Separate layer? Visually yes, via z-index and wrapper.
- Separate timeline? No. It is phase 1 of desktop `aboutTl`, and mobile `introTl`.
- Reusable scene? No. It is embedded in About DOM and animated from `PinnedSections`.

Finding:

Chapter A exists as a DOM subregion, not as an independent scene.

### Morph Phase

Observed behavior:

- `.about-editorial-text` exits.
- `.about-portrait-img` moves/fades out.
- `.about-portrait-left-img` moves/fades in.
- `.about-sub-content` fades in and becomes pointer-active.

Questions:

- Dedicated phase? Yes inside desktop `aboutTl`.
- Dedicated module? No.
- Embedded into Chapter A? Partially, because it exits Chapter A elements.
- Embedded into Chapter B? Partially, because it reveals Chapter B elements.

Finding:

The morph phase is a timeline segment that bridges Chapter A and Chapter B, but it has no independent ownership boundary.

### Chapter B: Deep Dive State

Observed elements:

- `.about-sub-content`
- `.sub-section-eyebrow`
- View CTA
- `.sub-section-focus`
- `.sub-section-metrics`
- `.sub-section-stack`

Questions:

- Independent scene? No.
- Shared scene? Yes. It shares `About.tsx` DOM and desktop `aboutTl`.

Finding:

Chapter B is a DOM subregion inside the same About component. Its desktop reveal is embedded in `aboutTl`; its mobile reveal is a separate ScrollTrigger on `.about-sub-content`.

### Overlay Layer

Observed overlays:

- `.about-glass-overlay`
- `.about-portrait-trigger`
- `NavRail`

Questions:

- About-owned? Glass overlay and portrait trigger are About-owned.
- Global-owned? `NavRail` is global and rendered by `PinnedSections`.

Finding:

Overlay ownership is split. About owns local visual/interaction overlays; global navigation overlay remains outside About.

## Deliverable 6 - Technical Debt Assessment

| Dimension | Score | Assessment |
| --- | ---: | --- |
| Architecture Clarity | 5/10 | Visual chapters exist, but DOM ownership and animation ownership are split between `About.tsx` and `PinnedSections.tsx`. |
| Layer Separation | 6/10 | Z-index layers are readable, but layers are not explicit modules or scene contracts. |
| Timeline Ownership Clarity | 4/10 | Timeline code is concentrated in `PinnedSections`, including About internals and global theme mutation. |
| Transition Readiness | 5/10 | A white canvas transition can be planned, but implementation would risk touching About content without a new boundary. |
| Future CMS Compatibility | 5/10 | Content is hardcoded in `About.tsx`; no Firebase/CMS coupling exists, but no content schema or repository boundary exists either. |

Overall:

```txt
Architecture clarity: medium-low
Layer separation: medium
Timeline ownership clarity: low-medium
Transition readiness: partial
Future CMS compatibility: medium
```

## Deliverable 7 - Transition Readiness Assessment

Can we safely redesign:

```txt
Hero
↓
White Canvas Environment
```

without touching:

```txt
Chapter A
Morph Phase
Chapter B
```

Answer: `PARTIAL`

Justification:

- The white canvas currently resolves through About container styling plus global CSS variables, not through a dedicated environment layer.
- Desktop About intro, morph, Chapter B reveal, and theme transition are all inside one `aboutTl`.
- Any transition that animates `.about-portrait-img`, `.about-editorial-text`, `.about-char`, `.about-sub-content`, or `html` theme variables risks taking ownership of About scene internals.
- A safe redesign is possible only if the future transition owns a separate transition object or environment layer and stops at an explicit lifecycle boundary before Chapter A reveal begins.

Safe next redesign boundary:

```txt
Transition may own:
- a dedicated transition visual object
- coverage/progress state
- white-canvas environment handoff signal

Transition must not own:
- About portrait reveal
- About text/char reveal
- morph between portrait poses
- Chapter B deep dive reveal
- stack/metrics/focus cards
```

## Deliverable 8 - Recommended Architecture

Recommended future architecture before adding Hero to About transition animation:

```txt
Hero Scene
↓
Environment Transition Layer
↓
White Canvas Environment
↓
About Chapter A
↓
About Morph Phase
↓
About Chapter B
↓
Global Overlay Layer
```

Ownership boundaries:

| Boundary | Owner | Allowed Responsibilities | Forbidden Responsibilities |
| --- | --- | --- | --- |
| Hero Scene | Future `HeroScene` | Hero DOM, Hero text exit, Hero renderer eligibility | About DOM or About reveal |
| Environment Transition Layer | Future transition module | Transition object, coverage, environment handoff | About typography, portraits, metrics, stack |
| White Canvas Environment | Future About/environment scene boundary | About background layer and light theme state | Chapter A/B content animation |
| About Chapter A | Future `AboutScene` or chapter timeline | Intro portrait/text reveal | Transition coverage or Chapter B content |
| About Morph Phase | Future About-owned morph timeline | Portrait pose transition, intro exit, Chapter B entrance signal | Hero transition or global overlay state |
| About Chapter B | Future About-owned chapter timeline | Deep dive content, metrics, stack, CTA visibility | Hero/environment transition |
| Global Overlay Layer | Navigation system | Active section UI and progress UI | About scene internals |

Recommended migration posture:

1. Keep the current code unchanged until the transition boundary is explicitly designed.
2. Do not add a Hero to About transition that targets current About internals.
3. If redesign work begins later, first define an explicit environment handoff layer or scene lifecycle boundary.
4. Preserve the existing About morph experience until ownership is extracted into an About-owned scene/timeline.

## Final Audit Answer

The current About section should be treated as:

```txt
Hero
↓
About scene with embedded white environment
↓
Chapter A
↓
Morph phase
↓
Chapter B
```

It should not yet be treated as:

```txt
Hero
↓
White Canvas Environment
↓
Chapter A
↓
Chapter B
```

because the white canvas environment is not a dedicated layer and the morph phase is embedded in the About timeline.

No Hero to About redesign should begin until the environment transition boundary is made explicit in architecture.
