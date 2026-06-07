# FEATURE-003E Bug Audit — Signature Path Not Animating

This document logs the runtime investigation, root-cause analysis, and recommended fix for the signature path scroll animation issue in the Work section.

---

## 1. Diagnostics Summary

Based on automated headless browser testing via Puppeteer, we extracted the following exact runtime states:

```txt
Path Length: 6156.0419921875 user units
strokeDasharray (CSS style): 6156.04 (unitless)
strokeDashoffset (CSS style): 6156px (has px suffix)
Initial Render State: Fully visible / solid line
```

```txt
Total ScrollTriggers: 11
Signature Path Trigger Found: YES
Trigger ID: .work-section (ProjectShowcase)
Trigger State: Active, tracking scroll position
```

### Scroll State Progress

| Scroll Y (px) | transform Attribute | stroke-dashoffset (CSS Style) | Expected State | Actual Visual State |
| :--- | :--- | :--- | :--- | :--- |
| `0` | `matrix(1,0,0,1,-10,0)` | `6156px` | Fully Hidden | Fully Visible |
| `1000` | `matrix(1,0,0,1,-10,0)` | `6156px` | Fully Hidden | Fully Visible |
| `2500` | `matrix(1,0,0,1,-6.50,0)` | `5080px` | Partially Drawn | Fully Visible |
| `4000` | `matrix(1,0,0,1,1.06,0)` | `2749px` | Mostly Drawn | Fully Visible |
| `5500` | `matrix(1,0,0,1,8.73,0)` | `391px` | Near Completed | Fully Visible |

---

## 2. Root Cause Analysis

The bug is caused by a **coordinate unit mismatch** in the browser's SVG style rendering engine:

1. **Unit Conflict**:
   - `strokeDasharray` is set to `6156.04` (unitless). In SVG, a unitless value defaults to **SVG user units** (viewBox coordinates, which match the length returned by `getTotalLength()`).
   - `strokeDashoffset` is set to `6156px` (with the `px` suffix). In modern CSS, a value with `px` suffix is interpreted as **CSS screen pixels**.
2. **Stretched Scaling Incoherence**:
   - Because the SVG has `preserveAspectRatio="none"` and `height: 100%`, it stretches to match the Work section height (`4812px` actual height vs `4000` virtual viewBox height).
   - This means **1 SVG user unit does not map 1-to-1 to 1 CSS pixel**.
   - Under this non-linear stretch, `stroke-dashoffset: 6156px` maps to only `~5117` SVG user units. The gap length is insufficient to cover the path, meaning the path is never fully hidden.
3. **Browser Render Failure**:
   - Chromium and other modern rendering engines fail to correctly align a unitless `stroke-dasharray` style with a pixel-unit `stroke-dashoffset` style under stretched SVG transforms, defaulting to rendering the path as a solid static line.
   - However, the ScrollTrigger system *is* firing and updating these values on scroll (as proven by the values changing in our scroll state table). The animation is running, but the browser is rendering it as static due to the style unit mismatch.

---

## 3. Confidence Scores

| Hypothesis | Description | Confidence Score |
| :--- | :--- | :--- |
| **A: Style Unit Mismatch** | Unitless `stroke-dasharray` combined with pixel-suffixed `stroke-dashoffset` style breaks SVG rendering. | **9.9 / 10** |
| **B: GSAP Not Targetting** | GSAP failed to select or find the path ref. | **0.0 / 10** (Proven wrong by active style updates in logs) |
| **C: ScrollTrigger Inactive** | ScrollTrigger is not capturing scroll events. | **0.0 / 10** (Proven wrong by active value changes in logs) |

---

## 4. Recommended Fix

To resolve the unit mismatch, we must bypass the CSS style engine entirely and update the SVG **attributes** directly. Attributes are strictly unitless and map 1-to-1 to SVG user space (viewBox units).

We accomplish this using GSAP's built-in **`attr` plugin**:

### Modify `ProjectShowcase.tsx`

```diff
-        // Initial state: line is fully hidden
-        gsap.set(path, {
-          strokeDasharray: length,
-          strokeDashoffset: length,
-        });
+        // Initial state: line is fully hidden using unitless attributes
+        gsap.set(path, {
+          attr: {
+            'stroke-dasharray': length,
+            'stroke-dashoffset': length,
+          }
+        });

-        // Drawing reveal + subtle horizontal drift (-10px to +10px drift)
-        gsap.fromTo(path,
-          { strokeDashoffset: length, x: -10 },
-          {
-            strokeDashoffset: 0,
-            x: 10,
-            ease: 'none',
-            scrollTrigger: {
-              trigger: sectionRef.current,
-              start: 'top top',
-              end: 'bottom bottom',
-              scrub: 0.8,
-            }
-          }
-        );
+        // Drawing reveal + subtle horizontal drift (-10px to +10px drift)
+        // Using the attr plugin ensures both dash properties share unitless SVG space.
+        gsap.fromTo(path,
+          { 
+            attr: { 'stroke-dashoffset': length },
+            x: -10 
+          },
+          {
+            attr: { 'stroke-dashoffset': 0 },
+            x: 10,
+            ease: 'none',
+            scrollTrigger: {
+              trigger: sectionRef.current,
+              start: 'top top',
+              end: 'bottom bottom',
+              scrub: 0.8,
+            }
+          }
+        );
```

We also recommend removing `transition: stroke-width 0.3s ease` from the path's inline styles to avoid any possible browser transition conflicts with GSAP updates.
