'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const quoteRef     = useRef<HTMLHeadingElement>(null);
  const textRef      = useRef<HTMLDivElement>(null);
  const metaRef      = useRef<HTMLDivElement>(null);
  const skillsRef    = useRef<HTMLDivElement>(null);
  const lineRef      = useRef<HTMLDivElement>(null);

  const pathRef      = useRef<SVGPathElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);

  // 1. Dynamic background & text color transition on scroll
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom', // Start transition as the section enters the bottom of viewport
      end: 'top 25%',      // Finish transition when section is 25% from top of viewport
      scrub: 1.2,          // Synced to Lenis scroll
      animation: gsap.timeline()
        .to('html', {
          '--color-bg': '#E8E0D5',         // Warm Linen/Ivory
          '--color-text-1': '#0A0A0A',     // Dark text
          '--color-text-2': '#444444',     // Muted text
          '--color-border': 'rgba(10, 10, 10, 0.15)', // Dark borders
          '--color-accent': '#3F702A',     // Contrast accent (dark green) on ivory
          '--text-shadow-glow': '0 2px 12px rgba(10, 10, 10, 0.02)',
          '--color-card-bg': 'rgba(255, 255, 255, 0.35)',
          '--color-card-shadow': '0 8px 32px rgba(10, 10, 10, 0.03)',
          '--color-card-shadow-hover': '0 12px 40px rgba(10, 10, 10, 0.05)',
          ease: 'none',
        }, 0),
    });

    return () => {
      trigger.kill();
      // Safely reset root variables upon unmount
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

  // 2. Scroll Animations for elements (stagger reveals & ribbon draws)
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      // Decorative Line reveal
      if (lineRef.current) {
        gsap.fromTo(lineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
              end: 'top 50%',
              scrub: true,
            }
          }
        );
      }

      // Staggered reveal of text and skills stack
      const targets = [quoteRef.current, textRef.current, metaRef.current, skillsRef.current];
      const activeTargets = targets.filter(t => t !== null);
      if (activeTargets.length > 0) {
        gsap.fromTo(activeTargets,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 70%',
            }
          }
        );
      }

      // Ribbon drawing animation synced with scroll
      const path = pathRef.current;
      if (path) {
        const length = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(path, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1.2,
          }
        });
      }

      // Parallax scroll-shift animation to separate depth layers
      const svg = svgRef.current;
      if (svg) {
        gsap.fromTo(svg,
          { yPercent: -10 },
          {
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            }
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-1)',
        padding: 'clamp(80px, 12vw, 160px) clamp(32px, 6vw, 80px)',
        overflow: 'hidden',
        transition: 'background-color 0.4s ease, color 0.4s ease',
        zIndex: 5,
      }}
    >
      {/* Dynamic Single Organic Ribbon Background (Parallax Layer) */}
      <svg
        ref={svgRef}
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: '-10%',
          left: 0,
          width: '100%',
          height: '120%',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.85,
        }}
      >
        <path
          ref={pathRef}
          d="M 500 -50 C 400 150, 150 250, 100 450 C 50 650, 200 520, 550 500 C 900 480, 950 720, 820 880 C 700 1020, 350 950, 450 1050"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </svg>

      {/* Content Container (placed on top of background SVG) */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Decorative Line Separator */}
        <div
          ref={lineRef}
          style={{
            width: '100%',
            height: '1px',
            background: 'var(--color-border)',
            transformOrigin: 'left center',
            marginBottom: 'clamp(40px, 8vw, 80px)',
          }}
        />

        {/* Section Tag */}
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '10px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--color-text-2)',
            opacity: 0.7,
            marginBottom: 'clamp(24px, 4vw, 40px)',
          }}
        >
          [ 02 / ABOUT ]
        </div>

        {/* Editorial Pull Quote */}
        <h2
          ref={quoteRef}
          style={{
            fontFamily: 'var(--font-display, Playfair Display, Georgia, serif)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(32px, 5.5vw, 64px)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-1)',
            textShadow: 'var(--text-shadow-glow, none)',
            marginBottom: 'clamp(40px, 8vw, 80px)',
            maxWidth: '1200px',
          }}
        >
          "I forge logic into feeling. Building high-fidelity digital systems where technical precision meets organic design."
        </h2>

        {/* Asymmetric Typography Storytelling columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '40px',
            marginBottom: 'clamp(80px, 12vw, 160px)',
          }}
          className="md:grid-cols-[1.5fr_1fr]"
        >
          {/* Narrative Story (Left Column) */}
          <div ref={textRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <p style={{ fontFamily: 'var(--font-body, sans-serif)', fontSize: 'clamp(16px, 1.8vw, 20px)', lineHeight: 1.6, color: 'var(--color-text-1)', opacity: 0.9, textShadow: 'var(--text-shadow-glow, none)' }}>
              Halo, I'm Ferry Rusly Chaniago — a Fullstack Creative Developer and UI/UX Designer who bridges tech and intuition. Saya membangun platform digital berkinerja tinggi, memadukan detail rekayasa perangkat lunak yang presisi dengan koreografi gerak yang ekspresif.
            </p>
            <p style={{ fontFamily: 'var(--font-body, sans-serif)', fontSize: '16px', lineHeight: 1.6, color: 'var(--color-text-2)', textShadow: 'var(--text-shadow-glow, none)' }}>
              Bagi saya, kode bukan sekadar logika komputasional, melainkan media untuk mentransfer emosi, interaksi, dan estetika. Berbekal Next.js, WebGL, dan rekayasa data modular, saya menghidupkan antarmuka digital yang dinamis, cepat, dan tak terlupakan.
            </p>
          </div>

          {/* Coordinates metadata (Right Column) */}
          <div ref={metaRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignSelf: 'start', borderLeft: '1px solid var(--color-border)', paddingLeft: '24px', opacity: 0.8 }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-3)', display: 'block' }}>Location</span>
              <span style={{ fontFamily: 'var(--font-body, sans-serif)', fontSize: '15px', color: 'var(--color-text-1)' }}>Surabaya, Indonesia</span>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-3)', display: 'block' }}>Latitude / Longitude</span>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '13px', color: 'var(--color-text-1)' }}>7.2575° S, 112.7521° E</span>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-3)', display: 'block' }}>Local Time</span>
              <span style={{ fontFamily: 'var(--font-body, sans-serif)', fontSize: '15px', color: 'var(--color-text-1)' }}>GMT +7 (WIB)</span>
            </div>
          </div>
        </div>

        {/* 3-Column Glassmorphism Skills grid */}
        <div
          ref={skillsRef}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '30px',
          }}
          className="sm:grid-cols-2 md:grid-cols-3"
        >
          <SkillCard
            num="01"
            title="Design & Creative"
            skills={['Figma, Layouting', 'Motion Typography', '3D & WebGL Prototyping', 'Design Systems Crafting']}
          />
          <SkillCard
            num="02"
            title="Frontend Engineering"
            skills={['React, Next.js (App Router)', 'TypeScript, JavaScript ES6+', 'GSAP & ScrollTrigger Physics', 'Tailwind CSS, Canvas Sim']}
          />
          <SkillCard
            num="03"
            title="Systems & Backend"
            skills={['Node.js, Express.js', 'PostgreSQL / SQL Databases', 'Firebase APIs & Auth', 'Performance Optimization']}
          />
        </div>
      </div>

      {/* Tailwind breakpoint helper style inject */}
      <style>{`
        @media (min-width: 768px) {
          .md\\:grid-cols-\\[1\\.5fr_1fr\\] {
            grid-template-columns: 1.55fr 0.8fr !important;
          }
          .md\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 640px) and (max-width: 767px) {
          .sm\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </section>
  );
}

// ── Reusable Glassmorphism Card Component ─────────────────────────────────────
function SkillCard({ title, skills, num }: { title: string; skills: string[]; num: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 'clamp(24px, 4vw, 36px)',
        borderRadius: 'var(--radius-xl, 20px)',
        background: 'var(--color-card-bg, rgba(255, 255, 255, 0.03))',
        border: '1px solid var(--color-border)',
        boxShadow: hovered
          ? 'var(--color-card-shadow-hover, 0 12px 40px rgba(0, 0, 0, 0.15))'
          : 'var(--color-card-shadow, 0 8px 32px rgba(0, 0, 0, 0.05))',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-2)',
            margin: 0,
          }}
        >
          {title}
        </h3>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '10px',
            color: 'var(--color-accent)',
            opacity: 0.6,
          }}
        >
          {num}
        </span>
      </div>

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {skills.map(skill => (
          <li
            key={skill}
            style={{
              fontFamily: 'var(--font-body, sans-serif)',
              fontSize: '14px',
              color: 'var(--color-text-1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'var(--color-accent)',
                flexShrink: 0,
              }}
            />
            {skill}
          </li>
        ))}
      </ul>
    </div>
  );
}
