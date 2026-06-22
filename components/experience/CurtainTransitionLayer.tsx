'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from '@/lib/gsap';
import type { PortfolioTransitionPhase } from './PortfolioExperienceContext';

type CurtainTransitionLayerProps = {
  phase: PortfolioTransitionPhase;
  onCovered(): void;
  onRevealed(): void;
};

const BRAND_TITLE = 'CHANIAGO STUDIO';
const ROLL_STEP_COUNT = 5;
const ROLL_DURATION = 1.08;
const ROLL_START_DELAY = 0.08;
const ROLL_STAGGER = 0.014;
const CHARACTER_HEIGHT_EM = 0.92;

function getRollSequence(char: string) {
  if (char === ' ') return [' '];

  return Array.from({ length: ROLL_STEP_COUNT + 1 }, () => char);
}

export default function CurtainTransitionLayer({
  phase,
  onCovered,
  onRevealed,
}: CurtainTransitionLayerProps) {
  const prefersReducedMotion = useReducedMotion();
  const coveredNotifiedRef = useRef(false);
  const revealedNotifiedRef = useRef(false);
  const coverHoldTimerRef = useRef<number | null>(null);
  const isCovering = phase === 'covering';
  const isRevealing = phase === 'revealing';
  const brandRef = useRef<HTMLDivElement>(null);
  const reelRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    if (phase === 'idle') {
      coveredNotifiedRef.current = false;
      revealedNotifiedRef.current = false;
      if (coverHoldTimerRef.current !== null) {
        window.clearTimeout(coverHoldTimerRef.current);
        coverHoldTimerRef.current = null;
      }
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'idle') return;

    const ctx = gsap.context(() => {
      gsap.set(brandRef.current, {
        opacity: 1,
        y: 0,
      });

      reelRefs.current.forEach((reel, index) => {
        if (!reel) return;

        const rollsUp = index % 2 === 0;
        const travel = ROLL_STEP_COUNT * CHARACTER_HEIGHT_EM;

        gsap.set(reel, {
          y: prefersReducedMotion || rollsUp ? '0em' : `${-travel}em`,
        });

        if (prefersReducedMotion) return;

        gsap.to(reel, {
          y: rollsUp ? `${-travel}em` : '0em',
          duration: ROLL_DURATION + (index % 4) * 0.04,
          delay: ROLL_START_DELAY + index * ROLL_STAGGER,
          ease: 'power4.out',
        });
      });
    }, brandRef);

    return () => ctx.revert();
  }, [phase, prefersReducedMotion]);

  useEffect(() => {
    if (phase === 'idle') return;

    const fallbackDelay = prefersReducedMotion ? 260 : 1520;
    const timer = window.setTimeout(() => {
      if (phase === 'covering' && !coveredNotifiedRef.current) {
        coveredNotifiedRef.current = true;
        onCovered();
        return;
      }

      if (phase === 'revealing' && !revealedNotifiedRef.current) {
        revealedNotifiedRef.current = true;
        onRevealed();
      }
    }, fallbackDelay);

    return () => window.clearTimeout(timer);
  }, [onCovered, onRevealed, phase, prefersReducedMotion]);

  if (phase === 'idle') return null;

  return (
    <motion.div
      aria-hidden="true"
      className="portfolio-curtain-transition"
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={
        isCovering
          ? { opacity: 1, backdropFilter: 'blur(0px)' }
          : { opacity: 0, backdropFilter: 'blur(0px)' }
      }
      transition={{
        duration: prefersReducedMotion ? 0.12 : 0.58,
        ease: prefersReducedMotion ? 'linear' : [0.22, 1, 0.36, 1],
      }}
      onAnimationComplete={() => {
        if (isCovering && !coveredNotifiedRef.current) {
          if (coverHoldTimerRef.current !== null) {
            window.clearTimeout(coverHoldTimerRef.current);
          }

          coverHoldTimerRef.current = window.setTimeout(() => {
            if (coveredNotifiedRef.current) return;
            coveredNotifiedRef.current = true;
            onCovered();
            coverHoldTimerRef.current = null;
          }, prefersReducedMotion ? 220 : 1180);
          return;
        }

        if (isRevealing && !revealedNotifiedRef.current) {
          revealedNotifiedRef.current = true;
          onRevealed();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1600,
        pointerEvents: 'none',
        backgroundColor: '#5C141F',
        willChange: 'opacity',
        backfaceVisibility: 'hidden',
        contain: 'paint',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          userSelect: 'none',
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
            color: 'rgba(255, 255, 255, 0.98)',
            fontFamily: 'var(--font-jost), sans-serif',
            fontSize: 'clamp(28px, 5.6vw, 88px)',
            fontWeight: 700,
            letterSpacing: '0',
            textTransform: 'uppercase',
            lineHeight: 0.9,
            whiteSpace: 'nowrap',
            willChange: 'transform',
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
      </div>
    </motion.div>
  );
}
