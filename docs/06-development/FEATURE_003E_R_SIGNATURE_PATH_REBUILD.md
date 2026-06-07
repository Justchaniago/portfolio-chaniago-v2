# FEATURE-003E-R — Signature Path System Rebuild

This document details the architectural redesign, progress mappings, debugging capabilities, and CMS compatibility safeguards implemented during the rebuild of the Work Section Signature Path System.

---

## 1. Failure Analysis of the Prototype

The original prototype suffered from several systemic issues that made it fragile and visually inconsistent:

1. **Pixel-to-Coordinate Unit Mismatch**:
   - The path's total length is queried via `path.getTotalLength()`, returning a value in **SVG user units** (viewBox coordinates).
   - GSAP's default behavior when animating the `strokeDashoffset` CSS property was auto-appending a pixel suffix (`px`) (e.g. `stroke-dashoffset: 6156px;`).
   - Because the SVG layer has `preserveAspectRatio="none"` and stretches to fill the entire Work section height (which is dynamic and scaled), **1 SVG user unit does not equal 1 CSS pixel**.
   - Under scaling, the `6156px` dash offset was equivalent to only `~5117` user units, failing to fully hide the path. Additionally, Chromium fails to align unitless dash-arrays with pixel-suffixed offsets, causing the line to render fully solid and static immediately.
2. **Trigger Coordination Race Conditions**:
   - The original code set up multiple independent ScrollTriggers (one for drawing, one for drifting, one for fading).
   - In React, child component `useEffect` hooks run *before* parent `useEffect` hooks. Because the parent `PinnedSections` component pins the preceding `About` section (adding scroll offset spacer height dynamically), the child's ScrollTriggers computed their offsets before the pinning spacers existed. This resulted in severely misaligned trigger coordinates.
3. **Low CMS Adaptability**:
   - The animations relied on exact layout coordinates. If the number of projects changed or the Work section stretched, the ScrollTrigger end bounds and coordinates had to be manually re-tuned.

---

## 2. New Controller-Based Architecture

We decoupled the animation logic, rendering, layout, and diagnostics into four dedicated, highly maintainable modules:

```txt
components/work/
├── ProjectShowcase.tsx        # Work exhibition layout & mounts SVG container
├── SignaturePath.tsx          # Absolute SVG vector path renderer
├── SignaturePathController.ts # Logic unit mapping progress (0 -> 1) to attributes
└── SignaturePathDebug.tsx     # Overlay HUD rendering real-time scroll diagnostics
```

### Module Responsibilities
* **[ProjectShowcase.tsx](file:///Users/f/Documents/Portfolio-Chaniago/components/work/ProjectShowcase.tsx)**: Manages the showcase layout and creates the **single source of truth ScrollTrigger** on the Work section. It intercepts scroll events and passes the progress directly to the controller:
  ```ts
  ScrollTrigger.create({
    trigger: sectionRef.current,
    start: 'top bottom', // When the section enters viewport bottom
    end: 'bottom top',   // When the section leaves viewport top
    scrub: true,
    onUpdate: (self) => controller.update(self.progress),
  });
  ```
* **[SignaturePathController.ts](file:///Users/f/Documents/Portfolio-Chaniago/components/work/SignaturePathController.ts)**: A pure TypeScript controller that implements the animation mathematics. It updates the path's `stroke-dashoffset` and `transform` attribute directly as **unitless attributes** (bypassing the CSS pixel suffix bug) and updates the SVG opacity.
* **[SignaturePath.tsx](file:///Users/f/Documents/Portfolio-Chaniago/components/work/SignaturePath.tsx)**: Renders the SVG canvas using relative viewBox bounds (`0 0 1000 4000`) and relative path data. It does not contain any state or animation trigger code.
* **[SignaturePathDebug.tsx](file:///Users/f/Documents/Portfolio-Chaniago/components/work/SignaturePathDebug.tsx)**: Listens to custom window events broadcasted by the controller and renders a real-time HUD UI on-screen.

---

## 3. Progress Model Mapping

All path animations map to specific virtual progress thresholds (`0%` to `100%`) within the unified ScrollTrigger range (`top bottom` to `bottom top` of the Work section):

| Progress Threshold | Action | Description |
| :--- | :--- | :--- |
| `0.00 → 0.15` | **Quiet Entry** | Path is completely hidden (Opacity: `0`). WORK typography header is entering the viewport and being consumed without visual competition. |
| `0.15 → 0.25` | **Fade-In Phase** | SVG opacity transitions from `0.0` to `1.0`. The path slowly fades into existence behind the visual layout. |
| `0.20 → 0.75` | **Progressive Drawing** | Path draws on scroll. Dash offset transitions from `length` (fully hidden) to `0` (fully drawn). |
| `0.20 → 0.85` | **Organic Horizontal Drift** | Path translates horizontally (`translateX: -15px -> +15px`) to create a floating, organic editorial gesture. |
| `0.78 → 0.88` | **Fade-Out Phase** | SVG opacity transitions from `1.0` to `0.0`. The path is completely cleared before the CTA button and the void-black Contact section enter the screen. |
| `0.88 → 1.00` | **Quiet Exit** | Path remains fully invisible (Opacity: `0`). Contact section dominates the viewport without any blue stroke intrusions. |

---

## 4. Debug HUD System

To facilitate debugging across viewport sizes, a permanent floating diagnostic HUD is available in the bottom-right corner when `DEBUG_SIGNATURE_PATH = true` in [ProjectShowcase.tsx](file:///Users/f/Documents/Portfolio-Chaniago/components/work/ProjectShowcase.tsx):

* **HUD Visual**:
  ```txt
  PATH DEBUG HUD
  Progress: 62%
  [██████████░░░░░░]
  Draw Ratio: 76%
  Opacity: 100%
  Drift X: 3.6px
  Path Length: 6156px
  Dash Offset: 1477px
  ```
* **Performance Footprint**: Extremely lightweight. The controller uses native DOM attribute updates (`setAttribute`), avoiding React re-renders. The HUD runs on a passive window event listener and updates only when scroll occurs, maintaining a stable `60fps` frame rate during Lenis smooth scroll.

---

## 5. CMS Compatibility & Scalability

The rebuild is architected to remain stable under any CMS structural changes:

* **Dynamic Content Heights**: If the project list grows, the Work section height stretches in the DOM. Because the single ScrollTrigger is bound to the element's start/end offsets, the trigger range expands proportionally. The progress value is automatically recalculated between `0` and `1`, preserving the exact visual pacing and drawing ratios.
* **Placeholder Independence**: The path coordinate geometry is mapped to a relative virtual viewBox grid (`0 0 1000 4000`) and does not reference any project DOM elements. You can add, remove, resize, or shuffle project cards without breaking the SVG path or requiring a rebuild of the coordinate structure.
* **Empty States (0 projects)**: If the repository returns 0 projects, the Work section defaults to its minimum height (`100vh`). The ScrollTrigger still fires, the progress maps cleanly from `0 -> 1`, and the path draws and fades out safely, preventing any runtime crashes.
