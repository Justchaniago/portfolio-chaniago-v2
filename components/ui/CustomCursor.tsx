'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

type CursorState = 'default' | 'button' | 'image' | 'nav' | 'drag';

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [cursorText, setCursorText] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Set mounted flag to handle SSR safely
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 1. Direct hardware-level coordinates tracking with zero-latency updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updatePosition = (e: MouseEvent) => {
      // Instantly position the outer wrapper to prevent 1-frame re-render latency
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
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

  // 2. High-performance global event delegation for dynamic hover target morphing
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformOrigin: 'center center',
            backgroundColor: '#FFFFFF', // solid white inverts cleanly on difference mix-blend
          }}
          animate={{
            width:
              cursorState === 'default'
                ? 6
                : cursorState === 'button'
                ? 48
                : cursorState === 'image'
                ? 76
                : cursorState === 'nav'
                ? 80
                : cursorState === 'drag'
                ? 68
                : 6,
            height:
              cursorState === 'default'
                ? 6
                : cursorState === 'button'
                ? 48
                : cursorState === 'image'
                ? 76
                : cursorState === 'nav'
                ? 32
                : cursorState === 'drag'
                ? 68
                : 6,
            borderRadius: cursorState === 'nav' ? '16px' : '50%',
            border:
              cursorState === 'default'
                ? '0px solid rgba(255, 255, 255, 0)'
                : '1px solid rgba(255, 255, 255, 0.45)',
            // Transparent/minimal fill for rings, solid white for typography states to maximize contrast
            backgroundColor:
              cursorState === 'default'
                ? '#FFFFFF'
                : cursorState === 'button'
                ? 'rgba(255, 255, 255, 0.05)'
                : cursorState === 'image'
                ? 'rgba(255, 255, 255, 0.15)'
                : cursorState === 'nav'
                ? 'rgba(255, 255, 255, 0.05)'
                : cursorState === 'drag'
                ? 'rgba(255, 255, 255, 0.15)'
                : '#FFFFFF',
          }}
          // Dynamic, highly refined mechanical spring easing
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 30,
            mass: 0.8,
          }}
        >
          {/* Centered Monospace Text Overlay */}
          <AnimatePresence mode="wait">
            {(cursorState === 'image' || cursorState === 'drag') && (
              <motion.span
                key={cursorText || 'drag'}
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
                {cursorState === 'drag' ? 'DRAG' : (cursorText || 'VIEW')}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>,
    document.body
  );
}
