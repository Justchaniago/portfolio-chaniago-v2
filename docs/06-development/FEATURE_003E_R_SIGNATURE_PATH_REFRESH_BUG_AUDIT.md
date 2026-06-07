# FEATURE 003E-R: Signature Path Refresh Bug Audit

Date: 2026-06-07

## Result

Root Cause Identified: yes
Fix Proposed: yes
Fix Implemented: yes
Visual Verification Passed: yes

Confidence: 0.93

## Root Cause

The Signature Path ScrollTrigger was initialized from `ProjectShowcase` in a child `useEffect` before the parent `PinnedSections` effect created the desktop About pin.

React runs passive effects for children before parents. On hard refresh, this meant:

- `ProjectShowcase` measured `.work-section` and created the Signature Path ScrollTrigger first.
- `PinnedSections` then created the About `ScrollTrigger` with `pin: true`.
- The About pin inserted an additional 1000px pin spacer above Work.
- The Work trigger retained stale start/end geometry, so at the real Work trigger start the controller was already advanced by about 16.7%.

This exactly matches the observed refresh-only failure: hot reload can mask the issue because existing layout/spacer state may already be present when the child trigger reinitializes.

## Code Evidence

- `SignaturePathController` runs `path.getTotalLength()` in the constructor, immediately before setting `stroke-dasharray` and `stroke-dashoffset` attributes.
- `ProjectShowcase` constructs the controller and creates the Signature Path ScrollTrigger in its effect.
- `PinnedSections` creates the About pin (`pin: true`, `end: '+=100%'`) in the parent lifecycle.

Relevant current files:

- `components/work/SignaturePathController.ts`
- `components/work/SignaturePath.tsx`
- `components/work/ProjectShowcase.tsx`
- `components/sections/PinnedSections.tsx`

## Question 1: Controller Before SVG Ready?

Verdict: no.

Evidence:

- Browser runtime after hard refresh reported `pathLength: 6156.0419921875`.
- `stroke-dasharray` initialized to `6156.04`.
- `stroke-dashoffset` initialized to `6156.04`.
- `viewBox` existed as `0 0 1000 4000`.
- `preserveAspectRatio` existed as `none`.

The SVG and path were mounted and parseable when the controller ran. The failure was not caused by `getTotalLength()` returning zero or by the SVG path being unavailable.

## Question 2: Controller State Lost After Hydration?

Verdict: no for lost state, yes for bad lifecycle ordering.

Evidence:

- Hard refresh page-load state after fix:
  - `scrollY`: `0`
  - `svgOpacity`: `0`
  - `dasharrayAttr`: `6156.04`
  - `dashoffsetAttr`: `6156.04`
  - `transformAttr`: `translate(-15.00, 0)`
- The controller state existed and updated on scroll.
- The stale behavior was caused by the trigger's measured geometry being shifted, not by missing controller state.

The fix also calls `controller.update(signatureTrigger.progress)` immediately after `ScrollTrigger.create(...)`, so restored scroll positions are synchronized without waiting for the next scroll event.

## Question 3: Dash Attributes After Refresh

Post-fix hard-refresh DOM inspection:

| Sample | scrollY | svg opacity | stroke-dasharray | stroke-dashoffset | transform | draw ratio |
|---|---:|---:|---:|---:|---|---:|
| Page Load | 0 | 0 | 6156.04 | 6156.04 | translate(-15.00, 0) | 0% |
| 0% | 2000 | 0 | 6156.04 | 6156.04 | translate(-15.00, 0) | 0% |
| 25% | 3497 | 1 | 6156.04 | 5596.40 | translate(-12.69, 0) | 9% |
| 50% | 4994 | 1 | 6156.04 | 2798.20 | translate(-1.15, 0) | 55% |
| 75% | 6491 | 1 | 6156.04 | 0.00 | translate(10.38, 0) | 100% |
| 100% | 7988 | 0 | 6156.04 | 0.00 | translate(15.00, 0) | 100% |

Note: computed CSS values display `px` because browser computed style serializes SVG presentation values that way. The runtime source of truth is the SVG attribute values, which remain unitless.

## Question 4: ScrollTrigger Refresh / Layout Stabilization

Verdict: the problem was not a missing random `ScrollTrigger.refresh()` call. It was incorrect trigger creation order.

Measured hard-refresh geometry after fix:

- Work trigger expected start: `scrollY = 2000`
- Work trigger expected end: `scrollY = 7988`
- Work section rendered height: `4988.265625`
- Viewport height: `1000`
- Effective trigger span: `5988.265625`

Pre-fix evidence:

- At the expected 0% Work position (`scrollY = 2000`), the SVG opacity was already `0.17`.
- That maps to controller progress `~0.167`.
- `0.167 * 5988px ~= 1000px`, exactly the desktop About pin spacer height.

After fix:

- At the expected 0% Work position (`scrollY = 2000`), opacity is `0`, offset is full length, drift is `-15`.
- At 50%, offset is `2798.20`, opacity is `1`, drift is `-1.15`.
- At 100%, offset is `0`, opacity is `0`, drift is `15`.

## Question 5: SVG Height / ViewBox Mismatch?

Verdict: no.

Evidence:

- Rendered SVG height after refresh: `4988.265625px`.
- SVG viewBox: `0 0 1000 4000`.
- `preserveAspectRatio`: `none`.
- Path length: `6156.0419921875`.
- Unitless attributes update correctly after refresh.

The coordinate-space strategy is valid. The previous rebuild's unitless-attribute fix remains correct.

## Screenshots

Visual verification screenshots were captured after hard refresh and after the loader completed:

- 0%: `docs/06-development/signature-path-refresh-bug-screenshots/fixed-loaded-progress-0.png`
- 50%: `docs/06-development/signature-path-refresh-bug-screenshots/fixed-loaded-progress-50.png`
- 100%: `docs/06-development/signature-path-refresh-bug-screenshots/fixed-loaded-progress-100.png`

Observed:

- 0%: path hidden, dash offset full, drift `-15`.
- 50%: blue path visibly drawn through the Work section, dash offset reduced, drift near center.
- 100%: path draw complete but SVG opacity faded out for the transition into Contact.

## Implemented Fix

1. `PinnedSections` now uses `useLayoutEffect` for the parent ScrollTrigger setup. This makes the About pin/spacer exist before the child `ProjectShowcase` passive effect creates the Signature Path trigger.
2. `ProjectShowcase` now stores the created Signature Path trigger and immediately synchronizes the controller from `signatureTrigger.progress`.
3. Touched-file type cleanup removed local `any` usage for the global scroll fields and reveal item loop.

## Verification

- `npm run build`: passed.
- `npm run lint`: failed due pre-existing repo-wide lint issues in unrelated files. The touched-file lint issues from this patch were cleaned up.
- Hard-refresh DOM verification: passed.
- Visual verification: passed.

## Recommendation

Keep parent scroll/pin ownership in `PinnedSections`, but initialize parent pinning in the layout-effect phase whenever child sections depend on post-pin geometry. Avoid adding arbitrary delays or stray `ScrollTrigger.refresh()` calls; they mask the lifecycle ordering bug and can regress again under SSR/hydration or Fast Refresh differences.
