# Contact Reverse Flicker Knowledge

## Problem Summary

There is still a visible white flicker/glitch during reverse scroll around global scroll progress `0.934` to `0.935`.

User-visible symptom:
- Happens while reverse scrolling from Contact back toward Work.
- The Contact overlay is supposed to remain black and settled.
- A white flash/flicker is still visible to the user between `0.934` and `0.935`.
- User reports the issue persists after multiple attempted fixes.

Important: automated DOM/pixel checks suggested some fixes were working, but the user's actual visual result still shows flicker. Treat current automated evidence as incomplete, not definitive.

## Relevant Files

- `components/sections/PinnedSections.tsx`
- `components/scenes/ContactScene.ts`
- `components/sections/Contact.tsx`
- `components/work/ProjectShowcase.tsx`
- `components/ui/Loader.tsx`
- `components/layout/LoaderWrapper.tsx`
- `app/globals.css`

## Current Intended Behavior

The Work section should visually behave like the last normal page section. Contact should not feel like a separate white/normal section underneath it.

Desired Contact behavior:
- Contact appears as a fixed, full-viewport overlay above the bottom of Work.
- On forward scroll: Contact slides up over Work, then Contact text/content reveals.
- On reverse scroll: Contact text/content should settle/hide first, then the black Contact panel should slide down.
- No white Work background, Loader wave, text tail, or subpixel seam should flash during reverse.

## Current Implementation State

### Contact Overlay Structure

`Contact.tsx` currently renders `.contact-section-container` as:

- `position: fixed`
- `inset: 0`
- `width: 100vw`
- `height: 100vh`
- `backgroundColor: '#050505'`
- `zIndex: 850`
- `pointerEvents: 'none'`
- `overflow: 'hidden'`
- `willChange: 'transform'`

This was changed from the older absolute/normal section model.

### Contact Trigger

`PinnedSections.tsx` now drives Contact using `#work-section`:

- trigger: `#work-section`
- start: `bottom bottom`
- end: `bottom top`
- scrub: `true`

It calls `contactScene.setProgress(...)`.

A direct scroll/resize sync was also added:

```ts
const updateContactOverlayProgress = () => {
  const workSection = document.getElementById('work-section');
  if (!workSection) return;

  const workBounds = workSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const progress = viewportHeight > 0
    ? gsap.utils.clamp(0, 1, (viewportHeight - workBounds.bottom) / viewportHeight)
    : 0;

  contactScene.setProgress(progress);
};
```

This was added because one debug pass showed a one-frame stale state when jumping from bottom to `0.935`.

### Contact Scene Progress Logic

`ContactScene.ts` now has:

- `setProgress(progress)`
- panel progress and content progress separated
- `CONTENT_REVEAL_START = 0.42`
- `CONTENT_REVEAL_DEADZONE = 0.2`
- `resetContent(...)` to force title chars, utility columns, footer, hover CSS vars, and pointer state back to baseline

Core idea:
- panel reaches full cover before content reveal starts
- during reverse, content is reset before panel moves down
- title stagger tail is blanked in the early content range

Current logic includes:

```ts
const rawContentProgress = gsap.utils.clamp(
  0,
  1,
  (clampedProgress - CONTENT_REVEAL_START) / (1 - CONTENT_REVEAL_START)
);

const contentProgress = rawContentProgress <= CONTENT_REVEAL_DEADZONE
  ? 0
  : gsap.utils.clamp(
      0,
      1,
      (rawContentProgress - CONTENT_REVEAL_DEADZONE) / (1 - CONTENT_REVEAL_DEADZONE)
    );
```

And the panel is held at full cover while content is active:

```ts
gsap.set('.contact-section-container', {
  yPercent: contentProgress > 0 ? 0 : (1 - easedPanelProgress) * 100,
  opacity: 1,
});
```

### Contact Hover Reset

`Contact.tsx` now listens for `contactSceneReset`:

```ts
window.addEventListener('contactSceneReset', resetHoverField);
```

`resetHoverField` cancels animation frames and resets:

- pointer active state
- pointer velocity
- char energy
- `--contact-hover-stop`
- `--contact-hover-warm-stop`
- `--contact-hover-white-stop`
- `--contact-energy-scale`

This was added because hover/radial gradient state could otherwise remain visible during reverse.

## Fix Attempts Already Made

### Attempt 1: Make Contact a fixed overlay

Changed Contact from normal/absolute section behavior to a fixed overlay.

Result:
- Contact layer started appearing over Work.
- But user later saw glitches during reverse.

### Attempt 2: Remove transform stacking

Earlier Contact had an inline `transform: translateY(100%)` plus GSAP `yPercent`, causing stacked translation.

Removed the inline transform and let GSAP own `yPercent`.

Result:
- Contact could reach full viewport at bottom.
- Did not fully solve flicker/glitch.

### Attempt 3: Separate panel movement from content timeline

Changed `ContactScene` so panel `yPercent` is controlled directly by progress, and title/utility/footer are controlled by the timeline.

Result:
- Reduced coupling between slide-up panel and text reveal.
- Did not fully solve flicker/glitch.

### Attempt 4: Force reset on reverse

Added `resetContent(...)` to set:

- title debug opacity to `0`
- title chars to `y: '112%'`, `opacity: 0`
- utility/footer to `opacity: 0`, `y: 18`
- pointer events to `none`
- hover CSS vars to `0%`

Result:
- DOM checks showed title/content resetting.
- User still sees flicker.

### Attempt 5: Disable pointer/hover residue

Added `contactSceneReset` event and reset hover interaction state in `Contact.tsx`.

Result:
- Reduced risk of radial hover highlight/gradient staying alive.
- User still sees flicker.

### Attempt 6: Hold panel full-cover while content reverses

Changed panel logic so panel stays at `yPercent: 0` while `contentProgress > 0`.

Goal:
- prevent Work's white background from appearing behind partial Contact content.

Result from automated DOM:
- At `0.935`, panel top was `0`, transform was identity.
- But user still sees flicker.

### Attempt 7: Add content dead-zone

Automated debug showed that at `0.934-0.935`, title stagger tail still had 4-6 visible center letters with opacity as high as about `0.75`.

Added `CONTENT_REVEAL_DEADZONE = 0.2`, remapping early content progress to `0`.

Automated result after patch:
- At `0.934`, `0.9345`, `0.935`, `0.9355`, `0.936`:
  - panel top `0`
  - panel bottom viewport height
  - visible title chars `0`
  - max title opacity `0.000`

User result:
- User still reports flicker persists.

### Attempt 8: Direct progress sync on scroll/resize

Added `updateContactOverlayProgress` listener in `PinnedSections.tsx`.

Reason:
- A jump test from bottom to `0.935` showed one stale frame where all title chars were still opacity `1` before the next RAF/ScrollTrigger update corrected them.

Result:
- Automation looked cleaner, but user still reports visual flicker.

## Automated Debug Evidence Collected

### DOM sampling before dead-zone

At document ratio around `0.935`, Contact panel was full-cover, but title tail was still visible:

- scene progress about `0.5252`
- raw content progress about `0.1814`
- visible chars: `4`
- max opacity: about `0.748`

This suggested the white flash could be title stagger tail.

### DOM sampling after dead-zone

After dead-zone:

- `0.934` to `0.936`:
  - panel full-cover
  - visible chars `0`
  - max title opacity `0.000`

But this did not match user's visual report.

### Loader false positive during debug

One screenshot at `0.935` showed white/green wave and `JUSTCHANIAGO [14%]`.

This came from `components/ui/Loader.tsx`, because the headless test initially did not wait for `html.is-loaded`.

After waiting for:

```js
document.documentElement.classList.contains('is-loaded')
```

the loader was unmounted and no longer present in the screenshot.

Conclusion:
- Loader can create a white/green false positive if tests run before loading finishes.
- But user likely observes after loader is gone, so do not assume Loader is the final root cause unless verified in browser.

## Current Known Gap

Automation says the specific Contact DOM state is clean at `0.934-0.935`, but user still sees flicker.

This means the root cause may be outside the currently sampled Contact title/panel properties, or the issue depends on real browser smooth scroll behavior, device pixel ratio, refresh timing, Lenis, compositing, or dev overlay/debug elements.

## Strong Next Hypotheses

### 1. Lenis and ScrollTrigger are desynced

The app uses Lenis. ScrollTrigger may be receiving updates at a different timing than Lenis' actual transform/scroll frame.

What to inspect:
- `components/layout/LenisInit.tsx`
- whether `ScrollTrigger.update()` is called from Lenis RAF
- whether `gsap.ticker` and Lenis RAF are double-driving scroll
- whether direct `window.scroll` listeners are insufficient because Lenis uses virtual scroll timing

Potential fix direction:
- integrate Lenis and ScrollTrigger through one authoritative RAF/update loop
- remove duplicate scroll listener if it causes race conditions

### 2. Debug scroll ruler or nav element causes white flashes

There is a fixed debug scroll ruler in `PinnedSections.tsx` with very high z-index `9999`.

It contains white text/lines and can visually look like flicker if it overlaps the transition area.

What to test:
- temporarily remove/hide `#debug-scroll-ruler`
- check if flicker disappears

### 3. GPU/compositing seam from fixed transform layer

Contact is `position: fixed` with GSAP transform. On reverse, browser compositor may flash underlying white background even when DOM says panel is full-cover.

Potential fix direction:
- add a permanent fixed black underlay behind Contact during the Work -> Contact range
- make Contact panel slightly overscan viewport:
  - `inset: -2px`
  - `width: calc(100vw + 4px)`
  - `height: calc(100vh + 4px)`
- use `translate3d(0, ..., 0)` or `force3D: true`
- set `backfaceVisibility: 'hidden'`, `contain: 'paint'`, `isolation: 'isolate'`

### 4. Theme variable `--color-bg` flips white behind Contact

Work and global background are often white via `--color-bg`.

Even with Contact full-cover, any compositing gap exposes white.

Potential fix direction:
- while Contact overlay is in active range, force a black page underlay or temporarily set root/body background to `#050505`
- do not rely only on the moving Contact layer to hide white

### 5. Contact content timeline still has stale frame in real gesture

Automation using `window.scrollTo` may not reproduce real wheel/touchpad reverse scroll.

What to test:
- use browser with real wheel input
- sample with `requestAnimationFrame` continuously during wheel, not after scroll settles
- log every frame where:
  - panel top > `0`
  - any title char opacity > `0`
  - any utility/footer opacity > `0`
  - element at viewport center/top is not Contact

## Suggested Next Debug Script

Add temporary in-browser debug code, not headless-only:

```js
(() => {
  const rows = [];
  function sample() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const ratio = scrollY / max;
    if (ratio > 0.93 && ratio < 0.94) {
      const panel = document.querySelector('.contact-section-container');
      const chars = [...document.querySelectorAll('.contact-title-char')];
      const utilities = [...document.querySelectorAll('.contact-utility-column')];
      const footer = document.querySelector('.contact-footer-meta');
      rows.push({
        t: performance.now(),
        ratio,
        y: scrollY,
        panelTop: panel?.getBoundingClientRect().top,
        panelTransform: panel && getComputedStyle(panel).transform,
        maxCharOpacity: Math.max(...chars.map((el) => Number(getComputedStyle(el).opacity))),
        utilityOpacity: utilities.map((el) => getComputedStyle(el).opacity),
        footerOpacity: footer && getComputedStyle(footer).opacity,
        topEl: document.elementFromPoint(innerWidth / 2, 2)?.className,
        midEl: document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.className,
      });
    }
    requestAnimationFrame(sample);
  }
  requestAnimationFrame(sample);
  window.__contactFlickerRows = rows;
})();
```

After reproducing the flicker:

```js
console.table(window.__contactFlickerRows.slice(-80));
```

## Suggested Next Fix Direction

Most robust likely fix:

1. Add a fixed black underlay independent from Contact content/panel.
2. Activate it for the entire Work-bottom-to-Contact range, slightly earlier than Contact panel movement.
3. Keep it visible until reverse scroll is safely above the problematic range.
4. Let the Contact panel/content animate above that underlay.

Reason:
- If the flicker is compositor/theme/white-background exposure, content/panel timeline tuning will keep missing it.
- A stable underlay removes white as a possible visual fallback.

Possible implementation:

```tsx
<div className="contact-transition-underlay" aria-hidden="true" />
```

CSS:

```css
.contact-transition-underlay {
  position: fixed;
  inset: -2px;
  background: #050505;
  opacity: 0;
  pointer-events: none;
  z-index: 840;
  transform: translateZ(0);
  backface-visibility: hidden;
  contain: paint;
}
```

Drive opacity from the same Work-bottom progress:

- opacity `1` before Contact content starts
- opacity remains `1` during reverse until Contact panel is fully hidden or until safely before `0.934`

This is preferable to more title dead-zone tweaking if the issue is white exposure rather than text opacity.

## Current Verification Commands Used

These passed after the latest changes:

```bash
npx tsc --noEmit
npx eslint components/scenes/ContactScene.ts components/sections/PinnedSections.tsx components/sections/Contact.tsx
```

## Important Warning For Next Agent

Do not trust a single settled DOM sample. The flicker is likely frame/timing/compositor related.

The next debug should inspect continuous frames during real reverse scroll, after loader has completed, preferably with Lenis running normally in the actual browser.

