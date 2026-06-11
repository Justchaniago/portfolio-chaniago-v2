'use client';

import { usePortfolioExperience } from '@/components/experience/PortfolioExperienceContext';

export default function AboutChapterB() {
  const portfolioExperience = usePortfolioExperience();

  return (
    /* 5. New Sub-section Editorial Grid (Placed on the right quadrant, progressive reveals) */
    <div
      className="about-sub-content"
      style={{
        position: 'absolute',
        right: '8vw', // Placed on the right quadrant
        bottom: '24vh', // Shifted upward by ~120px (from 12vh to 24vh) to allow section reveals earlier
        width: 'clamp(440px, 40vw, 640px)',
        zIndex: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5vh', // Spacing reduced from 4vh to 2.5vh to tighten relationships
        opacity: 0, // Animated via GSAP timeline
        willChange: 'opacity, transform',
        pointerEvents: 'none',
      }}
    >
      {/* Header Row: Title & Integrated Contextual VIEW Action on the same axis */}
      <div
        className="sub-section-eyebrow"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          willChange: 'opacity, transform',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px', // Increased size for visual authority
            fontWeight: 800, // Stronger weight
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-text-1, #0A0A0A)', // Better visual contrast
            opacity: 0.85,
          }}
        >
          02 — Deep Dive Focus
        </span>

        {/* Integrated Contextual VIEW Action Belongs to Section Header */}
        <span
          onClick={() => {
            portfolioExperience?.navigateTo('work');
          }}
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '9px',
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-text-1, #0A0A0A)',
            opacity: 0.75,
            border: '0.85px solid var(--color-border, rgba(10, 10, 10, 0.15))',
            padding: '3px 10px',
            borderRadius: '100px',
            background: 'var(--color-card-bg, rgba(255, 255, 255, 0.05))',
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}
        >
          VIEW
        </span>
      </div>

      {/* Current Focus Grid */}
      <div
        className="sub-section-focus"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          willChange: 'opacity, transform',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '8px',
            fontWeight: 800, // Stronger label weight
            letterSpacing: '0.12em', // Improved uppercase tracking
            textTransform: 'uppercase',
            color: 'var(--color-text-1, #0A0A0A)',
            opacity: 0.55, // Improved visual contrast
          }}
        >
          Current Focus
        </span>
        <div
          className="sub-section-focus-grid"
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
                  fontSize: '11px', // Increased size
                  fontWeight: 800, // Stronger weight for distinct cards title
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
                  opacity: 0.60, // Lower weight description supports title scanability
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
          gap: '10px',
          willChange: 'opacity, transform',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '8px',
            fontWeight: 800, // Stronger weight
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-1, #0A0A0A)',
            opacity: 0.55, // Improved contrast
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
          gap: '10px',
          willChange: 'opacity, transform',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '8px',
            fontWeight: 800, // Stronger weight
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-1, #0A0A0A)',
            opacity: 0.55, // Improved contrast
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
  );
}
