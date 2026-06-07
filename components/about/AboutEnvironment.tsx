import type { ReactNode } from 'react';

type AboutEnvironmentProps = {
  children: ReactNode;
};

export default function AboutEnvironment({ children }: AboutEnvironmentProps) {
  return (
    <>
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
          opacity: 'calc(0.85 * var(--about-env-opacity, 0))' as any,
        }}
      />

      {children}

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
          opacity: 'var(--about-env-opacity, 0)' as any,
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
    </>
  );
}
