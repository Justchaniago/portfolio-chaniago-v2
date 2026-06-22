# FEATURE-003J Work Placeholder Scroll-Then-Morph Report

Date: 2026-06-13

## Summary

Implemented the Work placeholder expansion as an in-place shared-element morph interaction.

The current behavior:

- Work has 6 abstract placeholder cards.
- Clicking/tapping a placeholder expands it into a near-viewport preview card.
- If the clicked card is clipped or partially outside the viewport, the page scrolls it into a better measuring position first, then starts the morph.
- Collapse runs as a reverse morph on normal close paths: scroll intent, outside click, Escape, resize, close button, and desktop pointer leave.
- Source layout stays stable because the original placeholder remains in the document flow and is only visually hidden while the overlay is active.
- The expanded card is still placeholder-only; no real project image/gallery logic was added.

This task did not add ScrollTrigger pinning to Work. Existing Work reveal triggers and the signature-path scrub remain, but the signature scrub is temporarily disabled while a placeholder is expanded.

## Files Edited

### `components/work/ProjectShowcase.tsx`

Main implementation file.

Changes made:

- Added a typed six-card placeholder config.
- Converted placeholder blocks into clickable and keyboard-accessible morph sources.
- Added FLIP-style measurement with `getBoundingClientRect()`.
- Added scroll-then-morph preparation for clipped cards.
- Added one fixed overlay card rendered from React state.
- Added transform-based expand/collapse animation through GSAP.
- Added dual-layer morph structure:
  - shell/card layer handles position, scale, border radius, shadow, and clip mask;
  - media layer uses inverse counter-scale so inner visual content does not stretch during the shell morph.
- Added gradient scrim and staggered text reveal inside the expanded card.
- Added collapse triggers and interaction guards.
- Added off-screen fallback for the rare case where the destination source is fully outside the viewport.
- Disabled the signature path ScrollTrigger while expanded and re-enabled it after close.

### `lib/gsap.ts`

GSAP plugin registration.

Changes made:

- Registered `ScrollToPlugin`.
- Exported `ScrollToPlugin` with the existing GSAP utilities.

```ts
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CustomEase);

export { gsap, ScrollTrigger, ScrollToPlugin, CustomEase };
```

## Key Technical Design

### 1. Placeholder Config

The six placeholders are now defined in one config array:

```ts
const PLACEHOLDER_CARDS = [
  { id: 'wp-1', className: 'wp-1', title: 'Large Landscape Anchor', meta: '16:10 / Primary field' },
  { id: 'wp-2', className: 'wp-2', title: 'Tall Portrait Overlap', meta: '4:5 / Foreground overlap' },
  { id: 'wp-3', className: 'wp-3', title: 'Ultra Wide Cinematic', meta: '21:9 / Cinematic wall' },
  { id: 'wp-4', className: 'wp-4', title: 'Medium Portrait', meta: '3:4 / Editorial study' },
  { id: 'wp-5', className: 'wp-5', title: 'Rhythm Interrupter', meta: '1:1 / Detail crop' },
  { id: 'wp-6', className: 'wp-6', title: 'Solitary Close', meta: '16:10 / Closing frame' },
] as const;
```

This keeps ID, layout class, title, and ratio metadata in one place.

### 2. Morph State And Refs

The animation is mostly ref-driven so GSAP can run without forcing React renders every frame.

Important refs:

```ts
const overlayRef = useRef<HTMLDivElement>(null);
const mediaLayerRef = useRef<HTMLDivElement>(null);
const scrimRef = useRef<HTMLDivElement>(null);
const gradientScrimRef = useRef<HTMLDivElement>(null);
const activePlaceholderIdRef = useRef<PlaceholderId | null>(null);
const originRectRef = useRef<MorphRect | null>(null);
const targetRectRef = useRef<MorphRect | null>(null);
const isMorphingRef = useRef(false);
const isPreparingOpenRef = useRef(false);
const isScrollingToCardRef = useRef(false);
const expandCompleteRef = useRef(false);
const signatureScrollTriggerRef = useRef<ScrollTrigger | null>(null);
const placeholderRefs = useRef<Partial<Record<PlaceholderId, HTMLDivElement | null>>>({});
```

Why refs:

- avoid rerendering during timeline frames;
- block repeated click while opening/closing;
- preserve the active source ID during async scroll preparation;
- keep measured source and target rects stable for reverse morph.

### 3. Target Expanded Size

The expanded card is viewport-relative.

```ts
const getTargetRect = useCallback((): MorphRect => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobile = viewportWidth <= 768;
  const width = Math.round(viewportWidth * (isMobile ? 0.92 : 0.9));
  const height = Math.round(viewportHeight * (isMobile ? 0.78 : 0.86));

  return {
    x: Math.round((viewportWidth - width) / 2),
    y: Math.round((viewportHeight - height) / 2),
    width,
    height,
    borderRadius: isMobile ? 22 : 32,
  };
}, []);
```

Result:

- desktop: about `90vw x 86vh`;
- mobile: about `92vw x 78vh`;
- centered with breathing room around the viewport.

### 4. Scroll-Then-Morph

Before opening, the clicked source is checked. If it is clipped, the page scrolls it into a stable position first.

```ts
const scrollToPlaceholder = useCallback((source: HTMLElement, idealTopRatio = 0.12) => (
  new Promise<void>((resolve) => {
    const rect = source.getBoundingClientRect();
    const idealTop = window.innerHeight * idealTopRatio;
    const isFullyVisible = rect.top >= idealTop && rect.bottom <= window.innerHeight * 0.95;

    if (isFullyVisible) {
      resolve();
      return;
    }

    isScrollingToCardRef.current = true;
    gsap.to(window, {
      scrollTo: {
        y: window.scrollY + rect.top - idealTop,
        autoKill: false,
      },
      duration: 0.45,
      ease: 'power3.inOut',
      onComplete: () => {
        isScrollingToCardRef.current = false;
        resolve();
      },
      onInterrupt: () => {
        isScrollingToCardRef.current = false;
        resolve();
      },
    });
  })
), []);
```

Important guard:

- `isScrollingToCardRef` prevents the programmatic scroll from immediately triggering close.

### 5. Expand Flow

The open flow is:

1. reject repeated click if morph/open is already active;
2. normalize the source placeholder opacity/transform;
3. scroll into a better viewport position if needed;
4. measure the source rect;
5. disable signature-path scrub;
6. mount the fixed overlay card.

```ts
const expandPlaceholder = useCallback(async (placeholderId: PlaceholderId) => {
  if (isPreparingOpenRef.current || isMorphingRef.current || activePlaceholderIdRef.current) return;

  const source = placeholderRefs.current[placeholderId];
  if (!source) return;

  isPreparingOpenRef.current = true;
  gsap.killTweensOf(source);
  gsap.set(source, {
    opacity: 1,
    y: 0,
    scale: 1,
    clearProps: 'filter',
  });

  await scrollToPlaceholder(source);

  originRectRef.current = getSourceRect(placeholderId);
  if (!originRectRef.current) {
    isPreparingOpenRef.current = false;
    return;
  }

  signatureScrollTriggerRef.current?.disable();
  activePlaceholderIdRef.current = placeholderId;
  isPreparingOpenRef.current = false;
  setActivePlaceholderId(placeholderId);
}, [getSourceRect, scrollToPlaceholder]);
```

### 6. Dual-Layer Morph

The latest version uses a shell layer plus a media layer.

The shell is fixed at the final card size and starts visually clipped/scaled to the source rect:

```ts
gsap.set(overlay, {
  x: targetRect.x,
  y: targetRect.y,
  width: targetRect.width,
  height: targetRect.height,
  borderRadius: originRect.borderRadius,
  opacity: 1,
  scaleX: initialScaleX,
  scaleY: initialScaleY,
  clipPath: `inset(${clipTop}px ${clipRight}px ${clipBottom}px ${clipLeft}px round ${originRect.borderRadius}px)`,
  boxShadow: '0 4px 24px rgba(10, 10, 10, 0.01)',
  transformOrigin: '0% 0%',
});
```

The media layer starts with inverse scale:

```ts
gsap.set(mediaLayer, {
  scaleX: prefersReducedMotion ? 1 : 1 / initialScaleX,
  scaleY: prefersReducedMotion ? 1 : 1 / initialScaleY,
  opacity: 0.68,
  xPercent: 0,
  yPercent: 0,
  transformOrigin: '0% 0%',
});
```

Why this matters:

- The card shell can scale from source to viewport.
- The inner media is counter-scaled, so gradients/grid/content do not look crushed or stretched during the morph.
- This fixes the roughest visual issue from the earlier implementation where the overlay content looked too elastic.

### 7. Expand Timeline

The expand animation uses:

- shell scale to full size;
- clip-path to reveal full card;
- border radius transition;
- deeper shadow;
- scrim fade-in;
- media inverse scale back to `1`;
- delayed gradient scrim;
- staggered text reveal.

```ts
timeline
  .to(scrim, {
    opacity: prefersReducedMotion ? 0.12 : 1,
    duration: prefersReducedMotion ? 0.16 : 0.42,
  }, 0)
  .to(overlay, prefersReducedMotion
    ? {
        x: targetRect.x,
        y: targetRect.y,
        width: targetRect.width,
        height: targetRect.height,
        borderRadius: targetRect.borderRadius,
        clipPath: `inset(0px 0px 0px 0px round ${targetRect.borderRadius}px)`,
        opacity: 1,
        duration: 0.18,
      }
    : {
        x: targetRect.x,
        y: targetRect.y,
        scaleX: 1,
        scaleY: 1,
        borderRadius: targetRect.borderRadius,
        clipPath: `inset(0px 0px 0px 0px round ${targetRect.borderRadius}px)`,
        boxShadow: '0 44px 120px rgba(10, 10, 10, 0.22), 0 12px 40px rgba(249, 92, 75, 0.08)',
        duration: 0.6,
      }, 0)
  .to(mediaLayer, {
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    duration: prefersReducedMotion ? 0.18 : 0.6,
  }, 0)
  .to(gradientScrim, {
    opacity: 1,
    duration: 0.4,
    ease: 'power2.out',
  }, prefersReducedMotion ? 0.08 : 0.38)
  .to(textCatRef.current, { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out' }, prefersReducedMotion ? 0.08 : 0.46)
  .to(textTitleRef.current, { opacity: 1, y: 0, duration: 0.42, ease: 'power3.out' }, prefersReducedMotion ? 0.1 : 0.52)
  .to(textDescRef.current, { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out' }, prefersReducedMotion ? 0.12 : 0.58)
  .to(textTagsRef.current, { opacity: 1, y: 0, duration: 0.32, ease: 'power3.out' }, prefersReducedMotion ? 0.14 : 0.63);
```

### 8. Morph-Based Collapse

Collapse remeasures the destination placeholder and morphs the expanded card back to that rect.

```ts
const destinationRect = getSourceRect(activePlaceholderIdRef.current) ?? originRectRef.current;
const scaleX = destinationRect.width / targetRect.width;
const scaleY = destinationRect.height / targetRect.height;
const clipTop = destinationRect.y - targetRect.y;
const clipLeft = destinationRect.x - targetRect.x;
const clipRight = targetRect.width - (clipLeft + destinationRect.width);
const clipBottom = targetRect.height - (clipTop + destinationRect.height);
```

Normal close path:

```ts
timeline
  .to(gradientScrim, { opacity: 0, duration: 0.18, ease: 'power2.in' }, 0)
  .to(getTextNodes(), { opacity: 0, y: 8, duration: 0.18, ease: 'power2.in' }, 0)
  .to(scrim, { opacity: 0, duration: duration * 0.72 }, 0)
  .to(overlay, {
    x: destinationRect.x,
    y: destinationRect.y,
    scaleX,
    scaleY,
    borderRadius: destinationRect.borderRadius,
    clipPath: `inset(${clipTop}px ${clipRight}px ${clipBottom}px ${clipLeft}px round ${destinationRect.borderRadius}px)`,
    boxShadow: '0 4px 24px rgba(10, 10, 10, 0.01)',
    duration,
  }, 0)
  .to(mediaLayer, {
    scaleX: 1 / scaleX,
    scaleY: 1 / scaleY,
    opacity: 0.68,
    duration: duration * 0.9,
  }, 0);
```

This is the important fix for the user's complaint that scroll-close should not suddenly fade. Scroll now triggers the same reverse morph as other normal close actions.

## Interaction Behavior

Open:

- click/tap on a placeholder;
- Enter or Space on a focused placeholder;
- repeated clicks are ignored while preparing or morphing.

Close:

- scroll;
- wheel;
- touchmove;
- outside click on scrim;
- Escape;
- resize;
- close button;
- desktop pointer leave after a 120ms debounce.

Mobile:

- no dependency on hover leave;
- tap outside or scroll closes.

Reduced motion:

- uses shorter opacity/scale behavior instead of the full morph timing.

## Important CSS Additions

The overlay layer is fixed and independent from the Work document layout:

```css
.work-morph-layer {
  position: fixed;
  inset: 0;
  z-index: 1400;
  pointer-events: none;
}

.work-morph-card {
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  pointer-events: auto;
  will-change: transform, clip-path, border-radius, box-shadow, opacity;
  contain: layout paint;
}
```

The source placeholder is hidden without removing layout space:

```css
.work-placeholder.is-morph-source-hidden {
  opacity: 0 !important;
  pointer-events: none;
}
```

The media layer is separate from the card shell:

```css
.work-morph-media-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0.68;
  will-change: transform, opacity;
  transform-origin: 0% 0%;
}
```

The expanded preview gets a bottom readability gradient and placeholder text panel:

```css
.work-morph-gradient-scrim {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 58%;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.84) 0%,
    rgba(0, 0, 0, 0.58) 42%,
    rgba(0, 0, 0, 0) 100%
  );
  opacity: 0;
  z-index: 2;
  pointer-events: none;
}
```

## Tradeoffs

### Why not a normal modal?

A normal centered modal would be simpler, but it would not preserve the sense that the clicked card becomes the expanded card. The requirement was shared-element morph, so the implementation measures the source and animates a fixed overlay from that source.

### Why keep the original placeholder mounted?

Removing it would cause layout shift in Work. Keeping it mounted and only hiding it visually preserves spacing and makes reverse morph possible.

### Why use transform and clip-path instead of width/height animation?

Animating width and height every frame is more likely to feel rough and can cost more layout work. The current implementation keeps the card at target dimensions and animates transform plus clip-path. This is smoother, but more complex.

### Why add media counter-scale?

Scaling a whole card makes inner gradients and placeholder visuals stretch. The counter-scale media layer reduces that distortion. It is more code, but gives a more premium morph feel.

### Why still have an off-screen fade fallback?

If the user scrolls so far that the source card is fully outside the viewport before close can resolve a destination, a perfect reverse morph would target an invisible location. In that rare case, fading is safer than animating to a bad rect.

### Why disable signature scrub while expanded?

The signature path uses ScrollTrigger scrub behavior. Scroll is also a close trigger for the expanded placeholder. Temporarily disabling the signature scrub reduces visual conflict while the overlay is active, then restores it on close.

## Known Limitations

- The card is still placeholder-only. Real image/video content will need separate asset handling later.
- The current implementation is custom GSAP logic, not GSAP Flip plugin. It is explicit and controlled, but more manual.
- If the destination source is fully off-screen, the collapse uses the fallback fade instead of a full reverse morph.
- Pointer-leave close only applies to hover-capable desktop devices after expansion completes.
- The Work section still has many CSS rules inside `ProjectShowcase.tsx`; this task did not split styling into a separate stylesheet.

## Verification Performed

Commands run after implementation:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Result:

- TypeScript passed.
- Lint passed with existing warnings only.
- Production build passed.

Runtime check was also performed against the local preview on `http://localhost:3002`:

- clicked a clipped placeholder;
- programmatic scroll moved it into a better source position before morph;
- expanded overlay measured around near-viewport size;
- media layer ended at normal scale after expand;
- gradient scrim and text reveal reached visible opacity;
- scroll close kept the overlay visible during reverse morph instead of instantly fading/unmounting.

## Current Git Scope

Current modified runtime file:

- `components/work/ProjectShowcase.tsx`

Documentation file:

- `docs/06-development/FEATURE_003J_WORK_PLACEHOLDER_SCROLL_THEN_MORPH_REPORT.md`

Related GSAP file if not already committed in the current branch:

- `lib/gsap.ts`

## Follow-Up Recommendations

1. Test manually on real device Safari/Chrome mobile because `clip-path` plus transform can vary slightly by browser.
2. When real project media exists, keep the shell/media split so image content does not stretch during morph.
3. If the interaction needs even more native shared-element precision later, evaluate replacing the manual math with GSAP Flip plugin.
4. Consider extracting Work morph styles into a dedicated CSS module or component once the interaction stabilizes.
