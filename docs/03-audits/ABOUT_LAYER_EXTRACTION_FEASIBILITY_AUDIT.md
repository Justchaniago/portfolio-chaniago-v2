# AUDIT-ABOUT-002 - About Layer Extraction Feasibility Audit

Date: 2026-06-07

Status: Complete

Scope: Documentation-only feasibility audit for separating the current About implementation into explicit ownership layers.

Non-goals:
- No production code changes.
- No GSAP timeline or ScrollTrigger changes.
- No selector, layout, style, component, or architecture refactor.
- No new components.

## Executive Verdict

AUDIT-ABOUT-001 established that the current About section is visually structured as:

```txt
Hero
↓
About Scene
 ├─ White Environment
 ├─ Chapter A
 ├─ Morph Phase
 └─ Chapter B
```

This audit finds that the About section can be split into explicit layers only with a staged migration. The DOM is already visually grouped enough to support extraction, but the animation ownership is not ready for a single-step split because `PinnedSections.tsx` owns the selector-based timelines for multiple future layers at once.

Final answer: `PARTIAL`.

Extraction is feasible without intentional user-visible changes, but only if the extraction first preserves every current selector and timeline target, then moves ownership incrementally.

## Evidence Sources

- `components/sections/About.tsx`
- `components/sections/PinnedSections.tsx`
- `components/layout/NavRail.tsx`
- `components/layout/MorphNav.tsx`
- `components/ui/CustomCursor.tsx`
- `app/layout.tsx`
- `docs/03-audits/ABOUT_SECTION_ARCHITECTURE_AUDIT.md`

Current owner split:

```txt
DOM owner: About.tsx
Animation owner: PinnedSections.tsx
Global overlay owners: app/layout.tsx, PinnedSections.tsx, NavRail.tsx, MorphNav.tsx
Cursor behavior owner: CustomCursor.tsx via data-cursor attributes
```

## Deliverable 1 - Layer Extraction Map

### Environment Layer

Candidate elements:

```txt
.about-section-container
.about-glow-behind
.about-glass-overlay
```

| Element | Current Parent | Current Owner | Dependencies | Animation Ownership | Safe Extraction Level |
| --- | --- | --- | --- | --- | --- |
| `.about-section-container` | `#about-section` in `PinnedSections.tsx` | DOM/style in `About.tsx` | `--color-bg`, `--color-text-*`, `--color-border`, `--color-accent`; desktop theme tween in `aboutTl`; mobile CSS overrides | `PinnedSections.tsx` mutates `html` theme vars; no direct GSAP target on container | `PARTIAL` |
| `.about-glow-behind` | `.about-section-container` | `About.tsx` | Absolute positioning relative to About container; white visual language assumes light environment | No GSAP owner found | `SAFE` |
| `.about-glass-overlay` | `.about-section-container` | `About.tsx` | Absolute bottom placement; mobile CSS hides it; visual relation to portrait and environment | No GSAP owner found | `SAFE` for DOM move, `PARTIAL` because mobile CSS selectors must be preserved |

Environment finding:

The glow and glass objects can move first if selectors and style output remain unchanged. The container/background cannot be fully isolated until global theme variable mutation is moved behind an explicit environment boundary.

### Chapter A Layer

Candidate elements:

```txt
.about-editorial-text
.about-eyebrow
.about-char
.about-description
.about-portrait-img
```

| Element | Internal Dependencies | External Dependencies | Timeline Dependencies | Runtime Ownership | Feasibility |
| --- | --- | --- | --- | --- | --- |
| `.about-editorial-text` | Contains eyebrow, headline lines, chars, description | Desktop absolute layout; mobile CSS converts to relative flow | Desktop `aboutTl` exits wrapper at phase 2 | DOM in `About.tsx`; animation in `PinnedSections.tsx` | `PARTIAL` |
| `.about-eyebrow` | Chapter A wrapper | Theme text vars; mobile/desktop baseline setup | Desktop `aboutTl`; mobile `introTl` | DOM in `About.tsx`; animation in `PinnedSections.tsx` | `PARTIAL` |
| `.about-char` | Generated from headline text | Split text shape is manual JSX; selector is broad across both headline lines | Desktop `aboutTl` stagger; mobile `introTl` stagger | DOM in `About.tsx`; animation in `PinnedSections.tsx` | `HIGH RISK` |
| `.about-description` | Chapter A wrapper | Theme text vars; mobile/desktop baseline setup | Desktop `aboutTl`; mobile `introTl` | DOM in `About.tsx`; animation in `PinnedSections.tsx` | `PARTIAL` |
| `.about-portrait-img` | Shares visual space with glass and environment | Desktop absolute layout; mobile CSS overrides; morph phase also controls it | Desktop baseline, desktop Chapter A reveal, desktop morph exit, mobile intro reveal | DOM in `About.tsx`; animation in `PinnedSections.tsx` | `HIGH RISK` |

Chapter A finding:

Chapter A can be extracted only if the wrapper preserves the existing class names and child structure. The highest-risk element is `.about-portrait-img` because it belongs visually to Chapter A but is also a morph participant.

### Morph Layer

Candidate ownership:

```txt
aboutTl phase 2
```

Current controlled elements:

- `.about-editorial-text`
- `.about-portrait-img`
- `.about-portrait-left-img`
- `.about-sub-content`
- `.sub-section-eyebrow`
- `.sub-section-focus`
- `.sub-section-metrics`
- `.sub-section-stack`

State transitions:

```txt
Chapter A text: visible -> opacity 0, y -80
Primary portrait: visible -> xPercent -50, opacity 0
Secondary portrait: xPercent 50, opacity 0 -> xPercent 0, opacity 1
Chapter B wrapper: opacity 0, pointer-events none -> opacity 1, pointer-events auto
Chapter B subsections: opacity/y baseline -> opacity 1, y 0
```

Required inputs:

- Chapter A baseline/revealed state must already be established.
- `.about-portrait-left-img` must have an initial xPercent/opacity baseline.
- `.about-sub-content` must have opacity/pointer baseline.
- Subsection elements must exist and remain selector-addressable.
- Desktop `ScrollTrigger` pinning must remain active for scrubbed progress.

Required outputs:

- Chapter A is visually cleared.
- Primary portrait is gone.
- Secondary portrait is visible.
- Chapter B is visible and pointer-active.
- Stack, metrics, focus, and header are revealed.

Can Morph become an isolated controller?

Answer: `PARTIAL`.

Justification:

The morph phase has a coherent visual responsibility, but it currently depends on baselines created in the same desktop `aboutTl`. It also controls elements from Chapter A and Chapter B simultaneously. It can become an isolated controller only after Chapter A and Chapter B expose stable state contracts such as `chapterA.revealed`, `chapterA.exited`, `chapterB.hidden`, and `chapterB.visible`.

### Chapter B Layer

Candidate elements:

```txt
.about-sub-content
.sub-section-eyebrow
.sub-section-focus
.sub-section-metrics
.sub-section-stack
View CTA
.about-portrait-left-img
```

| Element | Current Ownership | Timeline Dependencies | Mobile Dependencies | Extraction Feasibility |
| --- | --- | --- | --- | --- |
| `.about-sub-content` | DOM/style in `About.tsx`; reveal in `PinnedSections.tsx` | desktop `aboutTl` phase 2; mobile sub-content trigger | mobile CSS makes it relative, full width, z-index 5 | `PARTIAL` |
| `.sub-section-eyebrow` | DOM/style in `About.tsx`; reveal in `PinnedSections.tsx` | desktop `aboutTl` | inherits wrapper mobile flow | `PARTIAL` |
| View CTA | DOM/click behavior in `About.tsx` | wrapper visibility only; no direct GSAP target | click uses document scroll height, not scene service | `PARTIAL` |
| `.sub-section-focus` | DOM/style in `About.tsx`; reveal in `PinnedSections.tsx` | desktop `aboutTl` | grid becomes one column under 480px | `PARTIAL` |
| `.sub-section-metrics` | DOM/style in `About.tsx`; reveal in `PinnedSections.tsx` | desktop `aboutTl` | wrapper flow | `PARTIAL` |
| `.sub-section-stack` | DOM/style in `About.tsx`; reveal in `PinnedSections.tsx` | desktop `aboutTl` | wrapper flow | `PARTIAL` |
| `.about-portrait-left-img` | DOM/style in `About.tsx`; reveal in `PinnedSections.tsx` | desktop baseline and morph phase | mobile CSS changes dimensions/position, but no mobile GSAP reveal found | `HIGH RISK` |

Chapter B finding:

The content grid can be extracted behind a preserved `.about-sub-content` selector. The secondary portrait should not be extracted as ordinary Chapter B content until morph ownership is clarified, because it is a morph endpoint rather than just static Chapter B decoration.

## Deliverable 2 - GSAP Dependency Graph

### Current Graph

```txt
PinnedSections.tsx
├─ gsap.matchMedia()
│
├─ Desktop About Timeline
│  ├─ baseline gsap.set()
│  │  ├─ .about-portrait-img
│  │  ├─ .about-eyebrow
│  │  ├─ .about-char
│  │  ├─ .about-description
│  │  ├─ .about-portrait-left-img
│  │  └─ .about-sub-content
│  │
│  └─ aboutTl ScrollTrigger
│     ├─ trigger: #about-section
│     ├─ pin: true
│     ├─ scrub: 0.5
│     ├─ Chapter A reveal
│     ├─ Morph phase
│     ├─ Chapter B reveal
│     └─ html theme variable tween
│
├─ Mobile About Intro Timeline
│  ├─ trigger: #about-section
│  ├─ .about-portrait-img
│  ├─ .about-eyebrow
│  ├─ .about-char
│  └─ .about-description
│
└─ Mobile About Sub-content Trigger
   ├─ trigger: .about-sub-content
   └─ .about-sub-content
```

### Direct Selector Dependencies

Selectors touched by desktop `aboutTl` and setup:

- `.about-portrait-img`
- `.about-eyebrow`
- `.about-char`
- `.about-description`
- `.about-portrait-left-img`
- `.about-sub-content`
- `.about-editorial-text`
- `.sub-section-eyebrow`
- `.sub-section-focus`
- `.sub-section-metrics`
- `.sub-section-stack`
- `html`

Selectors touched by mobile `introTl` and setup:

- `.about-portrait-img`
- `.about-eyebrow`
- `.about-description`
- `.about-char`
- `.about-sub-content`

Selectors touched by mobile sub-content trigger:

- `.about-sub-content`

### Cross-Layer Dependencies

```txt
aboutTl
├─ Environment
│  └─ html theme variables that drive .about-section-container background/text
├─ Chapter A
│  ├─ .about-portrait-img
│  ├─ .about-eyebrow
│  ├─ .about-char
│  └─ .about-description
├─ Morph
│  ├─ .about-editorial-text
│  ├─ .about-portrait-img
│  ├─ .about-portrait-left-img
│  └─ .about-sub-content
└─ Chapter B
   ├─ .sub-section-eyebrow
   ├─ .sub-section-focus
   ├─ .sub-section-metrics
   └─ .sub-section-stack
```

Risk label: `Layer Coupling`.

The desktop `aboutTl` is the primary extraction blocker. It handles environment, Chapter A reveal, morph, and Chapter B reveal as one scrubbed timeline. Any extraction that moves DOM without preserving selectors and timing baselines can break the timeline immediately.

## Deliverable 3 - Ownership Boundary Violations

Rule checked:

```txt
DOM Owner != Animation Owner
```

| Element / State | DOM Owner | Animation Owner | Severity | Reason |
| --- | --- | --- | --- | --- |
| `.about-portrait-img` | `About.tsx` | `PinnedSections.tsx` | `CRITICAL` | Same element is Chapter A portrait and morph participant across desktop/mobile systems. |
| `.about-char` | `About.tsx` | `PinnedSections.tsx` | `HIGH` | Character-level animation depends on broad selector stability and manual JSX split structure. |
| `.about-eyebrow` | `About.tsx` | `PinnedSections.tsx` | `HIGH` | Intro reveal is external to DOM owner. |
| `.about-description` | `About.tsx` | `PinnedSections.tsx` | `HIGH` | Intro reveal is external to DOM owner. |
| `.about-editorial-text` | `About.tsx` | `PinnedSections.tsx` | `HIGH` | Wrapper exits during morph despite being Chapter A DOM. |
| `.about-portrait-left-img` | `About.tsx` | `PinnedSections.tsx` | `HIGH` | Secondary portrait is invisible until morph phase and depends on GSAP baseline. |
| `.about-sub-content` | `About.tsx` | `PinnedSections.tsx` | `HIGH` | Chapter B visibility and pointer-events are external. |
| `.sub-section-eyebrow` | `About.tsx` | `PinnedSections.tsx` | `MEDIUM` | Revealed only in desktop `aboutTl`; no direct mobile target found. |
| `.sub-section-focus` | `About.tsx` | `PinnedSections.tsx` | `MEDIUM` | Revealed only in desktop `aboutTl`; selector must be preserved. |
| `.sub-section-metrics` | `About.tsx` | `PinnedSections.tsx` | `MEDIUM` | Revealed only in desktop `aboutTl`; selector must be preserved. |
| `.sub-section-stack` | `About.tsx` | `PinnedSections.tsx` | `MEDIUM` | Revealed only in desktop `aboutTl`; selector must be preserved. |
| `html` theme variables | global CSS/root | `PinnedSections.tsx` | `HIGH` | About environment appearance is controlled outside About and can affect other sections. |

## Deliverable 4 - Environment Isolation Feasibility

Can the white canvas be extracted into:

```txt
AboutEnvironment.tsx
```

without affecting:

```txt
Chapter A
Morph
Chapter B
```

Answer: `PARTIAL`.

### Theme Variables

Current usage:

```txt
--color-bg
--color-text-1
--color-text-2
--color-border
--color-accent
--text-shadow-glow
--color-card-bg
--color-card-shadow
--color-card-shadow-hover
--color-text-reveal-bg
```

Current mutation owner:

- `PinnedSections.tsx` desktop `aboutTl` mutates `html` theme variables at timeline position `0.1`.
- `PinnedSections.tsx` contact theme reset trigger also mutates light theme variables when leaving Contact upward.

Current dependency chain:

```txt
PinnedSections desktop aboutTl
↓
html CSS custom properties
↓
.about-section-container background
↓
Chapter A and Chapter B text/card colors
```

Isolation difficulty: `HIGH`.

Reason:

The environment background and content color system share the same global CSS variables. Extracting the visual objects alone is safe; extracting environment ownership is not fully safe until theme mutation is no longer embedded in a multi-purpose About timeline.

### Environment Visual Objects

| Visual Object | Current Element | Can Move to `AboutEnvironment.tsx`? | Risk |
| --- | --- | --- | --- |
| Background | `.about-section-container` background | `PARTIAL` | Depends on global theme variables and section sizing. |
| Glow | `.about-glow-behind` | `YES` | No GSAP owner found; preserve absolute positioning and selector. |
| Glass | `.about-glass-overlay` | `YES` | Preserve mobile `display: none` selector and bottom positioning. |

Environment isolation recommendation:

Extract glow and glass only after adding a no-op wrapper that preserves class names and rendered DOM order. Do not move theme mutation until a dedicated environment lifecycle contract exists.

## Deliverable 5 - Extraction Order Recommendation

Options evaluated:

```txt
Option A
Environment
↓
Chapter A
↓
Chapter B
↓
Morph
```

```txt
Option B
Morph
↓
Environment
↓
Chapter A
↓
Chapter B
```

```txt
Option C
Custom sequence
```

Chosen option: `Option C - Custom sequence`.

Recommended extraction order:

```txt
1. Documentation and selector contract freeze
2. Passive Environment visual extraction
3. Passive Chapter B content extraction
4. Passive Chapter A text extraction
5. Portrait boundary split
6. About-owned timeline/controller extraction
7. Morph controller extraction
8. Theme/environment lifecycle extraction
```

Justification:

- Option A starts with environment, which is partly safe for glow/glass but risky for theme variables.
- Option B starts with morph, the most coupled phase, so it is too risky.
- A custom sequence allows low-risk DOM grouping first while preserving every existing selector and timeline target.

Detailed migration notes:

1. Freeze selectors and measured states before any extraction.
2. Move `.about-glow-behind` and `.about-glass-overlay` behind an environment component without changing DOM order, class names, z-index, or media CSS.
3. Move `.about-sub-content` subtree behind a Chapter B component while keeping `.about-sub-content` as the timeline target.
4. Move `.about-editorial-text` subtree behind a Chapter A component while keeping `.about-char` generation identical.
5. Treat portraits as a shared boundary until morph ownership is explicit; do not hide them inside Chapter A/B too early.
6. Move About timeline setup from `PinnedSections.tsx` into an About-owned controller only after DOM extraction is visually locked.
7. Split morph into a controller after Chapter A and Chapter B can expose stable states.
8. Move theme mutation last because it is global and cross-section.

## Deliverable 6 - Transition Readiness Reassessment

Readiness target:

```txt
Hero
↓
Environment Transition
↓
White Canvas
↓
Chapter A
```

| Category | Score |
| --- | ---: |
| Environment Isolation | 4/10 |
| Chapter Separation | 5/10 |
| Morph Isolation | 3/10 |
| Ownership Clarity | 4/10 |
| Transition Readiness | 5/10 |

Reasoning:

- Environment Isolation: visual objects are easy to group, but the actual white canvas state is tied to global theme mutation in `aboutTl`.
- Chapter Separation: Chapter A and Chapter B are recognizable DOM subtrees, but portraits and timeline selectors cross boundaries.
- Morph Isolation: the phase is conceptually clear but operationally embedded in one desktop timeline.
- Ownership Clarity: `About.tsx` and `PinnedSections.tsx` split DOM and animation ownership.
- Transition Readiness: the target transition can be designed now, but it should not be implemented against current About internals without an explicit boundary.

## Deliverable 7 - Future Architecture Recommendation

Target architecture:

```txt
HeroScene
│
├─ Hero Content
│
└─ Exit State

EnvironmentTransitionLayer
│
└─ Transition Objects

AboutEnvironment
│
├─ Background
├─ Glow
└─ Glass

AboutChapterA
│
├─ Portrait Right
├─ Editorial Text
└─ Intro Copy

AboutMorphController
│
└─ A -> B State

AboutChapterB
│
├─ Portrait Left
├─ Metrics
├─ Focus
├─ Stack
└─ CTA

GlobalOverlayLayer
│
├─ NavRail
└─ MorphNav
```

Advantages:

- Makes environment ownership explicit before Hero to About transition work.
- Prevents a transition layer from animating About typography or portraits.
- Gives Chapter A and Chapter B clear DOM and content boundaries.
- Allows morph logic to become an About-owned bridge rather than a parent-owned timeline segment.
- Reduces selector sprawl inside `PinnedSections.tsx`.

Risks:

- Reordering DOM could break absolute positioning and z-index relationships.
- Moving `.about-char` generation could alter stagger target count/order.
- Moving portraits too early could break morph baselines.
- Moving theme variables too early could affect Work/Contact color continuity.
- Mobile CSS overrides depend on the current class names and cascade.

Migration complexity:

```txt
Environment visual extraction: Low to Medium
Chapter B passive extraction: Medium
Chapter A passive extraction: Medium to High
Portrait boundary split: High
Timeline/controller extraction: High
Theme lifecycle extraction: High
```

Expected technical debt reduction:

- Removes About DOM/animation ownership mismatch.
- Reduces parent timeline responsibility in `PinnedSections.tsx`.
- Creates a safer boundary for future Hero to Environment transition work.
- Makes future CMS/content extraction easier by separating Chapter A and Chapter B content.
- Clarifies global overlay responsibilities for `NavRail` and `MorphNav`.

## Final Audit Answer

Can About be safely split into:

```txt
Environment
Chapter A
Morph
Chapter B
```

without changing the user-visible experience?

Answer: `PARTIAL`.

Detailed justification:

- Yes, the DOM already contains recognizable layer candidates.
- Yes, environment visual objects such as glow and glass can be isolated with low risk if selectors and DOM order are preserved.
- No, the split is not safe as a single refactor because `aboutTl` controls Environment, Chapter A, Morph, and Chapter B together.
- No, the portraits cannot be cleanly assigned to Chapter A or Chapter B until morph ownership is formalized.
- No, the white canvas cannot be fully isolated while `html` theme mutation remains inside the desktop About timeline.

Recommended migration path:

```txt
1. Freeze selectors and current visual states.
2. Extract passive visual/content subtrees without changing class names or DOM order.
3. Keep portraits shared until morph state contracts exist.
4. Move About timeline ownership out of PinnedSections only after passive extraction proves stable.
5. Split morph into AboutMorphController.
6. Move theme/environment lifecycle last.
7. Only then implement Hero -> Environment Transition -> White Canvas -> Chapter A.
```

Until that migration path is followed, future Hero to About redesign work should treat the white canvas as an unsafe shared state rather than a standalone environment scene.
