'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  usePortfolioExperience,
  type PortfolioSectionId,
} from '@/components/experience/PortfolioExperienceContext';

const SECTIONS: Array<{
  id: PortfolioSectionId;
  label: string;
  num: string;
}> = [
  { id: 'hero', label: 'Hero', num: '01' },
  { id: 'about', label: 'About', num: '02' },
  { id: 'work', label: 'Work', num: '03' },
  { id: 'contact', label: 'Contact', num: '04' },
];

const SECTION_GAP = 56;

type WindowWithScrollProgress = Window & {
  __scrollTriggerProgress?: number;
};

export default function NavRail() {
  const portfolioExperience = usePortfolioExperience();
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const baseTargetYRef = useRef(0);
  const mouseYRef = useRef<number | null>(null);

  const y = useMotionValue(0);
  const scaleY = useMotionValue(1);
  const scaleX = useMotionValue(1);
  const springY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.8 });
  const springScaleY = useSpring(scaleY, { stiffness: 450, damping: 25 });
  const springScaleX = useSpring(scaleX, { stiffness: 450, damping: 25 });

  const getSectionIndex = (sectionId: PortfolioSectionId) => {
    const index = SECTIONS.findIndex((section) => section.id === sectionId);
    return index === -1 ? 0 : index;
  };

  const moveIndicatorToIndex = (index: number) => {
    const targetY = index * SECTION_GAP;
    baseTargetYRef.current = targetY;

    if (mouseYRef.current !== null) {
      const diff = mouseYRef.current - targetY;
      y.set(targetY + diff * 0.25);
      return;
    }

    y.set(targetY);
  };

  useEffect(() => {
    let lastY = 0;
    const unsubscribe = springY.on('change', (latest) => {
      const diff = Math.abs(latest - lastY);
      scaleY.set(1 + Math.min(diff * 0.12, 1.6));
      scaleX.set(1 - Math.min(diff * 0.06, 0.35));
      lastY = latest;
    });
    return () => unsubscribe();
  }, [springY, scaleY, scaleX]);

  useEffect(() => {
    if (portfolioExperience?.activeSection) {
      moveIndicatorToIndex(getSectionIndex(portfolioExperience.activeSection));
    }
  }, [portfolioExperience?.activeSection]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleProgressUpdate = (e: Event) => {
      const progress = (e as CustomEvent).detail.progress;
      const fillLine = document.querySelector('.nav-rail-fill') as HTMLDivElement | null;
      if (fillLine) {
        fillLine.style.height = `${progress * (SECTION_GAP * 3)}px`;
      }
    };

    window.addEventListener('scrollTriggerProgress', handleProgressUpdate);

    // Initial fill height check if progress is already published
    const progressWindow = window as unknown as WindowWithScrollProgress;
    if (progressWindow.__scrollTriggerProgress !== undefined) {
      const progress = progressWindow.__scrollTriggerProgress;
      const fillLine = document.querySelector('.nav-rail-fill') as HTMLDivElement | null;
      if (fillLine) {
        fillLine.style.height = `${progress * (SECTION_GAP * 3)}px`;
      }
    }

    return () => {
      window.removeEventListener('scrollTriggerProgress', handleProgressUpdate);
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = event.clientY - rect.top - 48;
    mouseYRef.current = relativeY;

    const baseTargetY = baseTargetYRef.current;
    const diff = relativeY - baseTargetY;
    y.set(baseTargetY + diff * 0.25);
  };

  const handleMouseLeave = () => {
    mouseYRef.current = null;
    setHovered(false);
    y.set(baseTargetYRef.current);
  };

  const handleSectionClick = (sectionId: PortfolioSectionId) => {
    portfolioExperience?.navigateTo(sectionId);
  };

  const displayedActiveIndex = portfolioExperience
    ? getSectionIndex(portfolioExperience.activeSection)
    : 0;

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
        pointerEvents: 'auto',
      }}
    >
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
          {SECTIONS[displayedActiveIndex].num}
        </span>
      </div>

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

        <div
          className="nav-rail-fill"
          style={{
            position: 'absolute',
            top: 0,
            width: '1px',
            height: '0px',
            background: 'var(--color-text-1, #0A0A0A)',
            transition:
              'height 0.1s linear, background 0.4s ease',
            willChange: 'height',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          {SECTIONS.map((section, index) => (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              type="button"
              aria-label={`Navigate to ${section.label}`}
              style={{
                appearance: 'none',
                border: 0,
                background: 'transparent',
                position: 'relative',
                width: '100%',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <span
                className={`nav-rail-label ${displayedActiveIndex === index ? 'active' : ''}`}
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
                  opacity: hovered ? (displayedActiveIndex === index ? 0.85 : 0.4) : 0,
                  filter: hovered ? 'blur(0px)' : 'blur(8px)',
                  transition:
                    'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 0.4s ease',
                  willChange: 'opacity, filter',
                }}
              >
                {section.label}
              </span>

              <div
                className={`nav-rail-dot ${displayedActiveIndex === index ? 'active' : ''}`}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--color-text-1, #0A0A0A)',
                  opacity: displayedActiveIndex === index ? 0 : 0.25,
                  transition: 'opacity 0.3s ease, background 0.4s ease',
                }}
              />
            </button>
          ))}
        </div>

        <motion.div
          className="nav-rail-active-indicator"
          style={{
            position: 'absolute',
            top: '-3px',
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
