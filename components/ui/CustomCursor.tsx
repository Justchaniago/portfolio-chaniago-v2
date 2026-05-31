'use client';

import { useEffect, useState, useCallback } from 'react';
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

      // Trigger compass state if cursor is within 220px of the navbar
      if (dist < 220) {
        setIsNearNav(true);
        // Angle in degrees
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

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spinText {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />

      <motion.div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          background: 'rgba(6, 6, 6, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          x: position.x - 48,
          y: position.y - 48,
          opacity: opacity,
          scale: isHovered ? 1.15 : 1,
          transition: 'opacity 0.2s ease, scale 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Dynamic Edge Text SVG (Spinning) */}
        <svg
          viewBox="0 0 100 100"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            animation: 'spinText 20s linear infinite',
          }}
        >
          <path
            id="textPath"
            d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
            fill="none"
          />
          <text fill="rgba(255, 255, 255, 0.65)">
            <textPath
              href="#textPath"
              startOffset="0%"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '7.8px',
                fontWeight: 700,
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
              }}
            >
              {isNearNav
                ? "NAVBAR • NAVBAR • NAVBAR • NAVBAR • "
                : "BRING ME AROUND • BRING ME AROUND • "}
            </textPath>
          </text>
        </svg>

        {/* Center Element - Swaps between dot and compass arrow */}
        <AnimatePresence mode="wait">
          {isNearNav ? (
            <motion.div
              key="compass"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              style={{
                width: '12px',
                height: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotate(${navAngle + 90}deg)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{ display: 'block' }}
              >
                <polygon
                  points="6,1 11,11 6,8 1,11"
                  fill="#FFFFFF"
                />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="dot"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: isHovered ? 1.5 : 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#FFFFFF',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
