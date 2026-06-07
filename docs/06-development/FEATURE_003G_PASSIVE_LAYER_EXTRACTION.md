# FEATURE-003G - Passive About Layer Extraction

Date: 2026-06-07

Status: Implemented

Scope: Structural JSX extraction only. No production animation, ScrollTrigger, theme lifecycle, layout, selector, z-index, responsive behavior, or transition redesign changes.

## Summary

FEATURE-003G performs the first passive decomposition of the About section into explicit ownership modules:

```txt
About
├─ AboutEnvironment
├─ Shared Morph Boundary
├─ AboutChapterA
└─ AboutChapterB
```

Animation ownership remains unchanged:

```txt
PinnedSections.tsx
└─ still owns all About GSAP setup, ScrollTriggers, desktop/mobile reveal timelines, and theme mutation
```

## Files Added

```txt
components/about/AboutEnvironment.tsx
components/about/AboutChapterA.tsx
components/about/AboutChapterB.tsx
```

## File Updated

```txt
components/sections/About.tsx
```

## Ownership Boundaries

### AboutEnvironment

Owns only:

```txt
.about-glow-behind
.about-glass-overlay
```

Implementation note:

`AboutEnvironment` accepts children so the rendered DOM order remains identical:

```txt
.about-glow-behind
.about-portrait-img
.about-portrait-left-img
.about-portrait-trigger
.about-glass-overlay
```

No wrapper DOM was introduced.

### AboutChapterA

Owns only:

```txt
.about-editorial-text
.about-eyebrow
.about-char
.about-description
```

Character splitting logic was moved without changing the string split expressions, key structure, class names, or span hierarchy. GSAP stagger targets remain `.about-char`.

### AboutChapterB

Owns only:

```txt
.about-sub-content
.sub-section-eyebrow
.sub-section-focus
.sub-section-metrics
.sub-section-stack
View CTA
```

The View CTA keeps the same `data-cursor="button"` attribute and `window.scrollTo()` behavior.

### About.tsx

Still owns:

```txt
.about-section-container
.about-portrait-img
.about-portrait-left-img
.about-portrait-trigger
AboutEnvironment
AboutChapterA
AboutChapterB
mobile selector CSS
```

## Retained Morph Boundary

These elements were intentionally not extracted:

```txt
.about-portrait-img
.about-portrait-left-img
.about-portrait-trigger
```

Reason:

AUDIT-ABOUT-002 identified portraits as shared boundaries between Chapter A, the morph phase, and Chapter B. Keeping them in `About.tsx` avoids assigning morph ownership prematurely.

## Selector Preservation Report

Required selectors preserved:

```txt
.about-glow-behind
.about-glass-overlay

.about-editorial-text
.about-eyebrow
.about-char
.about-description

.about-sub-content
.sub-section-eyebrow
.sub-section-focus
.sub-section-metrics
.sub-section-stack

.about-portrait-img
.about-portrait-left-img
.about-portrait-trigger
```

GSAP selectors in `PinnedSections.tsx` were not changed.

## Visual Regression Verification

Expected result:

```txt
Visual Difference = 0
```

Verification targets:

- Hero to About transition unchanged.
- Desktop About unchanged.
- Mobile About unchanged.
- Morph unchanged.
- Portrait positions unchanged.
- View CTA unchanged.
- Theme transitions unchanged.

Rationale:

- No rendered wrapper nodes were added.
- DOM order for environment, shared portrait boundary, Chapter A, and Chapter B was preserved.
- Class names and inline styles were moved verbatim.
- `PinnedSections.tsx` animation ownership and selectors were not modified.

Local smoke verification:

```txt
DOM order:
.about-glow-behind
.about-portrait-img
.about-portrait-left-img
.about-portrait-trigger
.about-glass-overlay
.about-editorial-text
.about-sub-content
STYLE

Selector counts:
all required selectors present

Desktop Chapter A sample:
primary portrait visible
Chapter A visible
Chapter B hidden
secondary portrait hidden

Desktop morph sample:
Chapter A hidden
primary portrait hidden
Chapter B visible
secondary portrait visible
stack and metrics visible
```

## Readiness for FEATURE-003H

Ready for a follow-up audit or implementation plan that targets one of these next steps:

1. Selector contract freeze with screenshot baselines.
2. About-owned timeline/controller extraction plan.
3. Morph controller boundary design.
4. Theme/environment lifecycle extraction plan.

Not ready for:

- Hero to About transition redesign.
- Morph timeline rewrite.
- Theme lifecycle migration.

Those remain blocked until explicit lifecycle boundaries are defined.

## Validation Checklist

```txt
git diff --check: pass
npm run build: pass
npx tsc --noEmit: pass
selector audit: pass
visual smoke check: pass
```
