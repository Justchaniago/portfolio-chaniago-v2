'use client';

import { useRef } from 'react';

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={containerRef}
      className="about-section-container"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--color-bg)',
        transition: 'background-color 0.4s ease, color 0.4s ease',
        zIndex: 1,
        pointerEvents: 'none', // Toggle managed by PinnedSections
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end', // Keep bottom-aligned
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* 1. Volumetric Glow Behind the Portrait (Subtle white-on-white atmospheric depth) */}
      <div
        className="about-glow-behind"
        style={{
          position: 'absolute',
          bottom: '-15vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120vw',
          height: '70vh',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 80%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.85,
        }}
      />

      {/* 2. Massive Right-Aligned Bottom Transparent Portrait Image (45-50% Viewport Width) */}
      <img
        src="/images/bannertransparan.png"
        alt="About Portrait"
        className="about-portrait-img"
        style={{
          position: 'absolute',
          bottom: '-10vh', // Anchors the portrait visually to the bottom viewport edge, grounding the subject
          right: '6vw', // Positioned on the right side to prevent any typographical overlap
          width: 'auto', // Preserve natural aspect ratio without empty contain letterboxes
          height: '112vh', // Enlarge the scale to dominate and fill the bottom viewport area
          display: 'block',
          objectFit: 'contain',
          objectPosition: 'bottom right',
          clipPath: 'inset(100% 0% 0% 0%)', // Crop reveal mask
          transform: 'translateY(120px)', // Initial spatial lift translate
          willChange: 'clip-path, transform',
          zIndex: 2,
        }}
      />

      {/* 3. Premium Atmospheric Glassmorphism Curved Dome Overlay (In front, dissolving lower torso beautifully) */}
      <div
        className="about-glass-overlay"
        style={{
          position: 'absolute',
          bottom: '-3vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '115vw',
          height: '42vh', // Covers lower torso while keeping face fully sharp
          zIndex: 3,
          pointerEvents: 'none',
          backdropFilter: 'blur(45px)',
          WebkitBackdropFilter: 'blur(45px)',
          borderRadius: '100% 100% 0 0 / 20% 20% 0 0', // Curved organic glass lens dome
          borderTop: '0.85px solid rgba(255, 255, 255, 0.65)', // Refraction highlight edge catching light
          boxShadow: 'inset 0 1px 20px rgba(255, 255, 255, 0.4), 0 -6px 30px rgba(0, 0, 0, 0.01)',
          // Perfect edge-free fade mask for the blur itself:
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0) 100%)',
        }}
      >
        {/* Layered white diffusion inside the blur container to create frosted glass cloud texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at bottom center, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0) 80%)',
            mixBlendMode: 'overlay',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.35) 40%, rgba(255, 255, 255, 0) 100%)',
          }}
        />
      </div>

      {/* 4. Editorial Neue Montreal Text Block (Lower-Left Quadrant, 30-35% Viewport Width) */}
      <div
        className="about-editorial-text"
        style={{
          position: 'absolute',
          left: '8vw',
          bottom: '12vh', // Placed intentionally in the lower-left quadrant
          width: 'clamp(380px, 32vw, 480px)', // Limit width to 380-480px (30-35% of viewport width)
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          pointerEvents: 'none',
        }}
      >
        {/* Eyebrow */}
        <span
          className="about-eyebrow"
          style={{
            fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-2)',
            marginBottom: '16px',
            opacity: 0,
            transform: 'translateY(15px)',
            willChange: 'opacity, transform',
            display: 'block',
          }}
        >
          Fullstack Developer
        </span>

        {/* Headline (Hi, I'm Chaniago.) with Character Split */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
          {/* Line 1: Hi, */}
          <h2
            className="about-text-line"
            style={{
              fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
              fontSize: 'clamp(72px, 5.5vw, 96px)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '-0.045em',
              lineHeight: 0.9,
              margin: 0,
              overflow: 'hidden',
            }}
          >
            {"Hi,".split("").map((char, index) => (
              <span
                key={index}
                className="about-char"
                style={{
                  display: 'inline-block',
                  willChange: 'transform',
                }}
              >
                {char}
              </span>
            ))}
          </h2>

          {/* Line 2: I'm Chaniago. */}
          <h2
            className="about-text-line"
            style={{
              fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
              fontSize: 'clamp(72px, 5.5vw, 96px)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '-0.045em',
              lineHeight: 0.9,
              margin: 0,
              overflow: 'hidden',
            }}
          >
            {"I'm Chaniago.".split("").map((char, index) => (
              <span
                key={index}
                className="about-char"
                style={{
                  display: 'inline-block',
                  willChange: 'transform',
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h2>
        </div>

        {/* Subheadline / Description */}
        <p
          className="about-description"
          style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: 'clamp(18px, 1.3vw, 22px)',
            lineHeight: 1.45,
            color: 'var(--color-text-2)',
            maxWidth: '28ch',
            margin: 0,
            opacity: 0,
            transform: 'translateY(20px)',
            willChange: 'opacity, transform',
          }}
        >
          Building thoughtful digital experiences through code, design, and AI.
        </p>
      </div>
    </section>
  );
}
