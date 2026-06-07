'use client';

import { useRef } from 'react';
import AboutChapterA from '../about/AboutChapterA';
import AboutChapterB from '../about/AboutChapterB';
import AboutEnvironment from '../about/AboutEnvironment';

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
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end', // Keep bottom-aligned
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <AboutEnvironment>
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

        {/* 2b. Massive Left-Aligned Bottom Transparent Portrait Image (Sub-section pose morph - Shifted 11vw left for spacious breathing room) */}
        <img
          src="/images/bannertransparanleft.png"
          alt="About Portrait Left"
          className="about-portrait-left-img"
          style={{
            position: 'absolute',
            bottom: '-10vh',
            left: '-11vw', // Shifted left by ~210px for spacious breathing room and gap
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
          className="about-portrait-trigger"
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
      </AboutEnvironment>

      <AboutChapterA />

      <AboutChapterB />

      <style>{`
        @media (max-width: 768px) {
          /* Structural Rebalancing for Mobile */
          .about-section-container {
            justify-content: flex-start !important; /* Align content to top */
            padding-top: 12vh !important; /* Add top padding for text */
          }
          
          /* Portrait: Meaningful visual anchor, 35-45% of viewport, showing shoulders/chest */
          .about-portrait-img {
            height: 55vh !important; /* Reduced height to fit within lower half */
            width: 100vw !important; /* Full width to ground it */
            bottom: 0 !important; /* Anchored to bottom */
            right: 0 !important;
            object-fit: cover !important; /* Cover to ensure it fills the width */
            object-position: top center !important; /* Focus on head/shoulders */
            transform: translateY(0) !important; /* Remove initial lift */
            /* Apply a long, gradual fade mask starting from the mid-torso down to the bottom edge */
            -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0) 100%) !important;
            mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0) 100%) !important;
          }
          .about-portrait-left-img {
            height: 55vh !important;
            width: 100vw !important;
            bottom: 0 !important;
            left: 0 !important;
            object-fit: cover !important;
            object-position: top center !important;
            /* Apply a long, gradual fade mask starting from the mid-torso down to the bottom edge */
            -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0) 100%) !important;
            mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0) 100%) !important;
          }

          /* Typography: Upper portion, above portrait */
          .about-editorial-text {
            position: relative !important; /* Flow with document */
            left: 0 !important;
            bottom: auto !important;
            width: 100% !important;
            padding: 0 6vw !important; /* Match container padding */
            z-index: 5 !important; /* Ensure it's above portrait */
          }

          /* Heading Layout: Prevent clipping, allow wrapping */
          .about-text-line {
            font-size: clamp(48px, 12vw, 72px) !important; /* Adjust scale for mobile */
            white-space: normal !important; /* Allow wrapping */
          }

          /* Sub-content: Flow below main text, above portrait */
          .about-sub-content {
            position: relative !important;
            right: auto !important;
            left: auto !important;
            bottom: auto !important;
            top: auto !important;
            width: 100% !important;
            padding: 0 6vw !important;
            margin-top: 4vh !important; /* Space below main text */
            z-index: 5 !important;
          }

          /* Hide glass overlay on mobile as it obscures the portrait and isn't needed for text contrast here */
          .about-glass-overlay {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .sub-section-focus-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
