'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [opacity, setOpacity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [navAngle, setNavAngle] = useState(0);
  const [isNearNav, setIsNearNav] = useState(false);

  // Framer Motion's useMotionValue handles direct DOM translation updates,
  // completely bypassing React's virtual DOM updates to achieve 100% absolute zero-lag,
  // locked 120fps hardware-composited pointer precision.
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    
    // Direct hardware-level setter
    mouseX.set(x);
    mouseY.set(y);
    setOpacity(1);

    // Calculate distance and angle to navbar
    const navEl = document.getElementById('morph-nav-container');
    if (navEl) {
      const rect = navEl.getBoundingClientRect();
      const navX = rect.left + rect.width / 2;
      const navY = rect.top + rect.height / 2;

      const dx = navX - x;
      const dy = navY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Trigger navbar compass state if within 220px of the navbar
      if (dist < 220) {
        setIsNearNav(true);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        setNavAngle(angle);
      } else {
        setIsNearNav(false);
      }
    } else {
      setIsNearNav(false);
    }
  }, [mouseX, mouseY]);

  const onMouseLeave = useCallback(() => setOpacity(0), []);
  const onMouseEnter = useCallback(() => setOpacity(1), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [onMouseMove, onMouseLeave, onMouseEnter]);

  // Handle magnetic-like hovers on links and clickable elements
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const addListeners = () => {
      const targets = document.querySelectorAll('a, button, [role="button"], input, textarea, select');
      targets.forEach((target) => {
        target.addEventListener('mouseenter', handleMouseEnter);
        target.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    // Attach initial listeners
    addListeners();

    // Re-attach listeners when DOM changes to handle Next.js client routing/renders
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      const targets = document.querySelectorAll('a, button, [role="button"], input, textarea, select');
      targets.forEach((target) => {
        target.removeEventListener('mouseenter', handleMouseEnter);
        target.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      {/* Hide standard browser mouse globally */}
      <style dangerouslySetInnerHTML={{ __html: `
        html, body, a, button, select, input, textarea, [role="button"] {
          cursor: none !important;
        }
      `}} />

      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          borderRadius: '50%',
          // 3D Volumetric Gradient Shading (creates a glowing physical phosphor glass bead)
          background: 'radial-gradient(circle at 35% 35%, #F0FDF4 0%, #C9F0A8 55%, #9CD470 100%)',
          // White light catcher highlight and bottom physical volumetric refraction shading
          boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.7), inset 0 -3px 8px rgba(0, 0, 0, 0.16), 0 12px 36px rgba(0, 0, 0, 0.28)',
          border: '1px solid rgba(255, 255, 255, 0.45)',
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          
          // Zero-lag hardware translation coordinates
          x: mouseX,
          y: mouseY,
          opacity: opacity,
          
          // Smoothly morph container size based on hover state (from 88px circle to 32px trigger bead)
          width: isHovered ? 32 : 88,
          height: isHovered ? 32 : 88,
          // Offset translation by half-width/height to keep it perfectly centered around mouse coordinate
          transform: `translate3d(-50%, -50%, 0)`,
          
          transformOrigin: 'center center',
          transition: 'width 0.32s cubic-bezier(0.16, 1, 0.3, 1), height 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
        }}
      >
        <AnimatePresence mode="wait">
          {isHovered ? (
            // Clickable Hover State: Morphs into a highly polished, custom, sharp generic mouse arrow cursor
            <motion.div
              key="hover-state"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                style={{ display: 'block', transform: 'translate(-1px, -1px)' }}
              >
                <polygon
                  points="2,2 18,9 10,11 6,17"
                  fill="#080c04" // Obsidian black arrow matching the theme
                  stroke="#F0FDF4" // Glowing light highlights around the arrow
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          ) : isNearNav ? (
            // Navbar Proximity State: Perfect 88px bead with dynamic compass arrow pointing to navbar
            <motion.div
              key="navbar-state"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#080c04', // Obsidian black for perfect legibility on the bright green bead
                textAlign: 'center',
                lineHeight: 1.1,
                userSelect: 'none',
              }}
            >
              {/* Compass Arrow pointing towards navbar */}
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `rotate(${navAngle + 90}deg)`,
                  transition: 'transform 0.1s ease-out',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <polygon points="6,1 11,11 6,8 1,11" fill="#080c04" />
                </svg>
              </div>
              <span>TO</span>
              <span>NAVBAR</span>
            </motion.div>
          ) : (
            // Default State: Perfect 88px bead with centered stacked "BRING ME AROUND" text
            <motion.div
              key="default-state"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#080c04', // Obsidian black text on the green bead
                textAlign: 'center',
                lineHeight: 1.1,
                userSelect: 'none',
              }}
            >
              <span>BRING</span>
              <span>ME</span>
              <span>AROUND</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
