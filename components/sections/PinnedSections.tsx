'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import Hero from './Hero';
import About from './About';
import Work from './Work';

export default function PinnedSections() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) return;

      // 2. Create master synchronized ScrollTrigger timeline
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

            // 3-Stage dynamic pointerEvents update gates to isolate sections precisely
            if (heroEl && aboutEl && workEl) {
              if (progress < 0.35) {
                heroEl.style.pointerEvents = 'auto';
                aboutEl.style.pointerEvents = 'none';
                workEl.style.pointerEvents = 'none';
              } else if (progress >= 0.35 && progress < 0.76) {
                heroEl.style.pointerEvents = 'none';
                aboutEl.style.pointerEvents = 'auto';
                workEl.style.pointerEvents = 'none';
              } else {
                heroEl.style.pointerEvents = 'none';
                aboutEl.style.pointerEvents = 'none';
                workEl.style.pointerEvents = 'auto';
              }
            }
          },
        },
      });

      // =========================================================================
      // --- PHASE 1: Hero elements fade & shift out (Timeline 0.0 -> 0.8) ---
      // =========================================================================
      tl.to('.hero-text-content', {
        opacity: 0,
        y: -60,
        scale: 0.94,
        ease: 'power1.out',
      }, 0);

      tl.to('.hero-meta-row', {
        opacity: 0,
        y: -30,
        ease: 'power1.out',
      }, 0);

      tl.to('.hero-fluid-canvas', {
        opacity: 0,
        ease: 'power1.out',
      }, 0);

      // Fade out the entire hero section container to reveal the About section underneath
      tl.to('.hero-section-container', {
        opacity: 0,
        ease: 'power1.inOut',
      }, 0.15);

      // Tagline splits: target the outer blocks to bypass CSS transition conflict
      tl.to('.hero-line-1', {
        x: 220,
        ease: 'power2.out',
      }, 0);

      tl.to('.hero-line-2', {
        x: -220,
        ease: 'power2.out',
      }, 0);

      // =========================================================================
      // --- PHASE 2: Global Theme Variable Morphing & About Biography Reveals (Timeline 0.15 -> 1.10) ---
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

      // Premium Clip-Path Mask Unveil + Spatial Parallax Rise of the native HD cutout portrait
      tl.fromTo('.about-portrait-img',
        {
          clipPath: 'inset(100% 0% 0% 0%)',
          y: 120,
        },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        0.45
      );

      // 1. Neue Montreal Eyebrow reveal (triggers at 0.80 progress)
      tl.fromTo('.about-eyebrow',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, ease: 'power2.out' },
        0.80
      );

      // 2. Headline Character Stagger Cascade
      tl.fromTo('.about-char',
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          stagger: 0.025,
          duration: 0.8,
          ease: 'premiumBezier',
        },
        0.82
      );

      // 3. Subheadline / Description reveal
      tl.fromTo('.about-description',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, ease: 'power2.out' },
        1.05
      );

      // =========================================================================
      // --- PHASE 3: NEW SUB-SECTION TRANSITION & PORTRAIT CROSS-FADE SLIDE (Timeline 1.10 -> 2.20) ---
      // =========================================================================
      // Initial state setup for left-aligned portrait and sub-content grids
      gsap.set('.about-portrait-left-img', {
        xPercent: 50, // Shifted right initially to slide in smoothly leftwards
        opacity: 0,
      });
      gsap.set('.about-sub-content', { opacity: 0 });
      gsap.set('.sub-section-eyebrow, .sub-section-focus, .sub-section-metrics, .sub-section-stack', {
        opacity: 0,
        y: 24,
      });

      // 1. Fade out and slide up the initial About biography text block
      tl.to('.about-editorial-text', {
        opacity: 0,
        y: -80,
        duration: 0.6,
        ease: 'power2.inOut',
      }, 1.10);

      // 2. Coordinated Portrait Cross-Fade Slide (0.8s duration)
      // Right-aligned portrait slides left and fades out
      tl.to('.about-portrait-img', {
        xPercent: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
      }, 1.20);

      // Left-aligned portrait slides left and fades in synchronously
      tl.to('.about-portrait-left-img', {
        xPercent: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.inOut',
      }, 1.20);

      // 3. Progressive Right-Side Sub-section Content Reveals
      tl.to('.about-sub-content', {
        opacity: 1,
        duration: 0.4,
        ease: 'none',
      }, 1.30);

      tl.to('.sub-section-eyebrow', {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      }, 1.40);

      tl.to('.sub-section-focus', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, 1.50);

      tl.to('.sub-section-metrics', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, 1.70);

      tl.to('.sub-section-stack', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, 1.90);

      // =========================================================================
      // --- PHASE 4: SUB-SECTION TO CURATED WORKS STAGGER REVEAL (Timeline 2.20 onwards) ---
      // =========================================================================
      // Left-aligned portrait fades and sinks downwards
      tl.to('.about-portrait-left-img', {
        opacity: 0,
        yPercent: 12,
        duration: 0.8,
        ease: 'power2.in',
      }, 2.20);

      // Right-side sub-section content fades and slides upwards
      tl.to('.about-sub-content', {
        opacity: 0,
        y: -40,
        duration: 0.6,
        ease: 'power2.in',
      }, 2.20);

      // Glass dome overlay fades out
      tl.to('.about-glass-overlay', {
        opacity: 0,
        duration: 0.6,
        ease: 'power1.inOut',
      }, 2.20);

      // Work section container emerges
      tl.to('.work-section-container', {
        opacity: 1,
        duration: 0.4,
        ease: 'none',
      }, 2.6);

      // Selected Works cards stagger up
      tl.fromTo('.work-header',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        2.8
      );

      tl.fromTo('.work-card-1',
        { opacity: 0, y: 40, scale: 0.96 },
        { opacity: 1, y: 24, scale: 1, duration: 0.9, ease: 'premiumBezier' },
        3.0
      );

      tl.fromTo('.work-card-2',
        { opacity: 0, y: 10, scale: 0.96 },
        { opacity: 1, y: -24, scale: 1, duration: 0.9, ease: 'premiumBezier' },
        3.2
      );
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
        height: '500vh', // Expanded scroll budget for multi-phase scrub
      }}
    >
      {/* Sticky base container locking viewport */}
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
        <Work />
      </div>
    </div>
  );
}
