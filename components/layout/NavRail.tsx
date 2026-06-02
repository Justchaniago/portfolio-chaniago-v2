'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { getActiveSectionIndex } from '@/lib/motion';

const SECTIONS = [
  { id: 'hero', label: 'Hero', num: '01', progress: 0.0 },
  { id: 'about', label: 'About', num: '02', progress: 1.85 / 37.6 }, 
  { id: 'work', label: 'Work', num: '03', progress: 6.5 / 37.6 },  
  { id: 'contact', label: 'Contact', num: '04', progress: 1.0 }, 
];

const SECTION_GAP = 56; // gap in pixels between dots

export default function NavRail() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [mouseY, setMouseY] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Framer Motion values for spring-driven active indicator
  const y = useMotionValue(0);
  const scaleY = useMotionValue(1);
  const scaleX = useMotionValue(1);

  // Crisp mechanical spring configuration (Apple-level design feel)
  const springY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.8 });
  const springScaleY = useSpring(scaleY, { stiffness: 450, damping: 25 });
  const springScaleX = useSpring(scaleX, { stiffness: 450, damping: 25 });

  // Handle velocity-based stretching into a capsule during movements
  useEffect(() => {
    let lastY = 0;
    const unsubscribe = springY.on('change', (latest) => {
      const diff = Math.abs(latest - lastY);
      // Capsule stretch: taller scaleY, slightly squeezed scaleX
      scaleY.set(1 + Math.min(diff * 0.12, 1.6));
      scaleX.set(1 - Math.min(diff * 0.06, 0.35));
      lastY = latest;
    });
    return () => unsubscribe();
  }, [springY, scaleY, scaleX]);

  const baseTargetYRef = useRef(0);
  const mouseYRef = useRef<number | null>(null);

  // Track window scroll and determine current active index
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getPreciseY = (progress: number) => {
      // 0 to 56px (Hero -> About)
      if (progress < 0.0154) return 0;
      if (progress >= 0.0154 && progress < 0.0231) {
        const t = (progress - 0.0154) / (0.0231 - 0.0154);
        return t * 56;
      }
      // 56px to 112px (About -> Work)
      if (progress >= 0.0231 && progress < 0.0923) return 56;
      if (progress >= 0.0923 && progress < 0.1192) {
        const t = (progress - 0.0923) / (0.1192 - 0.0923);
        return 56 + t * 56;
      }
      // 112px to 168px (Work -> Contact)
      if (progress >= 0.1192 && progress < 0.5037) return 112;
      if (progress >= 0.5037 && progress < 0.6692) {
        const t = (progress - 0.5037) / (0.6692 - 0.5037);
        return 112 + t * 56;
      }
      return 168; // Contact
    };

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const progress = window.scrollY / scrollHeight;

      // Update activeIndex using shared viewport-center hysteresis logic
      setActiveIndex((prev) => getActiveSectionIndex(progress, prev));

      const targetY = getPreciseY(progress);
      baseTargetYRef.current = targetY;

      // Update position factoring in mouse hover ref status
      if (mouseYRef.current !== null) {
        const diff = mouseYRef.current - targetY;
        y.set(targetY + diff * 0.25);
      } else {
        y.set(targetY);
      }

      // Dynamically fill the progress rail
      const fillLine = document.querySelector('.nav-rail-fill') as HTMLDivElement | null;
      if (fillLine) {
        fillLine.style.transform = `scaleY(${progress})`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call to set correct initial state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [y]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Calculate cursor Y position relative to the center vertical axis of dots
    const relativeY = e.clientY - rect.top - 48; // offset top counter block
    setMouseY(relativeY);
    mouseYRef.current = relativeY;

    // Trigger y update with magnetic pull
    const baseTargetY = baseTargetYRef.current;
    const diff = relativeY - baseTargetY;
    y.set(baseTargetY + diff * 0.25);
  };

  const handleMouseLeave = () => {
    setMouseY(null);
    mouseYRef.current = null;
    setHovered(false);

    // Restore exact scroll-driven target Y position
    y.set(baseTargetYRef.current);
  };

  const handleSectionClick = (progressVal: number) => {
    if (typeof window === 'undefined') return;
    const cinematicNavigate = (window as any).__cinematicNavigate;
    if (cinematicNavigate) {
      cinematicNavigate(progressVal);
    } else {
      // Fallback: instant scroll if cinematic system not ready
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: scrollHeight * progressVal, behavior: 'auto' });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setHovered(true)}
      className="nav-rail-container"
      style={{
        position: 'fixed',
        right: '3.5vw',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        padding: '20px 10px',
        pointerEvents: 'auto', // Receives hover triggers
      }}
    >
      {/* 1. Counter Display (Monochrome & Mono) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '24px',
        }}
      >
        <span
          className="nav-rail-counter-num"
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: 'var(--color-text-1, #0A0A0A)',
            transition: 'color 0.4s ease',
          }}
        >
          {SECTIONS[activeIndex].num}
        </span>
      </div>

      {/* 2. Scroll Progress Rail */}
      <div
        style={{
          position: 'relative',
          height: `${SECTION_GAP * 3}px`,
          width: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {/* Baseline Rail stroke */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '1px',
            background: 'var(--color-border, rgba(10, 10, 10, 0.1))',
            transition: 'background 0.4s ease',
          }}
        />

        {/* Dynamic Progress Fill overlay */}
        <div
          className="nav-rail-fill"
          style={{
            position: 'absolute',
            top: 0,
            width: '1px',
            height: '100%',
            background: 'var(--color-text-1, #0A0A0A)',
            transformOrigin: 'top center',
            transform: 'scaleY(0)',
            transition: 'background 0.4s ease',
            willChange: 'transform',
          }}
        />

        {/* Section Dots / Label Row Wrappers */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          {SECTIONS.map((section, idx) => (
            <div
              key={section.id}
              onClick={() => handleSectionClick(section.progress)}
              data-cursor="button"
              style={{
                position: 'relative',
                width: '100%',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {/* Elegant Fading/Blurring Label */}
              <span
                className={`nav-rail-label ${activeIndex === idx ? 'active' : ''}`}
                style={{
                  position: 'absolute',
                  right: '28px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '8px',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-1, #0A0A0A)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  opacity: hovered ? (activeIndex === idx ? 0.85 : 0.4) : 0,
                  filter: hovered ? 'blur(0px)' : 'blur(8px)',
                  transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 0.4s ease',
                  willChange: 'opacity, filter',
                }}
              >
                {section.label}
              </span>

              {/* Fixed Tiny Dot Mark */}
              <div
                className={`nav-rail-dot ${activeIndex === idx ? 'active' : ''}`}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--color-text-1, #0A0A0A)',
                  opacity: activeIndex === idx ? 0 : 0.25,
                  transition: 'opacity 0.3s ease, background 0.4s ease',
                }}
              />
            </div>
          ))}
        </div>

        {/* 3. Snappy Spring Morphing Active Indicator */}
        <motion.div
          className="nav-rail-active-indicator"
          style={{
            position: 'absolute',
            top: '-3px', // centers 10px indicator precisely over dots (16px vertical zone offset)
            width: '6px',
            height: '6px',
            borderRadius: '100px',
            background: 'var(--color-text-1, #0A0A0A)',
            zIndex: 3,
            pointerEvents: 'none',
            y: springY,
            scaleY: springScaleY,
            scaleX: springScaleX,
            transformOrigin: 'center center',
            transition: 'background 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}
