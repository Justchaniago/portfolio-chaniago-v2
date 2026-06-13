'use client';

import { useEffect, useState, useRef } from 'react';
import { projectRepository, type Project } from '@/lib/projects';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import SignaturePath from './SignaturePath';
import { SignaturePathController } from './SignaturePathController';
import SignaturePathDebug from './SignaturePathDebug';

const DEBUG_SIGNATURE_PATH = false;

type ProjectShowcaseProps = {
  enableScrollEffects?: boolean;
};

export default function ProjectShowcase({
  enableScrollEffects = true,
}: ProjectShowcaseProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [projects, setProjects] = useState<Project[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

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
    if (!enableScrollEffects) {
      const ctx = gsap.context(() => {
        gsap.set('.work-reveal-item', {
          opacity: 1,
          y: 0,
          scale: 1,
          clearProps: 'filter',
        });

        const path = pathRef.current;
        const svg = svgRef.current;
        if (path && svg) {
          const controller = new SignaturePathController(path, svg);
          controller.update(0.56);
        }
      }, sectionRef);

      return () => ctx.revert();
    }

    const ctx = gsap.context(() => {
      // 1. Quiet, premium reveal animation when each item enters the viewport
      const revealItems = gsap.utils.toArray<Element>('.work-reveal-item');
      revealItems.forEach((item) => {
        gsap.fromTo(item,
          { opacity: 0, y: 40, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: 'premiumBezier',
            scrollTrigger: {
              trigger: item,
              start: 'top 88%', // Triggers when the top of the element enters 88% of the viewport height
              toggleActions: 'play none none reverse',
            }
          }
        );
      });

      // 2. Single Unified ScrollTrigger driving the SignaturePathController
      const path = pathRef.current;
      const svg = svgRef.current;
      const section = sectionRef.current;
      if (path && svg && section) {
        const controller = new SignaturePathController(path, svg);

        const signatureTrigger = ScrollTrigger.create({
          trigger: section,
          start: 'top bottom', // Start tracking when top of work enters bottom of viewport
          end: 'bottom top',   // Stop tracking when bottom of work leaves top of viewport
          scrub: true,
          onUpdate: (self) => {
            controller.update(self.progress);
          },
        });

        controller.update(signatureTrigger.progress);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [enableScrollEffects]);

  return (
    <section ref={sectionRef} className="work-section">
      
      {/* Decoupled SVG Renderer Component */}
      <SignaturePath svgRef={svgRef} pathRef={pathRef} />

      {/* Floating Debug overlay HUD */}
      {DEBUG_SIGNATURE_PATH && <SignaturePathDebug />}

      <div className="work-container">
        
        {/* Header Block */}
        <div className="work-header">
          {/* Eyebrow */}
          <span
            className="work-reveal-item"
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: 'var(--color-accent, #F95C4B)',
              textTransform: 'uppercase',
              marginBottom: '2vh',
              display: 'block',
            }}
          >
            03 / EXHIBITION
          </span>

          <div className="work-header-grid">
            <h2
              className="work-reveal-item work-title"
              style={{ margin: 0 }}
            >
              WORK
            </h2>

            {/* Editorial Metadata Block */}
            <div className="work-reveal-item work-editorial-block">
              <span style={{ fontWeight: 800, color: 'var(--color-text-1, #0A0A0A)' }}>
                SELECTED WORK
              </span>
              <span>2023 — 2026</span>
              <span>INTERACTIVE EXPERIENCES</span>
              <span>DIGITAL PRODUCTS</span>
            </div>
          </div>
        </div>

        {/* Placeholder 1: Large Landscape Anchor */}
        <div className="work-reveal-item work-placeholder wp-1">
          <div className="work-placeholder-inner" />
        </div>

        {/* Placeholder 2: Tall Portrait Overlap (Overlap Rule) */}
        <div className="work-reveal-item work-placeholder wp-2">
          <div className="work-placeholder-inner" />
        </div>

        {/* Typographic Breathing Section (Museum Rule) */}
        <div className="work-reveal-item work-breathing-section">
          <p className="work-breathing-text">
            Selected experiences crafted with intention, not volume.
          </p>
        </div>

        {/* Placeholder 3: Ultra-wide Cinematic */}
        <div className="work-reveal-item work-placeholder wp-3">
          <div className="work-placeholder-inner" />
        </div>

        {/* Placeholder 4: Medium Portrait */}
        <div className="work-reveal-item work-placeholder wp-4">
          <div className="work-placeholder-inner" />
        </div>

        {/* Placeholder 5: Small Rhythm Interrupter */}
        <div className="work-reveal-item work-placeholder wp-5">
          <div className="work-placeholder-inner" />
        </div>

        {/* Placeholder 6: Solitary Close */}
        <div className="work-reveal-item work-placeholder wp-6">
          <div className="work-placeholder-inner" />
        </div>

        {/* CTA Prototype */}
        <div className="work-reveal-item work-cta-container">
          <button
            className="work-cta-button"
            type="button"
            onClick={() => {
              console.log('CTA clicked - composition explore');
            }}
          >
            Explore All Work <span className="work-cta-arrow">→</span>
          </button>
        </div>

      </div>

      <style>{`
        .work-section {
          position: relative;
          width: 100%;
          height: auto;
          min-height: 100vh;
          background-color: var(--color-bg, #F6F4F1);
          color: var(--color-text-1, #0A0A0A);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16vh 0 20vh 0;
          z-index: 2;
        }

        .work-path-svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          overflow: visible;
          --path-stroke-width: clamp(12px, 1.8vw, 24px);
        }

        .work-container {
          width: 100%;
          max-width: 1440px;
          padding: 0 8vw;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 0;
          z-index: 2;
        }

        .work-header {
          display: flex;
          flex-direction: column;
          width: 100%;
          margin-bottom: 18vh;
          z-index: 2;
        }

        .work-header-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          align-items: baseline;
          gap: 40px;
          width: 100%;
        }

        .work-title {
          font-family: "PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif;
          font-size: clamp(6rem, 15vw, 15rem);
          font-weight: 800;
          letter-spacing: -0.045em;
          text-transform: uppercase;
          line-height: 0.8;
          color: var(--color-text-1, #0A0A0A);
        }

        .work-editorial-block {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 500;
          line-height: 1.8;
          letter-spacing: 0.08em;
          color: var(--color-text-2, #444444);
          text-transform: uppercase;
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-self: end;
          padding-bottom: 0.5rem;
        }

        /* Placeholders general styling */
        .work-placeholder {
          background-color: rgba(10, 10, 10, 0.03);
          border: 1.2px solid rgba(10, 10, 10, 0.08);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.4s ease, background-color 0.4s ease;
          box-shadow: 0 4px 24px rgba(10, 10, 10, 0.01);
          z-index: 2;
        }

        .work-placeholder:hover {
          background-color: rgba(10, 10, 10, 0.05);
          border-color: rgba(10, 10, 10, 0.15);
          box-shadow: 0 8px 32px rgba(10, 10, 10, 0.03);
        }

        .work-placeholder-inner {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.7) 0%,
            rgba(255, 255, 255, 0) 50%,
            rgba(255, 255, 255, 0.4) 100%
          );
          opacity: 0.6;
          transition: opacity 0.6s ease;
        }

        .work-placeholder:hover .work-placeholder-inner {
          opacity: 1;
        }

        /* Desktop Positioning and Ratios */
        .wp-1 {
          width: 58%;
          aspect-ratio: 16 / 10;
          align-self: flex-start;
        }

        .wp-2 {
          width: 36%;
          aspect-ratio: 4 / 5;
          align-self: flex-end;
          margin-top: -14vh; /* Overlap Rule */
          z-index: 3;
        }

        .wp-3 {
          width: 82%;
          aspect-ratio: 21 / 9;
          align-self: flex-start;
          margin-top: 12vh;
        }

        .wp-4 {
          width: 42%;
          aspect-ratio: 3 / 4;
          align-self: flex-end;
          margin-top: 24vh;
        }

        .wp-5 {
          width: 25%;
          aspect-ratio: 1 / 1;
          align-self: flex-start;
          margin-left: 12vw;
          margin-top: 16vh;
        }

        .wp-6 {
          width: 48%;
          aspect-ratio: 16 / 10;
          align-self: flex-end;
          margin-top: 26vh;
        }

        /* Typographic rest segment (Museum Rule) */
        .work-breathing-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 12vh 0;
          align-items: flex-start;
          padding-left: 12vw;
          z-index: 2;
        }

        .work-breathing-text {
          font-family: var(--font-display, Georgia, serif);
          font-size: clamp(2rem, 4.2vw, 3.8rem);
          font-weight: 300;
          line-height: 1.35;
          color: var(--color-text-2, #444444);
          max-width: 18ch;
          margin: 0;
          font-style: italic;
        }

        /* CTA Prototype styling */
        .work-cta-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 28vh;
          margin-bottom: 4vh;
          z-index: 2;
        }

        .work-cta-button {
          background: none;
          border: none;
          font-family: var(--font-mono, monospace);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--color-text-1, #0A0A0A);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          transition: letter-spacing 0.3s ease, color 0.3s ease;
          position: relative;
        }

        .work-cta-button::after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 24px;
          right: 24px;
          height: 1px;
          background-color: var(--color-text-1, #0A0A0A);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease;
        }

        .work-cta-button:hover {
          letter-spacing: 0.22em;
        }

        .work-cta-button:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .work-cta-arrow {
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .work-cta-button:hover .work-cta-arrow {
          transform: translateX(4px);
        }

        /* Responsive collapse for Mobile */
        @media (max-width: 768px) {
          .work-section {
            padding: 10vh 0 12vh 0;
          }
          
          .work-container {
            padding: 0 6vw;
          }
          
          .work-header {
            margin-bottom: 10vh;
          }
          
          .work-header-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .work-title {
            font-size: clamp(4rem, 14vw, 6rem);
          }
          
          .work-editorial-block {
            align-self: flex-start;
            padding-bottom: 0;
            font-size: 10px;
          }
          
          /* Collapse to vertical list but maintain rhythm & asymmetry */
          .wp-1 {
            width: 100%;
            aspect-ratio: 16 / 10;
          }
          
          .wp-2 {
            width: 85%;
            aspect-ratio: 4 / 5;
            margin-top: 6vh; /* Less overlap on mobile, simple offset overlap */
            align-self: flex-end;
          }
          
          .work-breathing-section {
            padding: 8vh 0;
            padding-left: 2vw;
          }
          
          .work-breathing-text {
            font-size: clamp(1.6rem, 7vw, 2.4rem);
            max-width: 16ch;
          }
          
          .wp-3 {
            width: 100%;
            aspect-ratio: 16 / 9; /* Slightly taller for mobile landscape */
            margin-top: 6vh;
          }
          
          .wp-4 {
            width: 80%;
            aspect-ratio: 3 / 4;
            margin-top: 10vh;
            align-self: flex-start; /* Swapped alignment to break rhythm */
          }
          
          .wp-5 {
            width: 50%;
            aspect-ratio: 1 / 1;
            margin-left: 0;
            margin-top: 8vh;
            align-self: flex-end; /* Swapped alignment to break rhythm */
          }
          
          .wp-6 {
            width: 90%;
            aspect-ratio: 16 / 10;
            margin-top: 12vh;
            align-self: center;
          }
          
          .work-cta-container {
            margin-top: 16vh;
          }
        }
      `}</style>
    </section>
  );
}
