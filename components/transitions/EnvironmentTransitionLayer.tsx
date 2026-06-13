'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { palette } from '@/lib/theme/sectionThemes';

type EnvironmentTransitionLayerProps = {
  onEnvironmentHandoff?: () => void;
  onEnvironmentReset?: () => void;
  onTransitionComplete?: (complete: boolean) => void;
};

export default function EnvironmentTransitionLayer({
  onEnvironmentHandoff,
  onEnvironmentReset,
  onTransitionComplete,
}: EnvironmentTransitionLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const coverageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const layer = layerRef.current;
    const card = cardRef.current;
    const coverage = coverageRef.current;

    if (!layer || !card || !coverage) return;

    let handoffComplete = false;

    gsap.set(layer, { autoAlpha: 0 });
    gsap.set(card, {
      xPercent: -50,
      yPercent: 110,
      scale: 0.985,
      opacity: 1,
      boxShadow: '0 24px 80px rgba(10, 10, 10, 0.18), 0 2px 10px rgba(10, 10, 10, 0.08)',
    });
    gsap.set(coverage, { opacity: 0 });

    const transitionTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#about-section',
        start: 'top 70%',
        end: 'top 35%',
        scrub: true,
        onEnter: () => {
          gsap.set(layer, { autoAlpha: 1 });
        },
        onEnterBack: () => {
          gsap.set(layer, { autoAlpha: 1 });
        },
        onLeave: () => {
          gsap.set(layer, { autoAlpha: 1 });
        },
        onLeaveBack: () => {
          handoffComplete = false;
          onEnvironmentReset?.();
          onTransitionComplete?.(false);
          gsap.set(layer, { autoAlpha: 0 });
        },
        onUpdate: (self) => {
          if (self.progress >= 0.85 && !handoffComplete) {
            handoffComplete = true;
            onEnvironmentHandoff?.();
          }

          if (self.progress < 0.85 && handoffComplete) {
            handoffComplete = false;
            onEnvironmentReset?.();
          }
        },
      },
    });

    transitionTimeline
      .to(layer, { autoAlpha: 1, duration: 0.001, ease: 'none' }, 0)
      .to(card, { yPercent: 0, duration: 0.4, ease: 'none' }, 0)
      .to(card, {
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
        scale: 1,
        duration: 0.35,
        ease: 'none',
      }, 0.4)
      .to(card, {
        boxShadow: '0 0 0 rgba(10, 10, 10, 0)',
        duration: 0.1,
        ease: 'none',
      }, 0.75)
      .to(coverage, { opacity: 1, duration: 0.1, ease: 'none' }, 0.75)
      .to(card, { opacity: 1, duration: 0.15, ease: 'none' }, 0.85);

    const exitTween = gsap.fromTo(layer, { opacity: 1 }, {
      opacity: 0,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: {
        trigger: '#about-section',
        start: 'top 20%',
        end: 'top -5%',
        scrub: true,
        onEnter: () => {
          gsap.set(layer, { visibility: 'visible' });
          onTransitionComplete?.(true);
        },
        onEnterBack: () => {
          gsap.set(layer, { visibility: 'visible' });
          onTransitionComplete?.(true);
        },
        onLeave: () => {
          gsap.set(layer, { visibility: 'hidden' });
        },
        onLeaveBack: () => {
          gsap.set(layer, { visibility: 'visible' });
          onTransitionComplete?.(false);
        },
      },
    });

    return () => {
      transitionTimeline.kill();
      exitTween.kill();
    };
  }, [onEnvironmentHandoff, onEnvironmentReset, onTransitionComplete]);

  return (
    <div
      ref={layerRef}
      className="environment-transition-layer"
      aria-hidden="true"
    >
      <div ref={cardRef} className="environment-transition-card">
        <div ref={coverageRef} className="environment-transition-coverage" />
      </div>

      <style>{`
        .environment-transition-layer {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 80;
          overflow: hidden;
          visibility: hidden;
        }

        .environment-transition-card {
          position: absolute;
          left: 50%;
          bottom: 0;
          width: calc(100vw - 80px);
          height: 80vh;
          border-radius: 40px;
          background: ${palette.paper};
          overflow: hidden;
          will-change: transform, width, height, border-radius, box-shadow, opacity;
          -webkit-mask-image: -webkit-radial-gradient(white, black);
          mask-image: radial-gradient(white, black);
        }

        .environment-transition-coverage {
          position: absolute;
          inset: 0;
          background: ${palette.paper};
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .environment-transition-card {
            width: calc(100vw - 32px);
            height: 76vh;
            border-radius: 24px;
          }
        }
      `}</style>
    </div>
  );
}
