'use client';

import { projects } from '@/data/projects';
import WorkIntro from './WorkIntro';
import ProjectCard from './ProjectCard';

export default function ProjectShowcase() {
  return (
    <section
      className="work-section-container"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--color-bg, #FFFFFF)',
        zIndex: 1,
        opacity: 0, // GSAP reveals at timeline 4.85
        pointerEvents: 'none', // Toggle managed by PinnedSections
        overflow: 'hidden',
      }}
    >
      {/* 1. Masked Character Reveal Typography Title */}
      <WorkIntro />

      {/* 2. Dynamic Portal Project Cards Stacking Container */}
      <div
        className="work-cards-stack-wrapper"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {projects.map((project, idx) => (
          <div key={project.id}>
            {/* Project Editorial Typography Introduction */}
            <div
              className={`project-intro-block project-intro-block-${project.id}`}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                maxWidth: '900px',
                padding: '0 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '24px',
                zIndex: 10,
                opacity: 0,
                pointerEvents: 'none',
                willChange: 'transform, opacity, filter',
              }}
            >
              <span
                className={`project-intro-eyebrow-${project.id}`}
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent, #3F702A)',
                  opacity: 0,
                  transform: 'translateY(30px)',
                  filter: 'blur(8px)',
                  willChange: 'transform, opacity, filter',
                  display: 'block',
                }}
              >
                {project.category}
              </span>
              <h2
                className={`project-intro-title-${project.id}`}
                style={{
                  fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
                  fontSize: 'clamp(40px, 8vw, 84px)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.04em',
                  lineHeight: 0.95,
                  color: 'var(--color-text-1, #0A0A0A)',
                  margin: 0,
                  opacity: 0,
                  transform: 'translateY(40px)',
                  filter: 'blur(12px)',
                  willChange: 'transform, opacity, filter',
                }}
              >
                {project.title}
              </h2>
              <div
                className={`project-intro-line-${project.id}`}
                style={{
                  width: '80px',
                  height: '1px',
                  backgroundColor: 'rgba(10, 10, 10, 0.15)',
                  opacity: 0,
                  transform: 'scaleX(0)',
                  transformOrigin: 'center center',
                  willChange: 'transform, opacity',
                }}
              />
              <p
                className={`project-intro-desc-${project.id}`}
                style={{
                  fontFamily: 'var(--font-body), sans-serif',
                  fontSize: 'clamp(16px, 1.6vw, 22px)',
                  lineHeight: 1.5,
                  color: 'var(--color-text-2, #444444)',
                  margin: 0,
                  maxWidth: '38ch',
                  opacity: 0,
                  transform: 'translateY(30px)',
                  filter: 'blur(8px)',
                  willChange: 'transform, opacity, filter',
                }}
              >
                {project.impact}
              </p>
            </div>

            {/* Project Immersive Card */}
            <ProjectCard
              project={project}
              index={idx}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
