'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [opacity, setOpacity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [navAngle, setNavAngle] = useState(0);
  const [isNearNav, setIsNearNav] = useState(false);

  // Jelly motion states
  const [stretch, setStretch] = useState(0);
  const [travelAngle, setTravelAngle] = useState(0);

  const lastPosRef = useRef({ x: 0, y: 0, time: 0 });
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const now = performance.now();
    
    setPosition({ x: mouseX, y: mouseY });
    setOpacity(1);

    // Calculate mouse velocity for the elastic jelly stretch effect
    const dxMouse = mouseX - lastPosRef.current.x;
    const dyMouse = mouseY - lastPosRef.current.y;
    const dt = now - lastPosRef.current.time || 16;
    
    // Speed in pixels per millisecond
    const speed = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse) / dt;
    
    lastPosRef.current = { x: mouseX, y: mouseY, time: now };

    if (speed > 0.08) {
      const angle = Math.atan2(dyMouse, dxMouse) * (180 / Math.PI);
      setTravelAngle(angle);
      
      // Calculate dynamic stretch factor (tastefully capped at 0.35 to maintain aesthetics)
      const targetStretch = Math.min(speed * 0.12, 0.35);
      setStretch(targetStretch);
    }

    // Smoothly snap back to a perfect circle when the mouse stops
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    stopTimeoutRef.current = setTimeout(() => {
      setStretch(0);
    }, 60);

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
      {/* Hide standard browser mouse globally and apply cursor:none */}
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
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          background: '#FFFFFF', // Base white enables absolute mix-blend color inversion
          mixBlendMode: 'difference',
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          x: position.x - 44,
          y: position.y - 44,
          opacity: opacity,
          scale: isHovered ? 1.15 : 1,
          rotate: travelAngle,
          scaleX: 1 + stretch,
          scaleY: 1 - stretch,
          transformOrigin: 'center center',
          transition: 'opacity 0.2s ease, scale 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.08s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Inner container rotates in opposite direction to keep text horizontal & readable */}
        <div
          style={{
            transform: `rotate(${-travelAngle}deg)`,
            transition: 'transform 0.08s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <AnimatePresence mode="wait">
            {isNearNav ? (
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
                  color: '#000000', // Black inside, inverted to white over dark background
                  textAlign: 'center',
                  lineHeight: 1.1,
                  userSelect: 'none',
                }}
              >
                {/* Dynamic Arrow pointing towards navbar */}
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
                  color: '#000000', // Inverted to white over dark background
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
        </div>
      </motion.div>
    </>
  );
}
