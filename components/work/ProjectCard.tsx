'use client';

import { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
  index: number;
  total: number;
}

export default function ProjectCard({ project, index, total }: ProjectCardProps) {
  // Select which pre-loaded premium monochrome/technical public image to use as fallback
  // if the exact mock path doesn't load.
  const fallbackImages = ['/images/project_aura.png', '/images/project_kuro.png', '/images/chaniago.jpg'];
  const fallbackImage = fallbackImages[index % fallbackImages.length];

  return (
    <a
      href={`/work/${project.slug}`}
      onClick={(e) => {
        // Prevent default browser hard refresh for Next.js SPA transitions,
        // letting Next.js routing take over (or simple direct link handles it).
      }}
      className={`project-card-container project-card-container-${project.id}`}
      data-cursor="image"
      data-cursor-text="CASE STUDY"
      style={{
        display: 'block',
        textDecoration: 'none',
        pointerEvents: 'auto',
      }}
    >
      {/* 1. Subtle noise overlay for editorial technical texture */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
          opacity: 0.02,
          mixBlendMode: 'overlay',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* 2. Structured engineering alignment guide rails (visual flavor) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: '1px dashed var(--color-border, rgba(10, 10, 10, 0.05))',
          margin: '20px',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* 3. Portals / Image container */}
      <div
        className={`project-image-wrapper-${project.id}`}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: 'inherit',
          willChange: 'transform',
          WebkitMaskImage: '-webkit-radial-gradient(white, black)',
          maskImage: 'radial-gradient(white, black)',
        }}
      >
        <img
          src={project.image}
          alt={project.title}
          className={`project-image-${project.id}`}
          onError={(e) => {
            // Safe fallback to beautiful pre-existing portfolio asset if mock folder is missing
            e.currentTarget.src = fallbackImage;
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(1.12)', // Starts slightly scaled up for morph breathing room (restrained depth)
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            willChange: 'transform',
          }}
        />

        {/* 4. Elegant inner frame & recession bevel overlay to embed image physically inside card */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05), inset 0 0 0 1px var(--color-border, rgba(10, 10, 10, 0.04))',
            pointerEvents: 'none',
            zIndex: 2,
            transition: 'box-shadow 0.4s ease',
          }}
        />
      </div>
    </a>
  );
}
