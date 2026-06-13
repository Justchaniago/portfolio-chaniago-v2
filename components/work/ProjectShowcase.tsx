'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { projectRepository, type Project } from '@/lib/projects';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import SignaturePath from './SignaturePath';
import { SignaturePathController } from './SignaturePathController';
import SignaturePathDebug from './SignaturePathDebug';

const DEBUG_SIGNATURE_PATH = false;
const MORPH_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const POINTER_LEAVE_COLLAPSE_DELAY = 120;

const PLACEHOLDER_CARDS = [
  { id: 'wp-1', className: 'wp-1', title: 'Large Landscape Anchor', meta: '16:10 / Primary field' },
  { id: 'wp-2', className: 'wp-2', title: 'Tall Portrait Overlap', meta: '4:5 / Foreground overlap' },
  { id: 'wp-3', className: 'wp-3', title: 'Ultra Wide Cinematic', meta: '21:9 / Cinematic wall' },
  { id: 'wp-4', className: 'wp-4', title: 'Medium Portrait', meta: '3:4 / Editorial study' },
  { id: 'wp-5', className: 'wp-5', title: 'Rhythm Interrupter', meta: '1:1 / Detail crop' },
  { id: 'wp-6', className: 'wp-6', title: 'Solitary Close', meta: '16:10 / Closing frame' },
] as const;

type PlaceholderCard = (typeof PLACEHOLDER_CARDS)[number];
type PlaceholderId = PlaceholderCard['id'];
type MorphRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
};

type ProjectShowcaseProps = {
  enableScrollEffects?: boolean;
};

export default function ProjectShowcase({
  enableScrollEffects = true,
}: ProjectShowcaseProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [projects, setProjects] = useState<Project[]>([]);
  const [activePlaceholderId, setActivePlaceholderId] = useState<PlaceholderId | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayInnerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const activePlaceholderIdRef = useRef<PlaceholderId | null>(null);
  const originRectRef = useRef<MorphRect | null>(null);
  const targetRectRef = useRef<MorphRect | null>(null);
  const isMorphingRef = useRef(false);
  const isPreparingOpenRef = useRef(false);
  const isScrollingToCardRef = useRef(false);
  const expandCompleteRef = useRef(false);
  const ambientTweenRef = useRef<gsap.core.Tween | null>(null);
  const pointerLeaveTimeoutRef = useRef<number | null>(null);
  const signatureScrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const placeholderRefs = useRef<Partial<Record<PlaceholderId, HTMLDivElement | null>>>({});

  const activePlaceholder = PLACEHOLDER_CARDS.find((placeholder) => placeholder.id === activePlaceholderId) ?? null;

  const getTargetRect = useCallback((): MorphRect => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth <= 768;
    const width = Math.round(viewportWidth * (isMobile ? 0.92 : 0.9));
    const height = Math.round(viewportHeight * (isMobile ? 0.78 : 0.86));

    return {
      x: Math.round((viewportWidth - width) / 2),
      y: Math.round((viewportHeight - height) / 2),
      width,
      height,
      borderRadius: isMobile ? 22 : 32,
    };
  }, []);

  const clearPointerLeaveTimeout = useCallback(() => {
    if (pointerLeaveTimeoutRef.current === null) return;

    window.clearTimeout(pointerLeaveTimeoutRef.current);
    pointerLeaveTimeoutRef.current = null;
  }, []);

  const resetSignaturePath = useCallback(() => {
    signatureScrollTriggerRef.current?.enable();
  }, []);

  const scrollToPlaceholder = useCallback((source: HTMLElement, idealTopRatio = 0.12) => (
    new Promise<void>((resolve) => {
      const rect = source.getBoundingClientRect();
      const idealTop = window.innerHeight * idealTopRatio;
      const isFullyVisible = rect.top >= idealTop && rect.bottom <= window.innerHeight * 0.95;

      if (isFullyVisible) {
        resolve();
        return;
      }

      isScrollingToCardRef.current = true;
      gsap.to(window, {
        scrollTo: {
          y: window.scrollY + rect.top - idealTop,
          autoKill: false,
        },
        duration: 0.45,
        ease: 'power3.inOut',
        onComplete: () => {
          isScrollingToCardRef.current = false;
          resolve();
        },
        onInterrupt: () => {
          isScrollingToCardRef.current = false;
          resolve();
        },
      });
    })
  ), []);

  const getSourceRect = useCallback((placeholderId: PlaceholderId): MorphRect | null => {
    const source = placeholderRefs.current[placeholderId];
    if (!source) return null;

    const rect = source.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(source);
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      borderRadius: Number.parseFloat(computedStyle.borderRadius) || 12,
    };
  }, []);

  const collapsePlaceholder = useCallback(() => {
    if (!activePlaceholderIdRef.current || isMorphingRef.current) return;

    const overlay = overlayRef.current;
    const overlayInner = overlayInnerRef.current;
    const scrim = scrimRef.current;
    const targetRect = targetRectRef.current;
    const destinationRect = getSourceRect(activePlaceholderIdRef.current) ?? originRectRef.current;
    if (!overlay || !scrim || !targetRect || !destinationRect) {
      setActivePlaceholderId(null);
      activePlaceholderIdRef.current = null;
      return;
    }

    clearPointerLeaveTimeout();
    ambientTweenRef.current?.kill();
    ambientTweenRef.current = null;
    isMorphingRef.current = true;
    expandCompleteRef.current = false;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isOffScreen = destinationRect.y + destinationRect.height < 0 || destinationRect.y > window.innerHeight;
    const duration = prefersReducedMotion ? 0.16 : 0.58;
    const scaleX = destinationRect.width / targetRect.width;
    const scaleY = destinationRect.height / targetRect.height;

    const timeline = gsap.timeline({
      defaults: {
        ease: MORPH_EASE,
      },
      onComplete: () => {
        gsap.set([overlay, overlayInner, scrim], { clearProps: 'all' });
        isMorphingRef.current = false;
        originRectRef.current = null;
        targetRectRef.current = null;
        activePlaceholderIdRef.current = null;
        resetSignaturePath();
        setActivePlaceholderId(null);
      },
    });

    if (isOffScreen) {
      timeline
        .to(scrim, { opacity: 0, duration: 0.2 }, 0)
        .to(overlay, {
          opacity: 0,
          scale: 0.96,
          duration: prefersReducedMotion ? 0.16 : 0.25,
          ease: 'power2.in',
        }, 0);
      return;
    }

    timeline
      .to(scrim, { opacity: 0, duration: duration * 0.72 }, 0)
      .to(overlay, prefersReducedMotion
        ? {
            opacity: 0,
            scale: 0.96,
            duration,
          }
        : {
            x: destinationRect.x,
            y: destinationRect.y,
            scaleX,
            scaleY,
            borderRadius: destinationRect.borderRadius,
            boxShadow: '0 4px 24px rgba(10, 10, 10, 0.01)',
            duration,
          }, 0)
      .to(overlayInner, {
        scale: prefersReducedMotion ? 0.98 : 1,
        opacity: prefersReducedMotion ? 0 : 0.68,
        duration: duration * 0.9,
      }, 0);
  }, [clearPointerLeaveTimeout, getSourceRect, resetSignaturePath]);

  const expandPlaceholder = useCallback(async (placeholderId: PlaceholderId) => {
    if (isPreparingOpenRef.current || isMorphingRef.current || activePlaceholderIdRef.current) return;

    const source = placeholderRefs.current[placeholderId];
    if (!source) return;

    isPreparingOpenRef.current = true;
    gsap.killTweensOf(source);
    gsap.set(source, {
      opacity: 1,
      y: 0,
      scale: 1,
      clearProps: 'filter',
    });

    await scrollToPlaceholder(source);

    originRectRef.current = getSourceRect(placeholderId);
    if (!originRectRef.current) {
      isPreparingOpenRef.current = false;
      return;
    }
    signatureScrollTriggerRef.current?.disable();
    activePlaceholderIdRef.current = placeholderId;
    isPreparingOpenRef.current = false;
    setActivePlaceholderId(placeholderId);
  }, [getSourceRect, scrollToPlaceholder]);

  const handlePlaceholderKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>, placeholderId: PlaceholderId) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    expandPlaceholder(placeholderId);
  }, [expandPlaceholder]);

  const handleExpandedPointerLeave = useCallback(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || !expandCompleteRef.current) return;

    clearPointerLeaveTimeout();
    pointerLeaveTimeoutRef.current = window.setTimeout(() => {
      collapsePlaceholder();
    }, POINTER_LEAVE_COLLAPSE_DELAY);
  }, [clearPointerLeaveTimeout, collapsePlaceholder]);

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

  useLayoutEffect(() => {
    if (!activePlaceholderId) return;

    const overlay = overlayRef.current;
    const overlayInner = overlayInnerRef.current;
    const scrim = scrimRef.current;
    const originRect = originRectRef.current;
    if (!overlay || !overlayInner || !scrim || !originRect) return;

    const targetRect = getTargetRect();
    targetRectRef.current = targetRect;
    const initialScaleX = originRect.width / targetRect.width;
    const initialScaleY = originRect.height / targetRect.height;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    isMorphingRef.current = true;
    expandCompleteRef.current = false;

    gsap.set(scrim, {
      opacity: 0,
    });
    gsap.set(overlay, {
      x: originRect.x,
      y: originRect.y,
      width: targetRect.width,
      height: targetRect.height,
      borderRadius: originRect.borderRadius,
      opacity: 1,
      scaleX: initialScaleX,
      scaleY: initialScaleY,
      boxShadow: '0 4px 24px rgba(10, 10, 10, 0.01)',
      transformOrigin: '0% 0%',
    });
    gsap.set(overlayInner, {
      scale: 1,
      opacity: 0.68,
      xPercent: 0,
      yPercent: 0,
      transformOrigin: '50% 50%',
    });

    const timeline = gsap.timeline({
      defaults: {
        ease: MORPH_EASE,
      },
      onComplete: () => {
        isMorphingRef.current = false;
        expandCompleteRef.current = true;
        if (!prefersReducedMotion) {
          ambientTweenRef.current = gsap.to(overlayInner, {
            xPercent: 1.2,
            yPercent: -0.8,
            duration: 1.4,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        }
      },
    });

    timeline
      .to(scrim, {
        opacity: prefersReducedMotion ? 0.12 : 1,
        duration: prefersReducedMotion ? 0.16 : 0.42,
      }, 0)
      .to(overlay, prefersReducedMotion
        ? {
            x: targetRect.x,
            y: targetRect.y,
            width: targetRect.width,
            height: targetRect.height,
            borderRadius: targetRect.borderRadius,
            opacity: 1,
            duration: 0.18,
          }
        : {
            x: targetRect.x,
            y: targetRect.y,
            scaleX: 1,
            scaleY: 1,
            borderRadius: targetRect.borderRadius,
            boxShadow: '0 44px 120px rgba(10, 10, 10, 0.22), 0 12px 40px rgba(249, 92, 75, 0.08)',
            duration: 0.72,
          }, 0)
      .to(overlayInner, {
        scale: prefersReducedMotion ? 1 : 1.025,
        opacity: 1,
        duration: prefersReducedMotion ? 0.18 : 0.72,
      }, 0);

    return () => {
      timeline.kill();
      ambientTweenRef.current?.kill();
      ambientTweenRef.current = null;
    };
  }, [activePlaceholderId, getTargetRect]);

  useEffect(() => {
    if (!activePlaceholderId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isScrollingToCardRef.current) return;
      if (event.key === 'Escape') {
        collapsePlaceholder();
      }
    };
    const handleScrollIntent = () => {
      if (isScrollingToCardRef.current) return;
      collapsePlaceholder();
    };
    const handleResize = () => {
      if (isScrollingToCardRef.current) return;
      collapsePlaceholder();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleScrollIntent, { passive: true });
    window.addEventListener('touchmove', handleScrollIntent, { passive: true });
    window.addEventListener('scroll', handleScrollIntent, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleScrollIntent);
      window.removeEventListener('touchmove', handleScrollIntent);
      window.removeEventListener('scroll', handleScrollIntent);
      window.removeEventListener('resize', handleResize);
      clearPointerLeaveTimeout();
    };
  }, [activePlaceholderId, clearPointerLeaveTimeout, collapsePlaceholder]);

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
        signatureScrollTriggerRef.current = signatureTrigger;

        controller.update(signatureTrigger.progress);
      }
    }, sectionRef);

    return () => {
      signatureScrollTriggerRef.current = null;
      ctx.revert();
    };
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

        {PLACEHOLDER_CARDS.slice(0, 2).map((placeholder) => (
          <div
            key={placeholder.id}
            ref={(node) => {
              placeholderRefs.current[placeholder.id] = node;
            }}
            className={`work-reveal-item work-placeholder ${placeholder.className}${activePlaceholderId === placeholder.id ? ' is-morph-source-hidden' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`Expand ${placeholder.title}`}
            aria-pressed={activePlaceholderId === placeholder.id}
            onClick={() => expandPlaceholder(placeholder.id)}
            onKeyDown={(event) => handlePlaceholderKeyDown(event, placeholder.id)}
          >
            <div className="work-placeholder-inner" />
            <span className="work-placeholder-index">{placeholder.id.replace('wp-', '').padStart(2, '0')}</span>
          </div>
        ))}

        {/* Typographic Breathing Section (Museum Rule) */}
        <div className="work-reveal-item work-breathing-section">
          <p className="work-breathing-text">
            Selected experiences crafted with intention, not volume.
          </p>
        </div>

        {PLACEHOLDER_CARDS.slice(2).map((placeholder) => (
          <div
            key={placeholder.id}
            ref={(node) => {
              placeholderRefs.current[placeholder.id] = node;
            }}
            className={`work-reveal-item work-placeholder ${placeholder.className}${activePlaceholderId === placeholder.id ? ' is-morph-source-hidden' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`Expand ${placeholder.title}`}
            aria-pressed={activePlaceholderId === placeholder.id}
            onClick={() => expandPlaceholder(placeholder.id)}
            onKeyDown={(event) => handlePlaceholderKeyDown(event, placeholder.id)}
          >
            <div className="work-placeholder-inner" />
            <span className="work-placeholder-index">{placeholder.id.replace('wp-', '').padStart(2, '0')}</span>
          </div>
        ))}

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

      {activePlaceholder && (
        <div
          className="work-morph-layer"
          aria-hidden={false}
        >
          <div
            ref={scrimRef}
            className="work-morph-scrim"
            onClick={() => collapsePlaceholder()}
          />
          <div
            ref={overlayRef}
            className="work-morph-card"
            role="dialog"
            aria-modal="true"
            aria-label={`${activePlaceholder.title} expanded preview`}
            onPointerEnter={clearPointerLeaveTimeout}
            onPointerLeave={handleExpandedPointerLeave}
          >
            <div ref={overlayInnerRef} className="work-morph-card-inner">
              <div className="work-morph-grid" aria-hidden="true" />
              <div className="work-morph-orb work-morph-orb-a" aria-hidden="true" />
              <div className="work-morph-orb work-morph-orb-b" aria-hidden="true" />
              <div className="work-morph-content">
                <span className="work-morph-kicker">{activePlaceholder.id.replace('wp-', '').padStart(2, '0')} / PLACEHOLDER</span>
                <h3>{activePlaceholder.title}</h3>
                <p>{activePlaceholder.meta}</p>
              </div>
              <button
                type="button"
                className="work-morph-close"
                aria-label="Close expanded preview"
                onClick={() => collapsePlaceholder()}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

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
          cursor: pointer;
          outline: none;
          transition: border-color 0.4s ease, background-color 0.4s ease, opacity 0.24s ease, transform 0.4s ${MORPH_EASE};
          box-shadow: 0 4px 24px rgba(10, 10, 10, 0.01);
          z-index: 2;
        }

        .work-placeholder:hover,
        .work-placeholder:focus-visible {
          background-color: rgba(10, 10, 10, 0.05);
          border-color: rgba(10, 10, 10, 0.15);
          box-shadow: 0 8px 32px rgba(10, 10, 10, 0.03);
          transform: translateY(-2px);
        }

        .work-placeholder:focus-visible {
          box-shadow: 0 0 0 3px rgba(249, 92, 75, 0.22), 0 8px 32px rgba(10, 10, 10, 0.03);
        }

        .work-placeholder.is-morph-source-hidden {
          opacity: 0 !important;
          pointer-events: none;
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

        .work-placeholder-index {
          position: absolute;
          left: clamp(14px, 1.6vw, 22px);
          bottom: clamp(12px, 1.4vw, 18px);
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: rgba(10, 10, 10, 0.42);
          z-index: 2;
          pointer-events: none;
        }

        .work-morph-layer {
          position: fixed;
          inset: 0;
          z-index: 1400;
          pointer-events: none;
        }

        .work-morph-scrim {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 42%, rgba(249, 92, 75, 0.08), rgba(10, 10, 10, 0) 36%),
            rgba(246, 244, 241, 0.42);
          backdrop-filter: blur(7px) saturate(1.04);
          -webkit-backdrop-filter: blur(7px) saturate(1.04);
          pointer-events: auto;
        }

        .work-morph-card {
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.56), rgba(228, 222, 210, 0.36)),
            var(--color-stone, #E4DED2);
          border: 1px solid rgba(10, 10, 10, 0.12);
          color: var(--color-text-1, #0A0A0A);
          pointer-events: auto;
          will-change: transform, width, height, border-radius, box-shadow, opacity;
          contain: layout paint;
        }

        .work-morph-card-inner {
          position: absolute;
          inset: 0;
          overflow: hidden;
          opacity: 0.68;
          will-change: transform, opacity;
        }

        .work-morph-card-inner::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0) 45%, rgba(249, 92, 75, 0.18) 100%);
          opacity: 0.78;
          pointer-events: none;
        }

        .work-morph-card-inner::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E");
          background-size: 220px 220px;
          opacity: 0.055;
          mix-blend-mode: multiply;
          pointer-events: none;
        }

        .work-morph-grid {
          position: absolute;
          inset: clamp(18px, 2.4vw, 34px);
          border: 1px solid rgba(10, 10, 10, 0.12);
          border-radius: inherit;
          background-image:
            linear-gradient(rgba(10, 10, 10, 0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10, 10, 10, 0.055) 1px, transparent 1px);
          background-size: clamp(32px, 5vw, 72px) clamp(32px, 5vw, 72px);
          opacity: 0.58;
          pointer-events: none;
        }

        .work-morph-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(36px);
          pointer-events: none;
        }

        .work-morph-orb-a {
          width: 36%;
          aspect-ratio: 1 / 1;
          left: 8%;
          top: 8%;
          background: rgba(249, 92, 75, 0.22);
        }

        .work-morph-orb-b {
          width: 28%;
          aspect-ratio: 1 / 1;
          right: 10%;
          bottom: 10%;
          background: rgba(255, 255, 255, 0.46);
        }

        .work-morph-content {
          position: absolute;
          left: clamp(24px, 5vw, 78px);
          bottom: clamp(24px, 6vh, 72px);
          z-index: 2;
          max-width: min(520px, calc(100% - 48px));
          pointer-events: none;
        }

        .work-morph-kicker {
          display: block;
          margin-bottom: 14px;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          color: var(--color-accent, #F95C4B);
          text-transform: uppercase;
        }

        .work-morph-content h3 {
          margin: 0;
          font-family: "PP Neue Montreal", "Neue Montreal", var(--font-body), sans-serif;
          font-size: clamp(2.6rem, 8vw, 8.4rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 0.86;
          text-transform: uppercase;
        }

        .work-morph-content p {
          margin: 18px 0 0;
          font-family: var(--font-mono, monospace);
          font-size: clamp(10px, 1.1vw, 13px);
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--color-text-2, #3E3A36);
          text-transform: uppercase;
        }

        .work-morph-close {
          position: absolute;
          top: clamp(18px, 3vw, 34px);
          right: clamp(18px, 3vw, 34px);
          z-index: 3;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: 1px solid rgba(10, 10, 10, 0.16);
          background: rgba(246, 244, 241, 0.58);
          color: var(--color-text-1, #0A0A0A);
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transition: transform 0.28s ${MORPH_EASE}, background-color 0.28s ease;
        }

        .work-morph-close:hover,
        .work-morph-close:focus-visible {
          transform: scale(1.06);
          background: rgba(255, 255, 255, 0.76);
          outline: none;
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
