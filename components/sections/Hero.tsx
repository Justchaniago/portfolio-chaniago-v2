'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useFluidSim, FLUID_CONFIG } from '@/hooks/useFluidSim';
import { gsap, ScrollTrigger } from '@/lib/gsap';

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
  const lxRef      = useRef(-1);
  const lyRef      = useRef(-1);
  const line1Ref   = useRef<HTMLSpanElement>(null);
  const line2Ref   = useRef<HTMLSpanElement>(null);

  const [on,       setOn]       = useState(false);
  const [scroll,   setScroll]   = useState(0);
  const [hovered,  setHovered]  = useState(false);
  const [cursor,   setCursor]   = useState({ x: -100, y: -100 });
  const [cursorOn, setCursorOn] = useState(false);

  const { disturb, resetLastPos } = useFluidSim(canvasRef, FLUID_CONFIG);

  const [loaded, setLoaded] = useState(false);

  // 1. Listen for loader complete to fire initial stagger animations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (document.documentElement.classList.contains('is-loaded')) {
        setLoaded(true);
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

  // 2. Kinetic Text Split Scroll Animation (Line 1 right, Line 2 left)
  useEffect(() => {
    if (!loaded) return;

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2, // Synced with Lenis smooth-scroll lag
        animation: gsap.timeline()
          .to(line1Ref.current, { x: 180, ease: 'none' }, 0)
          .to(line2Ref.current, { x: -180, ease: 'none' }, 0)
      });

      return () => trigger.kill();
    }
  }, [loaded]);

  // Scroll dissolve
  useEffect(() => {
    function onScroll() {
      const el = sectionRef.current;
      if (!el) return;
      const pct = Math.max(0, Math.min(1, -el.getBoundingClientRect().top / el.offsetHeight));
      setScroll(pct);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mouse → fluid
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Cursor visual — use raw clientX/Y
    setCursor({ x: e.clientX, y: e.clientY });
    setCursorOn(true);

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

  const onMouseLeave = useCallback(() => {
    lxRef.current = -1;
    lyRef.current = -1;
    setCursorOn(false);
    resetLastPos();
  }, [resetLastPos]);

  // Scroll-driven values
  function ramp(v: number, from: number, to: number) {
    return Math.max(0, Math.min(1, (v - from) / (to - from)));
  }
  const metaOp = 1 - ramp(scroll, 0.00, 0.18);
  const textOp = 1 - ramp(scroll, 0.38, 0.72);
  const textSc = 1 - ramp(scroll, 0.15, 0.55) * 0.08;
  const textY = scroll * -38;
  const metaY = scroll * -22;

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        height: '100svh',
        minHeight: '600px',
        background: '#060606',
        overflow: 'hidden',
        cursor: 'none',
      }}
    >
      {/* Fluid canvas */}
      <canvas
        ref={canvasRef}
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
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(32px, 6vw, 80px)',
          transform: `translateY(${textY}px) scale(${textSc})`,
          opacity: textOp,
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
        <h1 style={{
          fontFamily: 'var(--font-display, Georgia, serif)',
          fontSize: 'clamp(48px, 7.5vw, 110px)',
          fontWeight: 500,
          letterSpacing: '-0.045em',
          lineHeight: 1.05,
          color: 'rgba(255,255,255,0.88)',
          margin: 0,
        }}>
          {/* Line 1 */}
          <span style={{
            display: 'block',
            overflow: 'hidden',
          }}>
            <span
              ref={line1Ref}
              style={{
                display: 'block',
                transform: on ? 'translateY(0)' : 'translateY(105%)',
                transition: `transform ${T.dur}ms ${T.ease} ${T.line1}ms`,
              }}
            >
              {COPY.line1}
            </span>
          </span>

          {/* Line 2 */}
          <span style={{ display: 'block', overflow: 'hidden' }}>
            <span
              ref={line2Ref}
              style={{
                display: 'block',
                transform: on ? 'translateY(0)' : 'translateY(105%)',
                transition: `transform ${T.dur}ms ${T.ease} ${T.line2}ms`,
              }}
            >
              <em
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                  fontStyle: 'italic',
                  color: hovered ? '#C9F0A8' : 'rgba(255,255,255,0.38)',
                  transition: 'color 0.45s cubic-bezier(0.16,1,0.3,1)',
                  pointerEvents: 'auto',
                  cursor: 'none',
                }}
              >
                {COPY.highlight}
              </em>
              <span style={{ color: 'rgba(255,255,255,0.22)' }}>
                {COPY.line2.replace(COPY.highlight, '')}
              </span>
            </span>
          </span>
        </h1>
      </div>

      {/* Meta row */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(28px, 4vw, 52px)',
        left: 'clamp(32px, 6vw, 80px)',
        right: 'clamp(32px, 6vw, 80px)',
        zIndex: 4,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        opacity: on ? metaOp : 0,
        transform: `translateY(${on ? metaY : 20}px)`,
        transition: on
          ? `opacity ${T.dur}ms ease ${T.meta}ms, transform ${T.dur}ms ${T.ease} ${T.meta}ms`
          : 'none',
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', gap: 'clamp(16px, 3vw, 40px)', alignItems: 'flex-end' }}>
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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          opacity: on ? 1 : 0,
          transition: `opacity ${T.dur}ms ease ${T.scroll}ms`,
        }}>
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

      {/* Custom cursor — dot */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#C9F0A8',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: cursorOn ? 0.9 : 0,
          transform: `translate(${cursor.x - 4}px, ${cursor.y - 4}px)`,
          transition: 'opacity 0.3s ease',
          willChange: 'transform',
        }}
      />
      {/* Custom cursor — ring (lags behind) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: '0.5px solid rgba(201,240,168,0.3)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: cursorOn ? 1 : 0,
          transform: `translate(${cursor.x - 17}px, ${cursor.y - 17}px)`,
          transition: 'transform 0.1s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
          willChange: 'transform',
        }}
      />

      <style>{`
        @keyframes scrollDot {
          0%   { transform: translateY(-100%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(420%); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </section>
  );
}
