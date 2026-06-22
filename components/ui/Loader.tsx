'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

interface LoaderProps {
  onComplete: () => void;
}

const BRAND_TITLE = 'CHANIAGO STUDIO';
const DARK_CANVAS = '#060606';
const ROLL_STEP_COUNT = 8;
const ROLL_DURATION = 2.75;
const ROLL_START_DELAY = 0.24;
const ROLL_STAGGER = 0.022;
const ROLL_SETTLE_HOLD = 0.5;
const LINE_FILL_DURATION = 3.05;
const CHARACTER_HEIGHT_EM = 0.92;

function getRollSequence(char: string) {
  if (char === ' ') return [' '];

  return Array.from({ length: ROLL_STEP_COUNT + 1 }, () => char);
}

export default function Loader({ onComplete }: LoaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const lineFillRef = useRef<HTMLDivElement>(null);
  const reelRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    let imageLoaded = false;
    const img = new Image();
    img.src = '/images/portrait.png';

    if (img.complete) {
      imageLoaded = true;
    } else {
      img.onload = () => {
        imageLoaded = true;
      };
      img.onerror = () => {
        imageLoaded = true;
      };
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set(brandRef.current, {
        opacity: 0,
        y: 10,
        scale: 0.985,
      });

      gsap.set(lineRef.current, {
        opacity: 0,
        y: 8,
      });

      gsap.set(lineFillRef.current, {
        scaleX: 0,
        transformOrigin: 'left center',
      });

      reelRefs.current.forEach((reel, index) => {
        if (!reel) return;

        const rollsUp = index % 2 === 0;
        const travel = ROLL_STEP_COUNT * CHARACTER_HEIGHT_EM;

        gsap.set(reel, {
          y: rollsUp ? '0em' : `${-travel}em`,
          opacity: 0,
        });

        const startTime = ROLL_START_DELAY + index * ROLL_STAGGER;

        tl.to(reel, {
          y: rollsUp ? `${-travel}em` : '0em',
          duration: ROLL_DURATION + (index % 4) * 0.08,
          ease: 'power4.out',
        }, startTime);

        tl.to(reel, {
          opacity: 1,
          duration: 0.25,
          ease: 'power2.out',
        }, startTime);
      });

      tl.to(brandRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.42,
        ease: 'power3.out',
      }, 0);

      tl.to(lineRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.34,
        ease: 'power2.out',
      }, 0.1);

      tl.to(lineFillRef.current, {
        scaleX: 1,
        duration: LINE_FILL_DURATION,
        ease: 'power3.out',
      }, 0.22);

      tl.to({}, { duration: ROLL_SETTLE_HOLD });

      tl.add(() => {
        const revealWhenReady = () => {
          if (!imageLoaded) {
            requestAnimationFrame(revealWhenReady);
            return;
          }

          gsap.timeline({ onComplete })
            .to(brandRef.current, {
              opacity: 0,
              y: -12,
              scale: 0.985,
              duration: 0.34,
              ease: 'power2.out',
            }, 0)
            .to(overlayRef.current, {
              opacity: 0,
              duration: 0.62,
              ease: 'power2.inOut',
            }, 0.12);
        };

        revealWhenReady();
      });
    }, overlayRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      role="status"
      aria-label="Loading Chaniago Studio"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: DARK_CANVAS,
        zIndex: 2147483647,
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        pointerEvents: 'all',
        isolation: 'isolate',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(18px, 3.4vw, 34px)',
          width: '100%',
        }}
      >
        <div
          ref={brandRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(1px, 0.2vw, 3px)',
            maxWidth: 'calc(100vw - 48px)',
            paddingInline: '24px',
            color: '#FFFFFF',
            fontFamily: 'var(--font-jost), sans-serif',
            fontSize: 'clamp(28px, 5.6vw, 88px)',
            fontWeight: 700,
            letterSpacing: '0',
            lineHeight: 0.9,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            willChange: 'opacity, transform',
          }}
        >
          {Array.from(BRAND_TITLE).map((char, index) => {
            const sequence = getRollSequence(char);

            if (char === ' ') {
              return (
                <span
                  key={`${char}-${index}`}
                  aria-hidden="true"
                  style={{
                    width: '0.36em',
                    flex: '0 0 0.36em',
                  }}
                />
              );
            }

            return (
              <span
                key={`${char}-${index}`}
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  height: '0.92em',
                  minWidth: '0.56em',
                  overflow: 'hidden',
                  textAlign: 'center',
                  verticalAlign: 'top',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <span
                  ref={(node) => {
                    reelRefs.current[index] = node;
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    willChange: 'transform',
                  }}
                >
                  {sequence.map((item, sequenceIndex) => (
                    <span
                      key={`${item}-${sequenceIndex}`}
                      style={{
                        display: 'block',
                        height: '0.92em',
                        lineHeight: 0.9,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </span>
              </span>
            );
          })}
        </div>

        <div
          ref={lineRef}
          style={{
            position: 'relative',
            width: 'clamp(132px, 28vw, 420px)',
            height: '1px',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.16)',
            willChange: 'opacity, transform',
          }}
        >
          <div
            ref={lineFillRef}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.92)',
              transform: 'scaleX(0)',
              transformOrigin: 'left center',
              willChange: 'transform',
            }}
          />
        </div>
      </div>
    </div>
  );
}
