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
  const [prevActiveIdx, setPrevActiveIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Story Progression States
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchHeld, setIsTouchHeld] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isAutoplaySuspended, setIsAutoplaySuspended] = useState(false);
  
  // Ref for tracking swipe gesture coordinates
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    isPointerDown: false,
  });

  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Select which pre-loaded premium monochrome/technical public image to use as fallback
  const fallbackImages = ['/images/project_aura.png', '/images/project_kuro.png', '/images/chaniago.jpg'];
  const fallbackImage = fallbackImages[index % fallbackImages.length];

  const totalSlides = project.gallery ? project.gallery.length : 1;

  // MutationObserver to bridge GSAP's direct DOM class/attribute animations into React state
  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const checkExpandedState = () => {
      const isExpandedAttr = cardEl.getAttribute('data-expanded') === 'true';
      setIsExpanded(isExpandedAttr);
    };

    // Run initial check
    checkExpandedState();

    // Listen for data-expanded mutations on cardEl
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-expanded') {
          checkExpandedState();
        }
      });
    });

    observer.observe(cardEl, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Autoplay progression loop using requestAnimationFrame for zero-jerk performance
  useEffect(() => {
    // Only run autoplay loop if card is expanded, not paused, not suspended, and not hovered/touch-held
    const shouldProgress = isExpanded && !isPaused && !isAutoplaySuspended && !isHovered && !isTouchHeld;

    if (!shouldProgress) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const updateProgress = (now: number) => {
      const deltaTime = now - lastTime;
      lastTime = now;

      setProgressPercent((prev) => {
        const next = prev + (deltaTime / 5000) * 100; // 5000ms per slide
        if (next >= 100) {
          const nextIdx = (activeIdx + 1) % totalSlides;
          
          setSlideDirection('forward');
          setPrevActiveIdx(activeIdx);
          setActiveIdx(nextIdx);
          setIsTransitioning(true);
          
          setTimeout(() => {
            setIsTransitioning(false);
          }, 800);

          return 0;
        }
        return next;
      });

      animationFrameId = requestAnimationFrame(updateProgress);
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isExpanded, activeIdx, isPaused, isAutoplaySuspended, isHovered, isTouchHeld, totalSlides]);

  // Safely clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  // Handle clean manual navigation (resets timer, morphs indicator, suspends autoplay 5s)
  const handleManualSlideChange = (nextIdx: number) => {
    if (nextIdx === activeIdx) return;

    const dir = (nextIdx === 0 && activeIdx === totalSlides - 1)
      ? 'forward'
      : (nextIdx === totalSlides - 1 && activeIdx === 0)
      ? 'backward'
      : nextIdx > activeIdx
      ? 'forward'
      : 'backward';

    setSlideDirection(dir);
    setPrevActiveIdx(activeIdx);
    setActiveIdx(nextIdx);
    setProgressPercent(0);
    setIsTransitioning(true);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 800);

    // Suspend autoplay progression for 5 seconds to let user explore
    setIsAutoplaySuspended(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsAutoplaySuspended(false);
    }, 5000);
  };

  // Pointer event handlers to support horizontal swipe gesture recognition
  const handlePointerDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (!isExpanded) return;

    const cardEl = cardRef.current;
    if (!cardEl) return;

    gestureRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now(),
      isPointerDown: true,
    };

    cardEl.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const gesture = gestureRef.current;
    if (!gesture.isPointerDown) return;

    const dx = e.clientX - gesture.startX;
    const dy = e.clientY - gesture.startY;

    // Lock horizontal history gestures
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      e.preventDefault();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const gesture = gestureRef.current;
    if (!gesture.isPointerDown) return;

    gesture.isPointerDown = false;
    cardRef.current?.releasePointerCapture(e.pointerId);

    const dx = e.clientX - gesture.startX;
    const dy = e.clientY - gesture.startY;
    const duration = Date.now() - gesture.startTime;
    const velocity = dx / duration; // pixels per ms

    const isSwipe = Math.abs(dx) > 50 || Math.abs(velocity) > 0.3;
    const isHorizontal = Math.abs(dx) > Math.abs(dy);

    if (isSwipe && isHorizontal) {
      let nextIdx = activeIdx;
      if (dx < 0) {
        nextIdx = (activeIdx + 1) % totalSlides;
      } else if (dx > 0) {
        nextIdx = (activeIdx - 1 + totalSlides) % totalSlides;
      }
      handleManualSlideChange(nextIdx);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const gesture = gestureRef.current;
    if (!gesture.isPointerDown) return;

    gesture.isPointerDown = false;
    cardRef.current?.releasePointerCapture(e.pointerId);
  };

  // V3 Always-Mounted Cross-Layer Cinematic Transitions with Apple Depth
  // Outgoing image exits left/right and scales down slightly (scale: 1 -> 0.985)
  // Incoming image enters left/right and scales down (scale: 1.015 -> 1.0)
  const getSlideStyle = (imgIdx: number) => {
    const transition = 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1), opacity 800ms cubic-bezier(0.22, 1, 0.36, 1)';

    if (!isExpanded) {
      // Collapsed poster mode (Only Slide 0 visible, rest are transparent fallback sizes)
      if (imgIdx === 0) {
        return {
          opacity: 1,
          transform: 'translateX(0%) scale(1.12)',
          zIndex: 2,
          transition: 'transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
        };
      } else {
        return {
          opacity: 0,
          transform: 'translateX(100%) scale(1.015)',
          zIndex: 1,
          transition: 'none',
        };
      }
    }

    // Expanded story viewer mode
    if (imgIdx === activeIdx) {
      return {
        opacity: 1,
        transform: 'translateX(0%) scale(1.0)',
        zIndex: 2,
        transition,
      };
    } else if (imgIdx === prevActiveIdx) {
      return {
        opacity: 0.99, // Keep visible but slightly translucent during transition
        transform: slideDirection === 'forward' 
          ? 'translateX(-100%) scale(0.985)' 
          : 'translateX(100%) scale(0.985)',
        zIndex: 1,
        transition,
      };
    } else {
      return {
        opacity: 0,
        transform: slideDirection === 'forward' 
          ? 'translateX(100%) scale(1.015)' 
          : 'translateX(-100%) scale(1.015)',
        zIndex: 0,
        transition: 'none', // Reset position immediately without animation
      };
    }
  };

  return (
    <a
      ref={cardRef}
      href={`/work/${project.slug}`}
      onClick={(e) => {
        // Enforce absolute click lockouts to prevent card navigation at all times.
        e.preventDefault();
      }}
      className={`project-card-container project-card-container-${project.id}`}
      data-cursor="image"
      data-cursor-text="CASE STUDY"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onTouchStart={() => setIsTouchHeld(true)}
      onTouchEnd={() => setIsTouchHeld(false)}
      style={{
        display: 'block',
        textDecoration: 'none',
        pointerEvents: 'auto',
        touchAction: 'pan-y', // Native smooth vertical scroll, gesture locking captures horizontal
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Dedicated CTA Case Study Button (Visible when fully expanded, isolates events and forces native precision cursor) */}
      <div
        data-cursor="native"
        style={{
          position: 'absolute',
          top: '48px',
          right: '48px',
          zIndex: 101,
          opacity: isExpanded ? 1 : 0,
          pointerEvents: isExpanded ? 'auto' : 'none',
          transform: isExpanded ? 'translateY(0px)' : 'translateY(-20px)',
          transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = `/work/${project.slug}`;
        }}
      >
        <button
          style={{
            fontFamily: '"PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: '#FFFFFF',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '12px 24px',
            borderRadius: '9999px',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.color = '#0A0A0A';
            e.currentTarget.style.transform = 'scale(1.03)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          View Case Study
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

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

      {/* 3. Portals / Image container (All images remain mounted to ensure zero blank frames) */}
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
                transform: slideStyle.transform,
                opacity: slideStyle.opacity,
                zIndex: slideStyle.zIndex,
                transition: slideStyle.transition,
                willChange: 'transform, opacity',
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
                  transform: 'translate(-50%, -50%)',
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

      {/* 5. FLOATING GALLERY CONTROL PILL (Morphs & emerges from GSAP in PinnedSections, forces native precision cursor) */}
      <div
        className={`project-gallery-pill project-gallery-pill-${project.id}`}
        data-cursor="native"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
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
            justifyContent: 'center',
            width: '144px',
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          {/* Left: V3 Segmented Story Indicators (Smooth width morph transitions) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {project.gallery && project.gallery.map((_, imgIdx) => {
              const isActive = imgIdx === activeIdx;
              const isCompleted = imgIdx < activeIdx;

              // Indicators morph sizes smoothly (8px -> 48px) and style states over 400ms using premium spring-like easing
              const morphStyle = {
                position: 'relative' as const,
                width: isActive ? '48px' : '8px',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: isCompleted ? '#FFFFFF' : isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                border: isActive || isCompleted ? 'none' : '1.5px solid rgba(255, 255, 255, 0.4)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'width 400ms cubic-bezier(0.25, 1, 0.5, 1), background-color 400ms cubic-bezier(0.25, 1, 0.5, 1), border-color 400ms cubic-bezier(0.25, 1, 0.5, 1), opacity 400ms cubic-bezier(0.25, 1, 0.5, 1)',
              };

              return (
                <div
                  key={imgIdx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleManualSlideChange(imgIdx);
                  }}
                  style={morphStyle}
                >
                  {/* High-Performance composite-only Progress fill inside the morphed active capsule */}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: '100%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '999px',
                        transform: `scaleX(${progressPercent / 100})`,
                        transformOrigin: 'left',
                        willChange: 'transform',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Circular Glass Play/Pause Control (Isolates click and pointer propagation) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsPaused((prev) => !prev);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              outline: 'none',
              marginLeft: '20px',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isPaused ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5V19L19 12L8 5Z" fill="#FFFFFF"/>
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" fill="#FFFFFF"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </a>
  );
}
