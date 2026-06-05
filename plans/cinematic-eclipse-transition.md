# Phase 1: Cinematic Eclipse Transition (Work → Contact) Design Plan

This plan establishes the architecture for Phase 1 of the portfolio transition: implementing a filmic, high-end organic eclipse transition layer between the final Work project showcase and the Contact section.

## 1. Core Intent & UX Story
When the user scrolls past the last project card ("Teman Dengar"), instead of a standard slide-up exit, the environment collapses into deep celestial darkness:
- **State A**: Last project card behaves normally (horizontal scrolling works).
- **State B (Departure)**: As the user scrolls down, a massive black organic eclipse rises from below. The final project card fades out and shifts up slightly (`y: 0 -> -40px`) rather than sliding completely off-screen.
- **State C (Eclipse Expand)**: The organic eclipse expands heavy and physical, swallowing the entire viewport (100% coverage, `#050505` background, size `220vw x 220vw`, organic asymmetrical superellipse shape).
- **State D (Blackout Hold)**: A strict scroll blackout hold of pure darkness (no text, no interface elements, pure deep carbon/black) for `0.3` units of scroll-time, building dramatic anticipation.
- **State E (Contact Birth)**: The Contact section emerges from within the darkness, fading in from `0 -> 1` and rising smoothly (`y: 60px -> 0`, duration `0.8s`, ease `power3.out`).

---

## 2. Structural & Layout Blueprint

### CSS Definition (globals.css)
We define the `.cinematic-eclipse-layer` CSS inside [`app/globals.css`](app/globals.css) using performance-optimized properties.

```css
/* Cinematic Eclipse Layer for Work → Contact transition */
.cinematic-eclipse-layer {
  position: absolute;
  top: 100%;
  left: 50%;
  width: 220vw;
  height: 220vw;
  background-color: #050505;
  border-radius: 40% 60% 45% 55% / 55% 45% 55% 45%; /* Celestial organic superellipse */
  z-index: 2; /* Sits above Work (z-index 1) and below Contact (z-index 3) */
  pointer-events: none;
  transform: translate(-50%, 0) scale(0.35);
  transform-origin: center center;
  will-change: transform, border-radius;
}
```

### Component Structure (PinnedSections.tsx)
We insert the `.cinematic-eclipse-layer` div element inside the viewport containment container `stickyRef` in [`components/sections/PinnedSections.tsx`](components/sections/PinnedSections.tsx):

```tsx
<Hero />
<About />
<ProjectShowcase />
<div className="cinematic-eclipse-layer" />
<Contact />
```

### Contact Section Z-Index (Contact.tsx)
We update [`components/sections/Contact.tsx`](components/sections/Contact.tsx) inline styles to ensure the container sits above the eclipse layer during its birth:
```typescript
zIndex: 3, // Sit above .cinematic-eclipse-layer (z-index 2)
```

---

## 3. Timeline Sequence Mapping

We intercept the existing GSAP timeline inside [`components/sections/PinnedSections.tsx`](components/sections/PinnedSections.tsx) between the last project's exit (`35.5`) and the Contact reveal (`36.8 -> 37.6`):

1. **Initial States Set (`scrollTrigger: 0`):**
   - Initialize `.cinematic-eclipse-layer` at its base offset.
   - Set `.contact-content-wrapper` initial offset to `y: 60` for a more dramatic rise.
   ```typescript
   tl.set('.cinematic-eclipse-layer', {
     transform: 'translate(-50%, 0) scale(0.35)',
     borderRadius: '40% 60% 45% 55% / 55% 45% 55% 45%',
   }, 0);
   tl.set('.contact-content-wrapper', { opacity: 0, y: 60 }, 0);
   ```

2. **Last Project Exit Refinement (`35.5 -> 36.3`):**
   - For `idx === projects.length - 1` (last project):
   ```typescript
   // Fade out & shift up last project card instead of standard -100vh translation
   tl.to(`.project-card-container-${project.id}`, {
     y: '-40px',
     opacity: 0,
     pointerEvents: 'none',
     duration: 0.8,
     ease: 'power3.inOut',
   }, start + 8.5);

   // Fade out parent Work section container
   tl.to('.work-section-container', {
     opacity: 0,
     duration: 0.8,
     ease: 'power3.inOut',
   }, start + 8.5);
   ```

3. **Cinematic Eclipse Rise & Expand (`35.5 -> 36.5`):**
   - Scale and slide the organic superellipse upwards to completely swallow the screen.
   - Morph the asymmetrical `border-radius` to `0%` to cover 100% of the viewport.
   ```typescript
   tl.to('.cinematic-eclipse-layer', {
     transform: 'translate(-50%, -150vh) scale(1.5)',
     borderRadius: '0% 0% 0% 0% / 0% 0% 0% 0%',
     duration: 1.0,
     ease: 'power4.inOut', // Heavy physical cinematic feel
   }, start + 8.5);
   ```

4. **Blackout Hold (`36.5 -> 36.8`):**
   - Scroll-scrub segment where everything is pitch black, holding suspense.
   - Contact remains at `opacity: 0`.

5. **Contact Birth Reveal (`36.8 -> 37.6`):**
   - Contact fades in and rises smoothly on top of the black background.
   ```typescript
   tl.to('.contact-section-container', {
     opacity: 1,
     pointerEvents: 'auto',
     duration: 0.4,
     ease: 'none',
   }, 36.8);

   tl.to('.contact-content-wrapper', {
     opacity: 1,
     y: 0,
     duration: 0.8,
     ease: 'power3.out', // State E: Smooth premium rise from inside the dark void
   }, 36.8);
   ```

---

## 4. Verification Checkpoints

- **Snapping Alignment**: Verify that scrolling forward and backward triggers the transitions smoothly without shifting the snapping anchors.
- **Hardware Acceleration**: Confirm that we are animating `transform` and `opacity` properties to keep scrolling performant (avoiding layout recalculations).
- **Responsive Layouts**: Ensure the `220vw` massive width/height prevents light leaks on ultra-wide screens or dynamic mobile layouts.
