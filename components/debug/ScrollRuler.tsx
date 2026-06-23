'use client';

import { useEffect } from 'react';

export default function ScrollRuler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScrollUpdate = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      const decimalProgress = docHeight > 0 ? (scrollY / docHeight) : 0;

      const rulerIndicator = document.getElementById('debug-ruler-indicator');
      const rulerText = document.getElementById('debug-ruler-text');
      if (rulerIndicator) {
        rulerIndicator.style.top = `${progress}%`;
      }
      if (rulerText) {
        rulerText.innerHTML = `
          <div style="font-size: 11px; font-weight: bold; color: #00ff66;">${decimalProgress.toFixed(3)}</div>
          <div style="font-size: 8px; color: rgba(255,255,255,0.5); margin-top: 2px;">${Math.round(progress)}% | ${scrollY}px</div>
        `.trim();
      }
    };

    window.addEventListener('scroll', handleScrollUpdate, { passive: true });
    handleScrollUpdate();

    return () => {
      window.removeEventListener('scroll', handleScrollUpdate);
    };
  }, []);

  return (
    <div
      id="debug-scroll-ruler"
      style={{
        position: 'fixed',
        right: '20px',
        top: '15vh',
        height: '70vh',
        width: '60px',
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '8px',
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'none',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 0',
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#00ff66',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        userSelect: 'none',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '9px', color: '#fff' }}>SCROLL</div>
      <div id="debug-ruler-text" style={{ marginBottom: '10px', textAlign: 'center' }}>0% (0px)</div>
      <div
        style={{
          position: 'relative',
          flex: 1,
          width: '12px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '6px',
          margin: '10px 0',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => (
          <div
            key={tick}
            style={{
              position: 'absolute',
              top: `${tick}%`,
              left: '-15px',
              right: '-15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '0',
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)', width: '12px', textAlign: 'right' }}>
              {tick % 20 === 0 ? `${tick}` : ''}
            </span>
            <div
              style={{
                width: tick % 50 === 0 ? '16px' : (tick % 10 === 0 ? '10px' : '6px'),
                height: '1px',
                backgroundColor: tick % 50 === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
              }}
            />
            <div style={{ width: '12px' }} />
          </div>
        ))}
        <div
          id="debug-ruler-indicator"
          style={{
            position: 'absolute',
            top: '0%',
            left: '-8px',
            right: '-8px',
            height: '3px',
            backgroundColor: '#00ff66',
            borderRadius: '2px',
            boxShadow: '0 0 8px #00ff66',
            transform: 'translateY(-50%)',
            transition: 'top 0.05s linear',
            willChange: 'top',
          }}
        />
      </div>
    </div>
  );
}
