'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

type CursorState = 'default' | 'button' | 'image' | 'nav' | 'drag' | 'near-image';

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [cursorText, setCursorText] = useState('');
  const [isNativeZone, setIsNativeZone] = useState(false);
  
  // Dynamic interaction states
  const [isClicked, setIsClicked] = useState(false);
  // Navbar Proximity
  const [isNearNav, setIsNearNav] = useState(false);
  const [navAngle, setNavAngle] = useState(-45); // default points up-right (↗)
  const [proximityProgress, setProximityProgress] = useState(0); // 0 (far) to 1.0 (hovering)
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Set mounted flag to handle SSR safely
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 1. MutationObserver to watch class changes on document.body and detect full-screen menu state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMenuState = () => {
      const open = document.body.classList.contains('menu-is-open');
      setIsMenuOpen(open);
    };

    checkMenuState();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkMenuState();
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // 2. Direct hardware-level coordinates tracking + closed navbar proximity + pixel-perfect elementFromPoint hit-testing
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updatePosition = (e: MouseEvent) => {
      const open = document.body.classList.contains('menu-is-open');

      let pullX = 0;
      let pullY = 0;

      // ────────────────────────────────────────────────────────────────────────
      // CASE A: Fullscreen Menu Closed -> Closed Navbar Proximity Calculations
      // ────────────────────────────────────────────────────────────────────────
      if (!open) {
        const navEl = document.getElementById('morph-nav-container');
        if (navEl) {
          const rect = navEl.getBoundingClientRect();
          const navX = rect.left + rect.width / 2;
          const navY = rect.top + rect.height / 2;

          const dx = navX - e.clientX;
          const dy = navY - e.clientY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Proximity threshold of 100px
          const radius = 100;

          if (dist < radius) {
            setIsNearNav(true);
            // Ramps up smoothly from 0.0 (at 100px) to 1.0 (hovering center)
            const progress = (radius - dist) / radius;
            setProximityProgress(progress);

            // Vector angle directly pointing from cursor to the menu capsule center
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            setNavAngle(angle);

            // Subtle organic magnetic offset (up to 5px pull towards trigger center)
            pullX = dx * 0.08 * progress;
            pullY = dy * 0.08 * progress;
          } else {
            setIsNearNav(false);
            setProximityProgress(0);
          }
        } else {
          setIsNearNav(false);
          setProximityProgress(0);
        }
      } else {
        setIsNearNav(false);
        setProximityProgress(0);
      }



      // Perform translation directly with pull offset
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${e.clientX + pullX}px, ${e.clientY + pullY}px, 0)`;
      }
      if (!visible) setVisible(true);

      // ────────────────────────────────────────────────────────────────────────
      // CASE C: Pixel-Perfect Hit-Testing via elementFromPoint DOM Traversal
      // ────────────────────────────────────────────────────────────────────────
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;

      let node: Element | null = el;
      let newState: CursorState = 'default';
      let cursorTextVal = '';
      let isNativeZoneVal = false;

      while (node && node !== document.body) {
        const dc = node.getAttribute('data-cursor');
        if (dc === 'native') {
          isNativeZoneVal = true;
          break;
        }



        // Priority 1: Explicit data-cursor attributes (view, image, nav, drag, default)
        if (dc) {
          if (dc === 'view' || dc === 'image') {
            newState = 'image';
            cursorTextVal = node.getAttribute('data-cursor-text') || 'VIEW';
          } else {
            newState = dc as CursorState;
            cursorTextVal = node.getAttribute('data-cursor-text') || '';
          }
          break;
        }

        // Priority 2: Direct image tags
        const tag = node.tagName.toLowerCase();
        if (tag === 'img') {
          newState = 'image';
          cursorTextVal = node.getAttribute('data-cursor-text') || 'VIEW';
          break;
        }

        // Priority 3: next/image wrapper (span/div with data-nimg attribute)
        if (node.hasAttribute('data-nimg')) {
          newState = 'image';
          cursorTextVal = node.getAttribute('data-cursor-text') || 'VIEW';
          break;
        }

        // Priority 4: Links and buttons (standard triggers)
        if (tag === 'a' || tag === 'button') {
          newState = 'button';
          break;
        }

        // Priority 5: ARIA role button triggers
        if (node.getAttribute('role') === 'button') {
          newState = 'button';
          break;
        }

        node = node.parentElement;
      }

      // Only trigger state updates on change to prevent React layout thrashing
      setCursorState((prev) => (prev !== newState ? newState : prev));
      setCursorText((prev) => (prev !== cursorTextVal ? cursorTextVal : prev));
      setIsNativeZone(isNativeZoneVal);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', updatePosition, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [visible]);

  // 3. Global window click tracking for micro press compression
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!mounted) return null;

  // Arrow state represents when explicitly hovered OR magnetically approaching the navbar (only if menu is closed)
  const isArrow = !isMenuOpen && (cursorState === 'nav' || isNearNav);

  // Render cursor through a React Portal directly into document.body to isolate it on its own top-level context
  return createPortal(
    <>
      {/* Disable the standard OS cursor globally across all interactive elements (guaranteed pointer-events: none on cursor elements) */}
      <style dangerouslySetInnerHTML={{ __html: `
        html, body, a, button, select, input, textarea, [role="button"], [data-cursor] {
          cursor: none !important;
        }
        [data-cursor="native"], [data-cursor="native"] * {
          cursor: auto !important;
        }
        a[data-cursor="native"], button[data-cursor="native"], [role="button"][data-cursor="native"] {
          cursor: pointer !important;
        }
      `}} />

      <div
        ref={containerRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          pointerEvents: 'none', // Critical: prevents cursor from blocking elementFromPoint hit testing!
          zIndex: 99999,
          willChange: 'transform',
          mixBlendMode: 'difference', // GPU-level dynamic color inversion
          opacity: visible && !isNativeZone ? 1 : 0,
          transition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Morphing Shape - Visual center locked precisely via static x/y percentages */}
        <motion.div
          style={{
            x: '-50%',
            y: '-50%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformOrigin: 'center center',
            backgroundColor: '#FFFFFF', // solid white inverts cleanly on difference mix-blend
            pointerEvents: 'none', // Double guarantee elementFromPoint safety
          }}
          animate={{
            // Geometric width/height morphing across all states
            width: isArrow
              ? 6 + 18 * proximityProgress // gradually expands from 6px to 24px shaft length
              : cursorState === 'near-image'
              ? 20 // slight scale outline circle
              : cursorState === 'default'
              ? 6
              : cursorState === 'button'
              ? 48
              : cursorState === 'image'
              ? 76
              : cursorState === 'drag'
              ? 68
              : 6,
            height: isArrow
              ? 6 - 4.5 * proximityProgress // gradually flattens from 6px to 1.5px shaft thickness
              : cursorState === 'near-image'
              ? 20 // slight scale outline circle
              : cursorState === 'default'
              ? 6
              : cursorState === 'button'
              ? 48
              : cursorState === 'image'
              ? 76
              : cursorState === 'drag'
              ? 68
              : 6,
            borderRadius: isArrow ? '1px' : '50%', // Matches default
            // Remove border outline on Arrow/Dot state to keep pure minimalist strokes
            border: isArrow
              ? '0px solid transparent'
              : cursorState === 'default'
              ? '0px solid rgba(255, 255, 255, 0)'
              : cursorState === 'near-image'
              ? '1px solid rgba(255, 255, 255, 0.45)' // subtle outline
              : '1px solid rgba(255, 255, 255, 0.45)',
            // Dynamic backplate color
            backgroundColor: isArrow
              ? '#FFFFFF' // solid white shaft line
              : cursorState === 'default'
              ? '#FFFFFF' // solid white dot
              : cursorState === 'near-image'
              ? 'rgba(255, 255, 255, 0.05)'
              : cursorState === 'button'
              ? 'rgba(255, 255, 255, 0.05)'
              : cursorState === 'image'
              ? 'rgba(255, 255, 255, 0.15)'
              : cursorState === 'drag'
              ? 'rgba(255, 255, 255, 0.15)'
              : '#FFFFFF',
            // Magnetic alignment vector rotation (shaft orientation)
            rotate: isArrow ? navAngle : 0,
            // Proximity scale expansion (scale 1.08) and click compression (scale 0.92)
            scale: isArrow
              ? isClicked
                ? 0.92
                : 1.0 + 0.08 * proximityProgress
              : isClicked
              ? 0.88
              : 1.0,
          }}
          // Premium mechanical spring easing (extremely crisp Linear/Apple design feel)
          transition={{
            type: 'spring',
            stiffness: 450,
            damping: 35,
            mass: 0.8,
          }}
        >
          {/* Arrow Head - Symmetrical outward projection lines attached at the right tip */}
          {/* Head Line 1: Pivots -45deg from the shaft direction */}
          <motion.div
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              height: 1.5,
              backgroundColor: '#FFFFFF',
              transformOrigin: 'right center',
              translateY: '-50%',
              pointerEvents: 'none',
            }}
            animate={{
              width: isArrow ? 9 * proximityProgress : 0,
              rotate: isArrow ? -45 : 0,
              opacity: isArrow ? proximityProgress : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 35,
              mass: 0.8,
            }}
          />
          {/* Head Line 2: Pivots 45deg from the shaft direction */}
          <motion.div
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              height: 1.5,
              backgroundColor: '#FFFFFF',
              transformOrigin: 'right center',
              translateY: '-50%',
              pointerEvents: 'none',
            }}
            animate={{
              width: isArrow ? 9 * proximityProgress : 0,
              rotate: isArrow ? 45 : 0,
              opacity: isArrow ? proximityProgress : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 35,
              mass: 0.8,
            }}
          />

          {/* Centered Monospace Text Overlay (for image & drag states) */}
          <AnimatePresence mode="wait">
            {!isArrow && cursorState === 'image' && (
              <motion.span
                key={cursorText || 'VIEW'}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#000000', // pure black inverts automatically over difference background
                  textAlign: 'center',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {cursorText || 'VIEW'}
              </motion.span>
            )}
            {!isArrow && cursorState === 'drag' && (
              <motion.span
                key="drag-text"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#000000',
                  textAlign: 'center',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                DRAG
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>


      </div>
    </>,
    document.body
  );
}
