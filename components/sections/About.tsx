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

      {/* 2. Massive Centered Bottom Transparent Portrait Image */}
      <img
        src="/images/bannertransparan.png"
        alt="About Portrait"
        className="about-portrait-img"
        style={{
          position: 'absolute',
          bottom: '-10vh', // Anchors the portrait visually to the bottom viewport edge, grounding the subject
          left: 0,
          right: 0,
          margin: '0 auto',
          width: 'auto', // Preserve natural aspect ratio without empty contain letterboxes
          height: '112vh', // Enlarge the scale to dominate and fill the bottom viewport area
          display: 'block',
          objectFit: 'contain',
          objectPosition: 'bottom center',
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

      {/* 4. Editorial Neue Montreal Text (HI, I'M CHANIAGO) with Character Split */}
      <div
        className="about-editorial-text"
        style={{
          position: 'absolute',
          left: '10vw',
          top: '30vh', // Positioned slightly upper-middle on the left side
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
          color: 'var(--color-text-1)',
          pointerEvents: 'none',
        }}
      >
        {/* Line 1: HI, */}
        <h2
          className="about-text-line"
          style={{
            fontSize: 'clamp(48px, 6.5vw, 92px)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
            margin: 0,
            overflow: 'hidden',
          }}
        >
          {"HI,".split("").map((char, index) => (
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

        {/* Line 2: I'M CHANIAGO */}
        <h2
          className="about-text-line"
          style={{
            fontSize: 'clamp(48px, 6.5vw, 92px)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
            margin: 0,
            overflow: 'hidden',
          }}
        >
          {"I'M CHANIAGO".split("").map((char, index) => (
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
    </section>
  );
}
