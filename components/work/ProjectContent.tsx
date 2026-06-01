'use client';

import { Project } from '@/data/projects';

interface ProjectContentProps {
  project: Project;
  index: number;
  total: number;
}

export default function ProjectContent({ project, index, total }: ProjectContentProps) {
  const formatNumber = (num: number) => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  return (
    <div
      className={`project-info-panel project-info-panel-${project.id}`}
      style={{
        position: 'absolute',
        top: '100vh', // Positioned exactly below the image wrapper (which occupies top 0-100vh)
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between', // Spaced out elegantly top to bottom
        padding: '10vh 8vw 6vh',
        zIndex: 10,
        willChange: 'transform',
      }}
    >
      {/* Top Section: Category & Title */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginTop: 'auto',
          marginBottom: '24px',
          gap: '16px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-accent, #3F702A)',
          }}
        >
          {project.category}
        </span>
        <h2
          style={{
            fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
            color: 'var(--color-text-1, #0A0A0A)',
            margin: 0,
          }}
        >
          {project.title}
        </h2>
      </div>

      {/* Middle Section: Impact Statement & CTA */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px',
          marginBottom: 'auto',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '1px',
            backgroundColor: 'rgba(10, 10, 10, 0.15)',
          }}
        />
        <p
          style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: 'clamp(15px, 1.3vw, 20px)',
            lineHeight: 1.5,
            color: 'var(--color-text-2, #444444)',
            margin: 0,
            maxWidth: '38ch',
          }}
        >
          {project.impact}
        </p>

        <a
          href={`/work/${project.slug}`}
          className="project-panel-cta"
          data-cursor="button"
          onClick={(e) => e.preventDefault()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color: '#FFFFFF',
            background: '#0A0A0A',
            padding: '14px 32px',
            borderRadius: '100px',
            cursor: 'pointer',
            transition: 'background 0.3s ease, transform 0.2s ease',
            pointerEvents: 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-accent, #3F702A)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0A0A0A';
          }}
        >
          <span>View Case Study</span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="1" y1="9" x2="9" y2="1" />
            <polyline points="4 1 9 1 9 6" />
          </svg>
        </a>
      </div>

      {/* Bottom Section: Progress Indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'var(--font-mono, monospace)',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-1, #0A0A0A)' }}>
            {formatNumber(index + 1)}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-3, #888888)' }}>
            /
          </span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-3, #888888)' }}>
            {formatNumber(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
