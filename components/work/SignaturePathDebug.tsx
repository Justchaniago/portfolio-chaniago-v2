// components/work/SignaturePathDebug.tsx
'use client';

import { useEffect, useState } from 'react';

export default function SignaturePathDebug() {
  const [data, setData] = useState({
    progress: 0,
    drawProgress: 0,
    opacity: 0,
    driftX: -15,
    length: 6156.04,
    offset: 6156.04,
  });

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setData(detail);
      }
    };

    window.addEventListener('signaturePathUpdate', handleUpdate);
    return () => window.removeEventListener('signaturePathUpdate', handleUpdate);
  }, []);

  const totalBlocks = 16;
  const filledBlocks = Math.round(data.progress * totalBlocks);
  const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(6, 6, 6, 0.95)',
        border: '1.5px solid var(--color-accent, #F95C4B)',
        borderRadius: '10px',
        padding: '16px',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '11px',
        color: '#FFFFFF',
        zIndex: 99999,
        pointerEvents: 'none',
        boxShadow: '0 8px 32px rgba(249, 92, 75, 0.18)',
        width: '260px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ fontWeight: 800, color: 'var(--color-accent, #F95C4B)', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '6px', textTransform: 'uppercase' }}>
        Path Debug HUD
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Progress:</span>
          <span style={{ color: 'var(--color-accent, #F95C4B)', fontWeight: 'bold' }}>{Math.round(data.progress * 100)}%</span>
        </div>
        <div style={{ color: 'var(--color-accent, #F95C4B)', letterSpacing: '0.05em' }}>
          [{progressBar}]
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Draw Ratio:</span>
        <span>{Math.round(data.drawProgress * 100)}%</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Opacity:</span>
        <span>{Math.round(data.opacity * 100)}%</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Drift X:</span>
        <span>{data.driftX.toFixed(1)}px ({( ((data.driftX + 15) / 30) * 100 ).toFixed(0)}%)</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Path Length:</span>
        <span>{Math.round(data.length)}px</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Dash Offset:</span>
        <span>{Math.round(data.offset)}px</span>
      </div>
    </div>
  );
}
