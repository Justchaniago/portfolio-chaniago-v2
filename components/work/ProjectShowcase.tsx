'use client';

import { useEffect, useState } from 'react';
import { projectRepository, type Project } from '@/lib/projects';

export default function ProjectShowcase() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    projectRepository.getPublishedProjects().then(setProjects);
  }, []);

  return (
    <section
      id="work-section"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        color: '#0A0A0A',
        padding: '16vh 8vw',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '6vh',
        zIndex: 2,
      }}
    >
      {/* Editorial Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.2em',
            color: 'var(--color-accent, #3F702A)',
            textTransform: 'uppercase',
          }}
        >
          03 / WORK
        </span>
        <h2
          style={{
            fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
            fontSize: 'clamp(44px, 7vw, 92px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            margin: 0,
            lineHeight: 0.95,
          }}
        >
          Selected Projects
        </h2>
      </div>

      <div
        style={{
          width: '100%',
          height: '1px',
          backgroundColor: 'rgba(10, 10, 10, 0.12)',
        }}
      />

      {/* Projects List Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: '20px',
        }}
      >
        {projects.map((project, idx) => (
          <a
            key={project.id}
            href={`/work/${project.slug}`}
            className="work-project-row"
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '36px 0',
              borderBottom: '1px solid rgba(10, 10, 10, 0.08)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Left side: Num and Title */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '32px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '13px',
                  fontWeight: 600,
                  opacity: 0.35,
                }}
              >
                {idx < 9 ? `0${idx + 1}` : idx + 1}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3
                  className="work-project-title"
                  style={{
                    fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
                    fontSize: 'clamp(28px, 4vw, 56px)',
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {project.title}
                </h3>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    opacity: 0.5,
                  }}
                >
                  {project.category}
                </span>
              </div>
            </div>

            {/* Right side: Summary / Impact */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', maxWidth: '35%' }}>
              <p
                style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: 'clamp(14px, 1.2vw, 18px)',
                  lineHeight: 1.4,
                  margin: 0,
                  textAlign: 'right',
                  opacity: 0.7,
                }}
              >
                {project.summary}
              </p>
              <div className="work-project-arrow" style={{ opacity: 0, transform: 'translateX(-10px)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>

      <style>{`
        .work-project-row:hover {
          padding-left: 20px;
          background-color: rgba(10, 10, 10, 0.02);
          border-bottom-color: rgba(10, 10, 10, 0.25);
        }
        .work-project-row:hover .work-project-title {
          color: var(--color-accent, #3F702A);
        }
        .work-project-row:hover .work-project-arrow {
          opacity: 1 !important;
          transform: translateX(0) !important;
          color: var(--color-accent, #3F702A);
        }
        @media (max-width: 768px) {
          #work-section {
            padding: 12vh 6vw !important;
          }
          .work-project-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
            padding: 24px 0 !important;
          }
          .work-project-row:hover {
            padding-left: 0 !important;
            background-color: transparent !important;
          }
          .work-project-row div:last-child {
            max-width: 100% !important;
            align-items: flex-start !important;
          }
          .work-project-row p {
            text-align: left !important;
          }
        }
      `}</style>
    </section>
  );
}
