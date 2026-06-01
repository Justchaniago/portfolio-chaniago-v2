'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import Hero from './Hero';
import About from './About';
import ProjectShowcase from '../work/ProjectShowcase';
import Contact from './Contact';
import NavRail from '../layout/NavRail';
import { projects } from '@/data/projects';

export default function PinnedSections() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) return;

      // Calculate responsive project card geometry on initialization
      const isMobile = window.innerWidth <= 768;
      const cardTop = isMobile ? '22vh' : '15vh';
      const cardLeft = isMobile ? '6vw' : '7.5vw';
      const cardWidth = isMobile ? '88vw' : '85vw';
      const cardHeight = isMobile ? '56vh' : '70vh';
      const cardRadius = isMobile ? '32px' : '48px';

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6, // Faster catch-up to Lenis scroll to avoid double smoothing lag
          snap: {
            snapTo: (progress) => {
              const dur = tl.duration();
              if (!dur) return progress;
              const time = progress * dur;

              // 1. Hero Zone
              if (time >= 0 && time < 0.8) {
                return 0.0 / dur;
              }
              // 2. About Bio Zone
              if (time >= 0.8 && time < 2.3) {
                return 1.5 / dur;
              }
              // 3. About Sub-Section (Metrics/Stack)
              if (time >= 2.3 && time < 4.5) {
                return 3.8 / dur;
              }
              // 4. Work Masked Title ("Our Work" reveal)
              if (time >= 4.5 && time < 8.0) {
                if (time < 7.6) {
                  return 6.5 / dur; // Snaps to the fully revealed resting pause of "Our Work"
                } else {
                  return 8.0 / dur; // Snaps forward to Project 1's intro start
                }
              }

              // 5. Dynamic Project loop snapping
              for (let idx = 0; idx < projects.length; idx++) {
                const start = 8.0 + idx * 9.5; // Offset by 8.0 for "Our Work" cinematic pause
                const introMid = start + 1.4;
                const posterRest = start + 4.4;
                const morphStart = start + 4.4;
                const morphThreshold = start + 4.8;
                const exitStart = start + 8.5;
                const nextStart = start + 9.5;

                // Inside Project Intro Zone
                if (time >= start && time < start + 2.0) {
                  return introMid / dur;
                }
                
                // Inside Poster Resting Zone
                if (time >= start + 2.0 && time < morphStart) {
                  return posterRest / dur;
                }

                // Inside Morph Expansion Zone (Magnetic Snapping threshold)
                if (time >= morphStart && time < start + 5.2) {
                  if (time < morphThreshold) {
                    return posterRest / dur; // Snap back to Poster
                  } else {
                    return (start + 6.75) / dur; // Snap forward to Expanded Gallery
                  }
                }

                // Inside Expanded Gallery Landing Zone
                if (time >= start + 5.2 && time < exitStart) {
                  return (start + 6.75) / dur;
                }

                // Inside Project Exit Handoff Zone
                if (time >= exitStart && time < nextStart) {
                  // For the last project, snap to the Contact reveal
                  if (idx === projects.length - 1) {
                    return 37.0 / dur;
                  }
                  return nextStart / dur;
                }
              }

              // 6. Contact Zone
              if (time >= 36.5) {
                return 37.0 / dur;
              }

              return progress;
            },
            duration: { min: 0.35, max: 0.65 }, // Snappier, fluid glide times
            delay: 0.015, // Ultra-responsive 15ms snapping delay for instant magnetic capture!
            ease: 'power4.out', // Crisp, high-end momentum deceleration curve
          },
          onUpdate: (self) => {
            const progress = self.progress;
            const heroEl = document.querySelector('.hero-section-container') as HTMLDivElement | null;
            const aboutEl = document.querySelector('.about-section-container') as HTMLDivElement | null;
            const workEl = document.querySelector('.work-section-container') as HTMLDivElement | null;
            const contactEl = document.querySelector('.contact-section-container') as HTMLDivElement | null;

            if (heroEl && aboutEl && workEl && contactEl) {
              if (progress < 0.004) {
                heroEl.style.pointerEvents = 'auto';
                aboutEl.style.pointerEvents = 'none';
                workEl.style.pointerEvents = 'none';
                contactEl.style.pointerEvents = 'none';
              } else if (progress >= 0.004 && progress < 0.129) {
                heroEl.style.pointerEvents = 'none';
                aboutEl.style.pointerEvents = 'auto';
                workEl.style.pointerEvents = 'none';
                contactEl.style.pointerEvents = 'none';
              } else if (progress >= 0.129 && progress < 0.971) {
                heroEl.style.pointerEvents = 'none';
                aboutEl.style.pointerEvents = 'none';
                workEl.style.pointerEvents = 'auto';
                contactEl.style.pointerEvents = 'none';
              } else {
                heroEl.style.pointerEvents = 'none';
                aboutEl.style.pointerEvents = 'none';
                workEl.style.pointerEvents = 'none';
                contactEl.style.pointerEvents = 'auto';
              }
            }
          },
        },
      });

      // =========================================================================
      // --- PHASE 1: Hero fade & shift out (0.0 -> 0.15) ---
      // =========================================================================
      tl.to('.hero-text-content', { opacity: 0, y: -60, scale: 0.94, ease: 'power1.out' }, 0);
      tl.to('.hero-meta-row', { opacity: 0, y: -30, ease: 'power1.out' }, 0);
      tl.to('.hero-fluid-canvas', { opacity: 0, ease: 'power1.out' }, 0);
      tl.to('.hero-section-container', { opacity: 0, ease: 'power1.inOut' }, 0.15);
      tl.to('.hero-line-1', { x: 220, ease: 'power2.out' }, 0);
      tl.to('.hero-line-2', { x: -220, ease: 'power2.out' }, 0);

      // =========================================================================
      // --- PHASE 2: Theme morph + About biography reveals (0.15 -> 2.75) ---
      // =========================================================================
      tl.to('html', {
        '--color-bg': '#FFFFFF',
        '--color-text-1': '#0A0A0A',
        '--color-text-2': '#444444',
        '--color-border': 'rgba(10, 10, 10, 0.15)',
        '--color-accent': '#3F702A',
        '--text-shadow-glow': '0 2px 12px rgba(10, 10, 10, 0.02)',
        '--color-card-bg': 'rgba(255, 255, 255, 0.35)',
        '--color-card-shadow': '0 8px 32px rgba(10, 10, 10, 0.03)',
        '--color-card-shadow-hover': '0 12px 40px rgba(10, 10, 10, 0.05)',
        '--color-text-reveal-bg': 'rgba(10, 10, 10, 0.12)',
        ease: 'none',
      }, 0.15);

      tl.fromTo('.about-portrait-img',
        { clipPath: 'inset(100% 0% 0% 0%)', y: 120 },
        { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.8, ease: 'power2.out' },
        0.45
      );
      tl.fromTo('.about-eyebrow',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, ease: 'power2.out', duration: 0.4 },
        0.80
      );
      tl.fromTo('.about-char',
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.025, duration: 0.8, ease: 'premiumBezier' },
        0.85
      );
      tl.fromTo('.about-description',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, ease: 'power2.out', duration: 0.5 },
        1.25
      );

      // =========================================================================
      // --- PHASE 3: About sub-section + portrait cross-fade (2.75 -> 4.85) ---
      // =========================================================================
      tl.set('.about-portrait-left-img', { xPercent: 50, opacity: 0 }, 0);
      tl.set('.about-sub-content', { opacity: 0 }, 0);
      tl.set('.sub-section-eyebrow, .sub-section-focus, .sub-section-metrics, .sub-section-stack', {
        opacity: 0,
        y: 24,
      }, 0);
      // Work and Contact initial hidden states
      tl.set('.work-section-container', { opacity: 0, pointerEvents: 'none' }, 0);
      tl.set('.work-intro-container', { opacity: 1, y: '0px' }, 0);
      tl.set('.work-intro-line-1, .work-intro-line-2', {
        yPercent: 100,
        opacity: 0,
      }, 0);
      projects.forEach((project) => {
        tl.set(`.project-card-container-${project.id}`, {
          top: cardTop, // Rest at stable poster position by default
          left: cardLeft,
          width: cardWidth,
          height: cardHeight,
          borderRadius: cardRadius,
          y: '100vh', // Start translated down for hardware-accelerated composite-only animations
          opacity: 0,
          pointerEvents: 'none',
          attr: { 'data-expanded': 'false' },
        }, 0);
        tl.set(`.project-image-wrapper-${project.id}`, {
          borderRadius: cardRadius,
          yPercent: -15,
        }, 0);
        tl.set(`.project-image-${project.id}`, {
          scale: 1.12,
        }, 0);
        tl.set(`.project-intro-block-${project.id}`, {
          opacity: 0,
          y: 0,
        }, 0);
        tl.set(`.project-intro-eyebrow-${project.id}`, {
          opacity: 0,
          y: 30,
          filter: 'blur(8px)',
        }, 0);
        tl.set(`.project-intro-title-${project.id}`, {
          opacity: 0,
          y: 40,
          filter: 'blur(12px)',
        }, 0);
        tl.set(`.project-intro-line-${project.id}`, {
          opacity: 0,
          scaleX: 0,
        }, 0);
        tl.set(`.project-intro-desc-${project.id}`, {
          opacity: 0,
          y: 30,
          filter: 'blur(8px)',
        }, 0);
      });
      tl.set('.contact-section-container', { opacity: 0, pointerEvents: 'none' }, 0);
      tl.set('.contact-content-wrapper', { opacity: 0, y: 30 }, 0);

      tl.to('.about-editorial-text', { opacity: 0, y: -80, duration: 0.6, ease: 'power2.inOut' }, 2.75);
      tl.to('.about-portrait-trigger', { pointerEvents: 'none', duration: 0.1 }, 2.75);
      tl.to('.about-portrait-img', { xPercent: -50, opacity: 0, duration: 0.8, ease: 'power2.inOut' }, 2.85);
      tl.to('.about-portrait-left-img', { xPercent: 0, opacity: 1, duration: 0.8, ease: 'power2.inOut' }, 2.85);
      tl.to('.about-sub-content', { opacity: 1, pointerEvents: 'auto', duration: 0.4, ease: 'none' }, 2.95);
      tl.to('.sub-section-eyebrow', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 3.05);
      tl.to('.sub-section-focus', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 3.15);
      tl.to('.sub-section-metrics', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 3.35);
      tl.to('.sub-section-stack', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 3.55);

      // =========================================================================
      // --- PHASE 4: About exit + "Our Work" Cinematic Transition (4.85 -> 8.0) ---
      // =========================================================================
      tl.to('.about-portrait-left-img', { opacity: 0, yPercent: 12, duration: 0.8, ease: 'power2.in' }, 4.85);
      tl.to('.about-sub-content', { opacity: 0, pointerEvents: 'none', y: -40, duration: 0.6, ease: 'power2.in' }, 4.85);
      tl.to('.about-glass-overlay', { opacity: 0, duration: 0.6, ease: 'power1.inOut' }, 4.85);

      // Enable visibility for "Our Work" container
      tl.to('.work-section-container', { opacity: 1, pointerEvents: 'auto', duration: 0.45, ease: 'none' }, 4.85);

      // 1. Line 1 ("Our") reveals upward independently
      tl.to('.work-intro-line-1', {
        yPercent: 0,
        opacity: 1,
        duration: 1.0,
        ease: 'premiumBezier',
      }, 5.0);

      // 2. Line 2 ("Work") reveals with a 150ms staggered delay
      tl.to('.work-intro-line-2', {
        yPercent: 0,
        opacity: 1,
        duration: 1.0,
        ease: 'premiumBezier',
      }, 5.15);

      // 3. Seamless handoff: as user scrolls past, text subtly fades and moves upward
      tl.to('.work-intro-container', {
        y: '-80px',
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
      }, 7.2);

      // =========================================================================
      // =========================================================================
      // --- PHASE 5: Dynamic Projects Portal Morph Loop (6.0 -> 30.0) ---
      // =========================================================================
      projects.forEach((project, idx) => {
        const start = 8.0 + idx * 9.5;

        // Slide positions and transitions are now managed dynamically via custom gestures in ProjectCard.tsx

        // =========================================================================
        // --- PHASE 01: PROJECT TYPOGRAPHY INTRODUCTION (Staggered Intro) ---
        // =========================================================================
        // Masked reveal, upward translate, blur resolve, and scaleX horizontal divider emergence
        tl.to(`.project-intro-block-${project.id}`, { opacity: 1, pointerEvents: 'auto', duration: 0.1 }, start + 0.2);

        tl.to(`.project-intro-eyebrow-${project.id}`, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'premiumBezier',
        }, start + 0.2);

        tl.to(`.project-intro-title-${project.id}`, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'premiumBezier',
        }, start + 0.35);

        tl.to(`.project-intro-line-${project.id}`, {
          opacity: 1,
          scaleX: 1,
          duration: 0.6,
          ease: 'power2.out',
        }, start + 0.5);

        tl.to(`.project-intro-desc-${project.id}`, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'premiumBezier',
        }, start + 0.65);

        // --- PAUSE TYPOGRAPHY INTRODUCTION (0.55s) ---
        // start + 1.45 to start + 2.0. Allow user to read and build anticipation.

        // --- TYPOGRAPHY INTRODUCTION EXIT ---
        // Typography slides up cleanly and fades out to make space for the emergent card
        tl.to(`.project-intro-block-${project.id}`, {
          opacity: 0,
          y: -50,
          filter: 'blur(12px)',
          duration: 0.6,
          ease: 'power2.in',
          pointerEvents: 'none',
        }, start + 2.0);

        // =========================================================================
        // --- PHASE 02: IMAGE-ONLY PROJECT CARD ENTRY (Independent Fades) ---
        // =========================================================================
        // Card slides upward smoothly from below (hardware-accelerated y-translate) and fades in
        tl.fromTo(`.project-card-container-${project.id}`,
          { y: '100vh', opacity: 0 },
          {
            y: '0vh',
            opacity: 1,
            pointerEvents: 'auto',
            duration: 1.2,
            ease: 'power2.out',
          },
          start + 2.2
        );

        // Inner image parallax during entry (100% composite-only)
        tl.fromTo(`.project-image-wrapper-${project.id}`,
          { yPercent: -15 },
          { yPercent: 0, duration: 1.2, ease: 'power2.out' },
          start + 2.2
        );

        // --- CARD RESTING STATE (POSTER PHASE) ---
        // Hold/Pause centered card (with rounded corners) as a visual poster.
        // start + 3.4 to start + 4.2 (duration: 0.8s). No text visible, image dominant.

        // =========================================================================
        // --- PHASE 03: ONE-WAY MORPH EXPANSION ---
        // =========================================================================
        // Card expands in width, height, position, and border radius to fullscreen
        tl.to(`.project-card-container-${project.id}`, {
          width: '100vw',
          height: '100vh',
          top: '0vh',
          left: '0vw',
          borderRadius: '0px',
          duration: 1.2,
          ease: 'premiumBezier',
        }, start + 4.4);

        tl.to(`.project-image-wrapper-${project.id}`, {
          borderRadius: '0px',
          duration: 1.2,
          ease: 'premiumBezier',
        }, start + 4.4);

        // Inner image scales down slightly for morph depth
        tl.to(`.project-image-${project.id}-0`, {
          scale: 1.0,
          duration: 1.2,
          ease: 'premiumBezier',
        }, start + 4.4);

        // Dynamically transition all visual variables on html for NavRail & MorphNav to white/dark mode (instant toggle)
        tl.to('html', {
          '--color-bg': '#FFFFFF',
          '--color-text-1': '#FFFFFF',
          '--color-text-2': '#888888',
          '--color-border': 'rgba(255, 255, 255, 0.15)',
          '--color-card-bg': 'rgba(255, 255, 255, 0.08)',
          duration: 0.1,
          ease: 'none',
        }, start + 4.4);

        // =========================================================================
        // --- EXTRA: FLOATING GALLERY CONTROL PILL EMERGENCE (V3 Landing Sequence) ---
        // =========================================================================
        // 1. Orb Emergence (starts after 150ms pause at start + 5.75)
        tl.to(`.project-gallery-pill-${project.id}`, {
          opacity: 1,
          y: 0,
          scale: 1.0,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: 'premiumBezier',
        }, start + 5.75);

        // 2. Shape Morph to Pill (starts at start + 6.35)
        tl.to(`.project-gallery-pill-${project.id}`, {
          width: '180px',
          duration: 0.7,
          ease: 'premiumBezier',
        }, start + 6.35);

        // 3. Staggered Content Reveal inside the Pill (starts at start + 6.75)
        tl.to(`.pill-content-${project.id}`, {
          opacity: 1,
          pointerEvents: 'auto',
          duration: 0.4,
          ease: 'power2.out',
        }, start + 6.75);

        // Toggle state attribute signaling card has fully landed to trigger autoplay loop
        tl.set(`.project-card-container-${project.id}`, { attr: { 'data-expanded': 'true' } }, start + 6.75);

        // The horizontal project gallery interactions (dragging, parallax slides, live capsule and counters)
        // are now entirely handled via high-performance horizontal pointer gestures in ProjectCard.tsx,
        // leaving the vertical wheel/touch scroll completely unobstructed.

        // =========================================================================
        // --- PHASE 04: IMMERSIVE FULLSCREEN EXIT & PILL POWER DOWN (Exit Sequence) ---
        // =========================================================================
        // Halt autoplay progression immediately
        tl.set(`.project-card-container-${project.id}`, { attr: { 'data-expanded': 'false' } }, start + 8.5);

        // Fade gallery controls instantly on exit
        tl.to(`.pill-content-${project.id}`, {
          opacity: 0,
          pointerEvents: 'none',
          duration: 0.3,
        }, start + 8.5);

        tl.to(`.project-gallery-pill-${project.id}`, {
          opacity: 0,
          y: 32,
          scale: 0.8,
          filter: 'blur(8px)',
          duration: 0.5,
          ease: 'premiumBezier',
        }, start + 8.5);

        // Slide the entire expanded fullscreen card straight UP off-screen using hardware-accelerated y-translate
        if (idx < projects.length - 1) {
          tl.to(`.project-card-container-${project.id}`, {
            y: '-100vh',
            opacity: 0,
            duration: 1.0,
            ease: 'premiumBezier',
          }, start + 8.5);
        } else {
          // For the LAST project, slide straight up off-screen
          tl.to(`.project-card-container-${project.id}`, {
            y: '-100vh',
            opacity: 0,
            duration: 1.0,
            ease: 'premiumBezier',
          }, start + 8.5);

          // Fade out the entire Work section container to reveal Contact underneath
          tl.to('.work-section-container', {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.inOut',
          }, start + 8.7);
        }

        // Smoothly transition HTML variables back to light mode as card exits off-screen (instant toggle)
        tl.to('html', {
          '--color-bg': '#FFFFFF',
          '--color-text-1': '#0A0A0A',
          '--color-text-2': '#444444',
          '--color-border': 'rgba(10, 10, 10, 0.15)',
          '--color-card-bg': 'rgba(255, 255, 255, 0.35)',
          duration: 0.1,
          ease: 'none',
        }, start + 8.5);
      });

      // =========================================================================
      // --- PHASE 6: Work Exit + Contact reveal (36.8 -> 37.4) ---
      // =========================================================================
      tl.to('.contact-section-container', {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.4,
        ease: 'none',
      }, 36.8);

      tl.to('.contact-content-wrapper', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      }, 37.0);
    });

    return () => {
      ctx.revert();
      gsap.set('html', {
        '--color-bg': '',
        '--color-text-1': '',
        '--color-text-2': '',
        '--color-border': '',
        '--color-accent': '',
        '--text-shadow-glow': '',
        '--color-card-bg': '',
        '--color-card-shadow': '',
        '--color-card-shadow-hover': '',
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '750vh', // Optimizing physical travel distance by 37.5% for ultra-responsive, ergonomic scrolling
      }}
    >
      <NavRail />

      <div
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Hero />
        <About />
        <ProjectShowcase />
        <Contact />

      </div>
    </div>
  );
}
