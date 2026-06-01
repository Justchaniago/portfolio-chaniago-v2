'use client';

import { useState, useRef, useEffect } from 'react';
import { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
  index: number;
  total: number;
}

export default function ProjectCard({ project, index, total }: ProjectCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  
  // Slide index state (0, 1, 2)
  const [activeIdx, setActiveIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // dragX in pixels, currentProgress in [-1, 1]
  const [dragX, setDragX] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  
  // Ref for tracking gesture variables during dragging
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    isPointerDown: false,
    hasLockedDirection: false,
    dragDirection: null as 'horizontal' | 'vertical' | null,
    cardWidth: 0,
    dragDistance: 0,
  });

  // Select which pre-loaded premium monochrome/technical public image to use as fallback
  const fallbackImages = ['/images/project_aura.png', '/images/project_kuro.png', '/images/chaniago.jpg'];
  const fallbackImage = fallbackImages[index % fallbackImages.length];

  const totalSlides = project.gallery ? project.gallery.length : 1;

  // Pointer event handlers to support unified Mouse, Touch and Trackpad Drag gestures
  const handlePointerDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    // Check if the card is in its fully expanded fullscreen state
    const rect = cardEl.getBoundingClientRect();
    const isExpanded = rect.width >= window.innerWidth - 10;
    if (!isExpanded) return;

    // Record starting coordinates
    gestureRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now(),
      isPointerDown: true,
      hasLockedDirection: false,
      dragDirection: null,
      cardWidth: rect.width,
      dragDistance: 0,
    };

    // Capture the pointer to receive events even outside the card boundary
    cardEl.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const gesture = gestureRef.current;
    if (!gesture.isPointerDown) return;

    const dx = e.clientX - gesture.startX;
    const dy = e.clientY - gesture.startY;

    if (!gesture.hasLockedDirection) {
      // Determine gesture intent after moving slightly (5px threshold)
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        gesture.hasLockedDirection = true;
        if (Math.abs(dx) > Math.abs(dy)) {
          gesture.dragDirection = 'horizontal';
          setIsDragging(true);
        } else {
          gesture.dragDirection = 'vertical';
          // Release pointer capture so the browser can handle native vertical page scroll smoothly
          cardRef.current?.releasePointerCapture(e.pointerId);
        }
      }
      return;
    }

    if (gesture.dragDirection === 'horizontal') {
      // Prevent browser default behavior like horizontal swipe-to-navigate
      e.preventDefault();

      let targetDx = dx;
      
      // Rubber-banding if dragging past boundaries
      if (activeIdx === 0 && dx > 0) {
        targetDx = dx * 0.3; // Dampen drag-right on slide 0
      } else if (activeIdx === totalSlides - 1 && dx < 0) {
        targetDx = dx * 0.3; // Dampen drag-left on last slide
      }

      gesture.dragDistance = Math.abs(targetDx);
      setDragX(targetDx);
      setCurrentProgress(targetDx / gesture.cardWidth);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const gesture = gestureRef.current;
    if (!gesture.isPointerDown) return;

    gesture.isPointerDown = false;

    if (gesture.dragDirection === 'horizontal') {
      cardRef.current?.releasePointerCapture(e.pointerId);
      setIsDragging(false);

      const dx = e.clientX - gesture.startX;
      const duration = Date.now() - gesture.startTime;
      const velocity = dx / duration; // pixels per ms
      const dragPercent = dx / gesture.cardWidth;

      // Commit slide change if drag distance > 15% OR velocity is high enough (> 0.3 px/ms)
      const threshold = 0.15;
      const isSwipe = Math.abs(velocity) > 0.3;

      let nextIdx = activeIdx;
      if (dragPercent < -threshold || (isSwipe && velocity < 0)) {
        if (activeIdx < totalSlides - 1) {
          nextIdx = activeIdx + 1;
        }
      } else if (dragPercent > threshold || (isSwipe && velocity > 0)) {
        if (activeIdx > 0) {
          nextIdx = activeIdx - 1;
        }
      }

      // Transition animation lifecycle
      setIsTransitioning(true);
      
      // We calculate where currentProgress needs to go:
      // If index changed: -1 (for index increment) or 1 (for index decrement)
      // If canceled: 0
      const targetProgress = nextIdx === activeIdx 
        ? 0 
        : nextIdx > activeIdx ? -1 : 1;

      setCurrentProgress(targetProgress);
      setDragX(0);

      // Timeout to clean up transition states (duration matches the 850ms CSS ease)
      const timeoutId = setTimeout(() => {
        setActiveIdx(nextIdx);
        setCurrentProgress(0);
        setIsTransitioning(false);
      }, 850);

      return () => clearTimeout(timeoutId);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const gesture = gestureRef.current;
    if (!gesture.isPointerDown) return;

    gesture.isPointerDown = false;
    if (gesture.dragDirection === 'horizontal') {
      cardRef.current?.releasePointerCapture(e.pointerId);
    }
    
    // Reset to resting state on cancel
    setIsDragging(false);
    setIsTransitioning(true);
    setCurrentProgress(0);
    setDragX(0);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 850);
  };

  // Determine standard slide positioning based on activeIdx, dragProgress, and dragging states
  const getSlideStyle = (imgIdx: number) => {
    const dp = currentProgress; // value in [-1, 1], negative means dragging to next (right-to-left)
    const transitionStyle = isTransitioning
      ? 'transform 850ms cubic-bezier(0.22, 1, 0.36, 1), opacity 850ms cubic-bezier(0.22, 1, 0.36, 1), filter 850ms cubic-bezier(0.22, 1, 0.36, 1)'
      : 'none';

    // Static rest style when not dragging or transitioning
    if (!isDragging && !isTransitioning) {
      if (imgIdx === activeIdx) {
        return {
          wrapper: {
            transform: 'translateX(0%) scale(1)',
            opacity: 1,
            filter: 'blur(0px)',
            zIndex: 2,
            transition: 'none',
          },
          image: {
            transform: 'translate(-50%, -50%) translateX(0%) scale(1.0)',
            transition: 'none',
          }
        };
      } else if (imgIdx === activeIdx + 1) {
        return {
          wrapper: {
            transform: 'translateX(100%) scale(1.04)',
            opacity: 0,
            filter: 'blur(4px)',
            zIndex: 1,
            transition: 'none',
          },
          image: {
            transform: 'translate(-50%, -50%) translateX(30%) scale(1.04)',
            transition: 'none',
          }
        };
      } else if (imgIdx === activeIdx - 1) {
        return {
          wrapper: {
            transform: 'translateX(-100%) scale(1.04)',
            opacity: 0,
            filter: 'blur(4px)',
            zIndex: 1,
            transition: 'none',
          },
          image: {
            transform: 'translate(-50%, -50%) translateX(-30%) scale(1.04)',
            transition: 'none',
          }
        };
      } else {
        return {
          wrapper: {
            transform: imgIdx > activeIdx ? 'translateX(100%) scale(1.04)' : 'translateX(-100%) scale(1.04)',
            opacity: 0,
            filter: 'blur(4px)',
            zIndex: 0,
            transition: 'none',
          },
          image: {
            transform: imgIdx > activeIdx 
              ? 'translate(-50%, -50%) translateX(30%) scale(1.04)' 
              : 'translate(-50%, -50%) translateX(-30%) scale(1.04)',
            transition: 'none',
          }
        };
      }
    }

    // Active dragging or transition interpolation state
    if (dp < 0) {
      // Swiping to next slide (entering from right to left)
      const p = -dp; // normalized progress in [0, 1]
      
      if (imgIdx === activeIdx) {
        return {
          wrapper: {
            transform: `translateX(${p * -12}%) scale(${1 - p * 0.04})`,
            opacity: 1 - p * 0.5,
            filter: `blur(${p * 4}px)`,
            zIndex: 1,
            transition: transitionStyle,
          },
          image: {
            transform: `translate(-50%, -50%) translateX(${p * -18}%) scale(1.0)`,
            transition: transitionStyle,
          }
        };
      } else if (imgIdx === activeIdx + 1) {
        return {
          wrapper: {
            transform: `translateX(${(1 - p) * 100}%) scale(${1.04 - p * 0.04})`,
            opacity: p,
            filter: `blur(${(1 - p) * 4}px)`,
            zIndex: 2,
            transition: transitionStyle,
          },
          image: {
            transform: `translate(-50%, -50%) translateX(${(1 - p) * 30}%) scale(${1.04 - p * 0.04})`,
            transition: transitionStyle,
          }
        };
      } else {
        return {
          wrapper: {
            transform: 'translateX(100%) scale(1.04)',
            opacity: 0,
            filter: 'blur(4px)',
            zIndex: 0,
            transition: 'none',
          },
          image: {
            transform: 'translate(-50%, -50%) translateX(30%) scale(1.04)',
            transition: 'none',
          }
        };
      }
    } else {
      // Swiping to previous slide (entering from left to right)
      const p = dp; // normalized progress in [0, 1]

      if (imgIdx === activeIdx) {
        return {
          wrapper: {
            transform: `translateX(${p * 12}%) scale(${1 - p * 0.04})`,
            opacity: 1 - p * 0.5,
            filter: `blur(${p * 4}px)`,
            zIndex: 1,
            transition: transitionStyle,
          },
          image: {
            transform: `translate(-50%, -50%) translateX(${p * 18}%) scale(1.0)`,
            transition: transitionStyle,
          }
        };
      } else if (imgIdx === activeIdx - 1) {
        return {
          wrapper: {
            transform: `translateX(${(p - 1) * 100}%) scale(${1.04 - p * 0.04})`,
            opacity: p,
            filter: `blur(${(1 - p) * 4}px)`,
            zIndex: 2,
            transition: transitionStyle,
          },
          image: {
            transform: `translate(-50%, -50%) translateX(${(p - 1) * 30}%) scale(${1.04 - p * 0.04})`,
            transition: transitionStyle,
          }
        };
      } else {
        return {
          wrapper: {
            transform: 'translateX(-100%) scale(1.04)',
            opacity: 0,
            filter: 'blur(4px)',
            zIndex: 0,
            transition: 'none',
          },
          image: {
            transform: 'translate(-50%, -50%) translateX(-30%) scale(1.04)',
            transition: 'none',
          }
        };
      }
    }
  };

  // Continuous Liquid Progress Indicator Calculations
  const continuousIdx = activeIdx - currentProgress;
  const capsuleLeft = Math.min(48, Math.max(0, continuousIdx * 24));
  const fraction = continuousIdx % 1;
  const dist = 0.5 - Math.abs(0.5 - Math.abs(fraction));
  const capsuleWidth = 24 + dist * 16;

  // Continuous Counter Opacity & Blur Calculations
  const getCounterStyle = (numIdx: number) => {
    const diff = Math.abs(continuousIdx - numIdx);
    const opacity = Math.max(0, 0.85 - diff * 0.85);
    const blur = diff * 4;
    return {
      opacity,
      filter: blur > 0 ? `blur(${blur}px)` : 'none',
      transition: isTransitioning ? 'opacity 850ms cubic-bezier(0.22, 1, 0.36, 1), filter 850ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
    };
  };

  return (
    <a
      ref={cardRef}
      href={`/work/${project.slug}`}
      onClick={(e) => {
        // If the user was dragging horizontally, block click navigation entirely!
        if (gestureRef.current.dragDirection === 'horizontal' && gestureRef.current.dragDistance > 5) {
          e.preventDefault();
          return;
        }

        const cardEl = cardRef.current;
        if (cardEl) {
          const rect = cardEl.getBoundingClientRect();
          const isExpanded = rect.width >= window.innerWidth - 10;
          // If the card is collapsed, clicks should never navigate.
          // They only expand the card via PinnedSections timeline.
          if (!isExpanded) {
            e.preventDefault();
            return;
          }
        }
      }}
      className={`project-card-container project-card-container-${project.id}`}
      data-cursor="image"
      data-cursor-text="CASE STUDY"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{
        display: 'block',
        textDecoration: 'none',
        pointerEvents: 'auto',
        touchAction: 'pan-y', // Lock touch-drag to vertical scroll natively unless captured horizontally
        userSelect: 'none',
        WebkitUserSelect: 'none',
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
        {project.gallery && project.gallery.map((imgUrl, imgIdx) => {
          const slideStyle = getSlideStyle(imgIdx);
          
          return (
            <div
              key={imgIdx}
              className={`project-slide-wrapper project-slide-wrapper-${project.id}-${imgIdx}`}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                borderRadius: 'inherit',
                transform: slideStyle.wrapper.transform,
                opacity: slideStyle.wrapper.opacity,
                filter: slideStyle.wrapper.filter,
                zIndex: slideStyle.wrapper.zIndex,
                transition: slideStyle.wrapper.transition,
                willChange: 'transform, opacity, filter',
              }}
            >
              <img
                src={imgUrl}
                alt={`${project.title} - Slide ${imgIdx + 1}`}
                className={`project-image-${project.id} project-image-${project.id}-${imgIdx}`}
                onError={(e) => {
                  e.currentTarget.src = fallbackImage;
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: slideStyle.image.transform,
                  transition: slideStyle.image.transition,
                  willChange: 'transform',
                }}
              />
            </div>
          );
        })}

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

      {/* 5. FLOATING GALLERY CONTROL PILL (Morphs & emerges from GSAP in PinnedSections) */}
      <div
        className={`project-gallery-pill project-gallery-pill-${project.id}`}
        style={{
          position: 'absolute',
          bottom: '48px',
          left: '50%',
          transform: 'translateX(-50%) translateY(32px) scale(0.8)',
          width: '56px',
          height: '56px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          opacity: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          filter: 'blur(8px)',
        }}
      >
        {/* Staggered Content inside the Pill */}
        <div
          className={`pill-content pill-content-${project.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '128px',
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          {/* Left Counter Stack (Tactile cross-fades linked to drag progress) */}
          <div style={{ position: 'relative', width: '16px', height: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span 
              className={`pill-counter-num-${project.id}-0`} 
              style={{ 
                position: 'absolute', 
                fontFamily: 'var(--font-mono, monospace)', 
                fontSize: '11px', 
                fontWeight: 600, 
                color: '#FFFFFF',
                ...getCounterStyle(0),
              }}
            >
              01
            </span>
            <span 
              className={`pill-counter-num-${project.id}-1`} 
              style={{ 
                position: 'absolute', 
                fontFamily: 'var(--font-mono, monospace)', 
                fontSize: '11px', 
                fontWeight: 600, 
                color: '#FFFFFF',
                ...getCounterStyle(1),
              }}
            >
              02
            </span>
            <span 
              className={`pill-counter-num-${project.id}-2`} 
              style={{ 
                position: 'absolute', 
                fontFamily: 'var(--font-mono, monospace)', 
                fontSize: '11px', 
                fontWeight: 600, 
                color: '#FFFFFF',
                ...getCounterStyle(2),
              }}
            >
              03
            </span>
          </div>

          {/* Center Progress Rail */}
          <div
            style={{
              position: 'relative',
              width: '72px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Liquid Progress Capsule Scrubber */}
            <div
              className={`pill-progress-capsule-${project.id}`}
              style={{
                position: 'absolute',
                left: `${capsuleLeft}px`,
                width: `${capsuleWidth}px`,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: '#FFFFFF',
                willChange: 'left, width',
                transition: isTransitioning ? 'left 850ms cubic-bezier(0.22, 1, 0.36, 1), width 850ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
              }}
            />
          </div>

          {/* Right Total Counter */}
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              fontWeight: 600,
              color: '#FFFFFF',
              opacity: 0.5,
            }}
          >
            03
          </span>
        </div>
      </div>
    </a>
  );
}
