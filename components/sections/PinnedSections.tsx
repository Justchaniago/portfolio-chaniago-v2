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
          scrub: 1.2,
          onUpdate: (self) => {
            const progress = self.progress;
            const heroEl = document.querySelector('.hero-section-container') as HTMLDivElement | null;
            const aboutEl = document.querySelector('.about-section-container') as HTMLDivElement | null;
            const workEl = document.querySelector('.work-section-container') as HTMLDivElement | null;
            const contactEl = document.querySelector('.contact-section-container') as HTMLDivElement | null;

            if (heroEl && aboutEl && workEl && contactEl) {
              if (progress < 0.008) {
                heroEl.style.pointerEvents = 'auto';
                aboutEl.style.pointerEvents = 'none';
                workEl.style.pointerEvents = 'none';
                contactEl.style.pointerEvents = 'none';
              } else if (progress >= 0.008 && progress < 0.211) {
                heroEl.style.pointerEvents = 'none';
                aboutEl.style.pointerEvents = 'auto';
                workEl.style.pointerEvents = 'none';
                contactEl.style.pointerEvents = 'none';
              } else if (progress >= 0.211 && progress < 0.948) {
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
      projects.forEach((project) => {
        tl.set(`.project-card-container-${project.id}`, {
          top: '100vh',
          left: cardLeft,
          width: cardWidth,
          height: cardHeight,
          borderRadius: cardRadius,
          opacity: 1,
          pointerEvents: 'none',
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
      // --- PHASE 4: About exit + Work Intro reveal (4.85 -> 6.0) ---
      // =========================================================================
      tl.to('.about-portrait-left-img', { opacity: 0, yPercent: 12, duration: 0.8, ease: 'power2.in' }, 4.85);
      tl.to('.about-sub-content', { opacity: 0, pointerEvents: 'none', y: -40, duration: 0.6, ease: 'power2.in' }, 4.85);
      tl.to('.about-glass-overlay', { opacity: 0, duration: 0.6, ease: 'power1.inOut' }, 4.85);

      // Enable visibility for Work intro container
      tl.to('.work-section-container', { opacity: 1, pointerEvents: 'auto', duration: 0.4, ease: 'none' }, 5.0);

      // Reveal the large "MY WORK" masked editorial typography
      tl.fromTo('.work-intro-char',
        { yPercent: 100, opacity: 0, filter: 'blur(12px)' },
        { yPercent: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.05, duration: 0.8, ease: 'premiumBezier' },
        5.1
      );

      // Brief pause and then fade out the title to let the projects emerge
      tl.to('.work-intro-container', { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 5.7);

      // =========================================================================
      // =========================================================================
      // --- PHASE 5: Dynamic Projects Portal Morph Loop (6.0 -> 30.0) ---
      // =========================================================================
      projects.forEach((project, idx) => {
        const start = 6.0 + idx * 8.0;

        // Slide positions and transitions are now managed dynamically via custom gestures in ProjectCard.tsx

        // =========================================================================
        // --- PHASE 01: PROJECT TYPOGRAPHY INTRODUCTION ---
        // =========================================================================
        // Masked reveal, upward translate, blur resolve, and scaleX horizontal divider emergence
        tl.to(`.project-intro-block-${project.id}`, { opacity: 1, pointerEvents: 'auto', duration: 0.1 }, start);

        tl.to(`.project-intro-eyebrow-${project.id}`, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'premiumBezier',
        }, start + 0.15);

        tl.to(`.project-intro-title-${project.id}`, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'premiumBezier',
        }, start + 0.25);

        tl.to(`.project-intro-line-${project.id}`, {
          opacity: 1,
          scaleX: 1,
          duration: 0.6,
          ease: 'power2.out',
        }, start + 0.4);

        tl.to(`.project-intro-desc-${project.id}`, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'premiumBezier',
        }, start + 0.55);

        // --- PAUSE TYPOGRAPHY INTRODUCTION (0.8s) ---
        // start + 1.2 to start + 2.0. Allow user to read and build anticipation.

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
        // --- PHASE 02: IMAGE-ONLY PROJECT CARD ENTRY ---
        // =========================================================================
        // Card slides upward smoothly from below (100vh) to centered height (cardTop)
        tl.fromTo(`.project-card-container-${project.id}`,
          { top: '100vh', borderRadius: cardRadius },
          {
            top: cardTop,
            borderRadius: cardRadius,
            pointerEvents: 'auto',
            duration: 1.2,
            ease: 'power2.out',
          },
          start + 2.2
        );

        // Inner image parallax during entry
        tl.fromTo(`.project-image-wrapper-${project.id}`,
          { yPercent: -15, borderRadius: cardRadius },
          { yPercent: 0, borderRadius: cardRadius, duration: 1.2, ease: 'power2.out' },
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
        }, start + 4.2);

        tl.to(`.project-image-wrapper-${project.id}`, {
          borderRadius: '0px',
          duration: 1.2,
          ease: 'premiumBezier',
        }, start + 4.2);

        // Inner image scales down slightly for morph depth
        tl.to(`.project-image-${project.id}-0`, {
          scale: 1.0,
          duration: 1.2,
          ease: 'premiumBezier',
        }, start + 4.2);

        // Dynamically transition all visual variables on html for NavRail & MorphNav to white/dark mode (instant toggle)
        tl.to('html', {
          '--color-bg': '#FFFFFF',
          '--color-text-1': '#FFFFFF',
          '--color-text-2': '#888888',
          '--color-border': 'rgba(255, 255, 255, 0.15)',
          '--color-card-bg': 'rgba(255, 255, 255, 0.08)',
          duration: 0.1,
          ease: 'none',
        }, start + 4.2);

        // =========================================================================
        // --- EXTRA: FLOATING GALLERY CONTROL PILL EMERGENCE ---
        // =========================================================================
        // 1. Orb Emergence (translates up, fades in, and blurs in)
        tl.to(`.project-gallery-pill-${project.id}`, {
          opacity: 1,
          y: 0,
          scale: 1.0,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: 'premiumBezier',
        }, start + 5.2);

        // 2. Shape Morph to Pill (width expands to 180px)
        tl.to(`.project-gallery-pill-${project.id}`, {
          width: '180px',
          duration: 0.7,
          ease: 'premiumBezier',
        }, start + 5.6);

        // 3. Staggered Content Reveal inside the Pill
        tl.to(`.pill-content-${project.id}`, {
          opacity: 1,
          pointerEvents: 'auto',
          duration: 0.4,
          ease: 'power2.out',
        }, start + 6.0);

        // The horizontal project gallery interactions (dragging, parallax slides, live capsule and counters)
        // are now entirely handled via high-performance horizontal pointer gestures in ProjectCard.tsx,
        // leaving the vertical wheel/touch scroll completely unobstructed.

        // =========================================================================
        // --- PHASE 04: IMMERSIVE FULLSCREEN EXIT & PILL POWER DOWN ---
        // =========================================================================
        // Once the project reaches expanded state, it is a one-way journey. 
        // It never collapses back to card state. It simply slides straight UP off-screen.
        if (idx < projects.length - 1) {
          // Slide the entire expanded fullscreen card straight UP off-screen
          tl.to(`.project-card-container-${project.id}`, {
            top: '-100vh',
            duration: 1.0,
            ease: 'premiumBezier',
          }, start + 8.3);
        } else {
          // For the LAST project, slide straight up off-screen
          tl.to(`.project-card-container-${project.id}`, {
            top: '-100vh',
            duration: 1.0,
            ease: 'premiumBezier',
          }, start + 8.3);

          // Fade out the entire Work section container to reveal Contact underneath
          tl.to('.work-section-container', {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.inOut',
          }, start + 8.5);
        }

        // --- CONTROL PILL POWER DOWN (COLLAPSE REVERSAL) ---
        // 1. Staggered content inside the pill fades out
        tl.to(`.pill-content-${project.id}`, {
          opacity: 0,
          pointerEvents: 'none',
          duration: 0.25,
          ease: 'power2.in',
        }, start + 8.3);

        // 2. Shape morphs back to circular orb (width 56px)
        tl.to(`.project-gallery-pill-${project.id}`, {
          width: '56px',
          duration: 0.4,
          ease: 'premiumBezier',
        }, start + 8.4);

        // 3. Orb slides down, blurs, and fades out entirely
        tl.to(`.project-gallery-pill-${project.id}`, {
          opacity: 0,
          y: 32,
          scale: 0.8,
          filter: 'blur(8px)',
          duration: 0.4,
          ease: 'premiumBezier',
        }, start + 8.5);

        // Smoothly transition variables back to light mode as card exits off-screen (instant toggle)
        tl.to('html', {
          '--color-bg': '#FFFFFF',
          '--color-text-1': '#0A0A0A',
          '--color-text-2': '#444444',
          '--color-border': 'rgba(10, 10, 10, 0.15)',
          '--color-card-bg': 'rgba(255, 255, 255, 0.35)',
          duration: 0.1,
          ease: 'none',
        }, start + 8.3);
      });

      // =========================================================================
      // --- PHASE 6: Work Exit + Contact reveal (30.3 -> 31.7) ---
      // =========================================================================
      tl.to('.contact-section-container', {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.4,
        ease: 'none',
      }, 30.3);

      tl.to('.contact-content-wrapper', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      }, 30.5);
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
        height: '1200vh',
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
