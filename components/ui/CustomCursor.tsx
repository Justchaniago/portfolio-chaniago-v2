'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [opacity, setOpacity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [navAngle, setNavAngle] = useState(0);
  const [isNearNav, setIsNearNav] = useState(false);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    setPosition({ x: mouseX, y: mouseY });
    setOpacity(1);

    // Calculate distance and angle to navbar
    const navEl = document.getElementById('morph-nav-container');
    if (navEl) {
      const rect = navEl.getBoundingClientRect();
      const navX = rect.left + rect.width / 2;
      const navY = rect.top + rect.height / 2;

      const dx = navX - mouseX;
      const dy = navY - mouseY;
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
  }, []);

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
          background: '#FFFFFF', // Base white enables absolute mix-blend color inversion
          mixBlendMode: 'difference',
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          x: position.x,
          y: position.y,
          opacity: opacity,
          
          // Smoothly morph container size based on hover state (from 88px circle to 40px chevron)
          width: isHovered ? 40 : 88,
          height: isHovered ? 40 : 88,
          // Offset translation by half-width/height to keep it perfectly centered around mouse coordinate
          transform: `translate3d(-50%, -50%, 0)`,
          
          transformOrigin: 'center center',
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
        }}
      >
        <AnimatePresence mode="wait">
          {isHovered ? (
            // Clickable Hover State: Morphs into a sharp, minimalist diagonal link arrow
            <motion.div
              key="hover-state"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                style={{ display: 'block' }}
              >
                <path
                  d="M3 11L11 3M11 3H5M11 3V9"
                  stroke="#000000" // Black, inverts to white over dark background
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          ) : isNearNav ? (
            // Navbar Proximity State: Perfect 88px circle with dynamic compass arrow pointing to navbar
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
                color: '#000000', // Inverts to white over dark background
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
                  <polygon points="6,1 11,11 6,8 1,11" fill="#000000" />
                </svg>
              </div>
              <span>TO</span>
              <span>NAVBAR</span>
            </motion.div>
          ) : (
            // Default State: Perfect 88px circle with centered stacked "BRING ME AROUND" text
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
                color: '#000000', // Inverts to white over dark background
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
