'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import Hero from './Hero';
import About from './About';
import Contact from './Contact';
import NavRail from '../layout/NavRail';

export default function PinnedSections() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) return;

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
            const contactEl = document.querySelector('.contact-section-container') as HTMLDivElement | null;

            if (heroEl && aboutEl && contactEl) {
              if (progress < 0.15) {
                heroEl.style.pointerEvents = 'auto';
                aboutEl.style.pointerEvents = 'none';
                contactEl.style.pointerEvents = 'none';
              } else if (progress >= 0.15 && progress < 0.85) {
                heroEl.style.pointerEvents = 'none';
                aboutEl.style.pointerEvents = 'auto';
                contactEl.style.pointerEvents = 'none';
              } else {
                heroEl.style.pointerEvents = 'none';
                aboutEl.style.pointerEvents = 'none';
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
      gsap.set('.about-portrait-left-img', { xPercent: 50, opacity: 0 });
      gsap.set('.about-sub-content', { opacity: 0 });
      gsap.set('.sub-section-eyebrow, .sub-section-focus, .sub-section-metrics, .sub-section-stack', {
        opacity: 0,
        y: 24,
      });
      gsap.set('.contact-section-container', { opacity: 0, pointerEvents: 'none' });
      gsap.set('.contact-content-wrapper', { opacity: 0, y: 30 });

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
      // --- PHASE 4: About exit + Contact reveal (4.85 -> 5.95) ---
      // =========================================================================
      tl.to('.about-portrait-left-img', { opacity: 0, yPercent: 12, duration: 0.8, ease: 'power2.in' }, 4.85);
      tl.to('.about-sub-content', { opacity: 0, pointerEvents: 'none', y: -40, duration: 0.6, ease: 'power2.in' }, 4.85);
      tl.to('.about-glass-overlay', { opacity: 0, duration: 0.6, ease: 'power1.inOut' }, 4.85);

      tl.to('.contact-section-container', {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.4,
        ease: 'none',
      }, 5.15);

      tl.to('.contact-content-wrapper', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      }, 5.35);
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
        height: '450vh',
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
        <Contact />
      </div>
    </div>
  );
}
