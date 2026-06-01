'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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

function isBgLight(): boolean {
  if (typeof window === 'undefined') return false;
  const bg = window.getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
  if (bg.includes('232') || bg.toLowerCase().includes('ffffff') || bg.toLowerCase().includes('white') || bg.toLowerCase().includes('e8e0d5') || bg.includes('linen')) {
    return true;
  }
  if (window.scrollY > window.innerHeight * 0.5) {
    return true;
  }
  return false;
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
  origin: { x: number; y: number },
  curtainColor: string
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

  ctx.fillStyle = curtainColor;
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
    void rafId;
  });
}

// ─── Unified Morphing Navigation Container ───────────────────────────────────

export default function MorphNav() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const footerRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [navState, setNavState] = useState<NavState>('closed');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [menuTheme, setMenuTheme] = useState<'light-curtain' | 'dark-curtain'>('light-curtain');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<'work' | 'about' | 'contact'>('work');
  const [hovered, setHovered] = useState(false);
  const [windowHeight, setWindowHeight] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const themeColorRef = useRef<string>('#FFFFFF');

  const isReallyCollapsed = isCollapsed || navState !== 'closed';

  useEffect(() => {
    if (!isReallyCollapsed) {
      setHovered(false);
    }
  }, [isReallyCollapsed]);

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('menu-is-open');
      }
    };
  }, []);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowHeight(window.innerHeight);
    };
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

  // Scroll tracking — isCollapsed + activeSection
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? y / maxScroll : 0;

      setIsCollapsed(y > 80);
      
      if (progress < 0.17) {
        setActiveSection('about');
      } else if (progress >= 0.17 && progress < 0.94) {
        setActiveSection('work');
      } else {
        setActiveSection('contact');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && navState === 'open') handleClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Capture trigger origin — FloatingCircle is always top: 12, right: 28, size: 44
  function captureOrigin() {
    originRef.current = {
      x: window.innerWidth - 50, // right: 28px + half-width: 22px
      y: 34,                      // top: 12px + half-height: 22px
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

    // Evaluate background to set theme before curtain opens
    const isLight = isBgLight();
    const activeColor = isLight ? '#0A0A0A' : '#FFFFFF';
    themeColorRef.current = activeColor;
    setMenuTheme(isLight ? 'dark-curtain' : 'light-curtain');

    setNavState('opening');
    if (typeof document !== 'undefined') {
      document.body.classList.add('menu-is-open');
    }
    captureOrigin();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    await animateValue(0, 1, DURATION.curtainOpen, (p) => {
      drawLiquidBurst(ctx, canvas.width, canvas.height, p, originRef.current, themeColorRef.current);
    });

    revealItems();
    setNavState('open');
  }, [navState]);

  const handleClose = useCallback(async () => {
    if (navState !== 'open') return;
    setNavState('closing');
    if (typeof document !== 'undefined') {
      document.body.classList.remove('menu-is-open');
    }

    await hideItems();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    await animateValue(0, 1, DURATION.curtainClose, (p) => {
      drawLiquidBurst(ctx, canvas.width, canvas.height, 1 - p, originRef.current, themeColorRef.current);
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setNavState('closed');
  }, [navState]);

  const isAnimating = navState === 'opening' || navState === 'closing';

  // Unified navigation click handler
  const handleNavigationClick = useCallback((e: React.MouseEvent, href: string, isFromOverlay: boolean = false) => {
    e.preventDefault();
    const lenis = (window as any).lenis;

    // Handle closing the full-screen menu overlay first if clicked from inside the curtain menu
    if (isFromOverlay && navState === 'open') {
      handleClose();
    }

    if (href === '/work') {
      if (lenis) {
        // Scrolls to the Work focal center
        const targetScroll = document.documentElement.scrollHeight * 0.58;
        lenis.scrollTo(targetScroll, { duration: 2.6, easing: easeInOutExpo });
      } else {
        window.scrollTo({ top: document.documentElement.scrollHeight * 0.58, behavior: 'smooth' });
      }
    } else if (href === '/about') {
      if (lenis) {
        // Scrolls to the About full reveal phase
        const targetScroll = document.documentElement.scrollHeight * 0.11;
        lenis.scrollTo(targetScroll, { duration: 2.2, easing: easeInOutExpo });
      } else {
        window.scrollTo({ top: document.documentElement.scrollHeight * 0.11, behavior: 'smooth' });
      }
    } else if (href === '/contact') {
      if (lenis) {
        // Scrolls to Contact section
        const targetScroll = document.documentElement.scrollHeight * 0.98;
        lenis.scrollTo(targetScroll, { duration: 2.2, easing: easeInOutExpo });
      } else {
        window.scrollTo({ top: document.documentElement.scrollHeight * 0.98, behavior: 'smooth' });
      }
    }
  }, [navState, handleClose]);

  const getActiveState = (href: string) => {
    if (href === '/work') {
      return pathname === '/work' || (pathname === '/' && activeSection === 'work');
    }
    if (href === '/about') {
      return pathname === '/about' || (pathname === '/' && activeSection === 'about');
    }
    if (href === '/contact') {
      return pathname === '/contact' || (pathname === '/' && activeSection === 'contact');
    }
    return false;
  };

  const isOpen = navState === 'open';
  const activeColor = isOpen
    ? (menuTheme === 'dark-curtain' ? '#FFFFFF' : '#0A0A0A')
    : 'var(--color-text-1)';
  const borderColor = isOpen
    ? (menuTheme === 'dark-curtain' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(10, 10, 10, 0.15)')
    : 'var(--color-border)';
  const background = isOpen
    ? (menuTheme === 'dark-curtain' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(10, 10, 10, 0.03)')
    : 'var(--color-card-bg, rgba(255, 255, 255, 0.05))';

  const activeTheme = menuTheme === 'dark-curtain'
    ? {
        curtain: '#0A0A0A',
        text: '#FFFFFF',
        muted: 'rgba(255, 255, 255, 0.15)',
        accent: '#C9F0A8',
        dim: '#888888',
        border: 'rgba(255, 255, 255, 0.12)',
        closeLines: '#888888',
      }
    : {
        curtain: '#FFFFFF',
        text: '#0A0A0A',
        muted: 'rgba(10, 10, 10, 0.15)',
        accent: '#3F702A',
        dim: '#555555',
        border: 'rgba(10, 10, 10, 0.12)',
        closeLines: '#666666',
      };

  const morphTransition = {
    type: 'tween' as const,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    duration: 0.45,
  };

  return (
    <>
      {/* ── Fixed nav shell — logo only ───────────────────────────────────── */}
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
          padding: '0 28px',
          zIndex: 1000,
          pointerEvents: 'none',
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
            color: 'var(--color-text-1)',
            letterSpacing: '-0.03em',
            textDecoration: 'none',
            pointerEvents: 'auto',
            zIndex: 1001,
            mixBlendMode: navState === 'open' ? 'difference' : 'normal',
            transition: 'color 0.4s ease-out, mix-blend-mode 0s',
          }}
        >
          Ch.
        </a>
      </nav>

      {/* ── Unified Morphing Navigation Container ────────────────────────── */}
      <motion.div
        id="morph-nav-container"
        data-cursor="nav"
        animate={{
          left: isReallyCollapsed ? '100%' : '50%',
          x: isReallyCollapsed ? (hovered ? -140 : -72) : -130,
          width: isReallyCollapsed ? (hovered ? 112 : 44) : 260,
        }}
        transition={morphTransition}
        onMouseEnter={() => isReallyCollapsed && setHovered(true)}
        onMouseLeave={() => isReallyCollapsed && setHovered(false)}
        onClick={isReallyCollapsed && !isAnimating ? (isOpen ? handleClose : handleOpen) : undefined}
        role={isReallyCollapsed ? 'button' : undefined}
        aria-label={isReallyCollapsed ? (isOpen ? 'Close navigation menu' : 'Open navigation menu') : undefined}
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          height: '44px',
          borderRadius: '22px',
          border: `1px solid ${borderColor}`,
          background,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: 'var(--color-card-shadow, 0 8px 32px rgba(10, 10, 10, 0.03))',
          color: activeColor,
          cursor: isReallyCollapsed && !isAnimating ? 'pointer' : 'default',
          position: 'fixed',
          top: '12px',
          zIndex: 1001,
          pointerEvents: 'auto',
          overflow: 'hidden',
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* Hero Pill Nav Links (Visible when NOT collapsed) */}
        <motion.div
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            width: '260px',
            height: '100%',
            left: '50%',
            x: '-50%',
            pointerEvents: isReallyCollapsed ? 'none' : 'auto',
          }}
          animate={{
            opacity: isReallyCollapsed ? 0 : 1,
            scale: isReallyCollapsed ? 0.8 : 1,
            y: isReallyCollapsed ? -10 : 0,
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {NAV_LINKS.map((link, idx) => {
            const active = getActiveState(link.href);
            return (
              <span key={link.href} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {idx > 0 && (
                  <span
                    style={{
                      color: 'var(--color-text-3)',
                      opacity: 0.3,
                      userSelect: 'none',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '10px'
                    }}
                  >
                    •
                  </span>
                )}
                <a
                  href={link.href}
                  onClick={(e) => handleNavigationClick(e, link.href)}
                  data-cursor="nav"
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    color: 'var(--color-text-1)',
                    opacity: active ? 1 : 0.4,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  {link.label}
                </a>
              </span>
            );
          })}
        </motion.div>

        {/* Floating Circle Content (Visible when collapsed) */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '12px',
            width: '100%',
            height: '100%',
            pointerEvents: isReallyCollapsed ? 'auto' : 'none',
          }}
          animate={{
            opacity: isReallyCollapsed ? 1 : 0,
            scale: isReallyCollapsed ? 1 : 0.8,
            y: isReallyCollapsed ? 0 : 10,
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Monospace label inside the morphing button */}
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
              opacity: (hovered && isReallyCollapsed) ? 1 : 0,
              transform: (hovered && isReallyCollapsed) ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-10px)',
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
              transform: `rotate(${isOpen ? 180 : 0}deg)`,
              transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
              flexShrink: 0,
            }}
          >
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
        </motion.div>
      </motion.div>

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
                  borderTop: `0.5px solid ${activeTheme.muted}`,
                  padding: '10px 0',
                }}
              >
                <a
                  href={link.href}
                  onClick={(e) => handleNavigationClick(e, link.href, true)}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  data-cursor="image"
                  data-cursor-text={i === 0 ? 'VIEW' : i === 1 ? 'READ' : 'TALK'}
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
                        ? activeTheme.accent
                        : hoveredIdx !== null
                          ? 'transparent'
                          : activeTheme.muted,
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
                    {/* Layer 1: default text */}
                    <span
                      style={{
                        display: 'block',
                        color: hoveredIdx === i ? 'transparent' : activeTheme.text,
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
                    {/* Layer 2: accent — clip-path reveal left→right */}
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'block',
                        color: activeTheme.accent,
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
                      color: activeTheme.accent,
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
                color: activeTheme.dim,
                fontFamily: 'var(--font-body, sans-serif)',
              }}
            >
              Currently available
            </span>
            <a
              href="mailto:ferryruslyc@gmail.com"
              data-cursor="image"
              data-cursor-text="COPY"
              style={{
                fontSize: '12px',
                color: activeTheme.accent,
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
              e.currentTarget.style.borderColor = activeTheme.accent;
              const lines = e.currentTarget.querySelectorAll('line');
              lines.forEach(line => line.setAttribute('stroke', activeTheme.accent));
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = activeTheme.border;
              const lines = e.currentTarget.querySelectorAll('line');
              lines.forEach(line => line.setAttribute('stroke', activeTheme.closeLines));
            }}
            style={{
              all: 'unset',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: `0.5px solid ${activeTheme.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isAnimating ? 'default' : 'pointer',
              transition: 'border-color 0.25s ease',
              flexShrink: 0,
            }}
          >
            <CloseIcon stroke={activeTheme.closeLines} />
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

function CloseIcon({ stroke }: { stroke: string }) {
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
        stroke={stroke}
        strokeWidth="0.75"
        strokeLinecap="round"
        style={{ transition: 'stroke 0.25s ease' }}
      />
      <line
        x1="13" y1="1" x2="1" y2="13"
        stroke={stroke}
        strokeWidth="0.75"
        strokeLinecap="round"
        style={{ transition: 'stroke 0.25s ease' }}
      />
    </svg>
  );
}
