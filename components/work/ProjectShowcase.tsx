'use client';

import { useEffect, useState, useRef } from 'react';
import { projectRepository, type Project } from '@/lib/projects';
import { gsap } from '@/lib/gsap';

export default function ProjectShowcase() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [projects, setProjects] = useState<Project[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Keep repository pathway alive and active in background
    projectRepository.getPublishedProjects()
      .then((data) => {
        setProjects(data);
      })
      .catch((err) => {
        console.error('Failed to fetch projects in background:', err);
      });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Subtle reveal animation when section enters viewport
      gsap.fromTo('.work-reveal-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work-section"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        color: '#0A0A0A',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 8vw',
        zIndex: 2,
        overflow: 'hidden',
      }}
    >
      {/* Structural guidelines (visual flavor matching Contact and About) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: '1px dashed rgba(10, 10, 10, 0.05)',
          margin: '32px',
          borderRadius: '24px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Centered Composition */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '32px',
          zIndex: 2,
          maxWidth: '640px',
        }}
      >
        <span
          className="work-reveal-item"
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.2em',
            color: 'var(--color-accent, #3F702A)',
            textTransform: 'uppercase',
            display: 'block',
          }}
        >
          03 / WORK
        </span>

        <div
          className="work-reveal-item"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <h2
            style={{
              fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
              fontSize: 'clamp(44px, 5.5vw, 84px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
              margin: 0,
              lineHeight: 0.95,
              color: '#0A0A0A',
            }}
          >
            Future Experience
          </h2>
          <h3
            style={{
              fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
              fontSize: 'clamp(28px, 3.5vw, 52px)',
              fontWeight: 300,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              margin: 0,
              lineHeight: 1.0,
              color: 'rgba(10, 10, 10, 0.45)',
            }}
          >
            Under Construction
          </h3>
        </div>

        <div
          className="work-reveal-item"
          style={{
            width: '80px',
            height: '1px',
            backgroundColor: 'rgba(10, 10, 10, 0.12)',
            margin: '8px 0',
          }}
        />

        <p
          className="work-reveal-item"
          style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: 'clamp(15px, 1.2vw, 19px)',
            lineHeight: 1.5,
            color: '#444444',
            margin: 0,
            maxWidth: '32ch',
          }}
        >
          A new work experience is currently being crafted.
        </p>
      </div>
    </section>
  );
}
