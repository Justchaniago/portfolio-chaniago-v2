'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────────────

type NavState = 'closed' | 'opening' | 'open' | 'closing';

interface NavLink {
  num: string;
  label: string;
  href: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const NAV_LINKS: NavLink[] = [
  { num: '01', label: 'Work', href: '/work' },
  { num: '02', label: 'About', href: '/about' },
  { num: '03', label: 'Contact', href: '/contact' },
];

const COLORS = {
  curtain: '#E8E0D5',   // Putih Tulang (Bone White / Linen)
  accent: '#C9F0A8',   // Bright Phosphor Green
  accentDark: '#3F702A',   // Contrast Phosphor for readability on bone white
  bg: '#0A0A0A',   // Void Dark
  text: '#0A0A0A',   // Nav item text (dark on light curtain)
  muted: '#c2b9ac',   // Muted divider tone matching bone white
  dim: '#888888',   // Muted labels
} as const;

const DURATION = {
  curtainOpen: 1100,   // ms — curtain expand, paling berat
  curtainClose: 820,   // ms — close selalu lebih cepat dari open
  itemsBase: 750,   // ms — nav items reveal base
  footer: 600,   // ms — footer, paling ringan
  clipReveal: 480,   // ms — hover clip-reveal
  arrow: 380,   // ms — arrow slide-in, paling cepat
} as const;

const EASING = {
  curtain: 'cubic-bezier(0.87, 0, 0.13, 1)',       // expo in-out — berat di tengah
  items: 'cubic-bezier(0.16, 1, 0.3, 1)',         // expo out — decelerate elegan
  clip: 'cubic-bezier(0.25, 1, 0.5, 1)',          // quart out — smooth
  number: 'cubic-bezier(0.61, 1, 0.88, 1)',         // sine out — hampir tidak terasa
  arrow: 'cubic-bezier(0.34, 1.56, 0.64, 1)',      // back out — springy
  dim: 'linear',                                  // intentional, no ease
} as const;

// ─── Easing ──────────────────────────────────────────────────────────────────

function easeInOutExpo(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

// ─── Canvas draw — Phosphor liquid burst ─────────────────────────────────────
//
// Radial expand from trigger origin (top-right corner).
// Two superimposed sine waves create the mercury-liquid wobble.
// Amplitude peaks at progress midpoint via sin(π·p) envelope.

function drawLiquidBurst(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  progress: number,     // 0 = hidden, 1 = full coverage
  origin: { x: number; y: number }
): void {
  ctx.clearRect(0, 0, W, H);
  if (progress <= 0) return;

  const eased = easeInOutExpo(progress);
  const maxR = Math.sqrt(
    Math.max(origin.x, W - origin.x) ** 2 +
    Math.max(origin.y, H - origin.y) ** 2
  ) * 1.12;
  const r = maxR * eased;
  const wobble = 38 * Math.sin(Math.PI * progress * 0.85); // envelope: 0→peak→0

  ctx.fillStyle = COLORS.curtain;
  ctx.beginPath();

  const STEPS = 120;
  for (let i = 0; i <= STEPS; i++) {
    const angle = (i / STEPS) * Math.PI * 2;
    // Three frequencies — higher freq creates metallic ripple character
    const f1 = Math.sin(angle * 4 + progress * 13) * wobble;
    const f2 = Math.cos(angle * 3 + progress * 8) * wobble * 0.55;
    const f3 = Math.sin(angle * 7 + progress * 5) * wobble * 0.18;
    const dist = r + f1 + f2 + f3;
    const px = origin.x + Math.cos(angle) * dist;
    const py = origin.y + Math.sin(angle) * dist;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }

  ctx.closePath();
  ctx.fill();
}

// ─── Animation helper ─────────────────────────────────────────────────────────

function animateValue(
  from: number,
  to: number,
  duration: number,
  onUpdate: (val: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    let rafId: number;

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      onUpdate(from + (to - from) * t);
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        resolve();
      }
    }

    rafId = requestAnimationFrame(tick);
    // Expose cancel via returned promise (not needed here but safe pattern)
    void rafId;
  });
}

// ─── Trigger dot — dynamic morphing pill ─────────────────────────────────────

function TriggerDot({ onClick, disabled, isOpen }: { onClick: () => void; disabled: boolean; isOpen: boolean }) {
  const [hovered, setHovered] = useState(false);

  // Dynamic contrast skinnings: follows CSS variables when closed (adapting on scroll), hardcoded dark on white overlay curtain when open
  const activeColor = isOpen ? '#0A0A0A' : 'var(--color-text-1)';
  const borderColor = isOpen ? 'rgba(10, 10, 10, 0.15)' : 'var(--color-border)';

  const width = hovered ? '112px' : '44px';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      style={{
        boxSizing: 'border-box',
        width: width,
        height: '44px',
        borderRadius: '22px', // Always 22px to keep it a perfect pill
        border: `1px solid ${borderColor}`,
        background: isOpen ? 'rgba(10, 10, 10, 0.03)' : 'rgba(255, 255, 255, 0.05)',
        color: activeColor,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, border-color 0.3s ease',
        overflow: 'hidden',
        position: 'relative',
        outline: 'none',
        pointerEvents: 'auto',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Monospace label inside the morphing pill */}
      <span
        style={{
          position: 'absolute',
          left: '18px',
          top: '50%',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: activeColor,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-10px)',
          transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s ease',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {isOpen ? 'CLOSE' : 'MENU'}
      </span>

      {/* Hamburger lines / Close cross SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        style={{
          position: 'absolute',
          top: '50%',
          right: '12px', // Centers perfectly in 44px circle (12px padding on both sides) and stays anchored on right in 112px pill!
          transform: `translateY(-50%) ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`,
          transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
          flexShrink: 0,
        }}
      >
        {/* Top line / Diagonal 1 */}
        <line
          x1="2"
          y1="6"
          x2="18"
          y2="6"
          stroke={activeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{
            transformOrigin: '10px 10px',
            transform: isOpen ? 'translateY(4px) rotate(45deg)' : 'translateY(0) rotate(0deg)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease',
          }}
        />
        {/* Bottom line / Diagonal 2 */}
        <line
          x1="2"
          y1="14"
          x2="18"
          y2="14"
          stroke={activeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{
            transformOrigin: '10px 10px',
            transform: isOpen ? 'translateY(-4px) rotate(-45deg)' : 'translateY(0) rotate(0deg)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease',
          }}
        />
      </svg>

    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MorphNav() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const footerRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const [navState, setNavState] = useState<NavState>('closed');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    if (navState === 'open') handleClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Keyboard close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && navState === 'open') handleClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Capture trigger origin before animation
  function captureOrigin() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    originRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  // Show overlay + stagger nav items in
  function revealItems() {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    overlay.style.visibility = 'visible';

    const itemDurations = [680, 730, 800];
    const itemDelays = [80, 200, 360];

    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.transition = [
        `opacity   ${itemDurations[i]}ms ${EASING.items} ${itemDelays[i]}ms`,
        `transform ${itemDurations[i]}ms ${EASING.items} ${itemDelays[i]}ms`,
      ].join(', ');
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });

    if (footerRef.current) {
      footerRef.current.style.transition = [
        `opacity   ${DURATION.footer}ms ${EASING.items} 500ms`,
        `transform ${DURATION.footer}ms ${EASING.items} 500ms`,
      ].join(', ');
      footerRef.current.style.opacity = '1';
      footerRef.current.style.transform = 'translateY(0)';
    }
  }

  // Hide nav items instantly (before curtain close)
  function hideItems(): Promise<void> {
    return new Promise((resolve) => {
      const hideDelays = [120, 60, 0];
      const hideDurations = [220, 200, 180];

      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.transition = [
          `opacity   ${hideDurations[i]}ms ${EASING.dim}   ${hideDelays[i]}ms`,
          `transform ${hideDurations[i]}ms ${EASING.items} ${hideDelays[i]}ms`,
        ].join(', ');
        el.style.opacity = '0';
        el.style.transform = 'translateY(-18px)';
      });

      if (footerRef.current) {
        footerRef.current.style.transition = 'opacity 160ms linear 0ms';
        footerRef.current.style.opacity = '0';
      }

      setTimeout(() => {
        const overlay = overlayRef.current;
        if (overlay) {
          overlay.style.opacity = '0';
          overlay.style.pointerEvents = 'none';
          overlay.style.visibility = 'hidden';
        }
        // Reset for next open
        itemRefs.current.forEach((el) => {
          if (!el) return;
          el.style.transition = 'none';
          el.style.opacity = '0';
          el.style.transform = 'translateY(52px)';
        });
        if (footerRef.current) {
          footerRef.current.style.transition = 'none';
          footerRef.current.style.opacity = '0';
          footerRef.current.style.transform = 'translateY(20px)';
        }
        resolve();
      }, 320);
    });
  }

  const handleOpen = useCallback(async () => {
    if (navState !== 'closed') return;
    setNavState('opening');
    captureOrigin();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    await animateValue(0, 1, DURATION.curtainOpen, (p) => {
      drawLiquidBurst(ctx, canvas.width, canvas.height, p, originRef.current);
    });

    revealItems();
    setNavState('open');
  }, [navState]);

  const handleClose = useCallback(async () => {
    if (navState !== 'open') return;
    setNavState('closing');

    await hideItems();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    await animateValue(0, 1, DURATION.curtainClose, (p) => {
      drawLiquidBurst(ctx, canvas.width, canvas.height, 1 - p, originRef.current);
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setNavState('closed');
  }, [navState]);

  const isAnimating = navState === 'opening' || navState === 'closing';

  return (
    <>
      {/* ── Fixed nav shell — always visible ─────────────────────────────── */}
      <nav
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          zIndex: 1000,
          pointerEvents: 'none', // children opt back in
        }}
      >
        {/* Logo */}
        <a
          href="/"
          aria-label="Home"
          style={{
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: '18px',
            fontWeight: 600,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            textDecoration: 'none',
            pointerEvents: 'auto',
            zIndex: 1001,
            mixBlendMode: navState === 'open' ? 'difference' : 'normal',
            transition: 'mix-blend-mode 0s',
          }}
        >
          Ch.
        </a>

        {/* Trigger */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            pointerEvents: 'auto',
            zIndex: 1001,
          }}
        >
          {/* We forward ref to inner button via wrapper */}
          <div ref={triggerRef}>
            <TriggerDot
              onClick={navState === 'open' ? handleClose : handleOpen}
              disabled={isAnimating}
              isOpen={navState === 'open'}
            />
          </div>
        </div>
      </nav>

      {/* ── Canvas — liquid morph surface (fixed, full-screen) ───────────── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 900,
          pointerEvents: 'none',
        }}
      />

      {/* ── Full-screen nav overlay ───────────────────────────────────────── */}
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 950,
          background: 'transparent', // canvas provides the fill
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: isMobile ? '24px 28px 32px' : 'clamp(32px, 5vw, 56px)',
          opacity: 0,
          pointerEvents: 'none',
          visibility: 'hidden',
        }}
      >
        {/* Nav items */}
        <ul
          role="list"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            marginBottom: 'clamp(32px, 4vw, 48px)',
          }}
        >
          {NAV_LINKS.map((link, i) => (
            <li key={link.href}>
              <div
                ref={(el) => { itemRefs.current[i] = el; }}
                role="none"
                style={{
                  opacity: 0,
                  transform: 'translateY(52px)',
                  borderTop: `0.5px solid rgba(10, 10, 10, 0.08)`,
                  padding: '10px 0',
                }}
              >
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleClose();
                    // Give close animation time then navigate
                    setTimeout(() => {
                      window.location.href = link.href;
                    }, DURATION.curtainClose + 100);
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '16px',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    padding: '6px 0',
                  }}
                >
                  {/* Number */}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      color: hoveredIdx === i
                        ? COLORS.accentDark
                        : hoveredIdx !== null
                          ? 'transparent'
                          : 'rgba(10, 10, 10, 0.22)',
                      transition: `color 300ms ${EASING.number}, opacity 300ms ${EASING.number}`,
                      minWidth: '28px',
                      paddingBottom: '3px',
                      flexShrink: 0,
                    }}
                  >
                    {link.num}
                  </span>

                  {/* Label — clip-reveal overlay */}
                  <span style={{ position: 'relative', display: 'inline-block', overflow: 'hidden' }}>
                    {/* Layer 1: default white text */}
                    <span
                      style={{
                        display: 'block',
                        color: hoveredIdx === i ? 'transparent' : COLORS.text,
                        fontFamily: 'var(--font-display, Georgia, serif)',
                        fontSize: isMobile ? 'clamp(36px, 10vw, 52px)' : 'clamp(44px, 7vw, 80px)',
                        fontWeight: 500,
                        letterSpacing: '-0.045em',
                        lineHeight: 1.05,
                        opacity: hoveredIdx !== null && hoveredIdx !== i ? 0.06 : 1,
                        transitionProperty: 'opacity, color',
                        transitionDuration: '250ms, 300ms',
                        transitionTimingFunction: `${EASING.dim}, ${EASING.items}`,
                        userSelect: 'none',
                      }}
                    >
                      {link.label}
                    </span>
                    {/* Layer 2: phosphor accent — clip-path reveal left→right */}
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'block',
                        color: COLORS.accentDark,
                        fontFamily: 'var(--font-display, Georgia, serif)',
                        fontSize: isMobile ? 'clamp(36px, 10vw, 52px)' : 'clamp(44px, 7vw, 80px)',
                        fontWeight: 500,
                        letterSpacing: '-0.045em',
                        lineHeight: 1.05,
                        clipPath: hoveredIdx === i ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
                        transition: `clip-path ${DURATION.clipReveal}ms ${EASING.clip}`,
                        pointerEvents: 'none',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {link.label}
                    </span>
                  </span>

                  {/* Arrow */}
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '16px',
                      color: COLORS.accentDark,
                      opacity: hoveredIdx === i ? 1 : 0,
                      transform: hoveredIdx === i
                        ? 'translateX(0) translateY(-2px)'
                        : 'translateX(-14px) translateY(2px)',
                      transition: [
                        `opacity   ${DURATION.arrow}ms ease`,
                        `transform ${DURATION.arrow}ms ${EASING.arrow}`,
                      ].join(', '),
                      flexShrink: 0,
                      alignSelf: 'center',
                    }}
                  >
                    ↗
                  </span>
                </a>
              </div>
            </li>
          ))}
        </ul>

        {/* Footer row */}
        <div
          ref={footerRef}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            opacity: 0,
            transform: 'translateY(20px)',
          }}
        >
          {/* Left: status + email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span
              style={{
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(10, 10, 10, 0.35)',
                fontFamily: 'var(--font-body, sans-serif)',
              }}
            >
              Currently available
            </span>
            <a
              href="mailto:ferryruslyc@gmail.com"
              style={{
                fontSize: '12px',
                color: COLORS.accentDark,
                textDecoration: 'none',
                letterSpacing: '0.01em',
                transition: 'opacity 0.2s',
                fontFamily: 'var(--font-body, sans-serif)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              ferryruslyc@gmail.com
            </a>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            disabled={isAnimating}
            aria-label="Close navigation"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.accentDark;
              const lines = e.currentTarget.querySelectorAll('line');
              lines.forEach(line => line.setAttribute('stroke', COLORS.accentDark));
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(10, 10, 10, 0.12)';
              const lines = e.currentTarget.querySelectorAll('line');
              lines.forEach(line => line.setAttribute('stroke', '#888'));
            }}
            style={{
              all: 'unset',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '0.5px solid rgba(10, 10, 10, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isAnimating ? 'default' : 'pointer',
              transition: 'border-color 0.25s ease',
              flexShrink: 0,
            }}
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Global style for reduced motion */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </>
  );
}

// ─── Close icon ───────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <line
        x1="1" y1="1" x2="13" y2="13"
        stroke="#888"
        strokeWidth="0.75"
        strokeLinecap="round"
        style={{ transition: 'stroke 0.25s ease' }}
      />
      <line
        x1="13" y1="1" x2="1" y2="13"
        stroke="#888"
        strokeWidth="0.75"
        strokeLinecap="round"
        style={{ transition: 'stroke 0.25s ease' }}
      />
    </svg>
  );
}
