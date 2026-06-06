# Snap Removal & Work Rebuild Dependency Audit

This document audits the dependencies and assumptions of the current portfolio architecture, preparing for the transition from a legacy snap-driven timeline architecture to a natural smooth-scrolling architecture.

---

## 1. ExperienceDirector.ts Dependencies & Status

`ExperienceDirector` acts as the stateful authority for virtual scene transitions.

- **Current Imports/References**:
  - Imported and created in [PinnedSections.tsx](file:///Users/f/Documents/Portfolio-Chaniago/components/sections/PinnedSections.tsx)
  - References `WorkScene`, `ContactScene`, and `EclipseTransition` to manage scene states, transitions, and phase validations.
- **Dependency Analysis**:
  - In the legacy timeline, it coordinate state changes (`SCENE_ACTIVE`, `SCENE_EXITING`) during scroll snap capture.
  - In a natural scroll architecture, section lifecycle states can be triggered directly by viewport intersection (via ScrollTrigger callbacks), making the virtual coordinator redundant at runtime for layout.
  - However, to preserve compatibility with future integrations (e.g., ARCH-011 / ARCH-012, dynamic overlays, or custom interactive triggers), we must retain it in the codebase.
- **Readiness Verdict**: **RETAIN & ISOLATE**. Do not delete `ExperienceDirector.ts`. Remove its runtime invocation inside `PinnedSections.tsx` and isolate it from the active scroll loop to transition to direct ScrollTrigger lifecycle events.

---

## 2. WorkScene.ts Dependencies & Status

`WorkScene` encapsulates the active lifecycle states of the Work section.

- **Current Imports/References**:
  - Imported and created in [PinnedSections.tsx](file:///Users/f/Documents/Portfolio-Chaniago/components/sections/PinnedSections.tsx).
  - Referenced in [ExperienceDirector.ts](file:///Users/f/Documents/Portfolio-Chaniago/components/orchestration/ExperienceDirector.ts) to manage exit and resume states.
- **Dependency Analysis**:
  - Handles the reveal and exit of the Work section container (`.work-section-container`) and intro titles.
  - While the current sequencing (Projects 1 -> 2 -> 3) is being removed, the underlying infrastructure, scene boundaries, and state definitions may be reused by future iterations (e.g., Cinematic Curated Reel or Spatial Ledger).
- **Readiness Verdict**: **RETAIN & DEPRECATE ACTIVE RUNTIME**. Do not delete `WorkScene.ts`. Remove its registration in the active scroll timeline inside `PinnedSections.tsx`. Keep the file intact to serve as an architecture foundation for the future rebuild.

---

## 3. ContactScene.ts Dependencies & Status

`ContactScene` manages the reveal animation for the Contact section.

- **Current Imports/References**:
  - Imported and created in [PinnedSections.tsx](file:///Users/f/Documents/Portfolio-Chaniago/components/sections/PinnedSections.tsx).
  - Referenced in [ExperienceDirector.ts](file:///Users/f/Documents/Portfolio-Chaniago/components/orchestration/ExperienceDirector.ts).
- **Dependency Analysis**:
  - Manages its own `revealTimeline` which plays when `enter()` is called and reverses when `exit()` is called.
  - The reveal timeline is self-contained. It toggles opacity and pointer-events for `.contact-section-container` and staggers the characters and columns.
  - It does NOT rely on any animations inside the master virtual timeline, making it safe to trigger independently.
- **Readiness Verdict**: **RETAIN & INTEGRATE**. Integrate the Contact reveal natively by calling `contactScene.enter()` and `contactScene.exit()` from a ScrollTrigger attached directly to the `#contact-section` container.

---

## 4. RendererManager.ts Dependencies & Status

`RendererManager` coordinates frame loop execution and rendering states.

- **Current Imports/References**:
  - Imported and used in [useFluidSim.ts](file:///Users/f/Documents/Portfolio-Chaniago/hooks/useFluidSim.ts) to register and unregister the WebGL fluid simulation renderer.
- **Dependency Analysis**:
  - Automatically manages sleep state (`'SLEEPING'` vs `'ACTIVE'`) using an internal `IntersectionObserver` that monitors the physical canvas container.
  - When the Hero section leaves the viewport, the observer pauses the loop and puts the renderer to sleep automatically.
  - Does NOT have dependencies on the legacy pinning timeline or snapping calculations.
- **Readiness Verdict**: **PRESERVE COMPLETE**. No change is required. Performance will remain optimal since the fluid renderer will sleep naturally when scrolled offscreen.

---

## 5. NavRail.tsx & MorphNav.tsx Navigation Dependencies

`NavRail` and `MorphNav` display the active section state and allow jump navigation.

- **Current Imports/References**:
  - Import `getActiveSectionIndex` and `SECTION_ANCHORS` from [motion.ts](file:///Users/f/Documents/Portfolio-Chaniago/lib/motion.ts).
  - Listen to custom event `scrollTriggerProgress` to update activeIndex.
  - Click triggers call `window.__cinematicNavigate`.
- **Dependency Analysis**:
  - Both components rely on a global progress value (`0.0` to `1.0`) and hardcoded thresholds.
  - This is fragile and breaks if section heights or dynamic content (CMS) changes.
- **Readiness Verdict**: **MODIFY & UPGRADE**.
  - Transition both components to an **active-section model** based on visible area.
  - Introduce a central ScrollTrigger-based observer that dispatches an `activeSectionChange` event when a section's visible area crosses the 40% threshold.
  - Both components will listen to `activeSectionChange` to sync their indicators.
  - Section click will scroll to the DOM element directly (e.g. via Lenis or standard window scroll), rather than jumps to progress values.

---

## 6. PinnedSections.tsx Ownership Map

| System / Feature | Legacy PinnedSections (Current) | Future Smooth-Scroll (New) | Status |
| :--- | :--- | :--- | :--- |
| **Scroll Pinning** | Pins the entire screen for `750vh` using a master ScrollTrigger. | No master pinning. Normal vertical document-flow scroll. | **REMOVED** |
| **Section Snapping** | Custom math to force scroll boundaries & snap timing. | None. User controls scrolling pace entirely. | **REMOVED** |
| **Active Scene State** | Controlled via progress thresholds. | Controlled via SectionObserver (visible >= 40%). | **UPGRADED** |
| **About Reveal** | Morphing timelines scrubbed globally. | Local ScrollTrigger pinning About section to scrub its details. | **UPGRADED** |
| **Work Showcase** | Legacy project sequencing and card morphing. | Temporary neutral white canvas. | **REPLACED** |
| **Contact Reveal** | Triggered via ExperienceDirector phase transition. | Triggered via ScrollTrigger on Contact viewport enter. | **UPGRADED** |
