'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  usePortfolioExperience,
  type PortfolioSectionId,
} from '@/components/experience/PortfolioExperienceContext';
// getActiveSectionIndex progress calculation removed

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

const NAV_SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/@._-↗';
const NAV_SCRAMBLE_DURATION = 520;
function isBgLight(): boolean {
  if (typeof window === 'undefined') return false;
  const bg = window.getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
  if (bg.includes('232') || bg.toLowerCase().includes('ffffff') || bg.toLowerCase().includes('white') || bg.toLowerCase().includes('e8e0d5') || bg.includes('linen')) {
    return true;
  }
  return false;
}

function hrefToSection(href: string): PortfolioSectionId {
  const section = href.replace(/^\//, '');
  if (section === 'about' || section === 'work' || section === 'contact') {
    return section;
  }
  return 'hero';
}

// ─── Unified Morphing Navigation Container ───────────────────────────────────

export default function MorphNav() {
  const portfolioExperience = usePortfolioExperience();
  const navScrambleFramesRef = useRef<WeakMap<HTMLElement, number>>(new WeakMap());
  const activeNavScramblesRef = useRef<Set<HTMLElement>>(new Set());

  const [navState, setNavState] = useState<NavState>('closed');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [menuTheme, setMenuTheme] = useState<'light-curtain' | 'dark-curtain'>('light-curtain');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<'hero' | 'work' | 'about' | 'contact'>('hero');
  const [hovered, setHovered] = useState(false);
  const themeColorRef = useRef<string>('#FFFFFF');

  const activeSectionId = portfolioExperience?.activeSection ?? activeSection;
  const sectionCollapsed = portfolioExperience
    ? portfolioExperience.activeSection !== 'hero'
    : isCollapsed;
  const isReallyCollapsed = sectionCollapsed || navState !== 'closed';

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('menu-is-open');
      }
    };
  }, []);

  const getNavTextElement = (el: HTMLElement) => {
    return el.querySelector<HTMLElement>('.morph-nav-link-text');
  };

  const restoreNavText = useCallback((el: HTMLElement) => {
    const frame = navScrambleFramesRef.current.get(el);
    if (frame !== undefined) {
      window.cancelAnimationFrame(frame);
      navScrambleFramesRef.current.delete(el);
    }

    const label = el.dataset.label ?? '';
    const textEl = getNavTextElement(el);
    if (textEl) {
      textEl.textContent = label;
    }

    activeNavScramblesRef.current.delete(el);
  }, []);

  const scrambleNavText = useCallback((el: HTMLElement) => {
    const label = el.dataset.label ?? '';
    const textEl = getNavTextElement(el);
    if (!label || !textEl) return;

    restoreNavText(el);

    if (
      typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      textEl.textContent = label;
      return;
    }

    activeNavScramblesRef.current.add(el);
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / NAV_SCRAMBLE_DURATION);
      const settledIndex = Math.floor(progress * label.length);

      textEl.textContent = Array.from(label).map((char, index) => {
        if (char === ' ') return ' ';
        if (index <= settledIndex) return char;
        return NAV_SCRAMBLE_CHARS[
          Math.floor(Math.random() * NAV_SCRAMBLE_CHARS.length)
        ];
      }).join('');

      if (progress >= 1) {
        restoreNavText(el);
        return;
      }

      navScrambleFramesRef.current.set(el, window.requestAnimationFrame(tick));
    };

    navScrambleFramesRef.current.set(el, window.requestAnimationFrame(tick));
  }, [restoreNavText]);

  useEffect(() => {
    const activeNavScrambles = activeNavScramblesRef.current;
    return () => {
      activeNavScrambles.forEach((el) => restoreNavText(el));
      activeNavScrambles.clear();
    };
  }, [restoreNavText]);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);


  // Active section tracking for the virtual experience shell.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (portfolioExperience) return;

    const handleActiveSectionChange = (e: Event) => {
      const nextActiveSection = (e as CustomEvent<{
        activeSection: 'hero' | 'work' | 'about' | 'contact';
      }>).detail.activeSection;
      setActiveSection(nextActiveSection);
      setIsCollapsed(nextActiveSection !== 'hero');
    };

    window.addEventListener('activeSectionChange', handleActiveSectionChange);

    return () => {
      window.removeEventListener('activeSectionChange', handleActiveSectionChange);
    };
  }, [portfolioExperience]);

  const handleOpen = useCallback(() => {
    if (navState !== 'closed') return;

    const isLight = isBgLight();
    const activeColor = isLight ? '#0A0A0A' : '#FFFFFF';
    themeColorRef.current = activeColor;
    setMenuTheme(isLight ? 'dark-curtain' : 'light-curtain');

    setNavState('open');
  }, [navState]);

  const handleClose = useCallback(() => {
    if (navState !== 'open') return;
    setNavState('closed');
  }, [navState]);

  // Keyboard close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && navState === 'open') {
        handleClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navState, handleClose]);

  // Auto-close menu on global scroll
  useEffect(() => {
    if (typeof window === 'undefined' || navState !== 'open') return;

    const initialScrollY = window.scrollY;

    const handleScroll = () => {
      const diff = Math.abs(window.scrollY - initialScrollY);
      if (diff > 20) {
        handleClose();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navState, handleClose]);

  const isAnimating = navState === 'opening' || navState === 'closing';
  const hideCollapsedTriggerOnContact = activeSectionId === 'contact' && navState === 'closed';

  const handleNavigationClick = useCallback((e: React.MouseEvent, href: string, isFromOverlay: boolean = false) => {
    e.preventDefault();

    const targetSection = hrefToSection(href);

    if (isFromOverlay && navState === 'open') {
      handleClose();
      setTimeout(() => {
        portfolioExperience?.navigateTo(targetSection);
      }, 250);
      return;
    }

    portfolioExperience?.navigateTo(targetSection);
  }, [navState, handleClose, portfolioExperience]);

  const getActiveState = (href: string) => {
    const section = href.replace(/^\//, '');
    if (section === '') return activeSectionId === 'hero';
    return activeSectionId === section;
  };

  const isOpen = navState === 'open';
  const isExpanded = isOpen || navState === 'opening';
  const activeColor = isExpanded
    ? (menuTheme === 'dark-curtain' ? '#FFFFFF' : '#0A0A0A')
    : 'var(--color-text-1)';
  const borderColor = isExpanded
    ? (menuTheme === 'dark-curtain' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(10, 10, 10, 0.14)')
    : 'rgba(255, 255, 255, 0.12)';
  const background = isExpanded
    ? (menuTheme === 'dark-curtain'
        ? 'rgba(12, 12, 12, 0.88)'
        : 'rgba(255, 255, 255, 0.94)')
    : 'rgba(12, 12, 12, 0.82)';
  const surfaceShadow = isExpanded && menuTheme === 'light-curtain'
    ? '0 8px 32px rgba(10, 10, 10, 0.08)'
    : '0 8px 32px rgba(0, 0, 0, 0.24)';

  const morphTransition = {
    type: 'spring' as const,
    stiffness: 240,
    damping: 24,
    mass: 0.85,
  };

  return (
    <>
      {/* ── Transparent Click-Away Backdrop ─────────────────────────────────── */}
      {isOpen && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'transparent',
            cursor: 'default',
          }}
        />
      )}

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
        <button
          type="button"
          aria-label="Home"
          onClick={(e) => handleNavigationClick(e, '/')}
          style={{
            appearance: 'none',
            border: 0,
            background: 'transparent',
            padding: 0,
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-text-1)',
            letterSpacing: '-0.03em',
            textDecoration: 'none',
            pointerEvents: 'auto',
            zIndex: 1001,
            mixBlendMode: isOpen ? 'difference' : 'normal',
            transition: 'color 0.4s ease-out, mix-blend-mode 0s',
            cursor: 'pointer',
          }}
        >
          Ch.
        </button>
      </nav>

      {/* ── Unified Morphing Navigation Container ────────────────────────── */}
      <motion.div
        id="morph-nav-container"
        layout
        animate={{
          left: isReallyCollapsed ? '100%' : '50%',
          x: isReallyCollapsed
            ? (isOpen
                ? (isMobile ? 'calc(-100vw + 16px)' : '-348px')
                : (hovered ? -140 : -72))
            : -130,
          width: isReallyCollapsed
            ? (isOpen
                ? (isMobile ? 'calc(100vw - 32px)' : '320px')
                : (hovered ? 112 : 44))
            : 260,
          height: isOpen ? 250 : 44,
          borderRadius: isOpen ? '12px' : '22px',
          opacity: hideCollapsedTriggerOnContact ? 0 : 1,
          scale: hideCollapsedTriggerOnContact ? 0.94 : 1,
        }}
        transition={morphTransition}
        onMouseEnter={() => isReallyCollapsed && setHovered(true)}
        onMouseLeave={() => isReallyCollapsed && setHovered(false)}
        onClick={isReallyCollapsed && !isAnimating && !isOpen ? handleOpen : undefined}
        role={isReallyCollapsed && !isOpen ? 'button' : undefined}
        aria-label={isReallyCollapsed ? (isOpen ? 'Close navigation menu' : 'Open navigation menu') : undefined}
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          border: `1px solid ${borderColor}`,
          background,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: surfaceShadow,
          color: activeColor,
          cursor: isReallyCollapsed && !isAnimating && !isOpen ? 'pointer' : 'default',
          position: 'fixed',
          top: '12px',
          zIndex: 1001,
          pointerEvents: hideCollapsedTriggerOnContact ? 'none' : 'auto',
          overflow: 'hidden',
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          willChange: 'transform, width, height, border-radius',
          contain: 'paint layout',
        }}
      >
        {/* 1. Hero Pill Nav Links (Visible when NOT collapsed) */}
        {!isReallyCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              width: '260px',
              height: '44px',
              padding: '0 16px',
            }}
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
                    data-label={link.label}
                    onFocus={(e) => scrambleNavText(e.currentTarget)}
                    onMouseEnter={(e) => scrambleNavText(e.currentTarget)}
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      color: 'var(--color-text-1)',
                      opacity: active ? 1 : 0.52,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    <span
                      className="morph-nav-link-text"
                      style={{
                        display: 'inline-block',
                        minWidth: `${link.label.length}ch`,
                      }}
                    >
                      {link.label}
                    </span>
                  </a>
                </span>
              );
            })}
          </motion.div>
        )}

        {/* 2. Floating Circle Content (Visible when collapsed and closed) */}
        {isReallyCollapsed && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '12px',
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
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
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-10px)',
                transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s ease',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              MENU
            </span>

            {/* Hamburger lines */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{
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
                  transition: 'stroke 0.3s ease',
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
                  transition: 'stroke 0.3s ease',
                }}
              />
            </svg>
          </motion.div>
        )}

        {/* 3. Bento Dropdown Menu Content (Visible when collapsed and open) */}
        {isReallyCollapsed && isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.12, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '248px',
              padding: '20px',
              boxSizing: 'border-box',
            }}
          >
            {/* Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: 'var(--color-text-3)',
                opacity: 0.6,
              }}>
                NAVIGATION
              </span>
              {/* Close Button Cross */}
              <button
                onClick={handleClose}
                type="button"
                aria-label="Close menu"
                style={{
                  appearance: 'none',
                  border: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '4px',
                  color: activeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Links List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
              {NAV_LINKS.map((link, idx) => {
                const active = getActiveState(link.href);
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavigationClick(e, link.href, true)}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '12px',
                      textDecoration: 'none',
                      padding: '6px 0',
                      borderBottom: idx < NAV_LINKS.length - 1 ? '0.5px solid var(--color-border)' : 'none',
                      color: active ? 'var(--color-accent)' : 'var(--color-text-1)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '9px',
                      color: 'var(--color-text-3)',
                      minWidth: '16px',
                      opacity: 0.6,
                    }}>
                      {link.num}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-display, Georgia, serif)',
                      fontSize: '18px',
                      fontWeight: 500,
                      letterSpacing: '-0.02em',
                    }}>
                      {link.label}
                    </span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '12px',
                      color: 'var(--color-accent)',
                      opacity: active ? 1 : 0.3,
                      transform: hoveredIdx === idx ? 'translateX(2px) translateY(-2px)' : 'translateX(0) translateY(0)',
                      transition: 'transform 0.25s ease, opacity 0.25s ease',
                    }}>
                      ↗
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Divider Line */}
            <div style={{
              height: '0.5px',
              background: 'var(--color-border)',
              opacity: 0.15,
              margin: '12px 0 6px',
            }} />

            {/* Metadata Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '8px',
              color: 'var(--color-text-3)',
              letterSpacing: '0.08em',
              opacity: 0.65,
            }}>
              <span>SURABAYA, ID</span>
              <span>AVAILABLE</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Global style for reduced motion */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </>
  );
}
