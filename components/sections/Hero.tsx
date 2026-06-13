'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useFluidSim, FLUID_CONFIG } from '@/hooks/useFluidSim';

// ── Timing tokens — edit untuk polish ────────────────────────
const T = {
  overline: 380,
  line1: 540,
  line2: 820,
  meta: 1080,
  scroll: 1320,
  dur: 700,
  ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

// ── Content — edit di sini ────────────────────────────────────
const COPY = {
  overline: 'Creative developer × AI',
  line1: 'Where logic meets',
  line2: 'intuition — in code.',
  highlight: 'intuition',
  location: 'Surabaya, ID',
  status: 'Available',
  email: 'ferryruslyc@gmail.com',
} as const;

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lxRef = useRef(-1);
  const lyRef = useRef(-1);

  const [on, setOn] = useState(false);
  const [hovered, setHovered] = useState(false);

  const { disturb, resetLastPos } = useFluidSim(canvasRef, FLUID_CONFIG);

  const [loaded, setLoaded] = useState(false);

  // 1. Listen for loader complete to fire initial stagger animations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (document.documentElement.classList.contains('is-loaded')) {
        const frame = window.requestAnimationFrame(() => setLoaded(true));
        return () => window.cancelAnimationFrame(frame);
      } else {
        const handleComplete = () => setLoaded(true);
        document.addEventListener('loaderComplete', handleComplete);
        return () => document.removeEventListener('loaderComplete', handleComplete);
      }
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      const t = setTimeout(() => setOn(true), 150);
      return () => clearTimeout(t);
    }
  }, [loaded]);

  // Scroll → fluid ripples (soft dynamic disturbance based on scroll velocity and direction)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const dy = currentScrollY - lastScrollY;
          lastScrollY = currentScrollY;

          // Trigger ripples only if there is scroll movement and the hero section is in/near the viewport
          if (Math.abs(dy) > 0.1 && currentScrollY < window.innerHeight * 1.2) {
            const canvas = canvasRef.current;
            if (canvas) {
              const W = canvas.width;
              const H = canvas.height;

              // Proportional scroll velocity (soft clamp to maintain highly curated minimal aesthetics)
              const vy = Math.max(-6, Math.min(6, dy * 0.08));
              const absVy = Math.abs(vy);

              // Determine number of soft ripple points (1-3) based on scroll velocity
              const numPoints = Math.min(3, Math.max(1, Math.round(absVy * 0.4)));

              for (let i = 0; i < numPoints; i++) {
                // Distribute ripples randomly across the simulation resolution grid
                const rx = Math.random() * W;
                const ry = Math.random() * H;

                // Subtle horizontal speed, vertical speed matches the scrolling direction for a natural physical feel
                const vx = (Math.random() - 0.5) * 1.0;
                disturb(rx, ry, vx, vy * (0.7 + Math.random() * 0.5));
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [disturb]);

  // Mouse → fluid
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Fluid coords — scale to canvas pixel space
    const rect = canvas.getBoundingClientRect();
    const scX = canvas.width / rect.width;
    const scY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scX;
    const my = (e.clientY - rect.top) * scY;

    if (lxRef.current >= 0) {
      const vx = mx - lxRef.current;
      const vy = my - lyRef.current;
      if (Math.abs(vx) > 0.4 || Math.abs(vy) > 0.4) {
        disturb(mx, my, vx, vy);
      }
    }
    lxRef.current = mx;
    lyRef.current = my;
  }, [disturb]);

  const onMouseEnter = useCallback(() => {}, []);

  const onMouseLeave = useCallback(() => {
    lxRef.current = -1;
    lyRef.current = -1; // Correctly reset lyRef coordinate to prevent ripples from freezing!
    resetLastPos();
  }, [resetLastPos]);

  // Touch → fluid (Mobile interaction translation)
  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scX = canvas.width / rect.width;
    const scY = canvas.height / rect.height;
    const mx = (touch.clientX - rect.left) * scX;
    const my = (touch.clientY - rect.top) * scY;

    // Generate a strong initial ripple on tap
    disturb(mx, my, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
    
    lxRef.current = mx;
    lyRef.current = my;
  }, [disturb]);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scX = canvas.width / rect.width;
    const scY = canvas.height / rect.height;
    const mx = (touch.clientX - rect.left) * scX;
    const my = (touch.clientY - rect.top) * scY;

    if (lxRef.current >= 0) {
      const vx = mx - lxRef.current;
      const vy = my - lyRef.current;
      if (Math.abs(vx) > 0.4 || Math.abs(vy) > 0.4) {
        disturb(mx, my, vx, vy);
      }
    }
    lxRef.current = mx;
    lyRef.current = my;
  }, [disturb]);

  const onTouchEnd = useCallback(() => {
    lxRef.current = -1;
    lyRef.current = -1;
    resetLastPos();
  }, [resetLastPos]);

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="hero-section-container"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        background: '#060606',
        overflow: 'hidden',
        zIndex: 2,
      }}
    >
      {/* Fluid canvas */}
      <canvas
        ref={canvasRef}
        className="hero-fluid-canvas"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          display: 'block',
        }}
      />

      {/* Grain overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
          opacity: 0.028,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />

      {/* Hero text */}
      <div
        className="hero-text-content"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(32px, 6vw, 80px)',
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
      >
        {/* Overline */}
        <div style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '10px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.18)',
          marginBottom: '20px',
          opacity: on ? 1 : 0,
          transform: on ? 'translateY(0)' : 'translateY(14px)',
          transition: `opacity ${T.dur}ms ease ${T.overline}ms, transform ${T.dur}ms ${T.ease} ${T.overline}ms`,
        }}>
          {COPY.overline}
        </div>

        {/* H1 */}
        <h1
          className={`hero-tagline-shimmer${hovered ? ' is-highlight-hovered' : ''}`}
          style={{
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: 'clamp(42px, 7.5vw, 110px)', // Slightly smaller min-size for mobile to prevent wrapping
            fontWeight: 500,
            letterSpacing: '-0.045em',
            lineHeight: 1.25,
            color: 'rgba(255,255,255,0.88)',
            margin: 0,
          }}
        >
          {/* Line 1 */}
          <span
            className="hero-line-1"
            style={{
              display: 'block',
              overflow: 'hidden',
            }}
          >
            <span
              className="hero-line-reveal"
              style={{
                display: 'block',
                transform: on ? 'translateY(0)' : 'translateY(105%)',
                transition: `transform ${T.dur}ms ${T.ease} ${T.line1}ms`,
              }}
            >
              <span
                className="hero-line-scroll hero-line-scroll-left"
                style={{
                  display: 'block',
                  willChange: 'transform',
                }}
              >
                {COPY.line1}
              </span>
            </span>
          </span>

          {/* Line 2 */}
          <span
            className="hero-line-2"
            style={{
              display: 'block',
              overflow: 'hidden',
            }}
          >
            <span
              className="hero-line-reveal"
              style={{
                display: 'block',
                transform: on ? 'translateY(0)' : 'translateY(105%)',
                transition: `transform ${T.dur}ms ${T.ease} ${T.line2}ms`,
              }}
            >
              <span
                className="hero-line-scroll hero-line-scroll-right"
                style={{
                  display: 'block',
                  willChange: 'transform',
                }}
              >
                <em
                  className="hero-highlight"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  style={{
                    fontStyle: 'italic',
                    color: hovered ? 'var(--color-accent, #F95C4B)' : 'rgba(255,255,255,0.38)',
                    transition: 'color 0.45s cubic-bezier(0.16,1,0.3,1)',
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                  }}
                >
                  {COPY.highlight}
                </em>
                <span style={{ color: 'rgba(255,255,255,0.22)' }}>
                  {(() => {
                    const parts = COPY.line2.replace(COPY.highlight, '').split('—');
                    if (parts.length === 2) {
                      return (
                        <>
                          {parts[0]}
                          <span style={{
                            display: 'inline-block',
                            transform: 'translateY(0.08em)',
                            verticalAlign: 'middle',
                            lineHeight: 1,
                          }}>—</span>
                          {parts[1]}
                        </>
                      );
                    }
                    return COPY.line2.replace(COPY.highlight, '');
                  })()}
                </span>
              </span>
            </span>
          </span>
        </h1>
      </div>

      {/* Meta row */}
      <div
        className="hero-meta-row"
        style={{
          position: 'absolute',
          bottom: 'clamp(28px, 4vw, 52px)',
          left: 'clamp(24px, 6vw, 80px)', // Slightly reduced left padding on mobile
          right: 'clamp(24px, 6vw, 80px)', // Slightly reduced right padding on mobile
          zIndex: 4,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          opacity: on ? 1 : 0,
          transform: `translateY(${on ? 0 : 20}px)`,
          transition: on
            ? `opacity ${T.dur}ms ease ${T.meta}ms, transform ${T.dur}ms ${T.ease} ${T.meta}ms`
            : 'none',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          display: 'flex',
          gap: 'clamp(16px, 3vw, 40px)',
          alignItems: 'flex-end',
          flexWrap: 'wrap', // Allow wrapping on very small screens
        }}>
          {[
            { label: 'Based in', value: COPY.location },
            { label: 'Status', value: COPY.status },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.12)',
              }}>
                {item.label}
              </span>
              <span style={{
                fontFamily: 'var(--font-body, sans-serif)',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.2)',
              }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div
          className="hero-scroll-indicator"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            opacity: on ? 1 : 0,
            transition: `opacity ${T.dur}ms ease ${T.scroll}ms`,
          }}
        >
          <span style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '8px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.12)',
            writingMode: 'vertical-rl',
          }}>
            Scroll
          </span>
          <div style={{
            width: '1px',
            height: '40px',
            background: 'rgba(255,255,255,0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '12px',
              background: 'rgba(255,255,255,0.25)',
              borderRadius: '1px',
              animation: 'scrollDot 2.2s cubic-bezier(0.16,1,0.3,1) infinite',
            }} />
          </div>
        </div>
      </div>



      <style>{`
        @keyframes scrollDot {
          0%   { transform: translateY(-100%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(420%); opacity: 0; }
        }
        @keyframes heroTaglineShimmer {
          0% { background-position: 140% 50%; }
          100% { background-position: -40% 50%; }
        }
        .hero-tagline-shimmer,
        .hero-tagline-shimmer * {
          background-image: linear-gradient(
            105deg,
            rgba(255,255,255,0.22) 0%,
            rgba(255,255,255,0.34) 34%,
            rgba(255,255,255,0.94) 45%,
            rgba(249,92,75,0.86) 50%,
            rgba(255,255,255,0.78) 55%,
            rgba(255,255,255,0.32) 66%,
            rgba(255,255,255,0.22) 100%
          );
          background-size: 260% 100%;
          background-position: 140% 50%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent !important;
          animation: heroTaglineShimmer 4.8s ease-in-out infinite;
        }
        .hero-tagline-shimmer .hero-highlight {
          text-shadow: 0 0 0 rgba(249,92,75,0);
          transition: text-shadow 0.45s cubic-bezier(0.16,1,0.3,1);
        }
        .hero-tagline-shimmer.is-highlight-hovered .hero-highlight {
          background-image: linear-gradient(
            105deg,
            rgba(249,92,75,0.58) 0%,
            rgba(255,255,255,0.96) 42%,
            rgba(249,92,75,1) 50%,
            rgba(255,255,255,0.9) 58%,
            rgba(249,92,75,0.62) 100%
          );
          text-shadow: 0 0 24px rgba(249,92,75,0.34);
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: 0.01ms !important; }
          .hero-tagline-shimmer,
          .hero-tagline-shimmer * {
            background-image: none !important;
            color: rgba(255,255,255,0.82) !important;
          }
          .hero-tagline-shimmer .hero-highlight {
            color: rgba(255,255,255,0.46) !important;
          }
          .hero-tagline-shimmer.is-highlight-hovered .hero-highlight {
            color: var(--color-accent, #F95C4B) !important;
            text-shadow: none !important;
          }
        }
        @media (max-width: 768px) {
          .hero-scroll-indicator {
            opacity: ${on ? 0.6 : 0} !important;
          }
        }
      `}</style>
    </section>
  );
}
