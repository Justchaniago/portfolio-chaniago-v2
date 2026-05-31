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
  
  // Dynamic interaction, click, and navbar proximity states
  const [isClicked, setIsClicked] = useState(false);
  const [isNearNav, setIsNearNav] = useState(false);
  const [navAngle, setNavAngle] = useState(-45); // default points up-right (↗)
  const [proximityProgress, setProximityProgress] = useState(0); // 0 (far) to 1.0 (hovering)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Proximity-based image targets tracking (VIEW, READ, TALK, COPY)
  const [proximityHoverActive, setProximityHoverActive] = useState(false);
  const [proximityState, setProximityState] = useState<CursorState>('default');
  const [proximityText, setProximityText] = useState('');

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

  // 2. Direct hardware-level coordinates tracking + proximity + magnetic pull math
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Use ref to keep track of active state across event callbacks to prevent stale state closures
    let isHoverActive = false;

    const updatePosition = (e: MouseEvent) => {
      const open = document.body.classList.contains('menu-is-open');

      // ────────────────────────────────────────────────────────────────────────
      // CASE A: Fullscreen Menu is open -> Bypass all proximity and magnetic arrows
      // ────────────────────────────────────────────────────────────────────────
      if (open) {
        setIsNearNav(false);
        setProximityProgress(0);
        setProximityHoverActive(false);
        setProximityState('default');
        setProximityText('');
        isHoverActive = false;

        if (containerRef.current) {
          containerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        }
        if (!visible) setVisible(true);
        return;
      }

      // ────────────────────────────────────────────────────────────────────────
      // CASE B: Image Target Proximity Checking (VIEW, READ, TALK, COPY)
      // ────────────────────────────────────────────────────────────────────────
      const imgTargets = document.querySelectorAll('[data-cursor="image"]');
      let minImgDist = Infinity;
      let closestImgTarget: HTMLElement | null = null;

      for (let i = 0; i < imgTargets.length; i++) {
        const target = imgTargets[i] as HTMLElement;
        const rect = target.getBoundingClientRect();
        // Distance to the boundary of the rectangular target bounds
        const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
        const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minImgDist) {
          minImgDist = dist;
          closestImgTarget = target;
        }
      }

      if (closestImgTarget && minImgDist <= 40) {
        const customText = closestImgTarget.getAttribute('data-cursor-text') || 'VIEW';
        
        // Hysteresis boundary algorithm:
        // Zone 3 (Direct Hover) activates at <= 24px, deactivates at >= 36px
        let nextActive = isHoverActive;
        if (minImgDist <= 24) {
          nextActive = true;
        } else if (minImgDist >= 36) {
          nextActive = false;
        }

        isHoverActive = nextActive;
        setProximityHoverActive(nextActive);

        if (nextActive) {
          setProximityState('image');
          setProximityText(customText);
          setIsNearNav(false);

          // Apply subtle magnetic visual pull toward the element's visual center
          const rect = closestImgTarget.getBoundingClientRect();
          const targetCenterX = rect.left + rect.width / 2;
          const targetCenterY = rect.top + rect.height / 2;
          const mdx = targetCenterX - e.clientX;
          const mdy = targetCenterY - e.clientY;
          
          // Pull factor intensifies dynamically as the mouse gets closer
          const pullFactor = 0.08 * (1.0 - minImgDist / 36);
          const pullX = mdx * Math.max(0, pullFactor);
          const pullY = mdy * Math.max(0, pullFactor);

          if (containerRef.current) {
            containerRef.current.style.transform = `translate3d(${e.clientX + pullX}px, ${e.clientY + pullY}px, 0)`;
          }
          if (!visible) setVisible(true);
          return; // skip further checks
        } else {
          // Zone 2 (Near Target): slight scale outline, no text
          setProximityState('near-image');
          setProximityText('');
          setIsNearNav(false);

          if (containerRef.current) {
            containerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
          }
          if (!visible) setVisible(true);
          return;
        }
      }

      // If we got here, we are in Zone 1 (Outside Target) for image triggers
      isHoverActive = false;
      setProximityHoverActive(false);
      setProximityState('default');
      setProximityText('');

      // ────────────────────────────────────────────────────────────────────────
      // CASE C: Navbar Proximity & Dynamic Compass Alignment
      // ────────────────────────────────────────────────────────────────────────
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
          const pullX = dx * 0.08 * progress;
          const pullY = dy * 0.08 * progress;

          if (containerRef.current) {
            containerRef.current.style.transform = `translate3d(${e.clientX + pullX}px, ${e.clientY + pullY}px, 0)`;
          }
        } else {
          setIsNearNav(false);
          setProximityProgress(0);
          if (containerRef.current) {
            containerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
          }
        }
      } else {
        setIsNearNav(false);
        setProximityProgress(0);
        if (containerRef.current) {
          containerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        }
      }

      if (!visible) {
        setVisible(true);
      }
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

  // 4. High-performance global event delegation for standard hover target morphing
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        '[data-cursor], a, button, [role="button"], input, textarea, select'
      );

      if (!target) {
        setCursorState('default');
        setCursorText('');
        return;
      }

      // Ignore standard delegate overrides if the hovered item is an image proximity target
      if (target.getAttribute('data-cursor') === 'image') {
        return;
      }

      const state = target.getAttribute('data-cursor') as CursorState | null;
      const text = target.getAttribute('data-cursor-text') || '';

      if (state) {
        setCursorState(state);
        setCursorText(text);
      } else {
        // Fallback for standard clickable items
        setCursorState('button');
        setCursorText('');
      }
    };

    const handleMouseOut = () => {
      setCursorState('default');
      setCursorText('');
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  if (!mounted) return null;

  // Proximity overrides standard delegated state for image targets
  const activeState = proximityState !== 'default' ? proximityState : cursorState;
  const activeText = proximityState !== 'default' ? proximityText : cursorText;

  // Arrow state represents when explicitly hovered OR magnetically approaching the navbar (only if menu is closed)
  const isArrow = !isMenuOpen && (activeState === 'nav' || isNearNav);

  // Render cursor through a React Portal directly into document.body to isolate it on its own top-level context
  return createPortal(
    <>
      {/* Disable the standard OS cursor globally across all interactive elements */}
      <style dangerouslySetInnerHTML={{ __html: `
        html, body, a, button, select, input, textarea, [role="button"], [data-cursor] {
          cursor: none !important;
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
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
          mixBlendMode: 'difference', // GPU-level dynamic color inversion
          opacity: visible ? 1 : 0,
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
          }}
          animate={{
            // Geometric width/height morphing across all states
            width: isArrow
              ? 6 + 18 * proximityProgress // gradually expands from 6px to 24px shaft length
              : activeState === 'default'
              ? 6
              : activeState === 'near-image'
              ? 20 // slight scale increase (outline circle)
              : activeState === 'button'
              ? 48
              : activeState === 'image'
              ? 76
              : activeState === 'drag'
              ? 68
              : 6,
            height: isArrow
              ? 6 - 4.5 * proximityProgress // gradually flattens from 6px to 1.5px shaft thickness
              : activeState === 'default'
              ? 6
              : activeState === 'near-image'
              ? 20 // slight scale increase (outline circle)
              : activeState === 'button'
              ? 48
              : activeState === 'image'
              ? 76
              : activeState === 'drag'
              ? 68
              : 6,
            borderRadius: isArrow ? '1px' : '50%',
            // Remove border outline on Arrow/Dot state to keep pure minimalist strokes
            border: isArrow
              ? '0px solid transparent'
              : activeState === 'default'
              ? '0px solid rgba(255, 255, 255, 0)'
              : activeState === 'near-image'
              ? '1px solid rgba(255, 255, 255, 0.45)' // subtle outline
              : '1px solid rgba(255, 255, 255, 0.45)',
            // Dynamic backplate color
            backgroundColor: isArrow
              ? '#FFFFFF' // solid white shaft line
              : activeState === 'default'
              ? '#FFFFFF' // solid white dot
              : activeState === 'near-image'
              ? 'rgba(255, 255, 255, 0.05)'
              : activeState === 'button'
              ? 'rgba(255, 255, 255, 0.05)'
              : activeState === 'image'
              ? 'rgba(255, 255, 255, 0.15)'
              : activeState === 'drag'
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
            {!isArrow && activeState === 'image' && (
              <motion.span
                key={activeText || 'VIEW'}
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
                }}
              >
                {activeText || 'VIEW'}
              </motion.span>
            )}
            {!isArrow && activeState === 'drag' && (
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
