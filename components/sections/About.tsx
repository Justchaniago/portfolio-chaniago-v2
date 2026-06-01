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

      {/* 2a. Massive Right-Aligned Bottom Transparent Portrait Image (Shifted 6% right, 10% larger) */}
      <img
        src="/images/bannertransparan.png"
        alt="About Portrait"
        className="about-portrait-img"
        style={{
          position: 'absolute',
          bottom: '-10vh', // Anchors the portrait visually to the bottom viewport edge, grounding the subject
          right: '0vw', // Shifted 6% to the right (from 6vw to 0vw) to align exactly with the right edge
          width: 'auto', // Preserve natural aspect ratio without empty contain letterboxes
          height: '123vh', // Enlarged by 10% (from 112vh to 123vh)
          display: 'block',
          objectFit: 'contain',
          objectPosition: 'bottom right',
          clipPath: 'inset(100% 0% 0% 0%)', // Crop reveal mask
          transform: 'translateY(120px)', // Initial spatial lift translate
          willChange: 'clip-path, transform',
          zIndex: 2,
        }}
      />

      {/* 2b. Massive Left-Aligned Bottom Transparent Portrait Image (Sub-section pose morph) */}
      <img
        src="/images/bannertransparanleft.png"
        alt="About Portrait Left"
        className="about-portrait-left-img"
        style={{
          position: 'absolute',
          bottom: '-10vh',
          left: '0vw',
          width: 'auto',
          height: '123vh',
          display: 'block',
          objectFit: 'contain',
          objectPosition: 'bottom left',
          opacity: 0, // Animated via GSAP master timeline
          willChange: 'transform, opacity',
          zIndex: 2,
        }}
      />

      {/* Precise Portrait Hover Trigger Zone (Prevents early hover activation over empty transparent pixels) */}
      <div
        data-cursor="image"
        data-cursor-text="VIEW"
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 'clamp(280px, 24vw, 420px)',
          height: '92vh',
          zIndex: 10,
          pointerEvents: 'auto',
        }}
      />

      {/* 3. Premium Atmospheric Glassmorphism Curved Dome Overlay (Reduced height and blur by 40-50%) */}
      <div
        className="about-glass-overlay"
        style={{
          position: 'absolute',
          bottom: '-3vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '115vw',
          height: '24vh', // Reduced height by 43% (from 42vh to 24vh)
          zIndex: 3,
          pointerEvents: 'none',
          backdropFilter: 'blur(24px)', // Reduced blur by 47% (from 45px to 24px) for lighter glass look
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '100% 100% 0 0 / 30% 30% 0 0', // Curved organic glass lens dome
          borderTop: '0.85px solid rgba(255, 255, 255, 0.65)', // Refraction highlight edge catching light
          boxShadow: 'inset 0 1px 16px rgba(255, 255, 255, 0.35), 0 -4px 20px rgba(0, 0, 0, 0.005)',
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
            background: 'radial-gradient(circle at bottom center, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0) 80%)',
            mixBlendMode: 'overlay',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.25) 40%, rgba(255, 255, 255, 0) 100%)',
          }}
        />
      </div>

      {/* 4. Editorial Neue Montreal Text Block (Shifted left to increase gap → photo by >60px) */}
      <div
        className="about-editorial-text"
        style={{
          position: 'absolute',
          left: '6vw', // Shifted left (from 8vw to 6vw) to add spacious breathing room and gap
          bottom: '12vh', // Placed intentionally in the lower-left quadrant
          width: 'clamp(460px, 42vw, 680px)', // Increased width to ensure plenty of breathing room for long lines
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
              whiteSpace: 'nowrap', // Force line to stay strictly on one line (no wrapping)
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
              whiteSpace: 'nowrap', // Force line to stay strictly on one line (no wrapping)
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

      {/* 5. New Sub-section Editorial Grid (Placed on the right, progressive reveals) */}
      <div
        className="about-sub-content"
        style={{
          position: 'absolute',
          right: '8vw', // Placed on the right quadrant
          bottom: '12vh',
          width: 'clamp(440px, 40vw, 640px)',
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: '4vh',
          opacity: 0, // Animated via GSAP timeline
          willChange: 'opacity, transform',
          pointerEvents: 'none',
        }}
      >
        {/* Eyebrow */}
        <span
          className="sub-section-eyebrow"
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-text-2, #444444)',
            opacity: 0.45,
            display: 'block',
            willChange: 'opacity, transform',
          }}
        >
          02 — Deep Dive Focus
        </span>

        {/* Current Focus Grid */}
        <div
          className="sub-section-focus"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            willChange: 'opacity, transform',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '8px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-2, #444444)',
              opacity: 0.3,
            }}
          >
            Current Focus
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            {[
              { title: 'Teman Dengar', desc: 'Disability accessibility app' },
              { title: 'AI Systems', desc: 'Agentic workflows & logic' },
              { title: 'Automation', desc: 'System-level pipelines' },
              { title: 'Product Engineering', desc: 'High-fidelity UI systems' },
            ].map((focus) => (
              <div
                key={focus.title}
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border, rgba(10, 10, 10, 0.15))',
                  background: 'var(--color-card-bg, rgba(255, 255, 255, 0.05))',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--color-text-1, #0A0A0A)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {focus.title}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body, sans-serif)',
                    fontSize: '9px',
                    color: 'var(--color-text-2, #444444)',
                    opacity: 0.75,
                    marginTop: '2px',
                  }}
                >
                  {focus.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Metrics */}
        <div
          className="sub-section-metrics"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            willChange: 'opacity, transform',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '8px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-2, #444444)',
              opacity: 0.3,
            }}
          >
            Selected Metrics
          </span>
          <div style={{ display: 'flex', gap: '36px' }}>
            {[
              { value: '12+', label: 'Projects Built' },
              { value: '3+', label: 'Years Learning' },
              { value: '8+', label: 'Core Systems' },
            ].map((metric) => (
              <div key={metric.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display, Georgia, serif)',
                    fontSize: 'clamp(24px, 2.2vw, 32px)',
                    fontWeight: 500,
                    color: 'var(--color-text-1, #0A0A0A)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {metric.value}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '8px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-2, #444444)',
                    opacity: 0.75,
                  }}
                >
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Core Tech Stack */}
        <div
          className="sub-section-stack"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            willChange: 'opacity, transform',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '8px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-2, #444444)',
              opacity: 0.3,
            }}
          >
            Core Stack
          </span>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            {['Next.js', 'React', 'TypeScript', 'GSAP', 'Framer Motion', 'Tailwind CSS', 'Node.js', 'Python'].map(
              (tech) => (
                <span
                  key={tech}
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '8px',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    color: 'var(--color-text-1, #0A0A0A)',
                    padding: '5px 10px',
                    borderRadius: '100px',
                    border: '1px solid var(--color-border, rgba(10, 10, 10, 0.15))',
                    background: 'var(--color-card-bg, rgba(255, 255, 255, 0.05))',
                  }}
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
