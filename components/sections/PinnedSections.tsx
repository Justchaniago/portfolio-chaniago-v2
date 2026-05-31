'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import Hero from './Hero';
import About from './About';

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

            if (heroEl && aboutEl) {
              if (progress < 0.48) {
                heroEl.style.pointerEvents = 'auto';
                aboutEl.style.pointerEvents = 'none';
              } else {
                heroEl.style.pointerEvents = 'none';
                aboutEl.style.pointerEvents = 'auto';
              }
            }
          },
        },
      });

      // --- PHASE 1: Hero elements fade & shift out (0 -> 40) ---
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

      // --- PHASE 2: Global Theme Variable Morphing (15 -> 65) ---
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


      // Premium Clip-Path Mask Unveil + Spatial Parallax Rise (Ends perfectly flush at bottom edge with zero gaps!)
      tl.fromTo('.about-portrait-img',
        {
          clipPath: 'inset(100% 0% 0% 0%)',
          y: 80,
          yPercent: 12,
        },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          y: 0,
          yPercent: 0,
          ease: 'power2.out',
        },
        0.78
      );

      // 1. Neue Montreal Eyebrow reveal (triggers at 0.50 progress)
      tl.fromTo('.about-eyebrow',
        {
          opacity: 0,
          y: 15,
        },
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
        },
        0.50
      );

      // 2. Headline Character Stagger Cascade (Apple Keynote precision style)
      tl.fromTo('.about-char',
        {
          yPercent: 100, // Starts at translateY(100%) below its own baseline
          opacity: 0,
        },
        {
          yPercent: 0,
          opacity: 1,
          stagger: 0.025, // Character stagger: 0.02s - 0.04s
          duration: 0.8, // Duration: 0.7s - 0.9s
          ease: 'premiumBezier', // Custom premium cubic-bezier(0.22, 1, 0.36, 1)
        },
        0.52
      );

      // 3. Subheadline / Description reveal (triggers at 0.62 progress)
      tl.fromTo('.about-description',
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
        },
        0.62
      );
    });

    return () => {
      ctx.revert();
      // Reset variables upon destruction to be totally safe
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
        height: '350vh', // Total scroll budget (longer depth for slower scrub)
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
      </div>
    </div>
  );
}

