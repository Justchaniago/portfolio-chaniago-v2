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

      {/* 3. Premium Atmospheric Glassmorphism Blur Overlay (In front, dissolving lower torso beautifully) */}
      <div
        className="about-glass-overlay"
        style={{
          position: 'absolute',
          bottom: '-5vh',
          left: 0,
          right: 0,
          margin: '0 auto',
          width: '100%',
          height: '42vh', // Covers lower torso while keeping face fully sharp
          zIndex: 3,
          pointerEvents: 'none',
          backdropFilter: 'blur(55px)',
          WebkitBackdropFilter: 'blur(55px)',
          // Perfect edge-free fade mask for the blur itself:
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0) 100%)',
        }}
      >
        {/* Layered white diffusion inside the blur container to create frosted glass cloud texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at bottom center, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0) 80%)',
            mixBlendMode: 'overlay',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.25) 40%, rgba(255, 255, 255, 0) 100%)',
          }}
        />
      </div>
    </section>
  );
}
