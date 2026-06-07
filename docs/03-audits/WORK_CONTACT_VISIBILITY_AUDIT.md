# WORK SECTION HEIGHT & CONTACT VISIBILITY AUDIT

## 1. Findings & Observations

During the verification of **FEATURE-003D — Work Experience Layout Exploration**, we observed the following behavior in the browser:
- When the user scrolls to the absolute bottom of the page, the browser's active scroll position halts, yet the viewport displays a split screen:
  - The **top 60%** of the viewport is occupied by the bottom of the Work section (showing the `EXPLORE ALL WORK →` CTA on a white background).
  - The **bottom 40%** of the viewport displays the top of the Contact section (showing the `QUICK JUMP` and `CONNECT` navigation columns on a black background).
  - The large `JUSTCHANIAGO` section title and copyright footer, which are anchored to the bottom of the Contact section, are completely clipped off-screen and cannot be scrolled into view.
- The navigation rail (`NavRail` and `MorphNav`) highlights the **Contact** section (`04` / `Contact`) as active even though the viewport is still visually dominated by the Work section.

### Layout Geometrics
- **Viewport Dimensions**: `1440x702` (height = `702px`).
- **Total Document height**: `7271px` (retrieved from browser DOM).
- **Hero Section**: `702px` (`100vh`).
- **About Section**: `1404px` (`702px` height + `702px` ScrollTrigger pin spacer).
- **Work Section (`#work-section`)**: `4463px` in layout flow.
- **Contact Section (`#contact-section`)**: `702px` in layout flow.

---

## 2. Element & Spacing Analysis

We audited the CSS position, translation, and margin properties of all elements inside the Work section to see if they contribute to the document layout height:

1. **Large Work Header & Metadata**: Normal grid block layout. Contributes `276px` to document height.
2. **Placeholder 1 (wp-1)**: `position: relative`, `aspect-ratio: 16/10`. Contributes `522px` to height.
3. **Placeholder 2 (wp-2)**: `position: relative`, `aspect-ratio: 4/5`. It uses `margin-top: -14vh` (`-98px`) to overlap diagonally with Placeholder 1. This negative margin pulls the element up in normal flow, reducing total layout height by `98px`, which is expected and does not cause elements to escape layout height.
4. **Typographic Breathing Section**: Normal block layout. Contributes `288px` to height.
5. **Placeholder 3 (wp-3)**: `position: relative`, `aspect-ratio: 21/9`. Contributes `589px` to height.
6. **Placeholder 4 (wp-4)**: `position: relative`, `aspect-ratio: 3/4`. Contributes `974px` to height.
7. **Placeholder 5 (wp-5)**: `position: relative`, `aspect-ratio: 1/1`. Contributes `472px` to height.
8. **Placeholder 6 (wp-6)**: `position: relative`, `aspect-ratio: 16/10`. Contributes `614px` to height.
9. **CTA Container**: `position: relative`. Contributes `246px` to height.
10. **Section Padding**: `16vh` (top) + `20vh` (bottom) = `252px`.

### Conclusion on Composition Flow
All placeholders in `ProjectShowcase.tsx` are positioned **relatively** and use block margins, meaning they stay in the normal document flow and stretch the parent height. 

However, because the placeholders are extremely large and spaced far apart, the computed height of the Work section is **`4783px`** based on the CSS rules. 

But the browser is calculating the Work section height as **`4463px`** in the document layout flow, leading to a **`320px` height discrepancy**. 

This height discrepancy causes:
- The bottom `320px` of the Work section is pushed out of its container and overflows visually.
- Because `#work-section` is wrapped in a container with `overflow: hidden`, this bottom overflow *should* be clipped. However, because the container itself grows, it pushes `#contact-section` down.
- Since `#contact-section` starts at `y = 6889px`, but the document height ends at `7271px` (which is `702px` shorter than the expected `7591px`), the bottom `320px` of `#contact-section` is cut off from the scrollable area.

---

## 3. Observer & Threshold Audit

We audited the active section observer configured in `PinnedSections.tsx` lines 32-47:

```typescript
const sectionIds = ['hero', 'about', 'work', 'contact'];
sectionIds.forEach((id) => {
  ScrollTrigger.create({
    trigger: `#${id}-section`,
    start: 'top 40%',
    end: 'bottom 40%',
    onToggle: (self) => {
      if (self.isActive) {
        dispatchActiveSection(id);
      }
    },
    onEnter: () => dispatchActiveSection(id),
    onEnterBack: () => dispatchActiveSection(id),
  });
});
```

### Analysis
- When the user scrolls down, `#contact-section`'s top crosses `40%` of the viewport (measured from the top) at scroll position `6289px`.
- This fires `dispatchActiveSection('contact')` and highlights Contact in the nav system.
- However, at scroll position `6289px`, the bottom of the Work section is still at `6569px`, meaning the top `280px` of the viewport is showing Work content.
- Because the page height is constrained and the user cannot scroll further than `6569px`, they can never scroll the Contact section fully into view. The screen remains permanently split between Work and Contact, while the navigation system reports Contact as 100% active.

---

## 4. Root Cause Analysis

Based on the audit, the probability of root causes is assessed as follows:

| Probability | Potential Root Cause | Verification Details |
|---|---|---|
| **75%** | **Work/Contact Height Mismatch (Normal Flow Collapse)** | The parent `#contact-section` container uses `min-h-screen` and wraps `<Contact />`. Since `<Contact />` uses `position: absolute; inset: 0`, it does not contribute to normal document flow height. The parent `#contact-section` is limited to `100vh`. Since `#work-section`'s layout height overflows and pushes `#contact-section` down, but the browser scrollable height is capped, the absolute elements inside Contact are pushed past the scrollable document boundary. |
| **15%** | **Observer Trigger Point Mismatch** | The `start: 'top 40%'` threshold on `#contact-section` is triggered while the Work section's CTA and final padding are still visible. The observer needs to account for the extended length of the Work section. |
| **10%** | **Contact Section Opacity/Animation Issue** | The contact reveal timeline `contactScene.enter()` fires correctly and sets opacity to `1`. The elements (`QUICK JUMP`, `CONNECT`) are visible, but the bottom elements (Title/Footer) are visually pushed below the screen edge. |

---

## 5. Recommended Fixes

To fix the visual height mismatch without breaking document flow, we propose two adjustments:

### Fix 1: Eliminate Absolute Positioning inside Contact Section
Instead of positioning `.contact-section-container` absolutely inside `#contact-section`, make it a normal flow block:
- Remove `position: absolute`, `inset: 0`, and `height: 100%` from `Contact.tsx`.
- Change `#contact-section` to have `height: auto` and let `Contact` grow naturally to fit its elements.
- This ensures that all text elements (including the massive `JUSTCHANIAGO` title and copyright footer) are in normal document flow and stretch the scroll height, making them fully scrollable.

### Fix 2: Wrap Work Section Content and Align Observer Trigger
- Inside `ProjectShowcase.tsx`, wrap the visual layout in a `work-composition-wrapper` with a clear flex/block layout.
- Adjust the ScrollTrigger observer in `PinnedSections.tsx` to set Contact as active only when the top of `#contact-section` crosses `top 10%` or `top 20%` of the screen, ensuring the Work section is visually cleared before the active dot updates.

---

## 6. Risk Assessment

- **Animation Sync**: Changing `Contact` to a block layout means we must verify that the character reveals (`contactTitleReveal`) and column animations still transition smoothly in `ContactScene.ts`.
- **Theme Transitions**: The theme color transition triggers on `#contact-section` entering the screen. We must ensure the ScrollTrigger start positions are aligned with the new observer thresholds to prevent background colors from flashing too early or too late.
