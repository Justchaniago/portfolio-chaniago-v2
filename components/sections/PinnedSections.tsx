'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { SECTION_ANCHORS } from '@/lib/motion';

import Hero from './Hero';
import About from './About';
import ProjectShowcase from '../work/ProjectShowcase';
import Contact from './Contact';
import NavRail from '../layout/NavRail';
import { projects } from '@/data/projects';


export default function PinnedSections() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      const heroEl = document.querySelector('.hero-section-container') as HTMLDivElement | null;
      const aboutEl = document.querySelector('.about-section-container') as HTMLDivElement | null;
      const workEl = document.querySelector('.work-section-container') as HTMLDivElement | null;
      const contactEl = document.querySelector('.contact-section-container') as HTMLDivElement | null;

      if (!heroEl || !aboutEl || !workEl || !contactEl) return;

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
            snapTo: (progress, self) => {
              const dur = tl.duration();
              if (!dur) return progress;
              const time = progress * dur;
              const isScrollingUp = self && self.direction < 0;

              // 1. Hero vs About State 01 Snapping with Hysteresis
              if (time >= 0 && time < 1.85) {
                if (isScrollingUp) {
                  return time < 0.58 ? 0.0 : 1.85 / dur;
                } else {
                  return time >= 0.87 ? 1.85 / dur : 0.0;
                }
              }

              // 2 & 3. About State 01 vs About State 02 Snapping with Hysteresis
              if (time >= 1.85 && time < 4.0) {
                if (isScrollingUp) {
                  return time >= 1.0 ? 4.0 / dur : 1.85 / dur;
                } else {
                  return time >= 3.53 ? 4.0 / dur : 1.85 / dur;
                }
              }

              // 4. About State 02 vs Work Intro Snapping
              if (time >= 4.0 && time < 6.5) {
                if (isScrollingUp) {
                  return time < 5.0 ? 4.0 / dur : 6.5 / dur;
                } else {
                  return time >= 5.5 ? 6.5 / dur : 4.0 / dur;
                }
              }

              // 5. Work Intro vs Project 1 Intro Snapping
              if (time >= 6.5 && time < 8.0) {
                if (isScrollingUp) {
                  return 6.5 / dur;
                }
                return time >= 7.6 ? 9.4 / dur : 6.5 / dur;
              }

              // 6. Dynamic Project loop snapping
              for (let idx = 0; idx < projects.length; idx++) {
                const start = 8.0 + idx * 9.5;
                const introRest = start + 1.4;
                const galleryRest = start + 6.75;
                const morphStart = start + 4.4;
                const exitStart = start + 8.5;
                const nextStart = start + 9.5;

                // Project expansion magnetism thresholds (15% down / 85% up of the 1.2s morph duration)
                const morphThresholdDown = morphStart + 0.15 * 1.2; // start + 4.58
                const morphThresholdUp = morphStart + 0.85 * 1.2;   // start + 5.42

                if (time >= start && time < nextStart) {
                  if (isScrollingUp) {
                    // Scrolling up inside this project slot
                    
                    // If in the morph range: hysteresis snap back to poster if we scroll below 85%
                    if (time >= morphStart && time < start + 5.6) {
                      return time < morphThresholdUp ? introRest / dur : galleryRest / dur;
                    }
                    
                    // If deep inside the gallery zone: stay in gallery
                    if (time >= start + 5.6 && time < exitStart) {
                      return galleryRest / dur;
                    }

                    // Before morph: snap back to intro or previous project gallery
                    if (time >= start + 2.0 && time < morphStart) {
                      return introRest / dur;
                    }

                    if (time >= start && time < start + 2.0) {
                      if (idx > 0) {
                        const prevGallery = 8.0 + (idx - 1) * 9.5 + 6.75;
                        return prevGallery / dur;
                      } else {
                        return 6.5 / dur; // Work Intro
                      }
                    }
                  } else {
                    // Scrolling down inside this project slot
                    
                    // Inside Project Intro Zone
                    if (time >= start && time < start + 2.0) {
                      return introRest / dur;
                    }
                    
                    // Inside Poster resting zone
                    if (time >= start + 2.0 && time < morphStart) {
                      return introRest / dur;
                    }

                    // Inside Morph Expansion Zone (Magnetic Snapping)
                    if (time >= morphStart && time < start + 5.6) {
                      return time >= morphThresholdDown ? galleryRest / dur : introRest / dur;
                    }

                    // Inside Expanded Gallery Landing Zone
                    if (time >= start + 5.6 && time < exitStart) {
                      return galleryRest / dur;
                    }

                    // Inside Project Exit Handoff Zone
                    if (time >= exitStart && time < nextStart) {
                      if (idx === projects.length - 1) {
                        return 37.6 / dur; // Snap to Contact
                      }
                      const nextIntro = nextStart + 1.4;
                      return nextIntro / dur;
                    }
                  }
                }
              }

              // 7. Contact Zone Snapping
              if (time >= 36.5) {
                if (isScrollingUp) {
                  // Scrolling UP from Contact snaps back to the last project resting state
                  const lastProjectRest = 8.0 + (projects.length - 1) * 9.5 + 6.75;
                  return lastProjectRest / dur;
                }
                return 37.6 / dur; // Snap to canonical Contact resting point
              }

              return progress;
            },
            duration: { min: 0.35, max: 0.65 }, // Snappier, fluid glide times
            delay: 0.015, // Ultra-responsive 15ms snapping delay for instant magnetic capture!
            ease: 'power4.out', // Crisp, high-end momentum deceleration curve
          },
          onUpdate: (self) => {
            const progress = self.progress;

            // Use opacity and pointerEvents for performance, instead of display: none
            const setVisibility = (el: HTMLDivElement, visible: boolean) => {
              el.style.opacity = visible ? '1' : '0';
              el.style.pointerEvents = visible ? 'auto' : 'none';
            };

            // To make the transition from Hero to About smooth, we allow both sections to be visible
            // simultaneously during the transition window (progress 0.0 to 0.05).
            // This prevents the sudden "pop" or harsh cut of elements.
            if (progress < 0.05) {
              setVisibility(heroEl, true);
              setVisibility(aboutEl, true);
              setVisibility(workEl, false);
              setVisibility(contactEl, false);
              
              // Cross-fade the container opacities manually based on progress for absolute smoothness
              const fadeProgress = progress / 0.05; // 0.0 -> 1.0
              heroEl.style.opacity = String(1 - fadeProgress);
              aboutEl.style.opacity = String(fadeProgress);
            } else if (progress >= 0.05 && progress < 0.129) {
              setVisibility(heroEl, false);
              setVisibility(aboutEl, true);
              setVisibility(workEl, false);
              setVisibility(contactEl, false);
              aboutEl.style.opacity = '1';
            } else if (progress >= 0.129 && progress < 0.971) {
              setVisibility(heroEl, false);
              setVisibility(aboutEl, false);
              setVisibility(workEl, true);
              setVisibility(contactEl, false);
            } else {
              setVisibility(heroEl, false);
              setVisibility(aboutEl, false);
              setVisibility(workEl, false);
              setVisibility(contactEl, true);
            }
          },
        },
      });

      // Expose the master timeline so cinematicNavigate can force it to a
      // destination progress synchronously (Fix A: settle before reveal).
      timelineRef.current = tl;

      // =========================================================================
      // --- PHASE 1: Hero fade & shift out (0.0 -> 0.45) ---
      // =========================================================================
      // We extend the fade out of Hero elements and make the transition overlap beautifully with Phase 2.
      tl.to('.hero-text-content', { opacity: 0, y: -100, scale: 0.92, ease: 'power2.inOut' }, 0);
      tl.to('.hero-meta-row', { opacity: 0, y: -50, ease: 'power2.inOut' }, 0);
      tl.to('.hero-fluid-canvas', { opacity: 0, ease: 'power2.inOut' }, 0);
      tl.to('.hero-section-container', { opacity: 0, ease: 'power2.inOut' }, 0);
      tl.to('.hero-line-1', { x: 180, ease: 'power3.inOut' }, 0);
      tl.to('.hero-line-2', { x: -180, ease: 'power3.inOut' }, 0);

      // =========================================================================
      // --- PHASE 2: Theme morph + About biography reveals (0.0 -> 2.75) ---
      // =========================================================================
      // Start the background color transition earlier (at 0.0 instead of 0.15) and make it a smooth power2 curve
      // to blend the dark-to-light transition seamlessly without a sudden jump.
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
        ease: 'power2.inOut',
      }, 0.0);

      tl.fromTo('.about-portrait-img',
        { clipPath: 'inset(100% 0% 0% 0%)', y: 120, opacity: 0 },
        { clipPath: 'inset(0% 0% 0% 0%)', y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
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
          attr: { 'data-expanded': 'false', 'data-exiting': 'false' },
        }, 0);
        tl.set(`.project-image-wrapper-${project.id}`, {
          borderRadius: cardRadius,
          yPercent: -15,
        }, 0);
        tl.set(`.project-slide-wrapper-${project.id}-0`, {
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
        tl.set(`.project-gallery-pill-${project.id}`, {
          opacity: 0,
          y: 80,
          xPercent: -50,
          scale: 1.0,
          width: '52px',
          height: '52px',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }, 0);
      });
      tl.set('.contact-section-container', { opacity: 0, pointerEvents: 'none' }, 0);
      tl.set('.contact-content-wrapper', { opacity: 0, y: 30 }, 0);

      // Transition from State 01 to State 02 (happens in transition window 3.53 -> 4.0)
      tl.to('.about-editorial-text', { opacity: 0, y: -80, duration: 0.3, ease: 'power2.inOut' }, 3.53);
      tl.to('.about-portrait-trigger', { pointerEvents: 'none', duration: 0.1 }, 3.53);
      tl.to('.about-portrait-img', { xPercent: -50, opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 3.53);
      tl.to('.about-portrait-left-img', { xPercent: 0, opacity: 1, duration: 0.4, ease: 'power2.inOut' }, 3.53);
      tl.to('.about-sub-content', { opacity: 1, pointerEvents: 'auto', duration: 0.3, ease: 'none' }, 3.65);
      tl.to('.sub-section-eyebrow', { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 3.70);
      tl.to('.sub-section-focus', { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 3.75);
      tl.to('.sub-section-metrics', { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 3.80);
      tl.to('.sub-section-stack', { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 3.80);

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

        // The active slide scales down slightly for morph depth while the img keeps
        // its centering transform untouched.
        tl.to(`.project-slide-wrapper-${project.id}-0`, {
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
        // Toggle state after the fullscreen morph has landed, before the gallery controls appear.
        // This keeps React's gallery state aligned with the visual state without interrupting the morph.
        tl.set(`.project-card-container-${project.id}`, { attr: { 'data-expanded': 'true', 'data-exiting': 'false' } }, start + 5.50);

        // The horizontal project gallery interactions (dragging, parallax slides, live capsule and counters)
        // are now entirely handled via high-performance horizontal pointer gestures and a stable, one-shot
        // GSAP entry/exit sequence in ProjectCard.tsx, leaving the vertical scroll completely unobstructed.

        // =========================================================================
        // --- PHASE 04: IMMERSIVE FULLSCREEN EXIT & PILL POWER DOWN (Exit Sequence) ---
        // =========================================================================
        // Halt autoplay progression immediately
        tl.set(`.project-card-container-${project.id}`, { attr: { 'data-expanded': 'false', 'data-exiting': 'true' } }, start + 8.5);

        // Smoothly slide the entire expanded fullscreen card straight UP off-screen
        if (idx < projects.length - 1) {
          tl.to(`.project-card-container-${project.id}`, {
            y: '-100vh',
            pointerEvents: 'none',
            duration: 1.0,
            ease: 'power3.inOut',
          }, start + 8.5);
        } else {
          // For the LAST project, smooth exit before Contact section
          tl.to(`.project-card-container-${project.id}`, {
            y: '-100vh',
            pointerEvents: 'none',
            duration: 1.0,
            ease: 'power3.inOut',
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
      timelineRef.current = null;
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

  // ══════════════════════════════════════════════════════════════════════════════
  // Cinematic cross-section navigation — masked scroll jump with theme-matched reveal
  // ══════════════════════════════════════════════════════════════════════════════
  const overlayRef = useRef<HTMLDivElement>(null);

  const cinematicNavigate = useCallback((targetProgress: number) => {
    if (isTransitioningRef.current) return;
    if (typeof window === 'undefined') return;

    const overlay = overlayRef.current;
    const sticky = stickyRef.current;
    if (!overlay || !sticky) return;

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = scrollHeight * targetProgress;
    const currentScroll = window.scrollY;

    if (Math.abs(currentScroll - targetScroll) < 5) return;

    isTransitioningRef.current = true;
    // Gate the nav indicators (MorphNav / NavRail) from reacting to the jump scroll.
    (window as any).__navTransitioning = true;

    const lenis = (window as any).lenis;
    if (lenis) lenis.stop();

    ScrollTrigger.getAll().forEach((st) => {
      if (st.vars.snap) {
        (st as any)._snapDisabled = true;
        st.disable();
      }
    });

    // Overlay enters masking the SOURCE scene — paint it the current theme color.
    const sourceBg = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-bg').trim() || '#0A0A0A';
    gsap.set(overlay, { display: 'block', opacity: 0, backgroundColor: sourceBg });

    // ── PHASE 1: Departure — blur/scale the scene out behind a rising mask ──
    const departTl = gsap.timeline({
      onComplete: () => {
        // ── PHASE 2: Masked jump (overlay fully opaque now) ──
        gsap.set(sticky, { clearProps: 'scale,filter' });
        window.scrollTo({ top: targetScroll, behavior: 'auto' });
        ScrollTrigger.update();

        // ── PHASE 3: Stabilize across a few frames, then re-enable snapping ──
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              ScrollTrigger.getAll().forEach((st) => {
                if ((st as any)._snapDisabled) {
                  st.enable();
                  delete (st as any)._snapDisabled;
                }
              });
              ScrollTrigger.update();

              // ── Resolve the destination scene synchronously (still masked) ──
              // scrub:0.6 eases the timeline toward the new scroll over ~0.6s —
              // longer than the 0.4s reveal — which would let the mask lift on a
              // mid-scrub scene. Force the scrub catch-up to completion and pin the
              // timeline exactly to the destination so every tweened value (hero
              // opacity, theme colors) is final BEFORE the reveal begins.
              const masterTl = timelineRef.current;
              const masterSt = masterTl?.scrollTrigger;
              if (masterTl && masterSt) {
                const scrubTween = typeof (masterSt as any).getTween === 'function'
                  ? (masterSt as any).getTween()
                  : null;
                if (scrubTween) scrubTween.progress(1); // finish catch-up instantly
                masterTl.progress(targetProgress);      // pin to exact destination
                ScrollTrigger.update();
              }

              // ── Overlay color sync: match the SETTLED destination scene ──
              // The timeline is now pinned to the destination, so --color-bg holds
              // the real arrival theme. Paint the overlay that exact color so the
              // reveal dissolves destination-color → destination-scene (no veil).
              const destBg = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-bg').trim() || '#0A0A0A';
              gsap.set(overlay, { backgroundColor: destBg });

              // ── PHASE 4: Arrival — settle scale + dissolve the matched mask ──
              gsap.set(sticky, { scale: 1.01 });
              gsap.to(sticky, {
                scale: 1,
                duration: 0.5,
                ease: 'power2.out',
                clearProps: 'scale',
              });
              gsap.to(overlay, {
                opacity: 0,
                duration: 0.4,
                ease: 'power2.inOut',
                onComplete: () => {
                  gsap.set(overlay, { display: 'none' });
                  isTransitioningRef.current = false;
                  if (lenis) lenis.start();
                  (window as any).__navTransitioning = false;
                },
              });
            });
          });
        });
      },
    });

    departTl.to(sticky, {
      scale: 0.985,
      filter: 'blur(3px)',
      duration: 0.3,
      ease: 'power2.out',
    }, 0);

    departTl.to(overlay, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.in',
    }, 0);

  }, []);

  // Expose the cinematic navigator globally for NavRail and MorphNav
  useEffect(() => {
    (window as any).__cinematicNavigate = cinematicNavigate;
    return () => {
      delete (window as any).__cinematicNavigate;
    };
  }, [cinematicNavigate]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '750vh',
      }}
    >
      <NavRail />

      {/* Cinematic transition masking overlay — sits above ALL content */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          pointerEvents: 'none',
          display: 'none',
          opacity: 0,
          willChange: 'opacity',
        }}
      />

      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          willChange: 'transform, filter',
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
