'use client';

export default function Work() {
  return (
    <section
      className="work-section-container"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF', // Inherits light-theme white cleanly
        zIndex: 1,
        pointerEvents: 'none', // Managed dynamically by PinnedSections scroll gates
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(32px, 6vw, 80px)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        opacity: 0, // Animate in via GSAP ScrollTrigger
      }}
    >
      {/* 1. Monospace Section Eyebrow Header */}
      <div
        className="work-header"
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(10, 10, 10, 0.38)',
          marginBottom: '3vh',
          opacity: 0,
          transform: 'translateY(15px)',
          willChange: 'opacity, transform',
        }}
      >
        02 — Selected Works
      </div>

      {/* 2. Staggered 2-Column Gallery Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'clamp(32px, 5vw, 64px)',
          alignItems: 'center',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* LEFT COLUMN: Project 1 — Aether Aura (Positioned lower) */}
        <div
          className="work-card-1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            transform: 'translateY(24px)', // Staggered lower
            opacity: 0,
            scale: 0.96,
            willChange: 'opacity, transform, scale',
          }}
        >
          {/* Precise Image Box & Trigger Overlay */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/10',
              overflow: 'hidden',
              borderRadius: '2px',
              border: '0.5px solid rgba(10, 10, 10, 0.08)',
              backgroundColor: '#FAFAFA',
            }}
          >
            {/* Hotzone trigger wrapper aligned exactly to image boundary */}
            <div
              data-cursor="image"
              data-cursor-text="VIEW"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                pointerEvents: 'auto', // Receives hover triggers
              }}
            />
            {/* The Image (Ignored by mouse events to prevent transparent overlaps) */}
            <img
              src="/images/project_aura.png"
              alt="Aether Aura Mockup"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none', // Shielded
              }}
            />
          </div>

          {/* Project Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display), Georgia, serif)',
                fontSize: 'clamp(20px, 1.8vw, 28px)',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: '#0A0A0A',
                margin: 0,
              }}
            >
              Aether Aura
            </h3>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#555555',
              }}
            >
              Creative Direction & Web3 Editorial — 2026
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Project 2 — Kuro Obscura (Positioned higher) */}
        <div
          className="work-card-2"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            transform: 'translateY(-24px)', // Staggered higher
            opacity: 0,
            scale: 0.96,
            willChange: 'opacity, transform, scale',
          }}
        >
          {/* Precise Image Box & Trigger Overlay */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/10',
              overflow: 'hidden',
              borderRadius: '2px',
              border: '0.5px solid rgba(10, 10, 10, 0.08)',
              backgroundColor: '#FAFAFA',
            }}
          >
            {/* Hotzone trigger wrapper aligned exactly to image boundary */}
            <div
              data-cursor="image"
              data-cursor-text="VIEW"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                pointerEvents: 'auto', // Receives hover triggers
              }}
            />
            {/* The Image (Ignored by mouse events to prevent transparent overlaps) */}
            <img
              src="/images/project_kuro.png"
              alt="Kuro Obscura Mockup"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none', // Shielded
              }}
            />
          </div>

          {/* Project Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display), Georgia, serif)',
                fontSize: 'clamp(20px, 1.8vw, 28px)',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: '#0A0A0A',
                margin: 0,
              }}
            >
              Kuro Obscura
            </h3>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#555555',
              }}
            >
              Interactive Digital Catalogue — 2026
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
