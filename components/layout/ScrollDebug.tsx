'use client';

import { useEffect, useState } from 'react';
import { getActiveSectionIndex } from '@/lib/motion';

const SECTION_NAMES = ['Hero', 'About', 'Work', 'Contact'] as const;
const SNAP_TARGETS = [0.0, 1.45, 4.0, 6.5, 9.4, 14.75, 18.9, 24.25, 28.4, 33.75, 37.6];

export default function ScrollDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(0);
  const [nearestSnap, setNearestSnap] = useState(0);
  const [snapDistance, setSnapDistance] = useState(0);
  const [viewportCenter, setViewportCenter] = useState(0);
  
  // Card states
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [exitingCardId, setExitingCardId] = useState<string | null>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Toggle shortcut: Shift + D
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'D' && e.shiftKey) {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const y = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const prog = height > 0 ? y / height : 0;
      const t = prog * 37.6;

      setScrollY(y);
      setMaxScroll(height);
      setProgress(prog);
      setTime(t);
      setViewportCenter(window.innerHeight / 2);

      // Section active detection with hysteresis
      setActiveSectionIdx((prev) => getActiveSectionIndex(prog, prev));

      // Nearest snap target calculation
      let minDistance = Infinity;
      let target = 0;
      SNAP_TARGETS.forEach((snapTime) => {
        const dist = Math.abs(t - snapTime);
        if (dist < minDistance) {
          minDistance = dist;
          target = snapTime;
        }
      });
      setNearestSnap(target);
      setSnapDistance(minDistance);

      // Scan DOM for active project card states
      const cards = document.querySelectorAll('[class*="project-card-container"]');
      let expandedId: string | null = null;
      let exitingId: string | null = null;
      let slideIdx: number | null = null;

      cards.forEach((card) => {
        const classes = card.className.split(' ');
        const idClass = classes.find((c) => c.startsWith('project-card-container-'));
        const pid = idClass ? idClass.replace('project-card-container-', '') : 'unknown';

        if (card.getAttribute('data-expanded') === 'true') {
          expandedId = pid;
        }
        if (card.getAttribute('data-exiting') === 'true') {
          exitingId = pid;
        }
        const slideAttr = card.getAttribute('data-active-slide');
        if (slideAttr !== null) {
          slideIdx = parseInt(slideAttr, 10);
        }
      });

      setExpandedCardId(expandedId);
      setExitingCardId(exitingId);
      setActiveSlideIdx(slideIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    // Check DOM state periodically to catch non-scroll mutations
    const interval = setInterval(handleScroll, 300);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const snapConfidence = Math.max(0, 100 - (snapDistance / 1.0) * 100);

  return (
    <>
      {/* Small floating toggle button in the bottom-left corner */}
      <button
        type="button"
        onClick={() => setIsVisible((v) => !v)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 99999,
          backgroundColor: 'rgba(10, 10, 10, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isVisible ? '#FF3366' : '#00FF66',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
        }}
        title="Toggle Scroll Debug Overlay (Shift + D)"
      >
        ⚡
      </button>

      {/* Main Stats Overlay Panel */}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '68px',
            left: '20px',
            width: '340px',
            backgroundColor: 'rgba(10, 10, 10, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '16px',
            zIndex: 99998,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
            color: '#FFFFFF',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            letterSpacing: '0.02em',
            pointerEvents: 'auto',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
              paddingBottom: '8px',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontWeight: 'bold', color: '#00FF66' }}>⚙️ SCROLL ENGINE TELEMETRY</span>
            <span style={{ fontSize: '9px', color: '#888888' }}>SHIFT + D TO TOGGLE</span>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Active Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#AAAAAA' }}>Active Section:</span>
              <span style={{ fontWeight: 'bold', color: '#FFFFFF' }}>
                {SECTION_NAMES[activeSectionIdx]} ({activeSectionIdx})
              </span>
            </div>

            {/* Scroll Y */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#AAAAAA' }}>Scroll Y / Max:</span>
              <span>{Math.round(scrollY)}px / {Math.round(maxScroll)}px</span>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#AAAAAA' }}>Scroll Progress:</span>
              <span style={{ color: '#00D8FF' }}>{(progress * 100).toFixed(2)}%</span>
            </div>

            {/* Timeline Time */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#AAAAAA' }}>Timeline Time:</span>
              <span style={{ fontWeight: 'bold' }}>{time.toFixed(2)}s / 37.60s</span>
            </div>

            {/* Snap Target */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#AAAAAA' }}>Snap Target:</span>
              <span style={{ color: '#FFBD59' }}>{nearestSnap.toFixed(2)}s ({(nearestSnap / 37.6 * 100).toFixed(1)}%)</span>
            </div>

            {/* Snap Confidence */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#AAAAAA' }}>Snap Confidence:</span>
              <span style={{ color: snapConfidence > 80 ? '#00FF66' : '#FF5555' }}>
                {snapConfidence.toFixed(0)}%
              </span>
            </div>

            {/* Viewport Center */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#AAAAAA' }}>Viewport Center Y:</span>
              <span>{Math.round(viewportCenter)}px</span>
            </div>

            {/* Section Anchors Table */}
            <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px' }}>
              <div style={{ color: '#00FF66', fontWeight: 'bold', marginBottom: '4px', fontSize: '9px' }}>CHAPTER ANCHORS:</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center', fontSize: '9px' }}>
                <div>Hero<br/><span style={{ color: '#888888' }}>0.0%</span></div>
                <div>About<br/><span style={{ color: '#888888' }}>3.9%</span></div>
                <div>Work<br/><span style={{ color: '#888888' }}>17.3%</span></div>
                <div>Contact<br/><span style={{ color: '#888888' }}>100%</span></div>
              </div>
            </div>

            {/* Project Card State */}
            <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px' }}>
              <div style={{ color: '#00FF66', fontWeight: 'bold', marginBottom: '4px', fontSize: '9px' }}>PROJECT METADATA:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#AAAAAA' }}>Expanded Card ID:</span>
                  <span style={{ color: expandedCardId ? '#00FF66' : '#888888' }}>
                    {expandedCardId || 'None'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#AAAAAA' }}>Exiting Card ID:</span>
                  <span style={{ color: exitingCardId ? '#FF5555' : '#888888' }}>
                    {exitingCardId || 'None'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#AAAAAA' }}>Active Carousel Index:</span>
                  <span style={{ color: activeSlideIdx !== null ? '#00D8FF' : '#888888' }}>
                    {activeSlideIdx !== null ? `Slide #${activeSlideIdx + 1}` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
