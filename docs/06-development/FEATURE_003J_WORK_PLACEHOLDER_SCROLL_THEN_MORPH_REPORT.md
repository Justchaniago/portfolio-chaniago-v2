# FEATURE-003J Work Placeholder Scroll-Then-Morph Report

Date: 2026-06-13

## Summary

Implemented an Apple-style scroll-then-morph interaction for the Work section placeholders in `ProjectShowcase.tsx`.

The Work placeholder cards now:

- open from their exact source position into a near-viewport expanded preview;
- scroll into an ideal viewport position before morphing if the clicked card is clipped or partially off-screen;
- collapse back to the source card with the same transform-based morph on scroll, outside click, Escape, resize, or desktop pointer leave;
- avoid sudden fade during normal scroll-close;
- keep the expanded content abstract/placeholder-only until real project images are ready.

The Work section still does not use `pin: true`. Existing reveal ScrollTriggers and signature-path scrub remain intact.

## Files Edited

### `lib/gsap.ts`

Purpose:

- Register GSAP `ScrollToPlugin` so Work placeholders can scroll to an ideal viewport position before morphing.

Key change:

```ts
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CustomEase);

export { gsap, ScrollTrigger, ScrollToPlugin, CustomEase };
```

### `components/work/ProjectShowcase.tsx`

Purpose:

- Convert six static placeholder blocks into interactive morph sources.
- Add scroll-then-morph opening.
- Add transform-only FLIP morph animation.
- Add consistent morph-based close behavior.
- Add edge-case handling for clipped/off-screen cards.
- Pause signature-path scrub while expanded.

## Main Code Additions

### Placeholder Configuration

The six placeholders are now represented by a typed config array instead of repeated hardcoded JSX.

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

Each placeholder is now clickable and keyboard-accessible:

```tsx
<div
  key={placeholder.id}
  ref={(node) => {
    placeholderRefs.current[placeholder.id] = node;
  }}
  className={`work-reveal-item work-placeholder ${placeholder.className}${activePlaceholderId === placeholder.id ? ' is-morph-source-hidden' : ''}`}
  role="button"
  tabIndex={0}
  aria-label={`Expand ${placeholder.title}`}
  aria-pressed={activePlaceholderId === placeholder.id}
  onClick={() => expandPlaceholder(placeholder.id)}
  onKeyDown={(event) => handlePlaceholderKeyDown(event, placeholder.id)}
>
  <div className="work-placeholder-inner" />
  <span className="work-placeholder-index">{placeholder.id.replace('wp-', '').padStart(2, '0')}</span>
</div>
```

### State And Runtime Refs

The interaction is mostly ref-driven to avoid unnecessary render churn during GSAP animation.

```ts
const [activePlaceholderId, setActivePlaceholderId] = useState<PlaceholderId | null>(null);
const overlayRef = useRef<HTMLDivElement>(null);
const overlayInnerRef = useRef<HTMLDivElement>(null);
const scrimRef = useRef<HTMLDivElement>(null);
const activePlaceholderIdRef = useRef<PlaceholderId | null>(null);
const originRectRef = useRef<MorphRect | null>(null);
const targetRectRef = useRef<MorphRect | null>(null);
const isMorphingRef = useRef(false);
const isPreparingOpenRef = useRef(false);
const isScrollingToCardRef = useRef(false);
const expandCompleteRef = useRef(false);
const ambientTweenRef = useRef<gsap.core.Tween | null>(null);
const pointerLeaveTimeoutRef = useRef<number | null>(null);
const signatureScrollTriggerRef = useRef<ScrollTrigger | null>(null);
const placeholderRefs = useRef<Partial<Record<PlaceholderId, HTMLDivElement | null>>>({});
```

### Target Expanded Rect

Expanded preview size is viewport-based:

- desktop: `90vw x 86vh`, `32px` radius
- mobile: `92vw x 78vh`, `22px` radius

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

### Scroll-Then-Morph

Before morphing, a clipped card is smoothly scrolled into a stable measuring position.

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

### Open Flow

`expandPlaceholder()` now waits for the programmatic scroll before measuring the source rect.

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

### Transform-Only FLIP Expand

The overlay is fixed at the final target size, then animated from source scale to full scale. This avoids animating `width` and `height` every frame.

```ts
gsap.set(overlay, {
  x: originRect.x,
  y: originRect.y,
  width: targetRect.width,
  height: targetRect.height,
  borderRadius: originRect.borderRadius,
  opacity: 1,
  scaleX: initialScaleX,
  scaleY: initialScaleY,
  boxShadow: '0 4px 24px rgba(10, 10, 10, 0.01)',
  transformOrigin: '0% 0%',
});
```

The expand animation:

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
        opacity: 1,
        duration: 0.18,
      }
    : {
        x: targetRect.x,
        y: targetRect.y,
        scaleX: 1,
        scaleY: 1,
        borderRadius: targetRect.borderRadius,
        boxShadow: '0 44px 120px rgba(10, 10, 10, 0.22), 0 12px 40px rgba(249, 92, 75, 0.08)',
        duration: 0.72,
      }, 0)
  .to(overlayInner, {
    scale: prefersReducedMotion ? 1 : 1.025,
    opacity: 1,
    duration: prefersReducedMotion ? 0.18 : 0.72,
  }, 0);
```

### Morph-Based Collapse

Normal collapse re-measures the source placeholder and morphs the expanded card back to it.

```ts
const destinationRect = getSourceRect(activePlaceholderIdRef.current) ?? originRectRef.current;
const scaleX = destinationRect.width / targetRect.width;
const scaleY = destinationRect.height / targetRect.height;

timeline
  .to(scrim, { opacity: 0, duration: duration * 0.72 }, 0)
  .to(overlay, {
    x: destinationRect.x,
    y: destinationRect.y,
    scaleX,
    scaleY,
    borderRadius: destinationRect.borderRadius,
    boxShadow: '0 4px 24px rgba(10, 10, 10, 0.01)',
    duration,
  }, 0)
  .to(overlayInner, {
    scale: 1,
    opacity: 0.68,
    duration: duration * 0.9,
  }, 0);
```

### Off-Screen Collapse Fallback

If the source card is fully off-screen at close time, the card fades out instead of morphing to an invisible/off-screen target.

```ts
const isOffScreen = destinationRect.y + destinationRect.height < 0 || destinationRect.y > window.innerHeight;

if (isOffScreen) {
  timeline
    .to(scrim, { opacity: 0, duration: 0.2 }, 0)
    .to(overlay, {
      opacity: 0,
      scale: 0.96,
      duration: prefersReducedMotion ? 0.16 : 0.25,
      ease: 'power2.in',
    }, 0);
  return;
}
```

### Event Blocking

Close handlers ignore programmatic scroll from `scrollToPlaceholder()`.

```ts
const handleScrollIntent = () => {
  if (isScrollingToCardRef.current) return;
  collapsePlaceholder();
};
```

Applied to:

- `keydown`
- `wheel`
- `touchmove`
- `scroll`
- `resize`

### Signature Path Pause

The Work signature path scrub is disabled while a card is expanded, then enabled again after close.

```ts
signatureScrollTriggerRef.current?.disable();
```

Re-enabled in close completion:

```ts
const resetSignaturePath = useCallback(() => {
  signatureScrollTriggerRef.current?.enable();
}, []);
```

## Interaction Behavior

### Open

1. User clicks/taps/presses Enter or Space on a placeholder.
2. The clicked placeholder reveal tween is killed and snapped to a stable final transform.
3. If the placeholder is clipped, the page scrolls smoothly so the card top lands near `12%` of viewport height.
4. Source rect is measured after the scroll.
5. Signature path scrub is disabled.
6. The fixed overlay morphs from source rect to near-viewport size.

### Close

Close can be triggered by:

- wheel/scroll/touch scroll;
- Escape;
- resize;
- outside click;
- close button;
- desktop pointer leave after `120ms`.

Normal close morphs back to the re-measured source rect. Off-screen source fallback fades out.

## Tradeoffs

- Transform-only FLIP is smoother than animating `width`/`height`, but content inside the card scales during the morph. This is acceptable while content is abstract placeholder art. When real project text/images are added, an inverse-scale inner layer may be needed for perfect typography.
- Programmatic scroll before open adds a short delay when a card is clipped, but prevents awkward off-screen morph origins.
- Signature path scrub pause reduces background motion while expanded, but it means the signature path will not visually respond to scroll until the card closes.
- Off-screen fallback intentionally uses fade-out because morphing to a source outside viewport looks worse than a controlled dissolve.

## Problems Encountered

1. **Clicking clipped cards produced visually wrong morph origins**
   - Cause: source rect was measured while the card was partially off-screen.
   - Fix: scroll to ideal position first, then measure.

2. **Scroll close initially faded abruptly**
   - Cause: early implementation used a separate soft close mode.
   - Fix: all normal close paths now use the same transform-based morph.

3. **Morph initially felt rough**
   - Cause: animation used `width`/`height`, causing per-frame layout work.
   - Fix: card uses fixed target dimensions and animates `translate + scaleX/scaleY`.

4. **Source placeholder sometimes stayed visible**
   - Cause: reveal ScrollTrigger applied inline opacity.
   - Fix: source hidden class uses `opacity: 0 !important`.

5. **Ambient tween blocked close**
   - Cause: repeat tween was part of the main morph timeline.
   - Fix: ambient tween is separate and killed before close.

## Verification

Commands run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Results:

- TypeScript passed.
- ESLint passed with `0` errors and existing warnings only.
- Production build passed.

Runtime Puppeteer verification:

- Card clicked while clipped:
  - before click source top: `-265`
  - after programmatic scroll source top: `120`
  - expanded overlay: `1296 x 860`
- Scroll close:
  - overlay remained visible during collapse
  - opacity remained `1`
  - transform matrix showed card scaling back toward the source
  - overlay unmounted only after animation completed

## Current Edited Files

```txt
components/work/ProjectShowcase.tsx
lib/gsap.ts
docs/06-development/FEATURE_003J_WORK_PLACEHOLDER_SCROLL_THEN_MORPH_REPORT.md
```

## Follow-Up Recommendations

- When real project images are added, add media slots inside `work-morph-card-inner`.
- If text appears stretched during the morph, add inverse-scale content compensation.
- If hover-leave close feels too aggressive in manual testing, remove pointer-leave close and keep only scroll/outside/Escape.
- If real routing is added later, keep this morph as the preview state and route only from an explicit CTA inside the expanded card.
