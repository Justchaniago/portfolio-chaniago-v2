# AUDIT-LAYER-OWNERSHIP-002: Transition Layer vs. About Section Coexistence & GPU Compositor Audit

## Executive Summary
This audit traces the structural, visual, and performance characteristics of the viewport immediately following transition completion ($Y \ge 1050\text{px}$, or `TransitionComplete = true`). We investigate whether the **Environment Transition Layer** and the **About Section** suffer from stacking, rendering, or GPU compositor overlap anomalies. 

Our analysis proves that while the visual rendering flow from the white transition curtain to the About white canvas is seamless, there is a structural **Viewport Ownership Conflict**. Specifically, the Transition Layer remains mounted as a full-screen `fixed` overlay with a high z-index (`z-index: 80`) even after it fades out, relying purely on `visibility: hidden` to avoid stealing pointers. Concurrently, the About section runs as an `absolute` layer inside `PinnedSections` (`z-index: 1`) but houses high z-index interaction elements like the portrait hover trigger (`z-index: 10`).

This report details the layout metrics, GPU layers, transition lifecycles, and offers a comprehensive verdict on structural ownership.

---

## Deliverable 1 — Active DOM Nodes & Layer Properties
Immediately following `TransitionComplete = true` ($Y \ge 1050\text{px}$), the following DOM nodes occupy the viewport, with their key CSS properties detailed below:

| DOM Node Selector | CSS Position / Layout | Z-Index | Opacity | Visibility / Display | Pointer Events | GPU Promotion (`will-change` / transform) | Opaque Background? |
|:---|:---|:---:|:---:|:---|:---:|:---|:---|
| `.environment-transition-layer` | `fixed`, `inset: 0` | `80` | `0` (via exit tween) | `visibility: hidden` | `none` (inherent) | None on parent | No (`transparent`) |
| `.environment-transition-card` | `absolute`, `left: 50%`, `bottom: 0` | *Auto* | `1` | `visible` | `none` (inherited) | `will-change: transform, width, height, ...` | Yes (`#FFFFFF`) |
| `.environment-transition-coverage` | `absolute`, `inset: 0` | *Auto* | `1` | `visible` | `none` (inherited) | None | Yes (`#FFFFFF`) |
| `.about-section-container` | `absolute`, `inset: 0` | `1` | `1` | `display: flex`, `visible` | `auto` | None on parent | Yes (`var(--color-bg)` $\to$ `#FFFFFF`) |
| `.about-glow-behind` | `absolute`, bottom, centered | `1` | `0.85` | `visible` | `none` | `filter: blur(100px)` (indirect GPU cost) | No (`radial-gradient`) |
| `.about-portrait-img` | `absolute`, bottom/right | `2` | `0` $\to$ `1` (Gsap) | `visible` | `auto` (inherited) | `will-change: clip-path, transform` | No (`transparent` PNG) |
| `.about-portrait-left-img` | `absolute`, bottom/left | `2` | `0` (initial state) | `visible` | `auto` (inherited) | `will-change: transform, opacity` | No (`transparent` PNG) |
| `.about-portrait-trigger` | `absolute`, bottom/right | `10` | `1` | `visible` | `auto` | None | No (`transparent`) |
| `.about-editorial-text` | `absolute`, bottom/left | `4` | `1` (Gsap) | `visible` | `none` | None | No (`transparent`) |
| `.about-glass-overlay` | `absolute`, bottom, centered | `3` | `1` | `visible` | `none` | `backdrop-filter: blur(24px)` (Compositor Cost) | No (Glass gradients) |

---

## Deliverable 2 — Full-Screen GPU Compositor Surfaces
At $Y \ge 1050\text{px}$, there are **two full-screen layers** designated as hardware compositor surfaces:

1. **`EnvironmentTransitionLayer` (`.environment-transition-layer`)**:
   - **Promotion Trigger**: Inside its child `.environment-transition-card`, there is `will-change: transform, width, height, border-radius, box-shadow, opacity;`. 
   - **Render Cost**: The browser must keep this layer on its GPU compositor path because of the `will-change` hints. Even though the root layer has `opacity: 0` and `visibility: hidden` (which removes it from the screen and prevents paint passes), the GPU structure remains allocated until ScrollTrigger rolls back.
   
2. **`About` (`.about-section-container`)**:
   - **Promotion Trigger**:
     - `.about-portrait-img`: `will-change: clip-path, transform`
     - `.about-portrait-left-img`: `will-change: transform, opacity`
     - `.about-glass-overlay`: Invokes a heavy `backdrop-filter: blur(24px)` (Webkit/Blink compositor must isolate the layer under the backdrop to apply real-time blur passes).
   - **Render Cost**: High. The presence of overlapping absolute layers with WebGL/CSS filter operations (`blur` on glow and `backdrop-filter` on glass) creates **multi-layer compositor promotes**.

---

## Deliverable 3 — Visual Overlay & Glassmorphism Analysis
The visual relationship between the **Transition Layer** and **About Section** during this phase is extremely delicate. 

### Stacking Properties & Backdrop Filters
- **Transition Layer** sits at `z-index: 80` (fixed).
- **About Section** sits at `z-index: 1` (absolute).
- **About Glass Overlay** sits at `z-index: 3` (absolute) inside the About section. It applies a `backdrop-filter: blur(24px)` with an opacity bound to `var(--about-env-opacity, 0)`.
- When $Y \ge 1050\text{px}$, `var(--about-env-opacity)` morphs to `1` via `AboutEnvironmentLifecycle.ts` (triggered by the ScrollTrigger update).

### Visual Leakage or Corruption Hazard (Glassmorphism & Blurring)
If `.environment-transition-layer` did not have `visibility: hidden` and instead relied purely on `opacity: 0`, the GPU compositor would still composite it. This introduces a major rendering hazard:
1. **Compositor Double-Blur**: If a layer with a high z-index (`z-index: 80`) has `opacity` tweening near $0$, and another underlying layer (`z-index: 3`) applies `backdrop-filter: blur(24px)`, the browser's compositor must read-back the screen pixels *behind* `z-index: 3`, apply the blur, and then composite the layers above it.
2. **Glass Pixel Corruption**: If `.environment-transition-layer` is not completely unmounted or hidden via `visibility: hidden`, its microscopic pixels (or layout boundary) could be captured during the backdrop-filter's readback buffer. This results in a "glassy shadow," a subtle grid artifact, or a slight off-white color shift on the screen.
3. **The Proof of Shielding**: In [`components/transitions/EnvironmentTransitionLayer.tsx`](components/transitions/EnvironmentTransitionLayer.tsx:111), the `onLeave` callback of the exit ScrollTrigger runs `gsap.set(layer, { visibility: 'hidden' });` exactly when the exit transition completes. This is the **only shield** preventing the glassmorphic overlay inside About from reading back and blurring the transition curtain's inactive layout pixels.

---

## Deliverable 4 — Transition Layer Lifecycle Verification

### 1. Tween Timeline Analysis (Entry $\to$ Exit $\to$ Complete)
- **Active Range**: The exit tween starts at `top 20%` of `#about-section` and ends at `top -5%`.
- **Handoff (`onEnvironmentHandoff`)**: Triggered inside `onUpdate` at `self.progress >= 0.85`. This activates the environment variables (`--about-env-opacity: 1`, `--color-bg: #FFFFFF`) *before* the transition layer begins its opacity exit.
- **Exit Trigger**:
  - `start: 'top 20%'` is approximately $Y = 800\text{px}$.
  - `end: 'top -5%'` is approximately $Y = 1050\text{px}$.
  - Over this $250\text{px}$ scroll window, the transition layer's opacity is tweened from `1` to `0` linearly.
- **Unmounting/Deactivation**: The element is **never unmounted** from the React DOM tree. It remains mounted inside `PinnedSections.tsx`. Its rendering status is altered strictly by `visibility: 'hidden'` inside the ScrollTrigger callbacks:
  ```typescript
  onLeave: () => {
    gsap.set(layer, { visibility: 'hidden' });
    onTransitionComplete?.(true);
  }
  ```

### 2. Is there a moment where both are visible?
**Yes, by design, but controlled.**
Between $Y = 800\text{px}$ and $Y = 1050\text{px}$, the transition layer's opacity goes from $1.0 \to 0.0$. At this exact time, the About section's background (`var(--color-bg)`) is already `#FFFFFF` (from the handoff at `progress >= 0.85`). 
Because both the transition card (`background: #FFFFFF`) and the About section background (`background: #FFFFFF`) are identical pure-white solid fields, the cross-fade is visually imperceptible. However:
- The transition card's opacity is fading down.
- The About section's portrait and text have **not yet begun** to animate. This is because in `AboutController.ts`, the timeline progress is gated by:
  ```typescript
  if (!isTransitionComplete) {
    gsap.killTweensOf(aboutTl);
    aboutTl.progress(0);
  }
  ```
- Therefore, during the $800\text{px} \to 1050\text{px}$ fade, the user sees a solid white screen. Only when $Y \ge 1050\text{px}$ is `isTransitionComplete` set to `true`, releasing the lock and allowing the About text/portraits to reveal.

---

## Deliverable 5 — About Section Pointer-Events & Interaction State
Following transition completion, the user must be able to interact with the About page.

### 1. Pointer Events Ownership
- **About Section Container**: Styled with `pointerEvents: 'auto'`.
- **Transition Layer**: Styled with `pointer-events: none` in CSS (`.environment-transition-layer`). However, during the transition, the card has `pointer-events` inherited. At completion, `visibility: hidden` on the transition layer is the CSS-compliant way to guarantee it is entirely removed from the viewport's hit-testing tree.
- **Active Targets inside About**:
  - `about-portrait-trigger` (`z-index: 10`): Styled with `pointerEvents: 'auto'`. This is a dedicated hot-zone mapped to the portrait on the right edge.
  - Editorial elements are styled with `pointerEvents: 'none'` (so they don't block hovers passing through to the portraits).
  - Metrics and cards are layout flows, permitting interactions.

### 2. Is the user interacting with About or a dead transition layer?
Because the Transition Layer is at `z-index: 80` (higher than About's `z-index: 1`), if the Transition Layer did not have `visibility: hidden`, **all mouse hover coordinates and scroll clicks would be intercepted by the invisible Transition Layer**. 
The `visibility: hidden` property correctly removes the element from hit-testing. Thus, the user interacts directly with the About section. However, should a race condition occur where `onLeave` is bypassed (e.g., via rapid scroll wheel ticks), the `visibility` state could fail to update, leaving a "phantom shield" over the screen.

---

## Deliverable 6 — Visual Instability & Micro-Flicker Scenarios

Our deep investigation reveals **two potential micro-flicker or instability scenarios** under the hood:

### 1. The Backdrop-Filter Paint Invalidation Race
When `TransitionComplete` becomes `true` at $Y = 1050\text{px}$:
1. The transition layer is set to `visibility: 'hidden'`.
2. Simultaneously, `isTransitionComplete = true` triggers the `AboutController` to scroll-scrub the timeline.
3. The timeline starts animating the portrait (`clipPath` and `transform`) and activates the glass overlay (`--about-env-opacity: 1`).
4. At this exact frame, the GPU must **de-promote** the transition layer and **promote** the About glass overlay with its heavy `backdrop-filter: blur(24px)`.
5. This sudden compositor surface swap (deallocating a full-screen fixed texture and allocating a curved backdrop-filter texture) causes a **one-frame paint invalidation delay (micro-stutter or flash)** on slower monitors or mobile devices.

### 2. Absolute-in-Fixed Stacking Context Defect
`PinnedSections.tsx` contains:
- `EnvironmentTransitionLayer` (which uses `position: fixed` in CSS but is rendered as a sibling of the relative container).
- `#about-section` (which is `absolute` pinned via ScrollTrigger with `position: absolute; inset: 0`).
When ScrollTrigger pins `#about-section`, GSAP wraps it in a `.pin-wrapper` with `position: relative` or `absolute`. 
This creates a new **stacking context**. Inside this pinned wrapper, `z-index` values are relative *only* to the pin wrapper.
If the transition layer (fixed, `z-index: 80`) is not hidden, it stays absolutely on top of the pinned container. If GSAP recalculates pinning scales during scroll ticks, the pin-wrapper's z-index may shift, causing a depth-fighting flicker where the portrait jumps behind/ahead of the white background.

---

## Deliverable 7 — Final Forensic Verdict & Risk Assessment

### ⚖️ Forensic Verdict: **PASS (With High Operational Risk)**

The current implementation of the Transition-to-About handoff is **visually clean** and **functionally sound under normal scroll rates**, but exhibits **structural layer debt and high GPU invalidation risks**. 

```
                                  Y = 800px                   Y = 1050px
                                 (Exit Start)              (Exit Complete)
STACKING HEIGHT:                      |                           |
[z-index: 80] (Fixed Layer) --------->|== Fading White Curtain ==| (visibility: hidden)
                                      |                           |   [BLOCKED]
[z-index: 10] (Portrait Trigger) -----|-------------------------->|=== Pointer Active ===
                                      |                           |
[z-index: 4]  (Editorial Text) -------|-------------------------->|=== Reveals (GSAP) ===
                                      |                           |
[z-index: 1]  (About Container) ------|== Already Pure White =====|== var(--color-bg) ===
                                      v                           v
```

### Risk Breakdown

1. **The Phantom Shield Risk (High Probability under Inertial Scroll)**:
   Because the transition layer is hidden strictly via ScrollTrigger's `onLeave` and `onLeaveBack` callbacks, any rapid scroll gesture that "skips" the trigger boundary or fires frames in a batch can cause a race condition where the layer's opacity reaches `0` but `visibility: 'hidden'` is never evaluated. This locks the viewport behind an invisible z-index 80 barrier, rendering the portfolio unresponsive.
   
2. **Double-Composite Overhead (Performance Bottleneck)**:
   The transition card utilizes a radial-gradient mask-image:
   `-webkit-mask-image: -webkit-radial-gradient(white, black);`
   Applying masks on a full-screen hardware-promoted container alongside About's active `backdrop-filter` creates extreme compositor strain, leading to dropped frames (jank) precisely as the text reveal begins.

3. **DOM Redundancy**:
   Retaining a fully expanded, full-screen transition layer in the active DOM tree once the transition is finalized forces the browser to evaluate layout boundaries on every resize and scroll event.

---

## Recommendations (for future implementation cycles)
1. **Physical DOM Unmounting**: Instead of relying solely on `visibility: hidden` inside GSAP, statefully unmount `EnvironmentTransitionLayer` when `isTransitionComplete` is `true`.
2. **Explicit Layer Promotion Separation**: Ensure `will-change` properties on the transition card are removed dynamically once the animation concludes, freeing up GPU memory immediately.
3. **Z-Index Unification**: Align PinnedSection layers within a single master coordinate space to avoid fixed-vs-absolute stacking depth-fighting.
